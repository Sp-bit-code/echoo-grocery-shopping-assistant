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
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import {
  getProfile,
  googleLogin as apiGoogleLogin,
  login as apiLogin,
  logout as apiLogout,
} from "../../../api/authApi.js";

import {
  useAuth,
} from "../../../context/AuthContext.jsx";

const LOGIN_MODE_KEY =
  "echoo_login_mode";

/* =========================================================
   HELPERS
========================================================= */

const normalizeRole = (
  role
) =>
  String(role || "user")
    .trim()
    .toLowerCase() ===
  "admin"
    ? "admin"
    : "user";

/*
  These are legacy keys from the older Echoo build.

  Supabase itself should manage its real authentication
  session. We only remove these old project-specific keys
  instead of clearing the entire browser session storage.
*/
const clearLegacyAuth = () => {
  localStorage.removeItem(
    "echoo_session"
  );

  localStorage.removeItem(
    "echoo_access_token"
  );

  localStorage.removeItem(
    "echoo_refresh_token"
  );
};

const AdminLogin = () => {
  const navigate =
    useNavigate();

  const {
    refreshUser,
  } = useAuth();

  const [
    formData,
    setFormData,
  ] = useState({
    email: "",
    password: "",
  });

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  /* =======================================================
     PAGE TITLE
  ======================================================= */

  useEffect(() => {
    document.title =
      "Admin Login | EchOo Grocery";
  }, []);

  /* =======================================================
     CLEAN ADMIN MODE
  ======================================================= */

  const clearAdminMode = () => {
    localStorage.removeItem(
      LOGIN_MODE_KEY
    );

    clearLegacyAuth();

    window.dispatchEvent(
      new CustomEvent(
        "auth:logout"
      )
    );
  };

  /* =======================================================
     VERIFY ADMIN PROFILE
  ======================================================= */

  const verifyAdminProfile =
    async () => {
      const profile =
        await getProfile();

      if (!profile) {
        throw new Error(
          "Admin profile could not be found."
        );
      }

      const role =
        normalizeRole(
          profile.role
        );

      if (role !== "admin") {
        await apiLogout().catch(
          () => {}
        );

        clearAdminMode();

        toast.error(
          "Access denied. This account does not have admin access."
        );

        navigate(
          "/sign_in",
          {
            replace: true,
          }
        );

        return false;
      }

      /*
        IMPORTANT:
        Set admin mode BEFORE refreshing AuthContext.

        AuthContext uses this key when calculating the
        effective role for the current session.
      */
      localStorage.setItem(
        LOGIN_MODE_KEY,
        "admin"
      );

      if (refreshUser) {
        await refreshUser();
      }

      return true;
    };

  /* =======================================================
     OAUTH RETURN CHECK

     If Google OAuth redirects back to this page, we can
     detect an existing session and validate whether it
     belongs to an actual admin.
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const checkExistingAdminSession =
      async () => {
        const loginMode =
          localStorage.getItem(
            LOGIN_MODE_KEY
          );

        if (
          loginMode !== "admin"
        ) {
          return;
        }

        try {
          const profile =
            await getProfile();

          if (
            cancelled ||
            !profile
          ) {
            return;
          }

          if (
            normalizeRole(
              profile.role
            ) !== "admin"
          ) {
            await apiLogout().catch(
              () => {}
            );

            clearAdminMode();

            if (!cancelled) {
              toast.error(
                "This Google account does not have admin access."
              );

              navigate(
                "/sign_in",
                {
                  replace:
                    true,
                }
              );
            }

            return;
          }

          if (refreshUser) {
            await refreshUser();
          }

          if (!cancelled) {
            navigate(
              "/admin/dashboard",
              {
                replace: true,
              }
            );
          }
        } catch {
          /*
            No active authenticated session yet.
            This is normal when simply opening
            the admin login page.
          */
        }
      };

    checkExistingAdminSession();

    return () => {
      cancelled = true;
    };
  }, [
    navigate,
    refreshUser,
  ]);

  /* =======================================================
     INPUT
  ======================================================= */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  /* =======================================================
     EMAIL LOGIN
  ======================================================= */

  const handleEmailLogin =
    async (event) => {
      event.preventDefault();

      const email =
        formData.email
          .trim()
          .toLowerCase();

      const password =
        formData.password;

      if (
        !email ||
        !password
      ) {
        toast.error(
          "Please enter your admin email and password."
        );

        return;
      }

      try {
        setLoading(true);

        /*
          Ensure any previous customer session is removed.
        */
        await apiLogout().catch(
          () => {}
        );

        clearAdminMode();

        /*
          Set admin mode before login so that when the
          context refreshes it knows this is an admin
          login flow.
        */
        localStorage.setItem(
          LOGIN_MODE_KEY,
          "admin"
        );

        await apiLogin({
          email,
          password,
        });

        const isAdmin =
          await verifyAdminProfile();

        if (!isAdmin) {
          return;
        }

        toast.success(
          "Admin login successful."
        );

        navigate(
          "/admin/dashboard",
          {
            replace: true,
          }
        );
      } catch (error) {
        console.error(
          "Admin login error:",
          error
        );

        await apiLogout().catch(
          () => {}
        );

        clearAdminMode();

        toast.error(
          error?.message ||
            "Admin login failed."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =======================================================
     GOOGLE ADMIN LOGIN
  ======================================================= */

  const handleGoogleLogin =
    async () => {
      try {
        setLoading(true);

        await apiLogout().catch(
          () => {}
        );

        clearAdminMode();

        /*
          Preserve admin intent across the OAuth redirect.

          When AuthContext initializes after OAuth,
          it can distinguish this from normal customer
          Google login.
        */
        localStorage.setItem(
          LOGIN_MODE_KEY,
          "admin"
        );

        await apiGoogleLogin();
      } catch (error) {
        console.error(
          "Google admin login error:",
          error
        );

        await apiLogout().catch(
          () => {}
        );

        clearAdminMode();

        toast.error(
          error?.message ||
            "Google admin login failed."
        );

        setLoading(false);
      }
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] p-4 flex items-center justify-center">

      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[36px] border border-white/70 bg-white/55 shadow-[0_25px_70px_rgba(31,41,55,0.15)] backdrop-blur-2xl md:grid-cols-2">

        {/* =================================================
            LEFT PANEL
        ================================================= */}

        <div className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 p-12 text-white md:flex">

          <div className="relative z-10">

            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
              <ShieldCheckIcon className="h-7 w-7" />
            </div>

            <p className="mb-4 text-sm font-medium text-gray-400">
              EchOo Grocery Admin
            </p>

            <h1 className="text-5xl font-bold leading-tight">
              Manage your
              <br />
              grocery store.
            </h1>

            <p className="mt-6 max-w-sm text-sm leading-7 text-gray-400">
              Manage grocery
              products, monitor
              inventory, process COD
              orders, review customer
              accounts and track store
              analytics.
            </p>
          </div>

          <div className="relative z-10">

            <div className="mb-4 h-px w-full bg-white/10" />

            <p className="text-xs leading-5 text-gray-500">
              Access is restricted to
              accounts whose Supabase
              profile role is set to
              admin.
            </p>
          </div>

          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        </div>

        {/* =================================================
            LOGIN PANEL
        ================================================= */}

        <div className="bg-white/50 p-8 sm:p-12 lg:p-16">

          {/* TOP LINKS */}
          <div className="mb-12 flex items-center justify-between">

            <Link
              to="/sign_in"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4" />

              User Login
            </Link>

            <Link
              to="/"
              className="text-sm font-semibold text-gray-600 transition hover:text-gray-900"
            >
              Home
            </Link>
          </div>

          <div className="mx-auto max-w-sm">

            {/* LOGO */}
            <div className="mb-8">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-sm font-bold text-white shadow-lg">
                  eO
                </div>

                <div>
                  <p className="text-lg font-bold tracking-tight text-gray-900">
                    EchOo
                  </p>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                    Grocery Admin
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900">
                Admin Login
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Sign in with an
                account that has
                administrator access.
              </p>
            </div>

            {/* EMAIL FORM */}
            <form
              onSubmit={
                handleEmailLogin
              }
              className="space-y-4"
            >

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Admin Email
                </label>

                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  disabled={loading}
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-5 py-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-900/5 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Password
                </label>

                <div className="relative">

                  <input
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/80 bg-white/80 py-4 pl-5 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-900/5 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (
                          previous
                        ) =>
                          !previous
                      )
                    }
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700 disabled:opacity-50"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gray-600 to-gray-900 py-4 text-sm font-semibold text-white shadow-[inset_0px_2px_4px_rgba(255,255,255,0.25),_0px_5px_12px_rgba(0,0,0,0.25)] transition hover:from-gray-500 hover:to-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Checking access..."
                  : "Login as Admin"}

                {!loading && (
                  <ArrowRightIcon className="h-4 w-4" />
                )}
              </button>
            </form>

            {/* DIVIDER */}
            <div className="my-6 flex items-center">

              <div className="flex-grow border-t border-gray-200" />

              <span className="mx-4 text-xs text-gray-400">
                or
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
              className="w-full rounded-full border border-white/80 bg-white/70 py-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue with Google
            </button>

            <div className="mt-6 rounded-2xl border border-white/80 bg-white/45 p-4">

              <div className="flex items-start gap-3">

                <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />

                <p className="text-xs leading-5 text-gray-500">
                  Customer accounts
                  cannot enter the admin
                  dashboard. Access is
                  verified against the
                  role stored in the
                  profile table.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;