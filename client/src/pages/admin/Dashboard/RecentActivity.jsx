import React from "react";

import {
  ArrowUpRight,
  IndianRupee,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

const formatStatus = (status) =>
  String(status || "placed")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

const getStatusColor = (status) => {
  switch (
    String(status || "").toLowerCase()
  ) {
    case "delivered":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    case "out_for_delivery":
      return "bg-blue-100 text-blue-700";

    case "packing":
      return "bg-amber-100 text-amber-700";

    case "confirmed":
      return "bg-indigo-100 text-indigo-700";

    case "placed":
    default:
      return "bg-gray-100 text-gray-700";
  }
};

/* =========================================================
   RECENT ACTIVITY
========================================================= */

const RecentActivity = ({
  recentOrders = [],
  stats = {},
  formatCurrency,
  navigate,
}) => {
  const safeFormatCurrency =
    formatCurrency ||
    ((amount) =>
      new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }
      ).format(
        Number(amount || 0)
      ));

  /* =======================================================
     SUMMARY VALUES
  ======================================================= */

  const totalRevenue =
    Number(
      stats.totalRevenue || 0
    );

  const totalSales =
    Number(
      stats.totalSales || 0
    );

  const totalOrders =
    Number(
      stats.totalOrders || 0
    );

  const deliveredOrders =
    Number(
      stats.deliveredOrders || 0
    );

  const currentOrders =
    Number(
      stats.currentOrders || 0
    );

  const cancelledOrders =
    Number(
      stats.cancelledOrders || 0
    );

  /*
    COD revenue and sales represent delivered orders,
    so these averages must use deliveredOrders.
  */

  const averageOrderValue =
    deliveredOrders > 0
      ? totalRevenue /
        deliveredOrders
      : 0;

  const itemsPerDeliveredOrder =
    deliveredOrders > 0
      ? totalSales /
        deliveredOrders
      : 0;

  /* =======================================================
     DATE
  ======================================================= */

  const formatDate = (value) => {
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
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleViewAll = () => {
    if (navigate) {
      navigate(
        "/admin/orders"
      );
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
          Activity
        </p>

        <h2 className="mt-1 text-lg font-bold text-gray-900">
          Recent Store Activity
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">

        {/* =================================================
            RECENT ORDERS
        ================================================= */}

        <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200/50 p-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Recent Orders
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Latest customer
                grocery orders
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleViewAll
              }
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-gray-500 to-gray-800 px-4 py-2 text-xs font-semibold text-white shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.25)] transition-all hover:from-gray-400 hover:to-gray-700"
            >
              View All

              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {recentOrders.length >
          0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full">
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
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map(
                    (order) => {
                      const customer =
                        order.userName ||
                        order.customer ||
                        order.userEmail ||
                        "Customer";

                      const amount =
                        Number(
                          order.total ||
                            order.amount ||
                            order.total_amount ||
                            0
                        );

                      const status =
                        order.status ||
                        order.order_status ||
                        "placed";

                      const date =
                        order.createdAt ||
                        order.created_at ||
                        order.date;

                      return (
                        <tr
                          key={
                            order.id
                          }
                          onClick={
                            handleViewAll
                          }
                          className="cursor-pointer border-b border-gray-100/70 last:border-0 transition-colors hover:bg-white/45"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/70 bg-white/60 text-gray-500">
                                <Package className="h-4 w-4" />
                              </div>

                              <span className="text-sm font-semibold text-gray-900">
                                #
                                {String(
                                  order.id
                                ).slice(
                                  0,
                                  8
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="max-w-[180px] truncate text-sm font-medium text-gray-900">
                              {
                                customer
                              }
                            </p>

                            {order.userEmail && (
                              <p className="mt-0.5 max-w-[180px] truncate text-xs text-gray-400">
                                {
                                  order.userEmail
                                }
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                            {safeFormatCurrency(
                              amount
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(
                                status
                              )}`}
                            >
                              {formatStatus(
                                status
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-500">
                            {formatDate(
                              date
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-[260px] items-center justify-center p-8 text-center">
              <div>
                <Package className="mx-auto h-9 w-9 text-gray-300" />

                <p className="mt-3 text-sm font-medium text-gray-600">
                  No orders yet
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  New customer orders
                  will appear here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            SALES SUMMARY
        ================================================= */}

        <div className="rounded-[2rem] border border-white/60 bg-white/40 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-xl">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-900">
              Sales Summary
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Delivered COD
              performance
            </p>
          </div>

          <div className="space-y-3">

            {/* AVERAGE ORDER */}
            <div className="rounded-2xl border border-white/60 bg-white/45 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Average Delivered
                    Order
                  </p>

                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {safeFormatCurrency(
                      averageOrderValue
                    )}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-gray-600">
                  <IndianRupee className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* ITEMS PER ORDER */}
            <div className="rounded-2xl border border-white/60 bg-white/45 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Items per
                    Delivered Order
                  </p>

                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {itemsPerDeliveredOrder.toFixed(
                      1
                    )}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-gray-600">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* DELIVERED REVENUE */}
            <div className="rounded-2xl border border-white/60 bg-white/45 p-4">
              <p className="text-xs font-medium text-gray-500">
                Delivered Revenue
              </p>

              <p className="mt-1 text-xl font-bold text-gray-900">
                {safeFormatCurrency(
                  totalRevenue
                )}
              </p>

              <p className="mt-1 text-[11px] text-gray-400">
                From{" "}
                {deliveredOrders}{" "}
                delivered COD orders
              </p>
            </div>
          </div>

          {/* =================================================
              ORDER BREAKDOWN
          ================================================= */}

          <div className="mt-5 border-t border-gray-200/60 pt-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Order Breakdown
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Total orders
                </span>

                <strong className="text-sm text-gray-900">
                  {totalOrders}
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  In progress
                </span>

                <strong className="text-sm text-gray-900">
                  {currentOrders}
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Delivered
                </span>

                <strong className="text-sm text-green-700">
                  {deliveredOrders}
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Cancelled
                </span>

                <strong className="text-sm text-red-600">
                  {cancelledOrders}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentActivity;