import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  ChevronRight,
  Home,
  MapPin,
  Package,
  ReceiptText,
  ShoppingBag,
  Truck,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getOrderById,
} from "../../../api/orderApi.js";

/* =========================================================
   HELPERS
========================================================= */

const formatPrice = (
  value
) => {
  const amount =
    Number(
      value || 0
    );

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(amount);
};

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

const getProductImage = (
  item
) => {
  const product =
    item?.products ||
    item?.product ||
    {};

  return (
    product.image ||
    product.product_images?.[0]
      ?.image_url ||
    product.images?.[0]
      ?.image_url ||
    product.images?.[0] ||
    ""
  );
};

/* =========================================================
   ORDER CONFIRMATION
========================================================= */

const OrderConfirmation = () => {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    orderId,
  } =
    useParams();

  const [
    order,
    setOrder,
  ] =
    useState(
      location.state?.order ||
        null
    );

  const [
    orderItems,
    setOrderItems,
  ] =
    useState(
      location.state
        ?.orderItems ||
        []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      !location.state
        ?.order
    );

  const [
    error,
    setError,
  ] =
    useState("");

  /* =======================================================
     LOAD ORDER

     Important:
     If user refreshes confirmation page,
     router state disappears.

     Therefore fetch order again using URL orderId.
  ======================================================= */

  useEffect(() => {
    let active = true;

    const loadOrder =
      async () => {
        if (!orderId) {
          setError(
            "Order ID is missing."
          );

          setLoading(false);

          return;
        }

        /*
          If navigation already supplied a full order,
          we still don't need another request immediately.
        */
        if (
          location.state
            ?.order?.id
        ) {
          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setError("");

          const data =
            await getOrderById(
              orderId
            );

          if (!active) {
            return;
          }

          setOrder(data);

          setOrderItems(
            data?.order_items ||
              data?.items ||
              []
          );
        } catch (err) {
          console.error(
            "Load order confirmation error:",
            err
          );

          if (!active) {
            return;
          }

          setError(
            err?.message ||
              "Unable to load your order."
          );
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    loadOrder();

    return () => {
      active = false;
    };
  }, [
    orderId,
    location.state,
  ]);

  /* =======================================================
     NORMALIZED DATA
  ======================================================= */

  const items =
    useMemo(() => {
      if (
        orderItems.length
      ) {
        return orderItems;
      }

      return (
        order?.order_items ||
        order?.items ||
        []
      );
    }, [
      order,
      orderItems,
    ]);

  const orderNumber =
    order?.order_number ||
    order?.orderNumber ||
    order?.id ||
    orderId;

  const totalAmount =
    Number(
      order?.total_amount ??
        order?.total ??
        0
    );

  const address =
    order?.address ||
    order?.delivery_address ||
    {};

  const status =
    String(
      order?.order_status ||
        order?.status ||
        "placed"
    )
      .replaceAll(
        "_",
        " "
      )
      .toUpperCase();

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-[#dceaf5] via-[#e9f0f6] to-[#f6f8fa] px-5">
        <div className="text-center">
          <div className="w-11 h-11 mx-auto rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />

          <p className="mt-4 text-sm text-gray-500">
            Loading your order...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error ||
    !order
  ) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-[#dceaf5] via-[#e9f0f6] to-[#f6f8fa] px-5">
        <div className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white/55 backdrop-blur-xl p-8 text-center shadow-xl">

          <Package className="w-12 h-12 mx-auto text-gray-400" />

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Unable to load order
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error ||
              "Order information is unavailable."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="
              mt-6
              px-7
              py-3
              rounded-full
              text-white
              font-semibold
              bg-gradient-to-b
              from-gray-500
              to-gray-900
              shadow-lg
            "
          >
            Back Home
          </button>

        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-[#dceaf5]
        via-[#e8f0f6]
        to-[#f5f8fa]
        px-4
        sm:px-6
        lg:px-8
        pt-32
        pb-16
        font-sans
      "
    >
      <div className="max-w-5xl mx-auto">

        {/* =================================================
            SUCCESS HEADER
        ================================================= */}

        <div className="text-center">

          <div
            className="
              w-20
              h-20
              mx-auto
              rounded-full
              bg-gradient-to-b
              from-gray-600
              to-gray-900
              flex
              items-center
              justify-center
              shadow-[inset_0_2px_4px_rgba(255,255,255,0.35),0_10px_25px_rgba(15,23,42,0.20)]
            "
          >
            <Check className="w-9 h-9 text-white" />
          </div>

          <p
            className="
              mt-6
              text-xs
              uppercase
              tracking-[0.22em]
              text-gray-400
              font-bold
            "
          >
            EchOo Grocery
          </p>

          <h1
            className="
              mt-2
              text-3xl
              sm:text-4xl
              font-bold
              tracking-tight
              text-gray-900
            "
          >
            Order Placed!
          </h1>

          <p className="mt-3 text-gray-500">
            Your grocery order has been received successfully.
          </p>

        </div>

        {/* =================================================
            ORDER NUMBER
        ================================================= */}

        <div
          className="
            mt-9
            rounded-[2.5rem]
            border
            border-white/80
            bg-white/55
            backdrop-blur-xl
            shadow-[0_15px_50px_rgba(15,23,42,0.07)]
            overflow-hidden
          "
        >

          <div className="px-6 sm:px-9 py-8 text-center">

            <p
              className="
                text-xs
                uppercase
                tracking-[0.18em]
                text-gray-400
                font-bold
              "
            >
              Order ID
            </p>

            <h2
              className="
                mt-2
                text-2xl
                sm:text-3xl
                font-black
                tracking-wide
                text-gray-900
                break-all
              "
            >
              {orderNumber}
            </h2>

            <div
              className="
                mt-7
                grid
                grid-cols-1
                sm:grid-cols-3
                gap-3
              "
            >

              <div className="rounded-2xl bg-white/60 p-4">
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  Status
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {status}
                </p>
              </div>

              <div className="rounded-2xl bg-white/60 p-4">
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  Payment
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  Cash on Delivery
                </p>
              </div>

              <div className="rounded-2xl bg-white/60 p-4">
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  Total
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {formatPrice(
                    totalAmount
                  )}
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* =================================================
            TWO COLUMN AREA
        ================================================= */}

        <div
          className="
            mt-6
            grid
            lg:grid-cols-[1.35fr_0.85fr]
            gap-6
          "
        >

          {/* ===============================================
              ORDER ITEMS
          =============================================== */}

          <section
            className="
              rounded-[2.3rem]
              border
              border-white/80
              bg-white/55
              backdrop-blur-xl
              p-6
              sm:p-8
              shadow-[0_12px_40px_rgba(15,23,42,0.05)]
            "
          >

            <div className="flex items-center gap-3 mb-6">

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-white/70
                  border
                  border-white
                  flex
                  items-center
                  justify-center
                "
              >
                <ShoppingBag className="w-5 h-5 text-gray-600" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.13em] font-bold text-gray-400">
                  Order
                </p>

                <h3 className="text-lg font-bold text-gray-900">
                  Items Ordered
                </h3>
              </div>

            </div>

            {items.length ? (
              <div className="space-y-4">

                {items.map(
                  (
                    item,
                    index
                  ) => {
                    const product =
                      item.products ||
                      item.product ||
                      {};

                    const name =
                      item.product_name ||
                      product.name ||
                      "Product";

                    const quantity =
                      Number(
                        item.quantity ||
                          1
                      );

                    const unitPrice =
                      Number(
                        item.unit_price ??
                          item.price ??
                          0
                      );

                    const totalPrice =
                      Number(
                        item.total_price ??
                          unitPrice *
                            quantity
                      );

                    const image =
                      getProductImage(
                        item
                      );

                    return (
                      <div
                        key={
                          item.id ||
                          `${name}-${index}`
                        }
                        className="
                          flex
                          items-center
                          gap-4
                          rounded-2xl
                          border
                          border-white/70
                          bg-white/55
                          p-4
                        "
                      >

                        <div
                          className="
                            w-20
                            h-20
                            rounded-2xl
                            bg-white
                            border
                            border-gray-100
                            flex
                            items-center
                            justify-center
                            overflow-hidden
                            shrink-0
                          "
                        >

                          {image ? (
                            <img
                              src={image}
                              alt={name}
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-300" />
                          )}

                        </div>

                        <div className="min-w-0 flex-1">

                          <h4 className="font-bold text-gray-900 truncate">
                            {name}
                          </h4>

                          <p className="mt-1 text-sm text-gray-500">
                            Qty {quantity}
                            {" · "}
                            {formatPrice(
                              unitPrice
                            )} each
                          </p>

                        </div>

                        <p className="font-bold text-gray-900">
                          {formatPrice(
                            totalPrice
                          )}
                        </p>

                      </div>
                    );
                  }
                )}

              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No item details available.
              </p>
            )}

            <div className="mt-6 border-t border-gray-200/70 pt-5">

              <div className="flex justify-between items-center">
                <span className="text-gray-500">
                  Total Payable
                </span>

                <span className="text-2xl font-black text-gray-900">
                  {formatPrice(
                    totalAmount
                  )}
                </span>
              </div>

              <p className="mt-1 text-xs text-gray-400 text-right">
                Pay on delivery
              </p>

            </div>

          </section>

          {/* ===============================================
              DELIVERY
          =============================================== */}

          <div className="space-y-6">

            <section
              className="
                rounded-[2.3rem]
                border
                border-white/80
                bg-white/55
                backdrop-blur-xl
                p-6
                shadow-[0_12px_40px_rgba(15,23,42,0.05)]
              "
            >

              <div className="flex items-center gap-3 mb-5">

                <MapPin className="w-5 h-5 text-gray-600" />

                <h3 className="font-bold text-gray-900">
                  Delivery Details
                </h3>

              </div>

              <div className="space-y-2 text-sm text-gray-600">

                <p className="font-semibold text-gray-900">
                  {address.full_name ||
                    "Customer"}
                </p>

                {address.address && (
                  <p>
                    {address.address}
                  </p>
                )}

                <p>
                  {[
                    address.city,
                    address.state,
                    address.pincode ||
                      address.postal_code,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                {address.phone && (
                  <p>
                    {address.phone}
                  </p>
                )}

              </div>

            </section>

            <section
              className="
                rounded-[2.3rem]
                border
                border-white/80
                bg-white/55
                backdrop-blur-xl
                p-6
                shadow-[0_12px_40px_rgba(15,23,42,0.05)]
              "
            >

              <div className="flex items-center gap-3">

                <ReceiptText className="w-5 h-5 text-gray-600" />

                <div>
                  <p className="text-xs uppercase font-bold tracking-wider text-gray-400">
                    Ordered
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {formatDate(
                      order.created_at
                    )}
                  </p>
                </div>

              </div>

              <div className="mt-5 flex items-center gap-3">

                <Truck className="w-5 h-5 text-gray-600" />

                <div>
                  <p className="text-xs uppercase font-bold tracking-wider text-gray-400">
                    Delivery
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    Order processing
                  </p>
                </div>

              </div>

            </section>

          </div>

        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div
          className="
            mt-7
            grid
            sm:grid-cols-2
            gap-3
          "
        >

          <button
            type="button"
            onClick={() =>
              navigate(
                "/profile",
                {
                  state: {
                    activeTab:
                      "orders",
                  },
                }
              )
            }
            className="
              min-h-14
              rounded-full
              flex
              items-center
              justify-center
              gap-2
              bg-gradient-to-b
              from-gray-500
              to-gray-900
              text-white
              font-bold
              shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_7px_18px_rgba(15,23,42,0.22)]
              hover:from-gray-400
              hover:to-gray-800
              transition
            "
          >
            <Package className="w-4 h-4" />

            View My Orders

            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/categories"
              )
            }
            className="
              min-h-14
              rounded-full
              flex
              items-center
              justify-center
              gap-2
              border
              border-white/90
              bg-white/60
              text-gray-700
              font-bold
              hover:bg-white
              transition
            "
          >
            <Home className="w-4 h-4" />

            Continue Shopping
          </button>

        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;