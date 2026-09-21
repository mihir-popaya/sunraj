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
const rawBaseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "/v1" : "https://jt3v2ls2-5000.inc1.devtunnels.ms/v1");

export const API_BASE_URL = rawBaseUrl.startsWith("http://")
  ? rawBaseUrl.replace(/^http:\/\//i, "https://")
  : rawBaseUrl;

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
    if (!isRefreshRoute) {
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
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
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
      if (isRefreshing) {
        // If a refresh is already in flight, queue this request until it resolves
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              resolve(api(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
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

        if (typeof newAccessToken === "string" && newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken);
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("token", newAccessToken);
          }

          if (typeof newRefreshToken === "string" && newRefreshToken) {
            useAuthStore.getState().setRefreshToken(newRefreshToken);
            if (typeof window !== "undefined") {
              localStorage.setItem("refreshToken", newRefreshToken);
            }
          }

          processQueue(null, newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return api(originalRequest);
        } else {
          throw new Error("No access token returned by refresh endpoint.");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();

        // Redirect to login only if not already there, preventing redirect loops
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;