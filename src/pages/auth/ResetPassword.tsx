import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { resetPassword } from "../../services/auth.api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1. Hold token in React memory state
  const [resetToken, setResetToken] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 2. Extract token on mount and instantly clean the URL bar
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");

    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);

      // Removes ?token=... query string from browser address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    // Token validation
    if (!resetToken) {
      setError("This password reset link is invalid or has expired.");
      return;
    }

    // Password validation
    if (!password) {
      setError("Please enter your new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // Confirm password validation
    if (!confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // Submit token stored safely in React state
      await resetPassword({
        token: resetToken,
        password,
      });

      // Password successfully changed
      navigate("/login", {
        replace: true,
        state: {
          message:
            "Password changed successfully. Please login with your new password.",
        },
      });
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to reset password. The reset link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-8 shadow-sm">
          {/* Back */}
          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#6B7688] hover:text-[#101E33]"
          >
            <FiArrowLeft size={16} />
            Back to Login
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#101E33]">
              Reset Password
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#6B7688]">
              Enter your new password below.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#101E33]"
              >
                New Password
              </label>

              <div className="relative">
                <FiLock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8994A5]"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter new password"
                  disabled={loading}
                  className="w-full rounded-xl border border-[#E7E9EC] bg-white py-3 pl-10 pr-11 text-sm text-[#101E33] outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8994A5] hover:text-[#101E33]"
                >
                  {showPassword ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-[#101E33]"
              >
                Confirm Password
              </label>

              <div className="relative">
                <FiLock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8994A5]"
                />

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm new password"
                  disabled={loading}
                  className="w-full rounded-xl border border-[#E7E9EC] bg-white py-3 pl-10 pr-11 text-sm text-[#101E33] outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8994A5] hover:text-[#101E33]"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Requirements */}
            <div className="rounded-xl bg-[#F7F9FC] p-4">
              <p className="text-xs font-semibold text-[#101E33]">
                Password requirements
              </p>

              <ul className="mt-2 space-y-1 text-xs text-[#6B7688]">
                <li>• Password must be at least 8 characters</li>
                <li>• Passwords must match</li>
              </ul>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#101E33] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1B3A6B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Changing Password..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}