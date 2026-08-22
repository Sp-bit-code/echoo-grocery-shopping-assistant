import {
  LogOutIcon,
  SearchIcon,
  ShieldUserIcon,
  XIcon,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  getAllOrders,
  getAllUsers,
} from "../../../api/adminApi.js";

import {
  getProducts,
} from "../../../api/productApi.js";

import {
  useAuth,
} from "../../../context/AuthContext.jsx";

import {
  useDebounce,
} from "../../../hooks/useDebounce.js";

import "./Header.css";

/* =========================================================
   HELPERS
========================================================= */

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const extractArray = (
  response,
  keys = []
) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  for (const key of keys) {
    if (
      Array.isArray(response?.[key])
    ) {
      return response[key];
    }

    if (
      Array.isArray(
        response?.data?.[key]
      )
    ) {
      return response.data[key];
    }
  }

  return [];
};

const normalizeProduct = (
  product = {}
) => {
  const images =
    product.product_images ||
    product.images ||
    [];

  const category =
    product.categories ||
    product.category ||
    {};

  const primaryImage =
    images.find?.(
      (image) =>
        image?.is_primary
    )?.image_url ||
    images?.[0]?.image_url ||
    product.primary_image ||
    product.image_url ||
    "";

  const categoryName =
    typeof category === "string"
      ? category
      : category?.name ||
        product.category_name ||
        "";

  const packSize =
    product.pack_size ||
    (product.quantity &&
    product.unit
      ? `${product.quantity} ${product.unit}`
      : product.unit || "");

  return {
    ...product,
    images,
    primaryImage,
    categoryName,
    packSize,
  };
};

const normalizeOrder = (
  order = {}
) => {
  const orderUser =
    order.profiles ||
    order.profile ||
    {};

  return {
    ...order,

    userName:
      order.userName ||
      orderUser.full_name ||
      orderUser.name ||
      orderUser.email ||
      "User",

    userEmail:
      order.userEmail ||
      orderUser.email ||
      "",

    status:
      order.order_status ||
      order.status ||
      "placed",

    total:
      Number(
        order.total_amount ||
          order.total ||
          0
      ),
  };
};

const normalizeUser = (
  item = {}
) => ({
  ...item,

  name:
    item.full_name ||
    item.name ||
    item.email ||
    "User",

  email:
    item.email || "",

  role:
    item.role || "user",
});

/* =========================================================
   HEADER
========================================================= */

