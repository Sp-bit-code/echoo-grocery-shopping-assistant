import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

import {
  getAllUsers,
} from "../../../api/adminApi.js";

import {
  useAuth,
} from "../../../context/AuthContext.jsx";

import "./AdminUsers.css";

const USERS_PER_PAGE = 10;

/* =========================================================
   HELPERS
========================================================= */

const extractUsers = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.users)) {
    return response.users;
  }

  if (
    Array.isArray(
      response?.data?.users
    )
  ) {
    return response.data.users;
  }

  return [];
};

const normalizeRole = (role) =>
  String(role || "user")
    .trim()
    .toLowerCase() === "admin"
    ? "admin"
    : "user";

const normalizeUser = (
  user = {}
) => ({
  ...user,

  id: user.id,

  name:
    user.full_name ||
    user.name ||
    user.email ||
    "User",

  fullName:
    user.full_name ||
    user.name ||
    "",

  email:
    user.email || "",

  phone:
    user.phone ||
    user.phone_number ||
    "",

  role:
    normalizeRole(
      user.role
    ),

  createdAt:
    user.created_at ||
    user.createdAt ||
    null,
});

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const getInitials = (name) => {
  const parts = String(
    name || "User"
  )
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]
      .charAt(0)
      .toUpperCase();
  }

  return `${parts[0].charAt(
    0
  )}${parts[
    parts.length - 1
  ].charAt(0)}`.toUpperCase();
};

/* =========================================================
   ADMIN USERS
========================================================= */

