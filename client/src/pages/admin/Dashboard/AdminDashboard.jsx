import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AlertTriangle,
  CheckCircle2,
  Package,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Users,
} from "lucide-react";

import {
  getAllOrders,
  getAllProducts,
  getAllUsers,
} from "../../../api/adminApi.js";

import {
  useAuth,
} from "../../../context/AuthContext.jsx";

import DashboardStats from "./DashboardStats.jsx";
import AnalyticsCharts from "./AnalyticsCharts.jsx";

import "./AdminDashboard.css";

/* =========================================================
   HELPERS
========================================================= */

const extractArray = (
  response,
  keys = []
) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    Array.isArray(
      response?.data
    )
  ) {
    return response.data;
  }

  for (const key of keys) {
    if (
      Array.isArray(
        response?.[key]
      )
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

/* =========================================================
   NORMALIZE PRODUCT
========================================================= */

const normalizeProduct = (
  product = {}
) => {
  const category =
    product.categories ||
    product.category ||
    {};

  const images =
    product.product_images ||
    product.images ||
    [];

  return {
    ...product,

    stock:
      Number(
        product.stock || 0
      ),

    price:
      Number(
        product.price || 0
      ),

    discountPrice:
      product.discount_price != null
        ? Number(
            product.discount_price
          )
        : null,

    categoryName:
      typeof category ===
      "string"
        ? category
        : category?.name ||
          product.category_name ||
          "Uncategorized",

    images,

    isActive:
      product.is_active !==
      false,

    isFeatured:
      Boolean(
        product.is_featured
      ),

    /*
      Added in Supabase.

      Example:
      amul-amul-fresh-paneer

      All pack variants of the same
      product share this value.
    */
    productGroupKey:
      product.product_group_key ||
      product.productGroupKey ||
      "",
  };
};

/* =========================================================
   LOGICAL PRODUCT KEY

   DATABASE:
   200 rows = SKU / pack variants

   STORE:
   48 actual logical products

   Example:

   Mother Dairy Classic Curd
     - 200 g
     - 400 g
     - 1 kg
     - 2 kg

   Dashboard counts this as ONE product.
========================================================= */

const getProductGroupKey = (
  product = {}
) => {
  const databaseKey =
    product.product_group_key ||
    product.productGroupKey;

  if (
    databaseKey &&
    String(
      databaseKey
    ).trim()
  ) {
    return String(
      databaseKey
    )
      .trim()
      .toLowerCase();
  }

  /*
    Safe fallback.

    If adminApi does not yet return
    product_group_key, grouping still
    works from brand + product name.
  */

  const brand =
    String(
      product.brand || ""
    )
      .trim()
      .toLowerCase();

  const name =
    String(
      product.name || ""
    )
      .trim()
      .toLowerCase();

  const fallbackKey =
    `${brand}-${name}`
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  /*
    Last fallback:
    Never accidentally combine two
    unknown products.
  */

  return (
    fallbackKey ||
    String(
      product.id || ""
    )
  );
};

/* =========================================================
   BUILD LOGICAL PRODUCT GROUPS
========================================================= */

const buildLogicalProductGroups = (
  products = []
) => {
  const groups =
    new Map();

  products.forEach(
    (product) => {
      const key =
        getProductGroupKey(
          product
        );

      if (!key) {
        return;
      }

      if (
        !groups.has(key)
      ) {
        groups.set(
          key,
          {
            key,
            variants: [],
          }
        );
      }

      groups
        .get(key)
        .variants.push(
          product
        );
    }
  );

  return Array.from(
    groups.values()
  ).map(
    (group) => {
      const variants =
        group.variants;

      const activeVariants =
        variants.filter(
          (product) =>
            product.isActive
        );

      const inactiveVariants =
        variants.filter(
          (product) =>
            !product.isActive
        );

      /*
        Total physical stock across every SKU.
      */
      const totalStock =
        variants.reduce(
          (
            total,
            product
          ) =>
            total +
            Number(
              product.stock ||
                0
            ),
          0
        );

      /*
        Stock that is actually sellable.
        Inactive packs are excluded.
      */
      const availableStock =
        activeVariants.reduce(
          (
            total,
            product
          ) =>
            total +
            Number(
              product.stock ||
                0
            ),
          0
        );

      const outOfStockVariants =
        variants.filter(
          (product) =>
            Number(
              product.stock ||
                0
            ) <= 0
        ).length;

      const activeOutOfStockVariants =
        activeVariants.filter(
          (product) =>
            Number(
              product.stock ||
                0
            ) <= 0
        ).length;

      const lowStockVariants =
        activeVariants.filter(
          (product) => {
            const stock =
              Number(
                product.stock ||
                  0
              );

            return (
              stock > 0 &&
              stock <= 10
            );
          }
        ).length;

      return {
        ...group,

        totalStock,
        availableStock,

        active:
          activeVariants.length > 0,

        featured:
          variants.some(
            (product) =>
              product.isFeatured
          ),

        activeVariants:
          activeVariants.length,

        inactiveVariants:
          inactiveVariants.length,

        outOfStockVariants,

        activeOutOfStockVariants,

        lowStockVariants,

        variantCount:
          variants.length,
      };
    }
  );
};

/* =========================================================
   NORMALIZE ORDER ITEM
========================================================= */

const normalizeOrderItem = (
  item = {}
) => {
  const product =
    item.products ||
    item.product ||
    {};

  const quantity =
    Number(
      item.quantity || 1
    );

  const unitPrice =
    Number(
      item.unit_price ||
        item.price ||
        product.discount_price ||
        product.price ||
        0
    );

  return {
    ...item,

    productId:
      item.product_id ||
      product.id ||
      null,

    productName:
      item.product_name ||
      product.name ||
      "Product",

    quantity,

    unitPrice,

    itemTotal:
      Number(
        item.total_price ||
          item.item_total ||
          item.itemTotal ||
          unitPrice *
            quantity
      ),
  };
};

/* =========================================================
   NORMALIZE ORDER
========================================================= */

const normalizeOrder = (
  order = {}
) => {
  const orderUser =
    order.profiles ||
    order.profile ||
    {};

  const items =
    order.order_items ||
    order.items ||
    [];

  return {
    ...order,

    total:
      Number(
        order.total_amount ||
          order.total ||
          0
      ),

    status:
      String(
        order.order_status ||
          order.status ||
          "placed"
      ).toLowerCase(),

    paymentMethod:
      order.payment_method ||
      "cod",

    userName:
      order.userName ||
      orderUser.full_name ||
      orderUser.name ||
      orderUser.email ||
      "Customer",

    userEmail:
      order.userEmail ||
      orderUser.email ||
      "",

    createdAt:
      order.created_at ||
      order.createdAt ||
      null,

    items:
      items.map(
        normalizeOrderItem
      ),
  };
};

/* =========================================================
   NORMALIZE USER
========================================================= */

const normalizeUser = (
  user = {}
) => ({
  ...user,

  name:
    user.full_name ||
    user.name ||
    user.email ||
    "User",

  email:
    user.email || "",

  role:
    String(
      user.role || "user"
    ).toLowerCase(),
});

/* =========================================================
   STATUS HELPERS
========================================================= */

const CURRENT_ORDER_STATUSES = [
  "placed",
  "confirmed",
  "packing",
  "out_for_delivery",
];

const formatStatus = (
  status
) =>
  String(status || "")
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );

const getStatusClass = (
  status
) => {
  switch (
    String(
      status
    ).toLowerCase()
  ) {
    case "delivered":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    case "out_for_delivery":
      return "bg-blue-100 text-blue-700";

    case "confirmed":
      return "bg-indigo-100 text-indigo-700";

    case "packing":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

/* =========================================================
   DASHBOARD
========================================================= */

const AdminDashboard = () => {
  const navigate =
    useNavigate();

  const {
    user: currentUser,
    profile,
  } = useAuth();

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
    users,
    setUsers,
  ] = useState([]);

  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    products,
    setProducts,
  ] = useState([]);

  /* =========================================================
     LOAD DASHBOARD DATA
  ========================================================= */

  const fetchDashboardData =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
      try {
        if (silent) {
          setRefreshing(
            true
          );
        } else {
          setLoading(
            true
          );
        }

        setError("");

        const [
          usersResponse,
          ordersResponse,
          productsResponse,
        ] =
          await Promise.all([
            getAllUsers(),
            getAllOrders(),
            getAllProducts(),
          ]);

        const usersData =
          extractArray(
            usersResponse,
            [
              "users",
            ]
          );

        const ordersData =
          extractArray(
            ordersResponse,
            [
              "orders",
            ]
          );

        const productsData =
          extractArray(
            productsResponse,
            [
              "products",
            ]
          );

        setUsers(
          usersData.map(
            normalizeUser
          )
        );

        setOrders(
          ordersData.map(
            normalizeOrder
          )
        );

        setProducts(
          productsData.map(
            normalizeProduct
          )
        );
      } catch (
        fetchError
      ) {
        console.error(
          "Dashboard data error:",
          fetchError
        );

        setError(
          fetchError?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(
          false
        );

        setRefreshing(
          false
        );
      }
    },
    []
  );

  /*
    Load once when Dashboard mounts.
  */
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /*
    Keep dashboard data fresh after Admin Products / Orders /
    Users are changed.

    - refresh when browser regains focus
    - refresh when tab becomes visible
    - refresh every 5 seconds while visible
    - supports a custom "admin:data-changed" event too
  */
  useEffect(() => {
    const refreshSilently =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          fetchDashboardData({
            silent: true,
          });
        }
      };

    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          refreshSilently();
        }
      };

    const intervalId =
      window.setInterval(
        refreshSilently,
        5000
      );

    window.addEventListener(
      "focus",
      refreshSilently
    );

    window.addEventListener(
      "admin:data-changed",
      refreshSilently
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.clearInterval(
        intervalId
      );

      window.removeEventListener(
        "focus",
        refreshSilently
      );

      window.removeEventListener(
        "admin:data-changed",
        refreshSilently
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [fetchDashboardData]);

  /* =========================================================
     LOGICAL PRODUCT GROUPS
  ========================================================= */

  const logicalProducts =
    useMemo(() => {
      return buildLogicalProductGroups(
        products
      );
    }, [products]);

  /* =========================================================
     ANALYTICS
  ========================================================= */

  const stats =
    useMemo(() => {
      /* =====================================================
         LOGICAL PRODUCTS
      ===================================================== */

      const totalProducts =
        logicalProducts.length;

      const activeProducts =
        logicalProducts.filter(
          (group) =>
            group.active
        ).length;

      /*
        Logical product is out of stock when it still has
        active pack variants but none of those active packs
        has stock available.
      */
      const outOfStockProducts =
        logicalProducts.filter(
          (group) =>
            group.active &&
            group.availableStock <=
              0
        ).length;

      const lowStockProducts =
        logicalProducts.filter(
          (group) =>
            group.active &&
            group.availableStock >
              0 &&
            group.availableStock <=
              10
        ).length;

      const inactiveProducts =
        logicalProducts.filter(
          (group) =>
            !group.active
        ).length;

      const featuredProducts =
        logicalProducts.filter(
          (group) =>
            group.featured
        ).length;

      /* =====================================================
         SKU / PACK VARIANTS
      ===================================================== */

      const totalSkuRows =
        products.length;

      const activeSkuRows =
        products.filter(
          (product) =>
            product.isActive
        ).length;

      const inactiveSkuRows =
        products.filter(
          (product) =>
            !product.isActive
        ).length;

      const outOfStockSkuRows =
        products.filter(
          (product) =>
            Number(
              product.stock ||
                0
            ) <= 0
        ).length;

      const lowStockSkuRows =
        products.filter(
          (product) => {
            const stock =
              Number(
                product.stock ||
                  0
              );

            return (
              product.isActive &&
              stock > 0 &&
              stock <= 10
            );
          }
        ).length;

      /* =====================================================
         ORDERS
      ===================================================== */

      const totalOrders =
        orders.length;

      const currentOrders =
        orders.filter(
          (order) =>
            CURRENT_ORDER_STATUSES.includes(
              order.status
            )
        ).length;

      const deliveredOrders =
        orders.filter(
          (order) =>
            order.status ===
            "delivered"
        );

      const cancelledOrders =
        orders.filter(
          (order) =>
            order.status ===
            "cancelled"
        ).length;

      /* =====================================================
         REVENUE
      ===================================================== */

      const totalRevenue =
        deliveredOrders.reduce(
          (
            sum,
            order
          ) =>
            sum +
            Number(
              order.total ||
                0
            ),
          0
        );

      /* =====================================================
         DELIVERED ITEMS
      ===================================================== */

      const totalSales =
        deliveredOrders.reduce(
          (
            sum,
            order
          ) => {
            const orderQuantity =
              order.items.reduce(
                (
                  itemSum,
                  item
                ) =>
                  itemSum +
                  Number(
                    item.quantity ||
                      0
                  ),
                0
              );

            return (
              sum +
              orderQuantity
            );
          },
          0
        );

      /* =====================================================
         CUSTOMERS
      ===================================================== */

      const customerUsers =
        users.filter(
          (user) =>
            user.role !==
            "admin"
        ).length;

      return {
        totalProducts,
        activeProducts,
        inactiveProducts,
        featuredProducts,
        outOfStockProducts,
        lowStockProducts,

        totalSkuRows,
        activeSkuRows,
        inactiveSkuRows,
        outOfStockSkuRows,
        lowStockSkuRows,

        totalOrders,
        currentOrders,

        deliveredOrders:
          deliveredOrders.length,

        cancelledOrders,

        totalRevenue,
        totalSales,

        totalUsers:
          users.length,

        activeUsers:
          customerUsers,
      };
    }, [
      users,
      orders,
      products,
      logicalProducts,
    ]);

  /* =========================================================
     RECENT ORDERS
  ========================================================= */

  const recentOrders =
    useMemo(() => {
      return [
        ...orders,
      ]
        .sort(
          (
            firstOrder,
            secondOrder
          ) =>
            new Date(
              secondOrder.createdAt ||
                0
            ) -
            new Date(
              firstOrder.createdAt ||
                0
            )
        )
        .slice(
          0,
          5
        );
    }, [orders]);

  /* =========================================================
     QUICK CARDS
  ========================================================= */

  const quickCards =
    useMemo(
      () => [
        {
          label:
            "All Products",

          value:
            stats.totalProducts,

          sub:
            `${stats.totalSkuRows} pack variants`,

          path:
            "/admin/products",

          icon:
            ShoppingBag,
        },

        {
          label:
            "Out of Stock",

          value:
            stats.outOfStockProducts,

          sub:
            `${stats.outOfStockSkuRows} pack variants out of stock`,

          path:
            "/admin/products",

          icon:
            AlertTriangle,
        },

        {
          label:
            "Customers",

          value:
            stats.activeUsers,

          sub:
            "Registered shoppers",

          path:
            "/admin/users",

          icon:
            Users,
        },

        {
          label:
            "Current Orders",

          value:
            stats.currentOrders,

          sub:
            "Orders in progress",

          path:
            "/admin/orders",

          icon:
            Package,
        },
      ],
      [
        stats,
      ]
    );

  /* =========================================================
     ADMIN
  ========================================================= */

  const adminName =
    profile?.full_name ||
    profile?.name ||
    currentUser
      ?.user_metadata
      ?.full_name ||
    currentUser?.email ||
    "Admin";

  /* =========================================================
     FORMAT CURRENCY
  ========================================================= */

  const formatCurrency = (
    amount
  ) =>
    new Intl.NumberFormat(
      "en-IN",
      {
        style:
          "currency",

        currency:
          "INR",

        minimumFractionDigits:
          0,

        maximumFractionDigits:
          0,
      }
    ).format(
      Number(
        amount || 0
      )
    );

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

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
        day:
          "2-digit",

        month:
          "short",

        year:
          "numeric",
      }
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900 mx-auto" />

          <p className="mt-3 text-gray-600 text-sm">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (
    error &&
    !users.length &&
    !orders.length &&
    !products.length
  ) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-10 h-10 text-gray-400 mx-auto mb-3" />

          <p className="text-gray-700 font-semibold">
            Unable to load
            dashboard
          </p>

          <p className="text-gray-500 text-sm mt-1">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              fetchDashboardData()
            }
            className="mt-5 px-6 py-2 bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white rounded-full font-semibold hover:from-gray-400 hover:to-gray-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 mb-1">
            EchOo Grocery
          </p>

          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="text-sm text-gray-600 mt-1">
            Welcome back,{" "}
            {adminName}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          {/* MANAGE PRODUCTS */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
            className="px-4 py-2 rounded-full bg-gradient-to-b from-gray-500 to-gray-800 text-white text-sm font-semibold shadow-[inset_0_2px_4px_rgba(255,255,255,0.25),0_4px_8px_rgba(0,0,0,0.2)] hover:from-gray-400 hover:to-gray-700 transition-all"
          >
            Manage Products
          </button>

          {/* REFRESH */}

          <button
            type="button"
            onClick={() =>
              fetchDashboardData({
                silent: true,
              })
            }
            disabled={
              refreshing
            }
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-white/70 text-gray-700 text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        </div>
      </div>

      {/* =====================================================
          QUICK CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {quickCards.map(
          (card) => {
            const Icon =
              card.icon;

            return (
              <button
                type="button"
                key={
                  card.label
                }
                onClick={() =>
                  navigate(
                    card.path
                  )
                }
                className="text-left bg-white/60 backdrop-blur-xl rounded-2xl border border-white/70 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {card.label}
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {card.value}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {card.sub}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-white/70 border border-white flex items-center justify-center text-gray-600">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </button>
            );
          }
        )}
      </div>

      {/* =====================================================
          MAIN STATISTICS
      ===================================================== */}

      <DashboardStats
        stats={
          stats
        }
        formatCurrency={
          formatCurrency
        }
      />

      {/* =====================================================
          ANALYTICS CHARTS
      ===================================================== */}

      <AnalyticsCharts
        orders={
          orders
        }
        products={
          products
        }
        formatCurrency={
          formatCurrency
        }
      />

      {/* =====================================================
          INVENTORY + ORDER OVERVIEW
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ===================================================
            INVENTORY
        =================================================== */}

        <section className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/70 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                Inventory
              </p>

              <h2 className="text-lg font-bold text-gray-900 mt-1">
                Stock Overview
              </h2>
            </div>

            <ShoppingBag className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">

            {/* LOGICAL PRODUCTS */}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Total products
              </span>

              <strong className="text-gray-900">
                {
                  stats.totalProducts
                }
              </strong>
            </div>

            {/* SKU VARIANTS */}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Pack variants
              </span>

              <strong className="text-gray-900">
                {
                  stats.totalSkuRows
                }
              </strong>
            </div>

            {/* ACTIVE PRODUCTS */}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Active products
              </span>

              <strong className="text-gray-900">
                {
                  stats.activeProducts
                }
              </strong>
            </div>

            {/* INACTIVE PRODUCTS */}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Inactive products
              </span>

              <strong className="text-gray-900">
                {
                  stats.inactiveProducts
                }
              </strong>
            </div>

            {/* ACTIVE SKUS */}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Active pack variants
              </span>

              <strong className="text-green-700">
                {
                  stats.activeSkuRows
                }
              </strong>
            </div>

            {/* INACTIVE SKUS */}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Inactive pack variants
              </span>

              <strong className="text-gray-700">
                {
                  stats.inactiveSkuRows
                }
              </strong>
            </div>

            {/* OUT-OF-STOCK SKUS */}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Out-of-stock variants
              </span>

              <strong className="text-red-600">
                {
                  stats.outOfStockSkuRows
                }
              </strong>
            </div>

            {/* LOW STOCK */}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Low stock
              </span>

              <strong className="text-amber-600">
                {
                  stats.lowStockProducts
                }
              </strong>
            </div>

            {/* OUT OF STOCK */}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Out of stock
              </span>

              <strong className="text-red-600">
                {
                  stats.outOfStockProducts
                }
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
            className="w-full mt-6 py-2.5 rounded-full border border-gray-200 bg-white/70 text-sm font-semibold text-gray-700 hover:bg-white transition-colors"
          >
            Manage Inventory
          </button>
        </section>

        {/* ===================================================
            ORDERS
        =================================================== */}

        <section className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/70 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                Orders
              </p>

              <h2 className="text-lg font-bold text-gray-900 mt-1">
                Order Overview
              </h2>
            </div>

            <ShoppingCart className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Total orders
              </span>

              <strong className="text-gray-900">
                {
                  stats.totalOrders
                }
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                In progress
              </span>

              <strong className="text-gray-900">
                {
                  stats.currentOrders
                }
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Delivered
              </span>

              <strong className="text-green-700">
                {
                  stats.deliveredOrders
                }
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Cancelled
              </span>

              <strong className="text-red-600">
                {
                  stats.cancelledOrders
                }
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/orders"
              )
            }
            className="w-full mt-6 py-2.5 rounded-full border border-gray-200 bg-white/70 text-sm font-semibold text-gray-700 hover:bg-white transition-colors"
          >
            Manage Orders
          </button>
        </section>

        {/* ===================================================
            CASH ON DELIVERY
        =================================================== */}

        <section className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/70 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                Cash on Delivery
              </p>

              <h2 className="text-lg font-bold text-gray-900 mt-1">
                Delivered Revenue
              </h2>
            </div>

            <CheckCircle2 className="w-5 h-5 text-gray-400" />
          </div>

          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(
              stats.totalRevenue
            )}
          </p>

          <p className="text-sm text-gray-500 mt-2">
            Revenue is counted
            from delivered COD
            orders.
          </p>

          <div className="mt-6 pt-5 border-t border-gray-200/70">
            <p className="text-xs text-gray-500">
              Items delivered
            </p>

            <p className="text-xl font-bold text-gray-900 mt-1">
              {
                stats.totalSales
              }
            </p>
          </div>
        </section>
      </div>

      {/* =====================================================
          RECENT ORDERS
      ===================================================== */}

      <section className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/70 shadow-sm overflow-hidden">

        {/* HEADER */}

        <div className="p-5 flex items-center justify-between border-b border-gray-200/50">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
              Latest Activity
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-1">
              Recent Orders
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/orders"
              )
            }
            className="text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            View All
          </button>
        </div>

        {/* NO ORDERS */}

        {recentOrders.length ===
        0 ? (
          <div className="p-10 text-center">
            <Package className="w-9 h-9 text-gray-300 mx-auto mb-3" />

            <p className="text-sm text-gray-500">
              No orders yet.
            </p>
          </div>
        ) : (
          /* =================================================
             ORDER TABLE
          ================================================= */

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">

              {/* TABLE HEADER */}

              <thead>
                <tr className="text-left border-b border-gray-200/50">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Order
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Date
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Status
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody>
                {recentOrders.map(
                  (order) => (
                    <tr
                      key={
                        order.id
                      }
                      onClick={() =>
                        navigate(
                          "/admin/orders"
                        )
                      }
                      className="border-b border-gray-100/70 last:border-0 hover:bg-white/40 cursor-pointer transition-colors"
                    >

                      {/* ORDER ID */}

                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          #
                          {String(
                            order.id
                          ).slice(
                            0,
                            8
                          )}
                        </span>
                      </td>

                      {/* CUSTOMER */}

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {
                            order.userName
                          }
                        </p>

                        {order.userEmail && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {
                              order.userEmail
                            }
                          </p>
                        )}
                      </td>

                      {/* DATE */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(
                          order.createdAt
                        )}
                      </td>

                      {/* TOTAL */}

                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(
                          order.total
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {formatStatus(
                            order.status
                          )}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;