const Header = () => {
  const navigate =
    useNavigate();

  const searchRef =
    useRef(null);

  const userMenuRef =
    useRef(null);

  const {
    user,
    profile,
    logout,
  } = useAuth();

  const [
    userMenuOpen,
    setUserMenuOpen,
  ] = useState(false);

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    searchData,
    setSearchData,
  ] = useState({
    users: [],
    products: [],
    orders: [],
  });

  const [
    searchResults,
    setSearchResults,
  ] = useState({
    users: [],
    products: [],
    orders: [],
  });

  const debouncedSearchQuery =
    useDebounce(
      searchQuery,
      250
    );

  /* =========================================================
     ADMIN DETAILS
  ========================================================= */

  const adminName =
    profile?.full_name ||
    profile?.name ||
    user?.user_metadata
      ?.full_name ||
    user?.email ||
    "Administrator";

  const adminAvatar =
    profile?.avatar_url ||
    profile?.avatar ||
    user?.user_metadata
      ?.avatar_url ||
    "";

  const userInitials =
    adminName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part[0]?.toUpperCase()
      )
      .join("") || "A";

  /* =========================================================
     CLOSE MENUS OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (
      event
    ) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target
        )
      ) {
        setSearchOpen(false);
      }

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(
          event.target
        )
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     LOAD SEARCH DATA
  ========================================================= */

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const alreadyLoaded =
      searchData.users.length ||
      searchData.products.length ||
      searchData.orders.length;

    if (alreadyLoaded) {
      return;
    }

    let ignore = false;

    const loadSearchData =
      async () => {
        try {
          setLoading(true);

          const [
            usersResponse,
            productsResponse,
            ordersResponse,
          ] =
            await Promise.all([
              getAllUsers(),
              getProducts(),
              getAllOrders(),
            ]);

          if (ignore) {
            return;
          }

          const users =
            extractArray(
              usersResponse,
              ["users"]
            );

          const products =
            extractArray(
              productsResponse,
              ["products"]
            );

          const orders =
            extractArray(
              ordersResponse,
              ["orders"]
            );

          setSearchData({
            users:
              users.map(
                normalizeUser
              ),

            products:
              products.map(
                normalizeProduct
              ),

            orders:
              orders.map(
                normalizeOrder
              ),
          });
        } catch (error) {
          if (!ignore) {
            console.error(
              "Admin search load error:",
              error
            );
          }
        } finally {
          if (!ignore) {
            setLoading(false);
          }
        }
      };

    loadSearchData();

    return () => {
      ignore = true;
    };
  }, [
    searchOpen,
    searchData.users.length,
    searchData.products.length,
    searchData.orders.length,
  ]);

  /* =========================================================
     FILTER SEARCH
  ========================================================= */

  useEffect(() => {
    const query =
      normalizeText(
        debouncedSearchQuery
      );

    if (!query) {
      setSearchResults({
        users: [],
        products: [],
        orders: [],
      });

      return;
    }

    const users =
      searchData.users
        .filter((item) => {
          return (
            normalizeText(
              item.name
            ).includes(query) ||
            normalizeText(
              item.email
            ).includes(query) ||
            normalizeText(
              item.role
            ).includes(query)
          );
        })
        .slice(0, 5);

    const products =
      searchData.products
        .filter((item) => {
          return (
            normalizeText(
              item.name
            ).includes(query) ||
            normalizeText(
              item.brand
            ).includes(query) ||
            normalizeText(
              item.categoryName
            ).includes(query) ||
            normalizeText(
              item.packSize
            ).includes(query)
          );
        })
        .slice(0, 5);

    const orders =
      searchData.orders
        .filter((item) => {
          return (
            normalizeText(
              item.id
            ).includes(query) ||
            normalizeText(
              item.userName
            ).includes(query) ||
            normalizeText(
              item.userEmail
            ).includes(query) ||
            normalizeText(
              item.status
            ).includes(query)
          );
        })
        .slice(0, 5);

    setSearchResults({
      users,
      products,
      orders,
    });
  }, [
    debouncedSearchQuery,
    searchData,
  ]);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout =
    async () => {
      try {
        await logout();

        navigate(
          "/admin_login",
          {
            replace: true,
          }
        );
      } catch (error) {
        console.error(
          "Admin logout error:",
          error
        );
      }
    };

  /* =========================================================
     RESULT NAVIGATION
  ========================================================= */

  const handleResultClick = (
    type
  ) => {
    const routes = {
      user: "/admin/users",
      product:
        "/admin/products",
      order: "/admin/orders",
    };

    navigate(routes[type]);

    setSearchOpen(false);
    setSearchQuery("");
  };

  const hasResults =
    searchResults.users.length >
      0 ||
    searchResults.products
      .length > 0 ||
    searchResults.orders.length >
      0;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      {searchOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-20"
          onClick={() =>
            setSearchOpen(false)
          }
        />
      )}

      <header className="bg-transparent border-b border-gray-200/50 z-30 sticky top-0">
        <div className="flex items-center justify-end h-16 px-4 md:px-6">
          <div className="flex items-center space-x-3">

            {/* =================================================
                GLOBAL SEARCH
            ================================================= */}

            <div
              className="relative"
              ref={searchRef}
            >
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(
                    (previous) =>
                      !previous
                  );

                  setUserMenuOpen(
                    false
                  );
                }}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                aria-label="Search admin data"
              >
                <SearchIcon className="w-5 h-5" />
              </button>

              {searchOpen && (
                <div
                  className="
                    fixed top-20 left-4 right-4 w-auto
                    md:absolute md:top-full md:left-auto md:right-0 md:mt-2 md:w-96
                    bg-white/80 backdrop-blur-xl rounded-2xl
                    shadow-[0_8px_32px_rgba(0,0,0,0.05)]
                    border border-white/60 z-50
                  "
                >
                  {/* SEARCH INPUT */}
                  <div className="p-4 border-b border-gray-200/50">
                    <div className="flex items-center">
                      <SearchIcon className="w-5 h-5 text-gray-400 mr-3" />

                      <input
                        type="text"
                        value={
                          searchQuery
                        }
                        onChange={(
                          event
                        ) =>
                          setSearchQuery(
                            event.target
                              .value
                          )
                        }
                        placeholder="Search users, groceries, orders..."
                        className="flex-1 border-0 focus:ring-0 focus:outline-none text-sm bg-transparent min-w-0"
                        autoFocus
                      />

                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() =>
                            setSearchQuery(
                              ""
                            )
                          }
                          className="p-1 text-gray-400 hover:text-gray-600"
                          aria-label="Clear search"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* RESULTS */}
                  <div className="max-h-[400px] overflow-y-auto">

                    {loading &&
                    !searchData.users
                      .length &&
                    !searchData.products
                      .length &&
                    !searchData.orders
                      .length ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-800 mx-auto" />

                        <p className="mt-2 text-gray-500 text-sm">
                          Loading search...
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* USERS */}
                        {searchResults.users
                          .length >
                          0 && (
                          <div className="p-4 border-b border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              Users (
                              {
                                searchResults
                                  .users
                                  .length
                              }
                              )
                            </h3>

                            <div className="space-y-2">
                              {searchResults.users.map(
                                (
                                  item
                                ) => (
                                  <button
                                    type="button"
                                    key={
                                      item.id
                                    }
                                    onClick={() =>
                                      handleResultClick(
                                        "user"
                                      )
                                    }
                                    className="w-full text-left p-2 rounded hover:bg-gray-50 flex items-center space-x-3"
                                  >
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                      <span className="text-sm font-medium text-gray-700">
                                        {(
                                          item.name ||
                                          "U"
                                        )
                                          .charAt(
                                            0
                                          )
                                          .toUpperCase()}
                                      </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {
                                          item.name
                                        }
                                      </p>

                                      <p className="text-xs text-gray-500 truncate">
                                        {
                                          item.email
                                        }
                                      </p>
                                    </div>
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* PRODUCTS */}
                        {searchResults.products
                          .length >
                          0 && (
                          <div className="p-4 border-b border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              Products (
                              {
                                searchResults
                                  .products
                                  .length
                              }
                              )
                            </h3>

                            <div className="space-y-2">
                              {searchResults.products.map(
                                (
                                  item
                                ) => {
                                  const price =
                                    Number(
                                      item.discount_price ||
                                        item.price ||
                                        0
                                    );

                                  return (
                                    <button
                                      type="button"
                                      key={
                                        item.id
                                      }
                                      onClick={() =>
                                        handleResultClick(
                                          "product"
                                        )
                                      }
                                      className="w-full text-left p-2 rounded hover:bg-gray-50 flex items-center space-x-3"
                                    >
                                      <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {item.primaryImage ? (
                                          <img
                                            src={
                                              item.primaryImage
                                            }
                                            alt={
                                              item.name
                                            }
                                            className="w-full h-full object-contain"
                                          />
                                        ) : (
                                          <span className="text-xs text-gray-400">
                                            {(
                                              item.name ||
                                              "P"
                                            ).charAt(
                                              0
                                            )}
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {
                                            item.name
                                          }
                                        </p>

                                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                                          {item.categoryName && (
                                            <span className="text-xs text-gray-500 truncate">
                                              {
                                                item.categoryName
                                              }
                                            </span>
                                          )}

                                          {item.packSize && (
                                            <span className="text-xs text-gray-400">
                                              {
                                                item.packSize
                                              }
                                            </span>
                                          )}

                                          <span className="text-xs font-semibold text-gray-800">
                                            ₹
                                            {price.toLocaleString(
                                              "en-IN"
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}

                        {/* ORDERS */}
                        {searchResults.orders
                          .length >
                          0 && (
                          <div className="p-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              Orders (
                              {
                                searchResults
                                  .orders
                                  .length
                              }
                              )
                            </h3>

                            <div className="space-y-2">
                              {searchResults.orders.map(
                                (
                                  item
                                ) => (
                                  <button
                                    type="button"
                                    key={
                                      item.id
                                    }
                                    onClick={() =>
                                      handleResultClick(
                                        "order"
                                      )
                                    }
                                    className="w-full text-left p-2 rounded hover:bg-gray-50"
                                  >
                                    <div className="flex justify-between items-start gap-4">
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                          #
                                          {String(
                                            item.id
                                          ).slice(
                                            0,
                                            8
                                          )}
                                        </p>

                                        <p className="text-xs text-gray-500 truncate">
                                          {
                                            item.userName
                                          }
                                        </p>
                                      </div>

                                      <div className="text-right shrink-0">
                                        <p className="text-sm font-semibold text-gray-900">
                                          ₹
                                          {Number(
                                            item.total ||
                                              0
                                          ).toLocaleString(
                                            "en-IN"
                                          )}
                                        </p>

                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">
                                          {String(
                                            item.status
                                          ).replace(
                                            /_/g,
                                            " "
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {!loading &&
                          searchQuery &&
                          !hasResults && (
                            <div className="p-8 text-center">
                              <SearchIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />

                              <p className="text-gray-500 text-sm">
                                No results found for "
                                {
                                  searchQuery
                                }
                                "
                              </p>
                            </div>
                          )}

                        {!searchQuery && (
                          <div className="p-8 text-center">
                            <SearchIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />

                            <p className="text-gray-500 text-sm">
                              Search users, groceries or orders
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                ADMIN ACCOUNT
            ================================================= */}

            <div
              className="relative"
              ref={userMenuRef}
            >
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(
                    (previous) =>
                      !previous
                  );

                  setSearchOpen(
                    false
                  );
                }}
                className="flex h-11 max-w-[11rem] items-center gap-2 rounded-full border border-white/70 bg-white/65 px-2.5 shadow-sm backdrop-blur-md transition-colors hover:bg-white/80 sm:max-w-[14rem]"
              >
                <div className="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center shrink-0">
                  {adminAvatar ? (
                    <img
                      src={
                        adminAvatar
                      }
                      alt={
                        adminName
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] font-semibold tracking-wide">
                      {
                        userInitials
                      }
                    </span>
                  )}
                </div>

                <div className="hidden min-w-0 flex-1 text-left sm:block">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {adminName}
                  </p>
                </div>

                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 shrink-0">
                  <ShieldUserIcon className="w-3.5 h-3.5" />
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-2rem))] bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-200/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center shrink-0">
                        {adminAvatar ? (
                          <img
                            src={
                              adminAvatar
                            }
                            alt={
                              adminName
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold tracking-wide">
                            {
                              userInitials
                            }
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {
                            adminName
                          }
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          Grocery Administrator
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-white/50 transition-colors"
                  >
                    <LogOutIcon className="w-4 h-4 mr-3" />

                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;