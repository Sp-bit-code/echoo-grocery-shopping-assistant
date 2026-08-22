import React, {
  useMemo,
} from "react";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Package,
} from "lucide-react";

/* =========================================================
   CHART COLORS

   Kept restrained to match the original Echoo
   blue / white / grey visual language.
========================================================= */

const PIE_COLORS = [
  "#1f2937",
  "#2563eb",
  "#60a5fa",
  "#93c5fd",
  "#64748b",
  "#94a3b8",
];

/* =========================================================
   HELPERS
========================================================= */

const getOrderStatus = (
  order = {}
) =>
  String(
    order.status ||
      order.order_status ||
      "placed"
  ).toLowerCase();

const getOrderDate = (
  order = {}
) =>
  order.createdAt ||
  order.created_at ||
  null;

const getOrderTotal = (
  order = {}
) =>
  Number(
    order.total ||
      order.total_amount ||
      0
  );

const getOrderItems = (
  order = {}
) =>
  order.items ||
  order.order_items ||
  [];

const getLocalDateKey = (
  value
) => {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
};

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

const getItemProductId = (
  item = {}
) =>
  item.productId ||
  item.product_id ||
  item.products?.id ||
  item.product?.id ||
  null;

const getItemQuantity = (
  item = {}
) =>
  Number(
    item.quantity || 0
  );

const getItemRevenue = (
  item = {}
) => {
  const quantity =
    getItemQuantity(item);

  if (
    item.itemTotal != null
  ) {
    return Number(
      item.itemTotal || 0
    );
  }

  if (
    item.total_price != null
  ) {
    return Number(
      item.total_price || 0
    );
  }

  if (
    item.item_total != null
  ) {
    return Number(
      item.item_total || 0
    );
  }

  const unitPrice =
    Number(
      item.unitPrice ||
        item.unit_price ||
        item.price ||
        item.products
          ?.discount_price ||
        item.products?.price ||
        item.product
          ?.discount_price ||
        item.product?.price ||
        0
    );

  return (
    unitPrice * quantity
  );
};

const findProduct = (
  item,
  products
) => {
  const productId =
    getItemProductId(item);

  if (productId) {
    const matched =
      products.find(
        (product) =>
          String(
            product.id
          ) ===
          String(productId)
      );

    if (matched) {
      return matched;
    }
  }

  return (
    item.products ||
    item.product ||
    {}
  );
};

const getProductName = (
  item,
  products
) => {
  const product =
    findProduct(
      item,
      products
    );

  return (
    item.productName ||
    item.product_name ||
    product.name ||
    "Product"
  );
};

const getProductCategory = (
  item,
  products
) => {
  const product =
    findProduct(
      item,
      products
    );

  const category =
    product.categories ||
    product.category ||
    {};

  if (
    typeof category ===
    "string"
  ) {
    return (
      category ||
      "Uncategorized"
    );
  }

  return (
    category?.name ||
    product.categoryName ||
    product.category_name ||
    "Uncategorized"
  );
};

/* =========================================================
   TOOLTIP — WEEKLY PERFORMANCE
========================================================= */

const PerformanceTooltip = ({
  active,
  payload,
  label,
  formatCurrency,
}) => {
  if (
    !active ||
    !payload?.length
  ) {
    return null;
  }

  const revenue =
    payload.find(
      (item) =>
        item.dataKey ===
        "revenue"
    )?.value || 0;

  const orders =
    payload.find(
      (item) =>
        item.dataKey ===
        "orders"
    )?.value || 0;

  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl backdrop-blur-xl">
      <p className="text-sm font-bold text-gray-900">
        {label}
      </p>

      <div className="mt-3 space-y-2">
        <div className="flex min-w-[180px] items-center justify-between gap-5">
          <span className="text-xs text-gray-500">
            Delivered Revenue
          </span>

          <strong className="text-sm text-gray-900">
            {formatCurrency(
              revenue
            )}
          </strong>
        </div>

        <div className="flex items-center justify-between gap-5">
          <span className="text-xs text-gray-500">
            Orders
          </span>

          <strong className="text-sm text-gray-900">
            {orders}
          </strong>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   CATEGORY TOOLTIP
========================================================= */

const CategoryTooltip = ({
  active,
  payload,
  formatCurrency,
}) => {
  if (
    !active ||
    !payload?.length
  ) {
    return null;
  }

  const item =
    payload[0]?.payload ||
    {};

  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 p-3 shadow-xl backdrop-blur-xl">
      <p className="text-sm font-bold text-gray-900">
        {item.name}
      </p>

      <p className="mt-1 text-xs text-gray-600">
        {item.units || 0} units
        delivered
      </p>

      <p className="mt-1 text-xs font-semibold text-gray-900">
        {formatCurrency(
          item.revenue || 0
        )}
      </p>
    </div>
  );
};