const AdminUsers = () => {
  const {
    user: currentUser,
    profile: currentProfile,
  } = useAuth();

  const [
    rawUsers,
    setRawUsers,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const deferredSearchTerm =
    useDeferredValue(
      searchTerm
    );

  const [
    selectedRole,
    setSelectedRole,
  ] = useState("all");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const currentUserId =
    currentUser?.id ||
    currentProfile?.id ||
    null;

  /* =======================================================
     FETCH
  ======================================================= */

  const fetchUsers = async ({
    silent = false,
  } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await getAllUsers();

      setRawUsers(
        extractUsers(
          response
        )
      );
    } catch (fetchError) {
      console.error(
        "Error loading users:",
        fetchError
      );

      setError(
        fetchError?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =======================================================
     NORMALIZE
  ======================================================= */

  const allUsers = useMemo(
    () =>
      rawUsers.map(
        normalizeUser
      ),
    [rawUsers]
  );

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(
    () => ({
      total:
        allUsers.length,

      customers:
        allUsers.filter(
          (user) =>
            user.role === "user"
        ).length,

      admins:
        allUsers.filter(
          (user) =>
            user.role === "admin"
        ).length,
    }),
    [allUsers]
  );

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredUsers =
    useMemo(() => {
      let list = [
        ...allUsers,
      ];

      const query =
        deferredSearchTerm
          .trim()
          .toLowerCase();

      if (query) {
        list = list.filter(
          (user) =>
            [
              user.name,
              user.email,
              user.phone,
              user.id,
            ].some((value) =>
              String(value || "")
                .toLowerCase()
                .includes(query)
            )
        );
      }

      if (
        selectedRole !==
        "all"
      ) {
        list = list.filter(
          (user) =>
            user.role ===
            selectedRole
        );
      }

      return list;
    }, [
      allUsers,
      deferredSearchTerm,
      selectedRole,
    ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredUsers.length /
          USERS_PER_PAGE
      )
    );

  const paginatedUsers =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        USERS_PER_PAGE;

      return filteredUsers.slice(
        start,
        start +
          USERS_PER_PAGE
      );
    }, [
      filteredUsers,
      currentPage,
    ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    deferredSearchTerm,
    selectedRole,
  ]);

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />

          <p className="mt-3 text-sm text-gray-600">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="admin-users space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
            Accounts
          </p>

          <h1 className="text-2xl font-bold text-gray-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            View registered
            customers and
            administrators.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            fetchUsers({
              silent: true,
            })
          }
          disabled={refreshing}
          className="flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/65 px-4 py-2 text-sm font-semibold text-gray-700 backdrop-blur-xl transition hover:bg-white disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4">
          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <div className="rounded-[1.6rem] border border-white/60 bg-white/40 p-5 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">
                Total Accounts
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {stats.total}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-gray-500">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-white/60 bg-white/40 p-5 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">
                Customers
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {stats.customers}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-gray-500">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-white/60 bg-white/40 p-5 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">
                Administrators
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {stats.admins}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-gray-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="rounded-[2rem] border border-white/60 bg-white/40 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search name, email, phone or ID..."
              className="h-11 w-full rounded-2xl border border-white/70 bg-white/60 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:bg-white"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(event) =>
              setSelectedRole(
                event.target.value
              )
            }
            className="h-11 rounded-2xl border border-white/70 bg-white/60 px-4 text-sm text-gray-700 outline-none"
          >
            <option value="all">
              All Roles
            </option>

            <option value="user">
              Customers
            </option>

            <option value="admin">
              Administrators
            </option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-xl">

        <div className="flex items-center justify-between border-b border-gray-200/50 px-5 py-4">
          <div>
            <h2 className="font-bold text-gray-900">
              Registered Accounts
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              {filteredUsers.length}{" "}
              account
              {filteredUsers.length !==
              1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

          <Users className="h-5 w-5 text-gray-400" />
        </div>

        {paginatedUsers.length ===
        0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-300" />

            <p className="mt-3 text-sm font-semibold text-gray-600">
              No users found
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Try changing your
              search or role filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">

              <thead>
                <tr className="border-b border-gray-200/50">

                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    User
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Contact
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Role
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Joined
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    ID
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.map(
                  (user) => {
                    const isCurrentUser =
                      currentUserId &&
                      String(
                        currentUserId
                      ) ===
                        String(
                          user.id
                        );

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100/70 last:border-0 transition-colors hover:bg-white/35"
                      >
                        {/* USER */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gray-600 to-gray-900 text-xs font-bold text-white shadow-sm">
                              {getInitials(
                                user.name
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="max-w-[200px] truncate text-sm font-semibold text-gray-900">
                                  {user.name}
                                </p>

                                {isCurrentUser && (
                                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-semibold text-gray-500">
                                    You
                                  </span>
                                )}
                              </div>

                              {user.phone && (
                                <p className="mt-0.5 text-xs text-gray-400">
                                  {user.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* EMAIL */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />

                            <span className="max-w-[220px] truncate text-sm text-gray-600">
                              {user.email ||
                                "—"}
                            </span>
                          </div>
                        </td>

                        {/* ROLE */}
                        <td className="px-5 py-4">
                          {user.role ===
                          "admin" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-800 px-2.5 py-1 text-xs font-semibold text-white">
                              <ShieldCheck className="h-3 w-3" />

                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              <User className="h-3 w-3" />

                              User
                            </span>
                          )}
                        </td>

                        {/* JOINED */}
                        <td className="px-5 py-4 text-xs text-gray-500">
                          {formatDate(
                            user.createdAt
                          )}
                        </td>

                        {/* ID */}
                        <td className="px-5 py-4">
                          <code className="rounded-lg bg-white/50 px-2 py-1 text-[10px] text-gray-500">
                            {String(
                              user.id ||
                                ""
                            ).slice(
                              0,
                              8
                            )}
                          </code>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {filteredUsers.length >
          USERS_PER_PAGE && (
          <div className="flex flex-col gap-3 border-t border-gray-200/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-xs text-gray-500">
              Page {currentPage} of{" "}
              {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  currentPage <= 1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
                className="flex items-center gap-1 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />

                Previous
              </button>

              <button
                type="button"
                disabled={
                  currentPage >=
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
                className="flex items-center gap-1 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next

                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;