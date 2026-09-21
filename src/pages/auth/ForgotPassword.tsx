import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiMail,
  FiCheckCircle,
} from "react-icons/fi";

import { forgotPassword } from "../../services/auth.api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      await forgotPassword({
        email: trimmedEmail,
      });

      setSuccess(
        "If an account exists with this email address, a password reset button has been sent to your email."
      );
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to send reset link. Please try again."
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
              Forgot Password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#6B7688]">
              Enter your registered email address and we will
              send you a password reset link.
            </p>
          </div>

          {/* Success */}
          {success && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex gap-3">
                <FiCheckCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <p className="text-sm leading-5 text-green-700">
                  {success}
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#101E33]"
              >
                Email Address
              </label>

              <div className="relative">
                <FiMail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8994A5]"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter your email address"
                  disabled={loading}
                  className="w-full rounded-xl border border-[#E7E9EC] bg-white py-3 pl-10 pr-4 text-sm text-[#101E33] outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#101E33] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1B3A6B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>
          </form>

          {/* Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-[#1B3A6B] hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}