/* =========================================================
   STATUS TOOLTIP
========================================================= */

const StatusTooltip = ({
  active,
  payload,
  label,
}) => {
  if (
    !active ||
    !payload?.length
  ) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 p-3 shadow-xl backdrop-blur-xl">
      <p className="text-sm font-bold text-gray-900">
        {label}
      </p>

      <p className="mt-1 text-xs text-gray-600">
        {payload[0]?.value || 0}{" "}
        orders
      </p>
    </div>
  );
};

/* =========================================================
   ANALYTICS CHARTS
========================================================= */

const AnalyticsCharts = ({
  orders = [],
  products = [],
  formatCurrency,
}) => {
  const safeFormatCurrency =
    formatCurrency ||
    ((amount) =>
      new Intl.NumberFormat(
        "en-IN",
        {
          style:
            "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }
      ).format(
        Number(
          amount || 0
        )
      ));

  /* =======================================================
     LAST 7 DAYS
  ======================================================= */

  const weeklyData =
    useMemo(() => {
      const days = [];

      for (
        let index = 6;
        index >= 0;
        index -= 1
      ) {
        const date =
          new Date();

        date.setHours(
          0,
          0,
          0,
          0
        );

        date.setDate(
          date.getDate() -
            index
        );

        const dateKey =
          getLocalDateKey(
            date
          );

        const dayOrders =
          orders.filter(
            (order) => {
              const createdAt =
                getOrderDate(
                  order
                );

              return (
                createdAt &&
                getLocalDateKey(
                  createdAt
                ) === dateKey
              );
            }
          );

        /*
          COD revenue is recognized only when
          the order has been delivered.
        */
        const revenue =
          dayOrders
            .filter(
              (order) =>
                getOrderStatus(
                  order
                ) ===
                "delivered"
            )
            .reduce(
              (sum, order) =>
                sum +
                getOrderTotal(
                  order
                ),
              0
            );

        days.push({
          name:
            date.toLocaleDateString(
              "en-IN",
              {
                weekday:
                  "short",
              }
            ),

          fullDate:
            date.toLocaleDateString(
              "en-IN",
              {
                day:
                  "2-digit",
                month:
                  "short",
              }
            ),

          revenue,

          orders:
            dayOrders.length,
        });
      }

      return days;
    }, [orders]);

  /* =======================================================
     ORDER STATUS
  ======================================================= */

  const statusData =
    useMemo(() => {
      const statuses = {
        placed: 0,
        confirmed: 0,
        packing: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0,
      };

      orders.forEach(
        (order) => {
          const status =
            getOrderStatus(
              order
            );

          if (
            Object.prototype.hasOwnProperty.call(
              statuses,
              status
            )
          ) {
            statuses[
              status
            ] += 1;
          }
        }
      );

      return Object.entries(
        statuses
      )
        .map(
          ([
            status,
            count,
          ]) => ({
            name:
              formatStatus(
                status
              ),

            count,
          })
        )
        .filter(
          (item) =>
            item.count > 0
        );
    }, [orders]);

  /* =======================================================
     ACTUAL CATEGORY SALES
  ======================================================= */

  const categoryData =
    useMemo(() => {
      const categoryMap =
        {};

      orders.forEach(
        (order) => {
          if (
            getOrderStatus(
              order
            ) !==
            "delivered"
          ) {
            return;
          }

          getOrderItems(
            order
          ).forEach(
            (item) => {
              const category =
                getProductCategory(
                  item,
                  products
                );

              if (
                !categoryMap[
                  category
                ]
              ) {
                categoryMap[
                  category
                ] = {
                  name:
                    category,

                  units: 0,

                  revenue: 0,
                };
              }

              categoryMap[
                category
              ].units +=
                getItemQuantity(
                  item
                );

              categoryMap[
                category
              ].revenue +=
                getItemRevenue(
                  item
                );
            }
          );
        }
      );

      return Object.values(
        categoryMap
      )
        .sort(
          (
            first,
            second
          ) =>
            second.units -
            first.units
        )
        .slice(0, 6);
    }, [
      orders,
      products,
    ]);

  /* =======================================================
     TOP SELLING PRODUCTS
  ======================================================= */

  const topProducts =
    useMemo(() => {
      const productSales =
        {};

      orders.forEach(
        (order) => {
          if (
            getOrderStatus(
              order
            ) !==
            "delivered"
          ) {
            return;
          }

          getOrderItems(
            order
          ).forEach(
            (item) => {
              const productId =
                getItemProductId(
                  item
                );

              const name =
                getProductName(
                  item,
                  products
                );

              const key =
                productId ||
                name;

              if (!key) {
                return;
              }

              if (
                !productSales[
                  key
                ]
              ) {
                productSales[
                  key
                ] = {
                  name,

                  units: 0,

                  revenue: 0,

                  category:
                    getProductCategory(
                      item,
                      products
                    ),
                };
              }

              productSales[
                key
              ].units +=
                getItemQuantity(
                  item
                );

              productSales[
                key
              ].revenue +=
                getItemRevenue(
                  item
                );
            }
          );
        }
      );

      return Object.values(
        productSales
      )
        .sort(
          (
            first,
            second
          ) =>
            second.revenue -
            first.revenue
        )
        .slice(0, 5);
    }, [
      orders,
      products,
    ]);

  /* =======================================================
     WEEKLY SUMMARY
  ======================================================= */

  const weeklyRevenue =
    weeklyData.reduce(
      (sum, day) =>
        sum +
        Number(
          day.revenue || 0
        ),
      0
    );

  const weeklyOrders =
    weeklyData.reduce(
      (sum, day) =>
        sum +
        Number(
          day.orders || 0
        ),
      0
    );

  const averageOrderValue =
    weeklyOrders > 0
      ? weeklyRevenue /
        weeklyOrders
      : 0;

  const peakDay =
    weeklyData.reduce(
      (best, day) =>
        day.revenue >
        (best?.revenue ||
          0)
          ? day
          : best,
      null
    );

  return (
    <section className="space-y-5">

      {/* ===================================================
          SECTION TITLE
      =================================================== */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
          Analytics
        </p>

        <h2 className="mt-1 text-lg font-bold text-gray-900">
          Store Performance
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* =================================================
            7-DAY PERFORMANCE
        ================================================= */}

        <div className="rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-xl lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                7-Day Performance
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Order volume and
                delivered COD revenue
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-800" />

                <span className="text-gray-600">
                  Revenue
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

                <span className="text-gray-600">
                  Orders
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <ComposedChart
                data={
                  weeklyData
                }
                margin={{
                  top: 5,
                  right: 5,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="echooRevenueArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#1f2937"
                      stopOpacity={
                        0.2
                      }
                    />

                    <stop
                      offset="100%"
                      stopColor="#1f2937"
                      stopOpacity={
                        0
                      }
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={
                    false
                  }
                />

                <XAxis
                  dataKey="name"
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                  tick={{
                    fontSize: 11,
                    fill:
                      "#6b7280",
                  }}
                />

                <YAxis
                  yAxisId="revenue"
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                  tick={{
                    fontSize: 11,
                    fill:
                      "#6b7280",
                  }}
                  tickFormatter={(
                    value
                  ) => {
                    if (
                      value >=
                      1000
                    ) {
                      return `₹${Math.round(
                        value /
                          1000
                      )}k`;
                    }

                    return `₹${value}`;
                  }}
                />

                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  allowDecimals={
                    false
                  }
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                  tick={{
                    fontSize: 11,
                    fill:
                      "#6b7280",
                  }}
                />

                <Tooltip
                  content={
                    <PerformanceTooltip
                      formatCurrency={
                        safeFormatCurrency
                      }
                    />
                  }
                />

                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  fill="url(#echooRevenueArea)"
                  stroke="none"
                />

                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1f2937"
                  strokeWidth={
                    3
                  }
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill:
                      "#1f2937",
                    stroke:
                      "#ffffff",
                    strokeWidth:
                      2,
                  }}
                />

                <Line
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  stroke="#2563eb"
                  strokeWidth={
                    2.5
                  }
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill:
                      "#2563eb",
                    stroke:
                      "#ffffff",
                    strokeWidth:
                      2,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-gray-200/60 pt-5 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                7-Day Revenue
              </p>

              <p className="mt-1 text-lg font-bold text-gray-900">
                {safeFormatCurrency(
                  weeklyRevenue
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-white/50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Avg. Order Value
              </p>

              <p className="mt-1 text-lg font-bold text-gray-900">
                {safeFormatCurrency(
                  averageOrderValue
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-white/50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Peak Revenue Day
              </p>

              <p className="mt-1 text-lg font-bold text-gray-900">
                {peakDay
                  ?.revenue >
                0
                  ? peakDay.fullDate
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            SALES BY CATEGORY
        ================================================= */}

        <div className="rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-xl">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Sales by Category
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Units from delivered
              orders
            </p>
          </div>

          {categoryData.length >
          0 ? (
            <div className="mt-4 h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      categoryData
                    }
                    dataKey="units"
                    nameKey="name"
                    cx="50%"
                    cy="46%"
                    innerRadius={
                      52
                    }
                    outerRadius={
                      82
                    }
                    paddingAngle={
                      3
                    }
                    stroke="none"
                  >
                    {categoryData.map(
                      (
                        item,
                        index
                      ) => (
                        <Cell
                          key={
                            item.name
                          }
                          fill={
                            PIE_COLORS[
                              index %
                                PIE_COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    content={
                      <CategoryTooltip
                        formatCurrency={
                          safeFormatCurrency
                        }
                      />
                    }
                  />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize:
                        "11px",
                      color:
                        "#6b7280",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center text-center">
              <div>
                <Package className="mx-auto h-9 w-9 text-gray-300" />

                <p className="mt-3 text-sm text-gray-500">
                  Category sales will
                  appear after orders
                  are delivered.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            ORDER STATUS
        ================================================= */}

        <div className="rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-xl">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Order Status
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Current order
              distribution
            </p>
          </div>

          {statusData.length >
          0 ? (
            <div className="mt-4 h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    statusData
                  }
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 18,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    horizontal={
                      false
                    }
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={
                      false
                    }
                    tickLine={
                      false
                    }
                    width={105}
                    tick={{
                      fontSize:
                        11,
                      fill:
                        "#6b7280",
                    }}
                  />

                  <XAxis
                    type="number"
                    allowDecimals={
                      false
                    }
                    axisLine={
                      false
                    }
                    tickLine={
                      false
                    }
                    tick={{
                      fontSize:
                        11,
                      fill:
                        "#6b7280",
                    }}
                  />

                  <Tooltip
                    content={
                      <StatusTooltip />
                    }
                  />

                  <Bar
                    dataKey="count"
                    name="Orders"
                    fill="#4b5563"
                    radius={[
                      0,
                      8,
                      8,
                      0,
                    ]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center">
              <p className="text-sm text-gray-500">
                No order data
                available.
              </p>
            </div>
          )}
        </div>

        {/* =================================================
            TOP PRODUCTS
        ================================================= */}

        <div className="rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-xl lg:col-span-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Top Selling Groceries
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Ranked by delivered
              revenue
            </p>
          </div>

          {topProducts.length >
          0 ? (
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              {topProducts.map(
                (
                  product,
                  index
                ) => (
                  <div
                    key={`${product.name}-${index}`}
                    className="rounded-2xl border border-white/60 bg-white/45 p-4"
                  >
                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-gray-600 shadow-sm">
                      <Package className="h-4 w-4" />
                    </div>

                    <p className="truncate text-sm font-bold text-gray-900">
                      {
                        product.name
                      }
                    </p>

                    <p className="mt-1 truncate text-xs text-gray-500">
                      {
                        product.category
                      }
                    </p>

                    <div className="mt-4">
                      <p className="text-lg font-bold text-gray-900">
                        {safeFormatCurrency(
                          product.revenue
                        )}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {
                          product.units
                        }{" "}
                        units sold
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-white/35 p-8 text-center">
              <Package className="mx-auto h-9 w-9 text-gray-300" />

              <p className="mt-3 text-sm text-gray-500">
                Top products will
                appear after delivered
                orders are available.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AnalyticsCharts;