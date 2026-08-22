import {
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import {
  getCurrentSession,
  resetPassword,
} from "../../../api/authApi.js";

import "./ResetPassword.css";

export default function ResetPassword() {
  const navigate =
    useNavigate();

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  const [
    validSession,
    setValidSession,
  ] = useState(false);

  /* =======================================================
     CHECK PASSWORD RESET SESSION
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const checkSession =
      async () => {
        try {
          const session =
            await getCurrentSession();

          if (mounted) {
            setValidSession(
              Boolean(
                session?.access_token
              )
            );
          }
        } catch (error) {
          console.error(
            "Reset session check failed:",
            error
          );

          if (mounted) {
            setValidSession(
              false
            );
          }
        } finally {
          if (mounted) {
            setCheckingSession(
              false
            );
          }
        }
      };

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     RESET PASSWORD
  ======================================================= */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (
        password.length < 8
      ) {
        toast.error(
          "Password must be at least 8 characters."
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        toast.error(
          "Passwords do not match."
        );

        return;
      }

      try {
        setLoading(true);

        await resetPassword({
          password,
        });

        toast.success(
          "Password updated successfully."
        );

        navigate(
          "/sign_in",
          {
            replace: true,
          }
        );
      } catch (error) {
        console.error(
          "Reset password error:",
          error
        );

        toast.error(
          error?.message ||
            "Failed to reset password."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="reset-password-page">
      <div className="reset-password-shell">
        {/* LEFT */}

        <div className="reset-password-left">
          <div>
            <div className="reset-password-brand">
              ECHOO
            </div>

            <p className="reset-password-eyebrow">
              Account security
            </p>

            <h1>
              Create a
              <br />
              new password.
            </h1>

            <p className="reset-password-description">
              Choose a strong new
              password to secure your
              grocery shopping account.
            </p>
          </div>

          <div className="reset-password-left-card">
            <KeyRound
              size={22}
            />

            <div>
              <strong>
                Keep it secure
              </strong>

              <span>
                Use at least 8
                characters and avoid
                passwords you use
                elsewhere.
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className="reset-password-right">
          <div className="reset-password-topbar">
            <div className="reset-password-mobile-brand">
              ECHOO
            </div>

            <Link
              to="/sign_in"
              className="reset-password-login-link"
            >
              Back to login
            </Link>
          </div>

          <div className="reset-password-form-wrap">
            {checkingSession ? (
              <div className="reset-password-status">
                <div className="reset-password-loader" />

                <h2>
                  Checking reset link
                </h2>

                <p>
                  Please wait while we
                  verify your password
                  recovery session.
                </p>
              </div>
            ) : !validSession ? (
              <div className="reset-password-status">
                <div className="reset-password-icon reset-password-icon-error">
                  <LockKeyhole
                    size={25}
                  />
                </div>

                <h2>
                  Reset link expired
                </h2>

                <p>
                  This password reset
                  link is invalid or has
                  expired. Request a new
                  link to continue.
                </p>

                <Link
                  to="/forgot-password"
                  className="reset-password-request-link"
                >
                  Request a new link
                </Link>
              </div>
            ) : (
              <>
                <div className="reset-password-icon">
                  <LockKeyhole
                    size={25}
                  />
                </div>

                <h2>
                  Set new password
                </h2>

                <p className="reset-password-subtitle">
                  Your new password must
                  contain at least 8
                  characters.
                </p>

                <form
                  onSubmit={
                    handleSubmit
                  }
                >
                  {/* PASSWORD */}

                  <label
                    htmlFor="new-password"
                    className="reset-password-label"
                  >
                    New password
                  </label>

                  <div className="reset-password-input-wrap">
                    <LockKeyhole
                      size={18}
                    />

                    <input
                      id="new-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        password
                      }
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event.target
                            .value
                        )
                      }
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      disabled={
                        loading
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      className="reset-password-eye"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>
                  </div>

                  {/* CONFIRM */}

                  <label
                    htmlFor="confirm-password"
                    className="reset-password-label reset-password-second-label"
                  >
                    Confirm password
                  </label>

                  <div className="reset-password-input-wrap">
                    <LockKeyhole
                      size={18}
                    />

                    <input
                      id="confirm-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(
                        event
                      ) =>
                        setConfirmPassword(
                          event.target
                            .value
                        )
                      }
                      placeholder="Enter password again"
                      autoComplete="new-password"
                      required
                      disabled={
                        loading
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      className="reset-password-eye"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      loading
                    }
                    className="reset-password-submit"
                  >
                    {loading
                      ? "Updating password..."
                      : "Reset password"}
                  </button>
                </form>

                <p className="reset-password-help">
                  Remembered your
                  password?{" "}
                  <Link to="/sign_in">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}