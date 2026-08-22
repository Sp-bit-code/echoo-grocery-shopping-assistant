import {
  ArrowUpRightIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import { useAuth } from "../../../context/AuthContext.jsx";

import "./LoginForm.css";

const LOGIN_MODE_KEY = "echoo_login_mode";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    googleLogin,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =========================================================
     REMEMBER EMAIL
  ========================================================= */

  useEffect(() => {
    const savedEmail =
      localStorage.getItem(
        "rememberedEmail"
      );

    if (!savedEmail) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      email: savedEmail,
      rememberMe: true,
    }));
  }, []);

  /* =========================================================
     USER LOGIN MODE
  ========================================================= */

  const setUserMode = () => {
    localStorage.setItem(
      LOGIN_MODE_KEY,
      "user"
    );

    window.dispatchEvent(
      new Event("auth:mode-change")
    );
  };

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =========================================================
     GOOGLE LOGIN
  ========================================================= */

  const handleGoogleLogin =
    async () => {
      if (loading) {
        return;
      }

      try {
        setLoading(true);

        setUserMode();

        await googleLogin();

        /*
          Supabase OAuth redirects the browser,
          so navigation happens after the OAuth
          redirect is processed.
        */
      } catch (error) {
        console.error(
          "Google login error:",
          error
        );

        toast.error(
          error?.message ||
            "Google login failed."
        );

        setLoading(false);
      }
    };

  /* =========================================================
     EMAIL LOGIN
  ========================================================= */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const email =
        formData.email.trim();

      const password =
        formData.password;

      if (
        !email ||
        !password
      ) {
        toast.error(
          "Please enter email and password."
        );

        return;
      }

      try {
        setLoading(true);

        /*
          Normal sign-in always runs in user mode.

          Even if the account belongs to an admin,
          it behaves as a customer unless the account
          signs in through /admin_login.
        */
        setUserMode();

        await login({
          email,
          password,
        });

        if (
          formData.rememberMe
        ) {
          localStorage.setItem(
            "rememberedEmail",
            email
          );
        } else {
          localStorage.removeItem(
            "rememberedEmail"
          );
        }

        toast.success(
          "Welcome back!"
        );

        const redirectPath =
          location.state?.from
            ?.pathname;

        /*
          Never enter the admin dashboard
          from the normal customer login.
        */
        if (
          redirectPath &&
          !redirectPath.startsWith(
            "/admin"
          )
        ) {
          navigate(
            redirectPath,
            {
              replace: true,
            }
          );

          return;
        }

        navigate(
          "/",
          {
            replace: true,
          }
        );
      } catch (error) {
        console.error(
          "Login error:",
          error
        );

        toast.error(
          error?.message ||
            "Invalid email or password."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-[40px] overflow-hidden">

        {/* ===================================================
            LEFT PANEL
        =================================================== */}

        <div className="hidden md:flex md:w-1/2 bg-[#1a1a1a] p-12 flex-col justify-between relative overflow-hidden">

          <div className="z-10">
            <p className="text-gray-400 text-sm mb-20">
              Everyday groceries,
              smarter shopping.
            </p>

            <h1 className="text-white text-6xl font-bold leading-tight tracking-tight max-w-xs">
              Login to
              <br />
              your account
            </h1>
          </div>

          {/* Original Echoo decorative block */}
          <div className="absolute bottom-0 right-0 w-3/4 translate-y-20 translate-x-10 opacity-40">
            <div className="w-full aspect-[9/16] bg-gradient-to-tr from-neutral-800 to-neutral-700 rounded-t-[40px] border-t border-l border-neutral-600 shadow-2xl" />
          </div>

          <div className="z-10 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-[10px] text-gray-400">
              ©
            </div>

            <span className="text-gray-500 text-xs">
              {new Date().getFullYear()} EchOo Grocery
            </span>
          </div>
        </div>

        {/* ===================================================
            RIGHT PANEL
        =================================================== */}

        <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col relative">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-16">
            <Link
              to="/"
              className="text-2xl font-semibold tracking-tight text-gray-900"
            >
              echOo
            </Link>

            <Link
              to="/sign_up"
              className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
            >
              Sign Up

              <div className="bg-gray-100 p-1 rounded-full">
                <ArrowUpRightIcon className="size-3" />
              </div>
            </Link>
          </div>

          {/* FORM */}
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Sign In
            </h2>

            <p className="text-sm text-gray-500 mb-8">
              Sign in to shop groceries,
              manage your cart and view your orders.
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* EMAIL */}
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all disabled:opacity-60"
              />

              {/* PASSWORD */}
              <div className="relative">
                <input
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={
                    formData.password
                  }
                  onChange={
                    handleChange
                  }
                  disabled={loading}
                  className="w-full px-6 py-4 pr-14 bg-white border border-gray-200 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={loading}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeIcon className="size-5" />
                  ) : (
                    <EyeSlashIcon className="size-5" />
                  )}
                </button>
              </div>

              {/* REMEMBER / FORGOT */}
              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={
                      formData.rememberMe
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
                    className="h-4 w-4 accent-black"
                  />

                  Remember me
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-gray-900 hover:underline whitespace-nowrap"
                >
                  Forgot password?
                </Link>
              </div>

              {/* SIGN IN */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={
                    !formData.email ||
                    !formData.password ||
                    loading
                  }
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white rounded-full text-base font-semibold hover:from-gray-400 hover:to-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="translate-x-3">
                    {loading
                      ? "Signing in..."
                      : "Sign In"}
                  </span>

                  <div className="ml-auto bg-white/20 p-1 rounded-full">
                    <ArrowUpRightIcon className="size-4" />
                  </div>
                </button>

                {/* ADMIN */}
                <Link
                  to="/admin_login"
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-full text-gray-800 font-semibold text-sm shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Login as Admin

                  <ArrowUpRightIcon className="size-4" />
                </Link>

                {/* DIVIDER */}
                <div className="relative flex items-center py-3">
                  <div className="flex-grow border-t border-gray-200" />

                  <span className="flex-shrink mx-4 text-gray-400 text-sm font-light">
                    Or login with
                  </span>

                  <div className="flex-grow border-t border-gray-200" />
                </div>

                {/* GOOGLE */}
                <button
                  type="button"
                  onClick={
                    handleGoogleLogin
                  }
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-gray-200 rounded-full text-gray-700 font-semibold text-sm shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 01-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.38z"
                    />

                    <path
                      fill="#34A853"
                      d="M12 22c2.7 0 4.97-.9 6.62-2.39l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.6A10 10 0 0012 22z"
                    />

                    <path
                      fill="#FBBC05"
                      d="M6.39 13.93A6 6 0 016.08 12c0-.67.12-1.32.31-1.93v-2.6H3.04A10 10 0 002 12c0 1.61.39 3.13 1.04 4.53l3.35-2.6z"
                    />

                    <path
                      fill="#EA4335"
                      d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.96 2.95 14.7 2 12 2a10 10 0 00-8.96 5.47l3.35 2.6C7.18 7.7 9.39 5.94 12 5.94z"
                    />
                  </svg>

                  Continue with Google
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-400 text-center mt-6">
              Admin dashboard access is available through Admin Login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;