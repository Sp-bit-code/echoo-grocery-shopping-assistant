import {
  ArrowLeft,
  KeyRound,
  Mail,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import {
  forgotPassword,
} from "../../../api/authApi.js";

import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      if (!cleanEmail) {
        toast.error(
          "Please enter your email address."
        );

        return;
      }

      try {
        setLoading(true);

        await forgotPassword(
          cleanEmail
        );

        /*
          Keep message generic so we do not reveal
          whether an account exists for the email.
        */
        toast.success(
          "If an account exists for this email, a reset link has been sent."
        );
      } catch (error) {
        console.error(
          "Forgot password error:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to send reset link."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-shell">
        {/* LEFT PANEL */}

        <div className="forgot-password-left">
          <div>
            <div className="forgot-password-brand">
              ECHOO
            </div>

            <p className="forgot-password-eyebrow">
              Account recovery
            </p>

            <h1>
              Forgot
              <br />
              your password?
            </h1>

            <p className="forgot-password-description">
              Enter the email linked
              to your account and
              we’ll send you a secure
              password reset link.
            </p>
          </div>

          <div className="forgot-password-left-card">
            <KeyRound
              size={22}
            />

            <div>
              <strong>
                Secure recovery
              </strong>

              <span>
                Your account stays
                protected throughout
                the reset process.
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}

        <div className="forgot-password-right">
          <div className="forgot-password-topbar">
            <div className="forgot-password-mobile-brand">
              ECHOO
            </div>

            <Link
              to="/sign_in"
              className="forgot-password-back"
            >
              <ArrowLeft
                size={16}
              />

              Back to login
            </Link>
          </div>

          <div className="forgot-password-form-wrap">
            <div className="forgot-password-icon">
              <Mail
                size={25}
              />
            </div>

            <h2>
              Reset password
            </h2>

            <p className="forgot-password-subtitle">
              We’ll email you a link
              to create a new password.
            </p>

            <form
              onSubmit={
                handleSubmit
              }
            >
              <label
                htmlFor="forgot-email"
                className="forgot-password-label"
              >
                Email address
              </label>

              <div className="forgot-password-input-wrap">
                <Mail
                  size={18}
                />

                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    loading
                  }
                  required
                />
              </div>

              <button
                type="submit"
                disabled={
                  loading
                }
                className="forgot-password-submit"
              >
                {loading
                  ? "Sending reset link..."
                  : "Send reset link"}
              </button>
            </form>

            <p className="forgot-password-help">
              Remembered your password?{" "}
              <Link to="/sign_in">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}