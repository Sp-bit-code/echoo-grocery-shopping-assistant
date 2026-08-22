import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  IndianRupee,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getAllOrders,
  updateOrderStatus,
} from "../../../api/adminApi.js";

const ORDERS_PER_PAGE = 10;

const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "packing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const CURRENT_STATUSES = [
  "placed",
  "confirmed",
  "packing",
  "out_for_delivery",
];

/* =========================================================
   HELPERS
========================================================= */

const extractOrders = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.orders)) {
    return response.orders;
  }

  if (
    Array.isArray(
      response?.data?.orders
    )
  ) {
    return response.data.orders;
  }

  return [];
};

const normalizeStatus = (status) => {
  const value = String(
    status || "placed"
  ).toLowerCase();

  /*
    Temporary compatibility with older
    seeded/order data if any still exists.
  */
  if (value === "pending") {
    return "placed";
  }

  if (value === "processing") {
    return "packing";
  }

  if (value === "shipped") {
    return "out_for_delivery";
  }

  if (value === "completed") {
    return "delivered";
  }

  return ORDER_STATUSES.includes(
    value
  )
    ? value
    : "placed";
};

const formatStatus = (status) =>
  String(status || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

const getStatusClass = (status) => {
  switch (
    normalizeStatus(status)
  ) {
    case "confirmed":
      return "bg-indigo-100 text-indigo-700";

    case "packing":
      return "bg-amber-100 text-amber-700";

    case "out_for_delivery":
      return "bg-blue-100 text-blue-700";

    case "delivered":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    case "placed":
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatPrice = (amount) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  ).format(
    Number(amount || 0)
  );

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

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const normalizeOrderItem = (
  item = {}
) => {
  const product =
    item.products ||
    item.product ||
    {};

  const quantity = Number(
    item.quantity || 1
  );

  const unitPrice = Number(
    item.unit_price ||
      item.unitPrice ||
      item.product_price ||
      item.price ||
      product.discount_price ||
      product.price ||
      0
  );

  const total = Number(
    item.total_price ||
      item.item_total ||
      item.itemTotal ||
      unitPrice * quantity
  );

  const productImages =
    product.product_images ||
    product.images ||
    [];

  const firstImage =
    Array.isArray(productImages) &&
    productImages.length
      ? typeof productImages[0] ===
        "string"
        ? productImages[0]
        : productImages[0]
            ?.image_url ||
          productImages[0]?.url ||
          ""
      : "";

  return {
    ...item,

    product,

    name:
      item.product_name ||
      item.productName ||
      item.name ||
      product.name ||
      "Product",

    image:
      item.product_image ||
      item.image ||
      firstImage,

    quantity,

    unitPrice,

    total,

    packSize:
      item.pack_size ||
      item.packSize ||
      product.pack_size ||
      "",

    unit:
      item.unit ||
      product.unit ||
      "",
  };
};

const normalizeOrder = (
  order = {}
) => {
  const profile =
    order.profiles ||
    order.profile ||
    {};

  const items =
    order.order_items ||
    order.items ||
    [];

  const address =
    order.delivery_address ||
    order.shipping_address ||
    order.address ||
    {};

  return {
    ...order,

    id: order.id,

    userName:
      order.userName ||
      order.user_name ||
      profile.full_name ||
      profile.name ||
      profile.email ||
      "Customer",

    userEmail:
      order.userEmail ||
      order.user_email ||
      profile.email ||
      "",

    userPhone:
      order.userPhone ||
      order.user_phone ||
      profile.phone ||
      "",

    total: Number(
      order.total_amount ||
        order.total ||
        order.amount ||
        0
    ),

    status: normalizeStatus(
      order.order_status ||
        order.status
    ),

    paymentMethod: "cod",

    paymentStatus:
      order.payment_status ||
      order.paymentStatus ||
      (normalizeStatus(
        order.order_status ||
          order.status
      ) === "delivered"
        ? "collected"
        : "pending"),

    createdAt:
      order.created_at ||
      order.createdAt ||
      order.date ||
      null,

    address,

    items: Array.isArray(items)
      ? items.map(
          normalizeOrderItem
        )
      : [],
  };
};

const formatAddress = (
  address
) => {
  if (!address) {
    return "No address available";
  }

  if (
    typeof address === "string"
  ) {
    return address;
  }

  const parts = [
    address.full_name ||
      address.name,

    address.address_line_1 ||
      address.addressLine1 ||
      address.line1 ||
      address.address,

    address.address_line_2 ||
      address.addressLine2 ||
      address.line2,

    address.landmark,

    address.city,

    address.state,

    address.postal_code ||
      address.postalCode ||
      address.pincode ||
      address.zip,

    address.country,
  ].filter(Boolean);

  return (
    parts.join(", ") ||
    "No address available"
  );
};

/* =========================================================
   ADMIN ORDERS
========================================================= */

const AdminOrders = () => {
  const [
    rawOrders,
    setRawOrders,
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
    selectedStatus,
    setSelectedStatus,
  ] = useState("all");

  const [
    dateFilter,
    setDateFilter,
  ] = useState("all");

  const [
    sortBy,
    setSortBy,
  ] = useState("newest");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState(null);

  const [
    updatingOrderId,
    setUpdatingOrderId,
  ] = useState(null);

  /* =======================================================
     LOAD ORDERS
  ======================================================= */

  const fetchOrders = async ({
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
        await getAllOrders();

      setRawOrders(
        extractOrders(
          response
        )
      );
    } catch (fetchError) {
      console.error(
        "Error loading orders:",
        fetchError
      );

      setError(
        fetchError?.message ||
          "Failed to load orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =======================================================
     NORMALIZE
  ======================================================= */

  const allOrders = useMemo(
    () =>
      rawOrders.map(
        normalizeOrder
      ),
    [rawOrders]
  );

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredOrders =
    useMemo(() => {
      let list = [
        ...allOrders,
      ];

      const query =
        deferredSearchTerm
          .trim()
          .toLowerCase();

      if (query) {
        list = list.filter(
          (order) =>
            [
              order.id,
              order.userName,
              order.userEmail,
              order.userPhone,
              order.status,
            ].some((value) =>
              String(value || "")
                .toLowerCase()
                .includes(query)
            )
        );
      }

      if (
        selectedStatus !==
        "all"
      ) {
        list = list.filter(
          (order) =>
            order.status ===
            selectedStatus
        );
      }

      if (
        dateFilter !== "all"
      ) {
        const now = new Date();

        list = list.filter(
          (order) => {
            if (
              !order.createdAt
            ) {
              return false;
            }

            const orderDate =
              new Date(
                order.createdAt
              );

            if (
              Number.isNaN(
                orderDate.getTime()
              )
            ) {
              return false;
            }

            if (
              dateFilter ===
              "today"
            ) {
              return (
                orderDate.toDateString() ===
                now.toDateString()
              );
            }

            if (
              dateFilter ===
              "week"
            ) {
              const start =
                new Date();

              start.setHours(
                0,
                0,
                0,
                0
              );

              start.setDate(
                start.getDate() -
                  7
              );

              return (
                orderDate >=
                start
              );
            }

            if (
              dateFilter ===
              "month"
            ) {
              return (
                orderDate.getMonth() ===
                  now.getMonth() &&
                orderDate.getFullYear() ===
                  now.getFullYear()
              );
            }

            return true;
          }
        );
      }

      if (
        sortBy === "newest"
      ) {
        list.sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
        );
      }

      if (
        sortBy === "oldest"
      ) {
        list.sort(
          (a, b) =>
            new Date(
              a.createdAt || 0
            ) -
            new Date(
              b.createdAt || 0
            )
        );
      }

      if (
        sortBy ===
        "amount-high"
      ) {
        list.sort(
          (a, b) =>
            b.total - a.total
        );
      }

      if (
        sortBy ===
        "amount-low"
      ) {
        list.sort(
          (a, b) =>
            a.total - b.total
        );
      }

      return list;
    }, [
      allOrders,
      deferredSearchTerm,
      selectedStatus,
      dateFilter,
      sortBy,
    ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredOrders.length /
          ORDERS_PER_PAGE
      )
    );

  const paginatedOrders =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        ORDERS_PER_PAGE;

      return filteredOrders.slice(
        start,
        start +
          ORDERS_PER_PAGE
      );
    }, [
      filteredOrders,
      currentPage,
    ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    deferredSearchTerm,
    selectedStatus,
    dateFilter,
    sortBy,
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
     KEEP MODAL ORDER UPDATED
  ======================================================= */

  useEffect(() => {
    if (!selectedOrder?.id) {
      return;
    }

    const updated =
      allOrders.find(
        (order) =>
          String(order.id) ===
          String(
            selectedOrder.id
          )
      );

    if (updated) {
      setSelectedOrder(
        updated
      );
    }
  }, [
    allOrders,
    selectedOrder?.id,
  ]);

  /* =======================================================
     STATS

     COD revenue is only counted after delivery.
  ======================================================= */

  const stats = useMemo(() => {
    const delivered =
      allOrders.filter(
        (order) =>
          order.status ===
          "delivered"
      );

    return {
      total:
        allOrders.length,

      current:
        allOrders.filter(
          (order) =>
            CURRENT_STATUSES.includes(
              order.status
            )
        ).length,

      delivered:
        delivered.length,

      cancelled:
        allOrders.filter(
          (order) =>
            order.status ===
            "cancelled"
        ).length,

      revenue:
        delivered.reduce(
          (sum, order) =>
            sum +
            Number(
              order.total || 0
            ),
          0
        ),
    };
  }, [allOrders]);

  /* =======================================================
     STATUS UPDATE
  ======================================================= */

  const handleUpdateStatus =
    async (
      orderId,
      newStatus
    ) => {
      const normalized =
        normalizeStatus(
          newStatus
        );

      try {
        setUpdatingOrderId(
          orderId
        );

        await updateOrderStatus(
          orderId,
          normalized
        );

        toast.success(
          `Order updated to ${formatStatus(
            normalized
          )}.`
        );

        await fetchOrders({
          silent: true,
        });
      } catch (updateError) {
        console.error(
          "Order status update error:",
          updateError
        );

        toast.error(
          updateError?.message ||
            "Failed to update order status."
        );
      } finally {
        setUpdatingOrderId(
          null
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />

          <p className="mt-3 text-sm text-gray-600">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
            Store Orders
          </p>

          <h1 className="text-2xl font-bold text-gray-900">
            Orders
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Track grocery orders
            and manage their
            delivery status.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            fetchOrders({
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

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4">
          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* ===================================================
          STATS
      =================================================== */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">

        <div className="rounded-2xl border border-white/60 bg-white/40 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Total Orders
            </p>

            <ShoppingBag className="h-4 w-4 text-gray-400" />
          </div>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats.total}
          </p>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/40 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              In Progress
            </p>

            <Clock3 className="h-4 w-4 text-gray-400" />
          </div>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats.current}
          </p>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/40 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Delivered
            </p>

            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats.delivered}
          </p>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/40 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Cancelled
            </p>

            <XCircle className="h-4 w-4 text-red-500" />
          </div>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats.cancelled}
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-white/60 bg-white/40 p-4 backdrop-blur-xl lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              COD Revenue
            </p>

            <IndianRupee className="h-4 w-4 text-gray-400" />
          </div>

          <p className="mt-2 text-xl font-bold text-gray-900">
            {formatPrice(
              stats.revenue
            )}
          </p>

          <p className="mt-1 text-[10px] text-gray-400">
            Delivered orders only
          </p>
        </div>
      </div>

      {/* ===================================================
          FILTERS
      =================================================== */}

      <div className="rounded-[2rem] border border-white/60 bg-white/40 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_190px_160px_170px]">

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
              placeholder="Search order, customer, email..."
              className="h-11 w-full rounded-2xl border border-white/70 bg-white/60 pl-11 pr-4 text-sm text-gray-900 outline-none focus:bg-white"
            />
          </div>

          <select
            value={
              selectedStatus
            }
            onChange={(event) =>
              setSelectedStatus(
                event.target.value
              )
            }
            className="h-11 rounded-2xl border border-white/70 bg-white/60 px-4 text-sm text-gray-700 outline-none"
          >
            <option value="all">
              All Statuses
            </option>

            {ORDER_STATUSES.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {formatStatus(
                    status
                  )}
                </option>
              )
            )}
          </select>

          <select
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(
                event.target.value
              )
            }
            className="h-11 rounded-2xl border border-white/70 bg-white/60 px-4 text-sm text-gray-700 outline-none"
          >
            <option value="all">
              All Dates
            </option>

            <option value="today">
              Today
            </option>

            <option value="week">
              Last 7 Days
            </option>

            <option value="month">
              This Month
            </option>
          </select>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target.value
              )
            }
            className="h-11 rounded-2xl border border-white/70 bg-white/60 px-4 text-sm text-gray-700 outline-none"
          >
            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>

            <option value="amount-high">
              Amount: High
            </option>

            <option value="amount-low">
              Amount: Low
            </option>
          </select>
        </div>
      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-xl">

        <div className="flex items-center justify-between border-b border-gray-200/50 px-5 py-4">
          <div>
            <h2 className="font-bold text-gray-900">
              Customer Orders
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              {
                filteredOrders.length
              }{" "}
              orders found
            </p>
          </div>

          <Package className="h-5 w-5 text-gray-400" />
        </div>

        {paginatedOrders.length ===
        0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-gray-300" />

            <p className="mt-3 text-sm font-semibold text-gray-600">
              No orders found
            </p>

            <p className="mt-1 text-xs text-gray-400">
              New grocery orders
              will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-gray-200/50">
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Order
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Payment
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Date
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.map(
                  (order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100/70 last:border-0 transition-colors hover:bg-white/35"
                    >
                      {/* ORDER */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          #
                          {String(
                            order.id
                          ).slice(
                            0,
                            8
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {
                            order.items
                              .length
                          }{" "}
                          item
                          {order.items
                            .length !==
                          1
                            ? "s"
                            : ""}
                        </p>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-5 py-4">
                        <p className="max-w-[180px] truncate text-sm font-medium text-gray-900">
                          {
                            order.userName
                          }
                        </p>

                        <p className="mt-0.5 max-w-[180px] truncate text-xs text-gray-400">
                          {
                            order.userEmail
                          }
                        </p>
                      </td>

                      {/* TOTAL */}
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                        {formatPrice(
                          order.total
                        )}
                      </td>

                      {/* PAYMENT */}
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                          COD
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        <select
                          value={
                            order.status
                          }
                          disabled={
                            updatingOrderId ===
                            order.id
                          }
                          onChange={(event) =>
                            handleUpdateStatus(
                              order.id,
                              event
                                .target
                                .value
                            )
                          }
                          className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {ORDER_STATUSES.map(
                            (
                              status
                            ) => (
                              <option
                                key={
                                  status
                                }
                                value={
                                  status
                                }
                              >
                                {formatStatus(
                                  status
                                )}
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      {/* DATE */}
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {formatDate(
                          order.createdAt
                        )}
                      </td>

                      {/* VIEW */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedOrder(
                                order
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/60 text-gray-600 transition hover:bg-white hover:text-gray-900"
                            aria-label="View order"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* =================================================
            PAGINATION
        ================================================= */}

        {filteredOrders.length >
          ORDERS_PER_PAGE && (
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
                className="flex items-center gap-1 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-white disabled:opacity-40"
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
                className="flex items-center gap-1 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-white disabled:opacity-40"
              >
                Next

                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================
          ORDER DETAILS MODAL
      =================================================== */}

      {selectedOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">

          <div className="my-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/95 shadow-2xl">

            {/* HEADER */}
            <div className="flex items-start justify-between border-b border-gray-200/60 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Order Details
                </p>

                <h3 className="mt-1 text-lg font-bold text-gray-900">
                  #
                  {String(
                    selectedOrder.id
                  ).slice(
                    0,
                    8
                  )}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(
                    selectedOrder.createdAt
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-6">

              {/* SUMMARY */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="h-4 w-4" />

                    <span className="text-xs font-semibold">
                      Customer
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-bold text-gray-900">
                    {
                      selectedOrder.userName
                    }
                  </p>

                  <p className="mt-1 break-all text-xs text-gray-500">
                    {
                      selectedOrder.userEmail ||
                      "No email"
                    }
                  </p>

                  {selectedOrder.userPhone && (
                    <p className="mt-1 text-xs text-gray-500">
                      {
                        selectedOrder.userPhone
                      }
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Truck className="h-4 w-4" />

                    <span className="text-xs font-semibold">
                      Status
                    </span>
                  </div>

                  <div className="mt-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                        selectedOrder.status
                      )}`}
                    >
                      {formatStatus(
                        selectedOrder.status
                      )}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <IndianRupee className="h-4 w-4" />

                    <span className="text-xs font-semibold">
                      Payment
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-bold text-gray-900">
                    Cash on Delivery
                  </p>

                  <p className="mt-1 text-xs capitalize text-gray-500">
                    {selectedOrder.status ===
                    "delivered"
                      ? "Payment collected"
                      : "Payment due on delivery"}
                  </p>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="h-4 w-4" />

                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Delivery Address
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-gray-700">
                  {formatAddress(
                    selectedOrder.address
                  )}
                </p>
              </div>

              {/* ITEMS */}
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">
                      Order Items
                    </h4>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {
                        selectedOrder
                          .items.length
                      }{" "}
                      product
                      {selectedOrder
                        .items
                        .length !== 1
                        ? "s"
                        : ""}
                    </p>
                  </div>

                  <Package className="h-5 w-5 text-gray-400" />
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200">

                  {selectedOrder.items
                    .length > 0 ? (
                    selectedOrder.items.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={
                            item.id ||
                            `${item.name}-${index}`
                          }
                          className="flex items-center gap-4 border-b border-gray-100 bg-white p-4 last:border-0"
                        >
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                            {item.image ? (
                              <img
                                src={
                                  item.image
                                }
                                alt={
                                  item.name
                                }
                                className="h-full w-full object-contain p-1"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-gray-300" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {
                                item.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {item.packSize ||
                                (item.unit
                                  ? item.unit
                                  : "Grocery product")}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {formatPrice(
                                item.unitPrice
                              )}{" "}
                              ×{" "}
                              {
                                item.quantity
                              }
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-bold text-gray-900">
                            {formatPrice(
                              item.total
                            )}
                          </p>
                        </div>
                      )
                    )
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-500">
                      No order items
                      available.
                    </div>
                  )}
                </div>
              </div>

              {/* TOTAL */}
              <div className="mt-5 flex justify-end">
                <div className="w-full max-w-sm rounded-2xl bg-gray-900 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                      Order Total
                    </span>

                    <strong className="text-xl">
                      {formatPrice(
                        selectedOrder.total
                      )}
                    </strong>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    <span>
                      Payment Method
                    </span>

                    <span>
                      Cash on Delivery
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;