import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";

import { useAuth } from "../../../context/AuthContext.jsx";
import useOrders from "../../../hooks/useOrders.js";

import OrdersSection from "../../../components/profile/OrdersSection/OrdersSection.jsx";
import OverviewSection from "../../../components/profile/OverviewSection/OverviewSection.jsx";
import ProfileSidebar from "../../../components/profile/ProfileSidebar/ProfileSidebar.jsx";
import SimpleFooter from "../../../components/layout/SimpleFoot/SimpleFoot.jsx";

import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const {
    user,
    profile,
    logout,
    refreshUser,
    authLoading,
    isAuthenticated,
  } = useAuth();

  const {
    orders,
    ordersLoading,
    orderStats,
    fetchOrders,
  } = useOrders({
    autoFetch: true,
  });

  const requestedSection =
    searchParams.get("section");

  const [activeSection, setActiveSection] =
    useState(
      requestedSection === "orders"
        ? "orders"
        : "overview"
    );

  const [refreshing, setRefreshing] =
    useState(false);

  /* =========================================================
     SYNC SECTION FROM URL
  ========================================================= */

  useEffect(() => {
    if (
      requestedSection === "orders" ||
      requestedSection === "overview"
    ) {
      setActiveSection(
        requestedSection
      );
    }
  }, [requestedSection]);

  /* =========================================================
     NORMALIZED USER
  ========================================================= */

  const currentUser = useMemo(() => {
    const account =
      profile || user;

    if (!account) {
      return null;
    }

    return {
      ...account,

      name:
        account.full_name ||
        account.name ||
        account.email ||
        "User",

      full_name:
        account.full_name ||
        account.name ||
        "",

      email:
        account.email || "",

      phone:
        account.phone || "",

      role:
        account.role || "user",

      avatar_url:
        account.avatar_url ||
        null,

      address:
        account.address ||
        null,

      orders,

      order: orders,

      orderStats,
    };
  }, [
    profile,
    user,
    orders,
    orderStats,
  ]);

  /* =========================================================
     REFRESH PROFILE
  ========================================================= */

  const refreshProfile =
    useCallback(async () => {
      try {
        setRefreshing(true);

        await Promise.all([
          refreshUser(),
          fetchOrders(),
        ]);
      } catch (error) {
        console.error(
          "Profile refresh error:",
          error
        );

        toast.error(
          "Could not refresh your profile."
        );
      } finally {
        setRefreshing(false);
      }
    }, [
      refreshUser,
      fetchOrders,
    ]);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout =
    async () => {
      try {
        await logout();

        navigate(
          "/sign_in",
          {
            replace: true,
          }
        );
      } catch (error) {
        console.error(
          "Logout error:",
          error
        );

        toast.error(
          "Unable to sign out."
        );
      }
    };

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    authLoading ||
    ordersLoading
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-gray-300 border-t-gray-700 animate-spin" />

          <p className="text-gray-500 text-sm font-medium">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     NOT LOGGED IN
  ========================================================= */

  if (
    !isAuthenticated ||
    !currentUser
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] flex flex-col items-center justify-center gap-4 p-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Please Sign In
        </h2>

        <p className="text-sm text-gray-500 text-center">
          Sign in to view your account and orders.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/sign_in")
          }
          className="px-6 py-3 rounded-full bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white font-semibold hover:from-gray-400 hover:to-gray-700 transition-all"
        >
          Go to Login
        </button>
      </div>
    );
  }

  /* =========================================================
     PAGE DATA
  ========================================================= */

  const sectionLabels = {
    overview: "Overview",
    orders: "My Orders",
  };

  const firstName =
    currentUser.full_name
      ?.split(" ")[0] ||
    currentUser.name
      ?.split(" ")[0] ||
    "User";

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] pt-20 pb-16">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 pb-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
              My Account
            </p>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              {
                sectionLabels[
                  activeSection
                ]
              }
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Welcome back,{" "}
              <span className="font-medium text-gray-700">
                {firstName}
              </span>
              !
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* REFRESH */}
            <button
              type="button"
              onClick={
                refreshProfile
              }
              disabled={refreshing}
              title="Refresh"
              className="w-10 h-10 rounded-full bg-white/50 border border-white/70 flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-800 transition-all shadow-sm disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>

            {/* LOGOUT */}
            <button
              type="button"
              onClick={
                handleLogout
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/50 border border-white/70 text-sm font-semibold text-gray-700 hover:bg-white transition-all shadow-sm"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />

              <span className="hidden sm:inline">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          PROFILE CONTENT
      ===================================================== */}

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* SIDEBAR */}
          <ProfileSidebar
            user={currentUser}
            activeSection={
              activeSection
            }
            setActiveSection={
              setActiveSection
            }
          />

          {/* CONTENT */}
          <div className="flex-1 min-w-0">
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">

              {activeSection ===
                "overview" && (
                <OverviewSection
                  user={
                    currentUser
                  }
                  setActiveSection={
                    setActiveSection
                  }
                />
              )}

              {activeSection ===
                "orders" && (
                <OrdersSection
                  user={
                    currentUser
                  }
                  orders={
                    orders
                  }
                  onRefresh={
                    refreshProfile
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <SimpleFooter />
      </div>
    </div>
  );
};

export default Profile;