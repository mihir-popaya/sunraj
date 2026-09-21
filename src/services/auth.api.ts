// src/services/auth.api.ts
import api from "./api";
import { useAuthStore } from "../store/authStore";

// ============================================================
// REQUEST & RESPONSE INTERFACES
// ============================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  data?: unknown;
  [key: string]: unknown;
}

export const normalizeToken = (value: unknown): string | null => {
  if (typeof value !== "string") return null;

  const token = value.trim().replace(/^Bearer\s+/i, "");
  return token || null;
};

// ============================================================
// TOKEN EXTRACTION HELPERS
// ============================================================

export const getAccessToken = (response: unknown): string | null => {
  const tokenKeys = new Set([
    "accessToken",
    "access_token",
    "token",
    "jwt",
    "idToken",
    "id_token",
  ]);

  const findToken = (value: unknown, depth = 0): string | null => {
    if (!value || typeof value !== "object" || depth > 5) return null;

    for (const [key, nestedValue] of Object.entries(value)) {
      const normalizedKey = key.replace(/[-_]/g, "").toLowerCase();
      if (
        (tokenKeys.has(key) ||
          normalizedKey === "accesstoken" ||
          normalizedKey === "authorization") &&
        normalizeToken(nestedValue)
      ) {
        return normalizeToken(nestedValue);
      }

      const nestedToken = findToken(nestedValue, depth + 1);
      if (nestedToken) return nestedToken;
    }

    return null;
  };

  return findToken(response);
};

export const getRefreshToken = (response: unknown): string | null => {
  const tokenKeys = new Set([
    "refreshToken",
    "refresh_token",
  ]);

  const findToken = (value: unknown, depth = 0): string | null => {
    if (!value || typeof value !== "object" || depth > 5) return null;

    for (const [key, nestedValue] of Object.entries(value)) {
      const normalizedKey = key.replace(/[-_]/g, "").toLowerCase();
      if (
        (tokenKeys.has(key) || normalizedKey === "refreshtoken") &&
        normalizeToken(nestedValue)
      ) {
        return normalizeToken(nestedValue);
      }

      const nestedToken = findToken(nestedValue, depth + 1);
      if (nestedToken) return nestedToken;
    }

    return null;
  };

  return findToken(response);
};

export const getSessionId = (response: unknown): string | null => {
  const findSessionId = (value: unknown, depth = 0): string | null => {
    if (!value || typeof value !== "object" || depth > 5) return null;

    for (const [key, nestedValue] of Object.entries(value)) {
      const normalizedKey = key.replace(/[-_]/g, "").toLowerCase();

      if (normalizedKey === "sessionid" && typeof nestedValue === "string") {
        return nestedValue.trim() || null;
      }

      const nestedSessionId = findSessionId(nestedValue, depth + 1);
      if (nestedSessionId) return nestedSessionId;
    }

    return null;
  };

  return findSessionId(response);
};

// ============================================================
// AUTH API METHODS
// ============================================================

/**
 * POST /auth/login
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", data);

  const authorizationHeader =
    response.headers?.authorization ||
    (typeof response.headers?.get === "function"
      ? response.headers.get("authorization")
      : undefined);
  const responseToken = getAccessToken(response.data);
  const responseRefreshToken = getRefreshToken(response.data);
  const responseSessionId = getSessionId(response.data);

  const result: AuthResponse = {
    ...response.data,
  };

  if (!responseToken && authorizationHeader) {
    result.accessToken = normalizeToken(authorizationHeader) ?? undefined;
  } else if (responseToken) {
    result.accessToken = responseToken;
  }

  if (responseRefreshToken) {
    result.refreshToken = responseRefreshToken;
  }

  // This API authenticates admin requests with its session cookie.
  if (responseSessionId) {
    result.sessionId = responseSessionId;
  }

  return result;
};

/**
 * GET /auth/me
 */
export const getCurrentUser = async (): Promise<AuthResponse> => {
  const response = await api.get("/auth/me");
  return response.data;
};

/**
 * POST /auth/refresh
 */
export const refreshToken = async (): Promise<AuthResponse> => {
  const storedRefreshToken =
    useAuthStore.getState().refreshToken ||
    (typeof window !== "undefined"
      ? localStorage.getItem("refreshToken")
      : null);

  const response = await api.post(
    "/auth/refresh",
    storedRefreshToken ? { refreshToken: storedRefreshToken } : {}
  );
  return response.data;
};

/**
 * POST /auth/logout
 */
export const logout = async (): Promise<AuthResponse> => {
  const response = await api.post("/auth/logout");
  return response.data;
};

/**
 * POST /auth/forgot
 */
export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<AuthResponse> => {
  const response = await api.post("/auth/forgot", data);
  return response.data;
};

/**
 * POST /admin_auth/reset_password
 */
export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<AuthResponse> => {
  const response = await api.post("/admin_auth/reset_password", data);
  return response.data;
};