import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserRole {
  _id: string;
  role_name: string;
  permissions: string[];
}

export interface User {
  _id: string;
  full_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (
    user: User,
    accessToken?: string | null,
    refreshToken?: string | null
  ) => void;

  setAccessToken: (accessToken: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;

  setAuthenticated: (authenticated: boolean) => void;

  setLoading: (loading: boolean) => void;

  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user, accessToken, refreshToken) =>
        set((state) => ({
          user,
          accessToken:
            accessToken === undefined ? state.accessToken : accessToken,
          refreshToken:
            refreshToken === undefined ? state.refreshToken : refreshToken,
          isAuthenticated: true,
          isLoading: false,
        })),

      setAccessToken: (accessToken) =>
        set({ accessToken }),

      setRefreshToken: (refreshToken) =>
        set({ refreshToken }),

      setAuthenticated: (authenticated) =>
        set({
          isAuthenticated: authenticated,
          isLoading: false,
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      clearAuth: () => {
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("sessionId");
        } catch {
          // Ignore localStorage errors in SSR or restricted environments
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "sunraj-admin-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const storedToken =
            typeof window !== "undefined"
              ? localStorage.getItem("accessToken") || localStorage.getItem("token")
              : null;

          if (state.user || state.accessToken || storedToken) {
            state.isAuthenticated = true;
          }
          state.isLoading = false;
        }
      },
    }
  )
);