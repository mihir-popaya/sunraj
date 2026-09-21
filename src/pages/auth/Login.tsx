// src/pages/auth/Login.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

import {
  login,
  getCurrentUser,
  getAccessToken,
  getRefreshToken,
  getSessionId,
  normalizeToken,
} from "../../services/auth.api";
import { useAuthStore } from "../../store/authStore";
import { loginSchema } from "../../schemas/login.schema";

import logo from "../../assets/images/logo.jpg";

/* =========================================================
   TYPES
========================================================= */

interface AuthResponseData {
  user?: any;
  token?: string;
  accessToken?: string;
  [key: string]: any;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const setUser = useAuthStore((state) => state.setUser);
  const successMessage = location.state?.message;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [serverError, setServerError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear previous errors
    setErrors({});
    setServerError("");

    // Validate form
    const result = loginSchema.safeParse({
      email: email.trim(),
      password,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    try {
      setLoading(true);

      // STEP 1: Execute Login API Request
      const response = await login({
        email: email.trim(),
        password,
      });

      // Axios only resolves successful HTTP responses. Some backend versions
      // omit the optional `success` field, so only an explicit false is a failure.
      if (response?.success === false) {
        setServerError(response?.message || "Unable to sign in.");
        return;
      }

      // STEP 2: Extract and persist tokens before making any follow-up request.
      const responseData = response?.data as AuthResponseData | undefined;
      const token = normalizeToken(
        getAccessToken(response) ||
          responseData?.accessToken ||
          responseData?.token ||
          (response as any)?.accessToken ||
          (response as any)?.token
      );

      const rToken = normalizeToken(
        getRefreshToken(response) ||
          responseData?.refreshToken ||
          responseData?.refresh_token ||
          (response as any)?.refreshToken ||
          (response as any)?.refresh_token
      );
          const sessionId = getSessionId(response);

      // STEP 3: Save Tokens Synchronously to Storage
      if (token) {
        useAuthStore.getState().setAccessToken(token);
        localStorage.setItem("accessToken", token);
        localStorage.setItem("token", token);
      }
      if (rToken) {
        localStorage.setItem("refreshToken", rToken);
      }
      if (sessionId) {
        localStorage.setItem("sessionId", sessionId);
      }

      let authenticatedUser =
        responseData?.user ||
        (response as any)?.user;

      if (!authenticatedUser) {
        try {
          const meResponse = await getCurrentUser();
          const meData = meResponse?.data as AuthResponseData | undefined;

          if (meResponse?.success !== false && (meData?.user || (meResponse as any)?.user)) {
            authenticatedUser = meData?.user || (meResponse as any)?.user;
          }
        } catch (meError) {
          console.warn("Could not fetch user via /auth/me:", meError);
        }
      }

      // Fallback user if backend succeeded but didn't return full user object
      if (!authenticatedUser) {
        authenticatedUser = {
          _id: "admin-user",
          full_name: email.split("@")[0] || "Administrator",
          email: email.trim(),
          phone_number: "",
          is_active: true,
          role: {
            _id: "admin",
            role_name: "Admin",
            permissions: ["*"],
          },
        };
      }

      // STEP 4: Save User in Zustand Store & Navigate
      setUser(authenticatedUser, token, rToken);

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error: unknown) {
      console.error("Login error:", error);

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const backendMessage = error.response.data?.message;

        if (status === 401) {
          setServerError(backendMessage || "Invalid email or password.");
        } else if (status === 403) {
          setServerError(
            backendMessage || "You are not authorized to access the admin panel."
          );
        } else {
          setServerError(backendMessage || "Unable to sign in. Please try again.");
        }
      } else {
        setServerError(
          "Unable to connect to the server. Please check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <div className="grid min-h-screen lg:grid-cols-[45%_55%]">
        {/* =================================================
            LEFT BRAND PANEL
        ================================================= */}
        <section
          className="
            relative
            hidden
            overflow-hidden
            bg-[#101E33]
            lg:flex
            lg:items-center
          "
        >
          {/* Background decoration */}
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full border border-white/[0.06]" />
          <div className="absolute -bottom-56 -left-40 h-[500px] w-[500px] rounded-full border border-white/[0.05]" />
          <div className="absolute right-20 top-1/2 h-24 w-24 rounded-full bg-[#C0272D]/10 blur-2xl" />

          {/* Core Content Container */}
          <div
            className="
              relative
              z-10
              mx-auto
              flex
              w-full
              max-w-[560px]
              flex-col
              items-center
              px-10
              xl:px-16
            "
          >
            {/* Centered Logo container */}
            <div className="flex w-full justify-center">
              <Link to="/login" className="inline-flex items-center">
                <div
                  className="
                    flex
                    h-[52px]
                    w-[200px]
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-lg
                    bg-white
                    px-3
                    py-2
                    shadow-sm
                  "
                >
                  <img
                    src={logo}
                    alt="Sunraj Corrugators logo"
                    className="block h-full w-full object-contain"
                  />
                </div>
              </Link>
            </div>

            {/* Main Text Content wrapper */}
            <div className="mt-16 flex flex-col items-center text-center">
              <div className="mb-4 inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C0272D]" />
                <span
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-[#D95A5F]
                  "
                >
                  Admin Portal
                </span>
              </div>

              <h2
                className="
                  max-w-[500px]
                  font-sora
                  text-4xl
                  font-semibold
                  leading-[1.12]
                  tracking-[-0.04em]
                  text-white
                  xl:text-[52px]
                "
              >
                Manage your
                <span className="text-[#D95A5F]"> packaging business.</span>
              </h2>

              <p
                className="
                  mt-5
                  max-w-[450px]
                  text-sm
                  leading-7
                  text-[#9CA9BC]
                "
              >
                Manage your products, machinery, industries, enquiries and website
                content from one centralized administration panel.
              </p>
            </div>

            {/* Feature cards */}
            <div className="mt-12 grid w-full grid-cols-2 gap-3">
              <div
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  p-4
                  backdrop-blur-sm
                "
              >
                <div
                  className="
                    mb-3
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/10
                    text-sm
                    text-white
                  "
                >
                  ✓
                </div>
                <p className="text-xs font-semibold text-white">Secure access</p>
                <p className="mt-1 text-[11px] text-[#7F8DA4]">
                  Protected admin area
                </p>
              </div>

              <div
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  p-4
                  backdrop-blur-sm
                "
              >
                <div
                  className="
                    mb-3
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/10
                    text-sm
                    text-white
                  "
                >
                  ↗
                </div>
                <p className="text-xs font-semibold text-white">
                  Centralized control
                </p>
                <p className="mt-1 text-[11px] text-[#7F8DA4]">
                  Manage website content
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 flex items-center gap-3 text-[11px] text-[#65748C]">
              <span>© {new Date().getFullYear()} Sunraj Corrugators</span>
              <span>•</span>
              <span>Admin Management System</span>
            </div>
          </div>
        </section>

        {/* =================================================
            RIGHT LOGIN SECTION
        ================================================= */}
        <section
          className="
            flex
            min-h-screen
            items-center
            justify-center
            px-5
            py-10
            sm:px-8
            lg:px-12
            xl:px-20
          "
        >
          <div className="w-full max-w-[440px]">
            {/* Mobile Logo */}
            <div
              className="
                mb-12
                flex
                items-center
                gap-3
                lg:hidden
              "
            >
              <Link
                to="/login"
                className="
                  flex
                  h-[46px]
                  w-[160px]
                  items-center
                  justify-start
                  overflow-hidden
                  rounded-lg
                  border
                  border-[#E7E9EC]
                  bg-white
                  px-2.5
                  py-1.5
                  shadow-sm
                "
              >
                <img
                  src={logo}
                  alt="Sunraj Corrugators logo"
                  className="block h-full w-full object-contain object-left"
                />
              </Link>
            </div>

            {/* Success Notification Alert */}
            {successMessage && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}

            {/* Heading */}
            <div className="mb-9">
              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.17em]
                  text-[#C0272D]
                "
              >
                Welcome back
              </p>

              <h2
                className="
                  mt-3
                  font-sora
                  text-3xl
                  font-semibold
                  tracking-[-0.035em]
                  text-[#101E33]
                  sm:text-[36px]
                "
              >
                Admin Login
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-[#718096]
                "
              >
                Sign in to access your Sunraj administration dashboard.
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div
                className="
                  mb-5
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-xs
                  font-medium
                  text-[#A91F25]
                "
              >
                {serverError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="admin@sunrajcorrugators.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                }
                error={errors.email}
              />

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="
                      text-sm
                      font-semibold
                      text-[#101E33]
                    "
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-[#1B3A6B] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <span
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#8A96A8]
                    "
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="4" y="10" width="16" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  </span>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    className={`
                      h-12
                      w-full
                      rounded-xl
                      border
                      bg-white
                      pl-11
                      pr-16
                      text-sm
                      text-[#101E33]
                      outline-none
                      transition-all
                      placeholder:text-[#A5ADBA]
                      ${
                        errors.password
                          ? "border-[#C0272D] focus:ring-4 focus:ring-red-100"
                          : "border-[#E1E5EA] focus:border-[#1B3A6B] focus:ring-4 focus:ring-blue-50"
                      }
                      hover:border-[#C5CBD4]
                    `}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-xs
                      font-bold
                      text-[#1B3A6B]
                      hover:text-[#C0272D]
                    "
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {errors.password && (
                  <p
                    className="
                      text-xs
                      font-medium
                      text-[#C0272D]
                    "
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label
                  className="
                    flex
                    cursor-pointer
                    items-center
                    gap-2.5
                    text-xs
                    font-medium
                    text-[#718096]
                  "
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="
                      h-4
                      w-4
                      cursor-pointer
                      rounded
                      border-[#D7DCE3]
                      accent-[#C0272D]
                    "
                  />
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button type="submit" loading={loading}>
                  <span>Sign in to Dashboard</span>
                  <span
                    className="
                      text-lg
                      transition-transform
                      duration-200
                      group-hover:translate-x-1
                    "
                  >
                    →
                  </span>
                </Button>
              </div>
            </form>

            {/* Security Notice */}
            <div
              className="
                mt-6
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-[#DCEBE2]
                bg-[#F3FAF6]
                px-4
                py-3
              "
            >
              <div
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#1E7A4C]
                  text-xs
                  font-bold
                  text-white
                "
              >
                ✓
              </div>

              <p
                className="
                  text-[11px]
                  leading-5
                  text-[#547263]
                "
              >
                Your account is protected with secure authentication.
              </p>
            </div>

            {/* Authorization Disclaimer */}
            <p
              className="
                mt-8
                text-center
                text-[11px]
                leading-5
                text-[#9AA3B1]
              "
            >
              Authorized personnel only.
              <br />
              Contact the system administrator if you need access.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
