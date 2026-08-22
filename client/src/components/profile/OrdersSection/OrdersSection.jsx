import {
  CalendarDays,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import {
  cancelOrder,
  getMyOrders,
} from "../../../api/orderApi.js";

import "./OrdersSection.css";

/* =========================================================
   FALLBACK IMAGE
========================================================= */

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' rx='24' fill='%23f1f5f9'/%3E%3Cpath d='M60 82h80l-10 67H70z' fill='%2393c5fd'/%3E%3Cpath d='M76 82c0-25 10-41 24-41s24 16 24 41' fill='none' stroke='%234b5563' stroke-width='8' stroke-linecap='round'/%3E%3C/svg%3E";

/* =========================================================
   HELPERS
========================================================= */

const formatPrice = (
  value
) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(value || 0)
  );

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
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

const getStatus = (
  order
) =>
  String(
    order?.status ||
      order?.order_status ||
      "placed"
  ).toLowerCase();

const getOrderItems = (
  order
) =>
  Array.isArray(
    order?.order_items
  )
    ? order.order_items
    : Array.isArray(
          order?.items
        )
      ? order.items
      : [];

const getProduct = (
  item
) =>
  item?.products ||
  item?.product ||
  {};

const getProductName = (
  item
) => {
  const product =
    getProduct(item);

  return (
    item?.product_name ||
    item?.productName ||
    product?.name ||
    "Grocery product"
  );
};

const getProductImage = (
  item
) => {
  const product =
    getProduct(item);

  const images =
    product?.product_images ||
    product?.images ||
    [];

  return (
    item?.product_image ||
    item?.productImage ||
    images?.find?.(
      (image) =>
        image?.is_primary
    )?.image_url ||
    images?.[0]
      ?.image_url ||
    product?.image ||
    FALLBACK_IMAGE
  );
};

const getPackSize = (
  item
) => {
  const product =
    getProduct(item);

  return (
    item?.pack_size ||
    product?.pack_size ||
    product?.packSize ||
    [
      product?.quantity,
      product?.unit,
    ]
      .filter(Boolean)
      .join(" ")
  );
};

const getItemPrice = (
  item
) =>
  Number(
    item?.price ||
      item?.unit_price ||
      0
  );

const getItemTotal = (
  item
) =>
  Number(
    item?.item_total ||
      item?.itemTotal ||
      getItemPrice(
        item
      ) *
        Number(
          item?.quantity ||
            1
        )
  );

const getOrderTotal = (
  order
) =>
  Number(
    order?.total_amount ||
      order?.total ||
      0
  );

const getShippingAddress = (
  order
) =>
  order?.shipping_address ||
  order?.shippingAddress ||
  order?.delivery_address ||
  order?.address ||
  {};

const getStatusLabel = (
  status
) => {
  const labels = {
    placed:
      "Order placed",
    confirmed:
      "Confirmed",
    processing:
      "Processing",
    packed:
      "Packed",
    shipped:
      "Shipped",
    out_for_delivery:
      "Out for delivery",
    delivered:
      "Delivered",
    completed:
      "Delivered",
    cancelled:
      "Cancelled",
  };

  return (
    labels[status] ||
    status
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase()
      )
  );
};

const canCancelOrder = (
  order
) => {
  const status =
    getStatus(order);

  /*
    Matches our order API:
    customer cancellation is allowed
    only while order is placed/confirmed.
  */

  return [
    "placed",
    "confirmed",
  ].includes(status);
};

/* =========================================================
   COMPONENT
========================================================= */

