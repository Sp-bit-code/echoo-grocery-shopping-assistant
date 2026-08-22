import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import "../styles/App.css";

const normalizeRole = (role) => {
  if (!role) return "user";

  const cleanRole = String(role).trim().toLowerCase();

  return cleanRole === "admin" ? "admin" : "user";
};

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const {
    isAuthenticated,
    profile,
    user,
    role,
    authLoading,
  } = useAuth();

  const location = useLocation();

  const currentRole = normalizeRole(
    role ||
      profile?.role ||
      user?.role ||
      user?.user_metadata?.role
  );

  // Wait until Supabase finishes checking the current session
  if (authLoading) {
    return (
      <div className="protected-loader">
        <div className="protected-loader-box">
          <div className="protected-loader-spinner" />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  // User is not logged in
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/sign_in"
        state={{ from: location }}
        replace
      />
    );
  }

  // Admin-only routes
  if (
    requiredRole === "admin" &&
    currentRole !== "admin"
  ) {
    return <Navigate to="/" replace />;
  }

  // User routes can be opened by any authenticated account
  // including admin accounts.
  if (requiredRole === "user") {
    return children;
  }

  return children;
};

export default ProtectedRoute;