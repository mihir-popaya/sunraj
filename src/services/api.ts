// src/services/api.ts
import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { useAuthStore } from "../store/authStore";

function normalizeToken(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const token = value.trim().replace(/^Bearer\s+/i, "");
  return token || null;
}

export interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Use relative proxy path (/v1) in development to avoid cross-origin cookie rejection
export const API_BASE_URL = import.meta.env.DEV
  ? "/v1"
  : (import.meta.env.VITE_API_URL || "/v1").replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

/* ============================================================
   REQUEST INTERCEPTOR
============================================================ */

api.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || "";
    const isRefreshRoute = requestUrl.includes("/auth/refresh");

    // Do NOT attach expired access token when requesting /auth/refresh
    if (!isRefreshRoute && !requestUrl.includes("/auth/login")) {
      const accessToken = normalizeToken(
        useAuthStore.getState().accessToken ||
        (typeof window !== "undefined"
          ? localStorage.getItem("accessToken") || localStorage.getItem("token")
          : null)
      );
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================================================
   RESPONSE INTERCEPTOR (REFRESH QUEUE & LOOP PREVENTION)
============================================================ */

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | RetryAxiosRequestConfig
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || "";

    const isAuthRoute =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout");

    /*
     * Only attempt refresh for authenticated API requests
     * that returned 401, are NOT auth routes, and haven't already been retried.
     */
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // If a refresh is already in flight, queue this request until it resolves
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string | null) => {
              if (newToken && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              } else {
                delete originalRequest.headers.Authorization;
              }
              resolve(api(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      isRefreshing = true;

      try {
        const storedRefreshToken =
          useAuthStore.getState().refreshToken ||
          (typeof window !== "undefined"
            ? localStorage.getItem("refreshToken")
            : null);

        // Perform refresh request using isolated axios call to avoid interceptor recursion
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          storedRefreshToken
            ? { refreshToken: storedRefreshToken }
            : {},
          {
            headers: {
              "Content-Type": "application/json",
              ...(storedRefreshToken
                ? { Authorization: `Bearer ${storedRefreshToken}` }
                : {}),
            },
            withCredentials: true,
          }
        );

        const newAccessToken = normalizeToken(
          refreshResponse.data?.data?.accessToken ??
          refreshResponse.data?.data?.access_token ??
          refreshResponse.data?.data?.token ??
          refreshResponse.data?.accessToken ??
          refreshResponse.data?.access_token ??
          refreshResponse.data?.token
        );

        const newRefreshToken = normalizeToken(
          refreshResponse.data?.data?.refreshToken ??
          refreshResponse.data?.data?.refresh_token ??
          refreshResponse.data?.refreshToken ??
          refreshResponse.data?.refresh_token
        );

        if (refreshResponse.data?.success === false) {
          useAuthStore.getState().clearAuth();
          throw new Error("Session refresh was rejected.");
        }

        // Cookie sessions can refresh successfully without a JSON access token.
        useAuthStore.getState().setAccessToken(newAccessToken);
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
          if (newAccessToken) localStorage.setItem("accessToken", newAccessToken);
        }
        if (newRefreshToken) {
          useAuthStore.getState().setRefreshToken(newRefreshToken);
          if (typeof window !== "undefined") {
            localStorage.setItem("refreshToken", newRefreshToken);
          }
        }

        processQueue(null, newAccessToken);
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        } else {
          delete originalRequest.headers.Authorization;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // A temporary network/server failure does not invalidate the session.
        if (
          axios.isAxiosError(refreshError) &&
          [401, 403].includes(refreshError.response?.status ?? 0)
        ) {
          useAuthStore.getState().clearAuth();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && originalRequest._retry && !isAuthRoute) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

export default api;