const OrdersSection = ({
  user,
  onRefresh,
}) => {
  const [
    orders,
    setOrders,
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
    cancellingOrder,
    setCancellingOrder,
  ] = useState(null);

  /* =======================================================
     LOAD ORDERS
  ======================================================= */

  const loadOrders =
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
            setLoading(true);
          }

          const data =
            await getMyOrders();

          setOrders(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (error) {
          console.error(
            "Failed to load orders:",
            error
          );

          toast.error(
            error?.message ||
              "Unable to load your orders."
          );
        } finally {
          setLoading(false);
          setRefreshing(
            false
          );
        }
      },
      []
    );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  /* =======================================================
     CANCEL
  ======================================================= */

  const handleCancelOrder =
    async (order) => {
      const orderId =
        order?.id;

      if (!orderId) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to cancel this order?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setCancellingOrder(
          orderId
        );

        await cancelOrder(
          orderId
        );

        toast.success(
          "Order cancelled successfully."
        );

        await loadOrders({
          silent: true,
        });

        await onRefresh?.();
      } catch (error) {
        console.error(
          "Cancel order error:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to cancel this order."
        );
      } finally {
        setCancellingOrder(
          null
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="orders-section">
        <div className="orders-section-header">
          <div>
            <p className="orders-section-eyebrow">
              Purchases
            </p>

            <h2>
              My orders
            </h2>
          </div>
        </div>

        <div className="orders-section-loading">
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="orders-section-skeleton"
              />
            )
          )}
        </div>
      </div>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!orders.length) {
    return (
      <div className="orders-section">
        <div className="orders-section-header">
          <div>
            <p className="orders-section-eyebrow">
              Purchases
            </p>

            <h2>
              My orders
            </h2>
          </div>
        </div>

        <div className="orders-section-empty">
          <div className="orders-section-empty-icon">
            <ShoppingBag
              size={30}
            />
          </div>

          <h3>
            No orders yet
          </h3>

          <p>
            Once you place your
            first grocery order,
            it will appear here.
          </p>

          <Link
            to="/categories"
            className="orders-section-shop-button"
          >
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  /* =======================================================
     ORDERS
  ======================================================= */

  return (
    <div className="orders-section">
      {/* HEADER */}

      <div className="orders-section-header">
        <div>
          <p className="orders-section-eyebrow">
            Purchases
          </p>

          <h2>
            My orders
          </h2>

          <span>
            {orders.length}{" "}
            {orders.length ===
            1
              ? "order"
              : "orders"}
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            loadOrders({
              silent: true,
            })
          }
          disabled={
            refreshing
          }
          className="orders-section-refresh"
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? "orders-section-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* ORDER LIST */}

      <div className="orders-section-list">
        {orders.map(
          (order) => {
            const status =
              getStatus(
                order
              );

            const items =
              getOrderItems(
                order
              );

            const address =
              getShippingAddress(
                order
              );

            const orderId =
              String(
                order.id ||
                  ""
              );

            return (
              <article
                key={
                  order.id
                }
                className="orders-section-card"
              >
                {/* ORDER TOP */}

                <div className="orders-section-card-header">
                  <div>
                    <p className="orders-section-order-label">
                      Order
                    </p>

                    <h3>
                      #
                      {orderId.length >
                      8
                        ? orderId.slice(
                            0,
                            8
                          )
                        : orderId}
                    </h3>

                    <div className="orders-section-date">
                      <CalendarDays
                        size={14}
                      />

                      {formatDate(
                        order.created_at ||
                          order.createdAt
                      )}
                    </div>
                  </div>

                  <div
                    className={`orders-section-status orders-section-status-${status}`}
                  >
                    {status ===
                    "shipped" ? (
                      <Truck
                        size={14}
                      />
                    ) : (
                      <Package
                        size={14}
                      />
                    )}

                    {getStatusLabel(
                      status
                    )}
                  </div>
                </div>

                {/* ITEMS */}

                <div className="orders-section-items">
                  {items.length >
                  0 ? (
                    items.map(
                      (
                        item,
                        index
                      ) => {
                        const name =
                          getProductName(
                            item
                          );

                        const image =
                          getProductImage(
                            item
                          );

                        const packSize =
                          getPackSize(
                            item
                          );

                        return (
                          <div
                            key={
                              item.id ||
                              `${order.id}-${index}`
                            }
                            className="orders-section-item"
                          >
                            <div className="orders-section-item-image">
                              <img
                                src={
                                  image
                                }
                                alt={
                                  name
                                }
                                onError={(
                                  event
                                ) => {
                                  event.currentTarget.onerror =
                                    null;

                                  event.currentTarget.src =
                                    FALLBACK_IMAGE;
                                }}
                              />
                            </div>

                            <div className="orders-section-item-info">
                              <h4>
                                {
                                  name
                                }
                              </h4>

                              <div className="orders-section-item-meta">
                                {packSize && (
                                  <span>
                                    {
                                      packSize
                                    }
                                  </span>
                                )}

                                <span>
                                  Qty:{" "}
                                  {Number(
                                    item.quantity ||
                                      1
                                  )}
                                </span>
                              </div>
                            </div>

                            <strong className="orders-section-item-price">
                              {formatPrice(
                                getItemTotal(
                                  item
                                )
                              )}
                            </strong>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <p className="orders-section-no-items">
                      Order items are
                      unavailable.
                    </p>
                  )}
                </div>

                {/* DELIVERY */}

                <div className="orders-section-details">
                  <div className="orders-section-detail">
                    <MapPin
                      size={16}
                    />

                    <div>
                      <span>
                        Deliver to
                      </span>

                      <strong>
                        {address.full_name ||
                          address.fullName ||
                          user?.full_name ||
                          user?.name ||
                          "Customer"}
                      </strong>

                      {(address.city ||
                        address.state ||
                        address.pincode ||
                        address.postal_code) && (
                        <p>
                          {[
                            address.city,
                            address.state,
                            address.pincode ||
                              address.postal_code,
                          ]
                            .filter(
                              Boolean
                            )
                            .join(
                              ", "
                            )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="orders-section-payment">
                    <span>
                      Payment
                    </span>

                    <strong>
                      Cash on Delivery
                    </strong>
                  </div>
                </div>

                {/* FOOTER */}

                <div className="orders-section-footer">
                  <div>
                    <span>
                      Order total
                    </span>

                    <strong>
                      {formatPrice(
                        getOrderTotal(
                          order
                        )
                      )}
                    </strong>
                  </div>

                  {canCancelOrder(
                    order
                  ) && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCancelOrder(
                          order
                        )
                      }
                      disabled={
                        cancellingOrder ===
                        order.id
                      }
                      className="orders-section-cancel"
                    >
                      {cancellingOrder ===
                      order.id ? (
                        <>
                          <RefreshCw
                            size={
                              15
                            }
                            className="orders-section-spin"
                          />

                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle
                            size={
                              15
                            }
                          />

                          Cancel
                          order
                        </>
                      )}
                    </button>
                  )}
                </div>
              </article>
            );
          }
        )}
      </div>
    </div>
  );
};

export default OrdersSection;