import React from "react";

import {
  IndianRupee,
  PackageCheck,
  ShoppingBag,
  Users,
} from "lucide-react";

const DashboardStats = ({
  stats = {},
  formatCurrency,
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

  const cards = [
    {
      label: "Items Delivered",
      value: stats.totalSales || 0,
      description:
        "Units from delivered orders",
      icon: ShoppingBag,
    },
    {
      label: "Total Orders",
      value: stats.totalOrders || 0,
      description:
        "All customer orders",
      icon: PackageCheck,
    },
    {
      label: "COD Revenue",
      value: safeFormatCurrency(
        stats.totalRevenue || 0
      ),
      description:
        "Revenue from delivered orders",
      icon: IndianRupee,
    },
    {
      label: "Customers",
      value:
        stats.activeUsers ||
        0,
      description:
        "Registered shoppers",
      icon: Users,
    },
  ];

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
          Store Summary
        </p>

        <h2 className="mt-1 text-lg font-bold text-gray-900">
          Business Overview
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon =
            card.icon;

          return (
            <div
              key={card.label}
              className="
                rounded-[2rem]
                border
                border-white/60
                bg-white/40
                p-5
                shadow-[0_8px_32px_rgba(0,0,0,0.03)]
                backdrop-blur-xl
                transition-all
                hover:-translate-y-0.5
                hover:bg-white/55
                hover:shadow-[0_10px_34px_rgba(0,0,0,0.05)]
              "
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500">
                    {card.label}
                  </p>

                  <p className="mt-2 break-words text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    {
                      card.description
                    }
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-white/70
                    bg-white/60
                    text-gray-600
                    shadow-sm
                  "
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DashboardStats;