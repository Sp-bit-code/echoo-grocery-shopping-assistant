import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  login as apiLogin,
  register as apiRegister,
  googleLogin as apiGoogleLogin,
  logout as apiLogout,
  getCurrentSession,
  getCurrentUser,
  getProfile,
  getUserRole,
  handleOAuthRedirect,
} from "../api/authApi";

const AuthContext = createContext(null);

const LOGIN_MODE_KEY = "echoo_login_mode";

/* =========================================================
   ROLE HELPERS
========================================================= */

const normalizeRole = (role) => {
  const cleanRole = String(role || "")
    .trim()
    .toLowerCase();

  return cleanRole === "admin" ? "admin" : "user";
};

const getLoginMode = () => {
  return localStorage.getItem(LOGIN_MODE_KEY) || "user";
};

const getEffectiveRole = (realRole) => {
  const loginMode = getLoginMode();
  const normalizedRealRole = normalizeRole(realRole);

  /*
    Normal website login:
      Admin account behaves like a normal user.

    Admin login:
      Only an account whose actual database role is "admin"
      receives admin access.
  */

  if (
    loginMode === "admin" &&
    normalizedRealRole === "admin"
  ) {
    return "admin";
  }

  return "user";
};

/* =========================================================
   PROFILE NORMALIZATION
========================================================= */

const normalizeProfile = (profileData, authUser) => {
  if (!profileData && !authUser) {
    return null;
  }

  const metadata = authUser?.user_metadata || {};

  const realRole = normalizeRole(
    profileData?.role || metadata?.role
  );

  const effectiveRole = getEffectiveRole(realRole);

  const fullName =
    profileData?.full_name ||
    metadata?.full_name ||
    metadata?.name ||
    "";

  return {
    id: profileData?.id || authUser?.id || "",

    email:
      profileData?.email ||
      authUser?.email ||
      "",

    full_name: fullName,

    name:
      fullName ||
      authUser?.email ||
      "User",

    phone:
      profileData?.phone ||
      metadata?.phone ||
      "",

    avatar_url:
      profileData?.avatar_url ||
      metadata?.avatar_url ||
      metadata?.picture ||
      "",

    address:
      profileData?.address || null,

    created_at:
      profileData?.created_at ||
      authUser?.created_at ||
      null,

    updated_at:
      profileData?.updated_at || null,

    role: effectiveRole,

    realRole,

    loginMode: getLoginMode(),
  };
};

/* =========================================================
   AUTH PROVIDER
========================================================= */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* -------------------------------------------------------
     APPLY AUTH STATE
  ------------------------------------------------------- */

  const applyAuthState = useCallback(
    (nextSession, nextUser, nextProfile) => {
      const normalizedProfile = normalizeProfile(
        nextProfile,
        nextUser
      );

      setSession(nextSession || null);
      setProfile(normalizedProfile);

      if (nextUser || normalizedProfile) {
        setUser({
          ...(nextUser || {}),
          ...(normalizedProfile || {}),
          authUser: nextUser || null,
        });
      } else {
        setUser(null);
      }
    },
    []
  );

  /* -------------------------------------------------------
     CLEAR AUTH STATE
  ------------------------------------------------------- */

  const clearAuthState = useCallback(() => {
    setSession(null);
    setProfile(null);
    setUser(null);
  }, []);

  /* -------------------------------------------------------
     FETCH PROFILE
  ------------------------------------------------------- */

  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser?.id) {
      setProfile(null);
      setUser(null);

      return null;
    }

    try {
      const profileData = await getProfile();

      const normalizedProfile = normalizeProfile(
        profileData,
        authUser
      );

      setProfile(normalizedProfile);

      setUser({
        ...authUser,
        ...normalizedProfile,
        authUser,
      });

      return normalizedProfile;
    } catch (error) {
      console.error("Profile fetch error:", error);

      /*
        Authentication can still exist even if profile
        loading temporarily fails.
      */

      const fallbackProfile = normalizeProfile(
        null,
        authUser
      );

      setProfile(fallbackProfile);

      setUser({
        ...authUser,
        ...fallbackProfile,
        authUser,
      });

      return fallbackProfile;
    }
  }, []);

  /* -------------------------------------------------------
     REFRESH CURRENT USER
  ------------------------------------------------------- */

  const refreshUser = useCallback(async () => {
    setAuthLoading(true);

    try {
      await handleOAuthRedirect();

      const currentSession = await getCurrentSession();
      const currentUser = await getCurrentUser();

      if (
        currentSession?.access_token &&
        currentUser
      ) {
        const profileData = await getProfile();

        applyAuthState(
          currentSession,
          currentUser,
          profileData
        );
      } else {
        clearAuthState();
      }
    } catch (error) {
      console.error("Auth refresh error:", error);
      clearAuthState();
    } finally {
      setAuthLoading(false);
    }
  }, [applyAuthState, clearAuthState]);

  /* -------------------------------------------------------
     INITIAL SESSION LOAD
  ------------------------------------------------------- */

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        await handleOAuthRedirect();

        const currentSession =
          await getCurrentSession();

        const currentUser =
          await getCurrentUser();

        if (!active) {
          return;
        }

        if (
          currentSession?.access_token &&
          currentUser
        ) {
          let profileData = null;

          try {
            profileData = await getProfile();
          } catch (error) {
            console.error(
              "Initial profile fetch error:",
              error
            );
          }

          if (!active) {
            return;
          }

          applyAuthState(
            currentSession,
            currentUser,
            profileData
          );
        } else {
          clearAuthState();
        }
      } catch (error) {
        console.error(
          "Session load error:",
          error
        );

        if (active) {
          clearAuthState();
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    };

    loadSession();

    const handleLogout = () => {
      clearAuthState();
      setAuthLoading(false);
    };

    const handleStorage = () => {
      loadSession();
    };

    const handleAuthModeChange = () => {
      loadSession();
    };

    window.addEventListener(
      "auth:logout",
      handleLogout
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      "auth:mode-change",
      handleAuthModeChange
    );

    return () => {
      active = false;

      window.removeEventListener(
        "auth:logout",
        handleLogout
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "auth:mode-change",
        handleAuthModeChange
      );
    };
  }, [applyAuthState, clearAuthState]);

  /* -------------------------------------------------------
     EMAIL LOGIN
  ------------------------------------------------------- */

  const login = useCallback(
    async ({ email, password }) => {
      const result = await apiLogin({
        email,
        password,
      });

      const nextSession =
        result?.session || null;

      const nextUser =
        result?.user ||
        nextSession?.user ||
        null;

      let nextProfile = null;

      if (nextUser) {
        try {
          nextProfile = await getProfile();
        } catch (error) {
          console.error(
            "Profile fetch after login failed:",
            error
          );
        }
      }

      applyAuthState(
        nextSession,
        nextUser,
        nextProfile
      );

      const normalizedProfile =
        normalizeProfile(
          nextProfile,
          nextUser
        );

      return {
        user: nextUser
          ? {
              ...nextUser,
              ...(normalizedProfile || {}),
              authUser: nextUser,
            }
          : null,

        profile: normalizedProfile,

        role:
          normalizedProfile?.role ||
          "user",

        realRole:
          normalizedProfile?.realRole ||
          "user",

        loginMode: getLoginMode(),

        session: nextSession,
      };
    },
    [applyAuthState]
  );

  /* -------------------------------------------------------
     REGISTER
  ------------------------------------------------------- */

  const register = useCallback(
    async ({
      fullName,
      name,
      email,
      password,
      phone = "",
    }) => {
      const finalName =
        fullName || name || "";

      localStorage.setItem(
        LOGIN_MODE_KEY,
        "user"
      );

      /*
        Do NOT send a role from React.

        Supabase automatically creates the profile
        with role = "user".
      */

      const result = await apiRegister({
        email,
        password,
        fullName: finalName,
        phone,
      });

      const nextSession =
        result?.session || null;

      const nextUser =
        result?.user ||
        nextSession?.user ||
        null;

      if (
        nextSession?.access_token &&
        nextUser
      ) {
        let nextProfile = null;

        try {
          nextProfile = await getProfile();
        } catch (error) {
          console.error(
            "Profile fetch after registration failed:",
            error
          );
        }

        applyAuthState(
          nextSession,
          nextUser,
          nextProfile
        );
      }

      return result;
    },
    [applyAuthState]
  );

  /* -------------------------------------------------------
     GOOGLE LOGIN
  ------------------------------------------------------- */

  const googleLogin = useCallback(async () => {
    localStorage.setItem(
      LOGIN_MODE_KEY,
      "user"
    );

    window.dispatchEvent(
      new Event("auth:mode-change")
    );

    return apiGoogleLogin();
  }, []);

  /* -------------------------------------------------------
     LOGOUT
  ------------------------------------------------------- */

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      localStorage.removeItem(
        LOGIN_MODE_KEY
      );

      clearAuthState();

      window.dispatchEvent(
        new Event("auth:logout")
      );
    }

    return true;
  }, [clearAuthState]);

  /* -------------------------------------------------------
     CONTEXT VALUE
  ------------------------------------------------------- */

  const value = useMemo(() => {
    const activeUser = profile || user;

    const realRole = normalizeRole(
      activeUser?.realRole ||
        profile?.realRole ||
        profile?.role ||
        user?.authUser?.user_metadata?.role ||
        session?.user?.user_metadata?.role
    );

    const activeRole =
      getEffectiveRole(realRole);

    const safeActiveUser = activeUser
      ? {
          ...activeUser,
          role: activeRole,
          realRole,
          loginMode: getLoginMode(),
        }
      : null;

    return {
      user: safeActiveUser,

      authUser:
        session?.user ||
        user?.authUser ||
        null,

      profile: safeActiveUser,

      session,

      role: activeRole,

      realRole,

      loginMode: getLoginMode(),

      authLoading,

      isAuthenticated: Boolean(
        session?.access_token &&
          safeActiveUser
      ),

      isAdmin:
        activeRole === "admin",

      isUser:
        activeRole === "user",

      login,

      register,

      googleLogin,

      logout,

      refreshUser,

      fetchProfile,

      getUserRole,
    };
  }, [
    user,
    profile,
    session,
    authLoading,
    login,
    register,
    googleLogin,
    logout,
    refreshUser,
    fetchProfile,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/* =========================================================
   AUTH HOOK
========================================================= */

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
};

export default AuthContext;