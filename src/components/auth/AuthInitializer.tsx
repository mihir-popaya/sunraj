// src/components/auth/AuthInitializer.tsx
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";

interface Props {
  children: React.ReactNode;
}

export default function AuthInitializer({ children }: Props) {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setLoading = useAuthStore((state) => state.setLoading);
  const persistedUser = useAuthStore((state) => state.user);
  const persistedToken = useAuthStore((state) => state.accessToken);

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const hasLocalToken =
      typeof window !== "undefined"
        ? Boolean(
            persistedToken ||
              localStorage.getItem("accessToken") ||
              localStorage.getItem("token")
          )
        : false;

    if (persistedUser || hasLocalToken) {
      setAuthenticated(true);
      setLoading(false);
      queueMicrotask(() => setInitialized(true));
      return;
    }

    setAuthenticated(false);
    setLoading(false);
    queueMicrotask(() => setInitialized(true));
  }, [setAuthenticated, setLoading, persistedUser, persistedToken]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA]">
        <p className="text-sm font-semibold text-[#101E33]">Restoring session...</p>
      </div>
    );
  }

  return <>{children}</>;
}