import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";

import {
  getCurrentUser,
  getProfile,
} from "../../../api/authApi.js";

import {
  clearCart,
  getCart,
} from "../../../api/cartApi.js";

import {
  createOrder,
} from "../../../api/orderApi.js";

import "./Checkout.css";

/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

/* =========================================================
   HELPERS
========================================================= */

const getProduct = (item = {}) =>
  item.products ||
  item.product ||
  {};

const getProductName = (
  item
) => {
  const product =
    getProduct(item);

  return (
    item.productName ||
    item.product_name ||
    product.name ||
    "Grocery Product"
  );
};

const getProductImage = (
  item
) => {
  const product =
    getProduct(item);

  const images =
    product.product_images ||
    product.images ||
    [];

  if (
    item.productImage ||
    item.product_image
  ) {
    return (
      item.productImage ||
      item.product_image
    );
  }

  if (!Array.isArray(images)) {
    return "";
  }

  const primary =
    images.find(
      (image) =>
        typeof image ===
          "object" &&
        image?.is_primary
    );

  if (primary) {
    return (
      primary.image_url ||
      primary.url ||
      ""
    );
  }

  const first =
    images[0];

  if (
    typeof first ===
    "string"
  ) {
    return first;
  }

  return (
    first?.image_url ||
    first?.url ||
    ""
  );
};

const getProductPrice = (
  item
) => {
  const product =
    getProduct(item);

  return Number(
    item.productPrice ||
      item.product_price ||
      product.discount_price ||
      product.price ||
      item.price ||
      0
  );
};

const getPackSize = (
  item
) => {
  const product =
    getProduct(item);

  if (
    item.pack_size ||
    item.packSize
  ) {
    return (
      item.pack_size ||
      item.packSize
    );
  }

  if (product.pack_size) {
    return product.pack_size;
  }

  if (
    product.quantity &&
    product.unit
  ) {
    return `${product.quantity} ${product.unit}`;
  }

  return "";
};

const formatPrice = (
  amount
) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  ).format(
    Number(amount || 0)
  );

/* =========================================================
   CHECKOUT
========================================================= */

const Checkout = () => {
  const navigate =
    useNavigate();

  const placingOrderRef =
    useRef(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadingCheckout,
    setLoadingCheckout,
  ] = useState(true);

  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);

  const [
    cartItems,
    setCartItems,
  ] = useState([]);

  const [
    formData,
    setFormData,
  ] = useState(
    INITIAL_FORM
  );

  /*
    There is no separate OrderConfirmation page.

    After Supabase creates the order, we keep the returned
    row here and render the confirmation directly inside
    Checkout. The database-generated `order_number` is the
    customer-facing unique order ID.
  */
  const [
    placedOrder,
    setPlacedOrder,
  ] = useState(null);

  const [
    placedOrderItems,
    setPlacedOrderItems,
  ] = useState([]);

  /* =======================================================
     LOAD CHECKOUT
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadCheckout =
      async () => {
        try {
          setLoadingCheckout(
            true
          );

          const user =
            await getCurrentUser();

          if (!user) {
            toast.info(
              "Please sign in to continue to checkout."
            );

            navigate(
              "/sign_in",
              {
                replace: true,
              }
            );

            return;
          }

          if (!mounted) {
            return;
          }

          setCurrentUser(
            user
          );

          let profile =
            null;

          try {
            profile =
              await getProfile();
          } catch (
            profileError
          ) {
            console.error(
              "Profile loading error:",
              profileError
            );
          }

          const fullName =
            profile?.full_name ||
            user.user_metadata
              ?.full_name ||
            user.user_metadata
              ?.name ||
            "";

          if (mounted) {
            setFormData(
              (previous) => ({
                ...previous,

                fullName,

                email:
                  profile?.email ||
                  user.email ||
                  "",

                phone:
                  profile?.phone ||
                  "",
              })
            );
          }

          const cartResponse =
            await getCart();

          const items =
            Array.isArray(
              cartResponse
            )
              ? cartResponse
              : Array.isArray(
                    cartResponse?.data
                  )
                ? cartResponse.data
                : Array.isArray(
                      cartResponse?.items
                    )
                  ? cartResponse.items
                  : [];

          if (mounted) {
            setCartItems(
              items
            );
          }
        } catch (error) {
          console.error(
            "Checkout load error:",
            error
          );

          toast.error(
            error?.message ||
              "Failed to load checkout."
          );
        } finally {
          if (mounted) {
            setLoadingCheckout(
              false
            );
          }
        }
      };

    loadCheckout();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  /* =======================================================
     TOTAL
  ======================================================= */

  const subtotal =
    useMemo(
      () =>
        cartItems.reduce(
          (
            total,
            item
          ) => {
            const price =
              getProductPrice(
                item
              );

            const quantity =
              Number(
                item.quantity ||
                  1
              );

            return (
              total +
              price * quantity
            );
          },
          0
        ),
      [cartItems]
    );

  /*
    No online payment or separate shipping-price
    calculation is used in this assessment.

    The final order total is the grocery cart total.
  */
  const total = subtotal;

  /* =======================================================
     FORM
  ======================================================= */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateCheckout =
    () => {
      if (!currentUser) {
        toast.error(
          "Please sign in first."
        );

        navigate(
          "/sign_in"
        );

        return false;
      }

      if (!cartItems.length) {
        toast.error(
          "Your cart is empty."
        );

        return false;
      }

      const requiredFields =
        [
          "fullName",
          "email",
          "phone",
          "address",
          "city",
          "state",
          "pincode",
        ];

      const missingField =
        requiredFields.some(
          (field) =>
            !String(
              formData[
                field
              ] || ""
            ).trim()
        );

      if (missingField) {
        toast.error(
          "Please complete all delivery details."
        );

        return false;
      }

      const emailValid =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          formData.email.trim()
        );

      if (!emailValid) {
        toast.error(
          "Please enter a valid email address."
        );

        return false;
      }

      const phoneDigits =
        formData.phone.replace(
          /\D/g,
          ""
        );

      if (
        phoneDigits.length <
        10
      ) {
        toast.error(
          "Please enter a valid phone number."
        );

        return false;
      }

      const pincode =
        formData.pincode
          .trim()
          .replace(
            /\s/g,
            ""
          );

      if (
        !/^\d{6}$/.test(
          pincode
        )
      ) {
        toast.error(
          "Please enter a valid 6-digit PIN code."
        );

        return false;
      }

      return true;
    };

  /* =======================================================
     DELIVERY ADDRESS
  ======================================================= */

  const buildAddress = () => ({
    full_name:
      formData.fullName.trim(),

    email:
      formData.email.trim(),

    phone:
      formData.phone.trim(),

    address:
      formData.address.trim(),

    address_line_1:
      formData.address.trim(),

    city:
      formData.city.trim(),

    state:
      formData.state.trim(),

    pincode:
      formData.pincode.trim(),

    postal_code:
      formData.pincode.trim(),

    country: "India",
  });

  /* =======================================================
     PLACE COD ORDER
  ======================================================= */

  const handlePlaceOrder =
    async () => {
      if (
        placingOrderRef.current ||
        loading
      ) {
        return;
      }

      if (
        !validateCheckout()
      ) {
        return;
      }

      try {
        placingOrderRef.current =
          true;

        setLoading(true);

        const address =
          buildAddress();

        /*
          COD ONLY.

          Later orderApi.createOrder() can internally be
          changed to call the secure Supabase
          place_cod_order() RPC.

          Checkout itself does not need Razorpay,
          card, UPI or payment-provider logic.
        */
        const response =
          await createOrder({
            items: cartItems,

            address,

            totalAmount:
              total,

            paymentMethod:
              "cod",

            notes: "",
          });

        const order =
          response?.order ||
          response?.data
            ?.order ||
          response?.data ||
          response;

        if (!order?.id) {
          throw new Error(
            "Order was not created correctly."
          );
        }

        /*
          Supabase generates `order_number` automatically.

          Keep the UUID `id` for database relationships and use
          `order_number` as the customer-facing unique order ID.
        */
        const orderNumber =
          order.order_number ||
          order.orderNumber ||
          order.id;

        const orderItems =
          response?.orderItems ||
          response?.order_items ||
          response?.data
            ?.orderItems ||
          response?.data
            ?.order_items ||
          [];

        /*
          Save the successful order locally BEFORE clearing the
          cart so Checkout can immediately switch to the success UI.
        */
        setPlacedOrder({
          ...order,

          order_number:
            orderNumber,
        });

        setPlacedOrderItems(
          Array.isArray(
            orderItems
          )
            ? orderItems
            : []
        );

        try {
          await clearCart();
        } catch (
          cartError
        ) {
          console.error(
            "Cart clear error:",
            cartError
          );
        }

        setCartItems([]);

        /*
          Notify any cart UI that the order consumed the cart.
          Components that do not listen to this event are harmless.
        */
        window.dispatchEvent(
          new CustomEvent(
            "cart:updated"
          )
        );

        toast.success(
          `Order placed! Order ID: ${orderNumber}`,
          {
            autoClose: 3000,
          }
        );

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch (error) {
        console.error(
          "Place order error:",
          error
        );

        const message =
          String(
            error?.message ||
              ""
          );

        if (
          error?.code ===
            "PGRST303" ||
          message
            .toLowerCase()
            .includes(
              "jwt expired"
            )
        ) {
          toast.error(
            "Your session has expired. Please sign in again."
          );

          navigate(
            "/sign_in",
            {
              replace: true,
            }
          );
        } else {
          toast.error(
            error?.message ||
              "Unable to place your order. Please try again."
          );
        }
      } finally {
        placingOrderRef.current =
          false;

        setLoading(false);
      }
    };

  /* =======================================================
     CLASSES
  ======================================================= */

  const inputClass =
    "w-full rounded-2xl border border-white/80 bg-white/55 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:bg-white/75 focus:ring-2 focus:ring-gray-400/40 disabled:opacity-60";

  const labelClass =
    "mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-gray-500";

  const glassPanelClass =
    "rounded-[2.5rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-xl lg:p-8";

  /* =======================================================
     LOADING
  ======================================================= */

  if (loadingCheckout) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />

          <p className="mt-3 text-sm text-gray-600">
            Loading checkout...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ORDER SUCCESS

     No separate confirmation route is required.
  ======================================================= */

  if (placedOrder) {
    const orderNumber =
      placedOrder.order_number ||
      placedOrder.orderNumber ||
      placedOrder.id;

    const placedTotal =
      Number(
        placedOrder.total_amount ??
          placedOrder.total ??
          total
      );

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] px-5 py-24 font-sans">
        <div className="w-full max-w-2xl overflow-hidden rounded-[2.75rem] border border-white/70 bg-white/45 shadow-[0_18px_70px_rgba(15,23,42,0.10)] backdrop-blur-2xl">

          <div className="px-7 pb-8 pt-9 text-center sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/80 bg-white/75 shadow-sm">
              <CheckCircle2 className="h-10 w-10 text-gray-900" />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
              EchOo Grocery
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Order placed successfully
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
              Your grocery order has been created and stored successfully.
              Keep the order ID below for tracking and support.
            </p>
          </div>

          <div className="mx-5 rounded-[2rem] border border-white/80 bg-white/60 p-6 shadow-sm sm:mx-8 sm:p-7">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
              Your Order ID
            </p>

            <p className="mt-2 break-all text-center text-2xl font-black tracking-[0.04em] text-gray-900 sm:text-3xl">
              {orderNumber}
            </p>

            <div className="mt-6 grid gap-3 border-t border-gray-200/70 pt-5 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/55 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Payment
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  Cash on Delivery
                </p>
              </div>

              <div className="rounded-2xl bg-white/55 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Total
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {formatPrice(
                    placedTotal
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-white/55 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Items
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {
                    placedOrderItems.length
                  }{" "}
                  {placedOrderItems.length ===
                  1
                    ? "item"
                    : "items"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 px-5 pb-8 pt-6 sm:grid-cols-2 sm:px-8">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/profile",
                  {
                    replace: true,

                    state: {
                      activeTab:
                        "orders",

                      section:
                        "orders",

                      orderNumber,
                    },
                  }
                )
              }
              className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gray-500 to-gray-800 px-6 py-3.5 text-sm font-bold text-white shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.25)] transition hover:from-gray-400 hover:to-gray-700"
            >
              <Package className="h-4 w-4" />

              View My Orders
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/categories"
                )
              }
              className="flex min-h-13 items-center justify-center gap-2 rounded-full border border-white/80 bg-white/65 px-6 py-3.5 text-sm font-bold text-gray-700 transition hover:bg-white"
            >
              <ShoppingBag className="h-4 w-4" />

              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     EMPTY CART
  ======================================================= */

  if (!cartItems.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] px-6">
        <div className="w-full max-w-md rounded-[2.5rem] border border-white/60 bg-white/40 p-10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-xl">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />

          <h2 className="mt-5 text-2xl font-bold text-gray-900">
            Your cart is empty
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Add some groceries before
            continuing to checkout.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/categories"
              )
            }
            className="mt-6 rounded-full bg-gradient-to-b from-gray-500 to-gray-800 px-6 py-3 text-sm font-semibold text-white shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.3)]"
          >
            Browse Groceries
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] pb-20 pt-28 font-sans">

      <div className="mx-auto max-w-[1400px] px-5 md:px-8">

        {/* HEADER */}
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/cart")
              }
              disabled={loading}
              className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 transition hover:text-gray-900 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />

              Review Cart
            </button>

            <h1 className="text-4xl font-medium tracking-tight text-gray-900 md:text-5xl">
              Checkout
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              Confirm your delivery
              details and place your
              grocery order.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-gray-400">
            <span className="text-gray-900">
              Delivery
            </span>

            <span>→</span>

            <span className="text-gray-900">
              COD
            </span>

            <span>→</span>

            <span>
              Confirmation
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="space-y-7 lg:col-span-7">

            {/* DELIVERY DETAILS */}
            <section
              className={
                glassPanelClass
              }
            >
              <div className="mb-7 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-900 text-white">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Delivery Details
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Where should we
                    deliver your
                    groceries?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* NAME */}
                <div className="md:col-span-2">
                  <label
                    className={
                      labelClass
                    }
                  >
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={
                      formData.fullName
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
                    placeholder="Your full name"
                    className={
                      inputClass
                    }
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    className={
                      labelClass
                    }
                  >
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
                    placeholder="you@example.com"
                    className={
                      inputClass
                    }
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label
                    className={
                      labelClass
                    }
                  >
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
                    placeholder="+91 98765 43210"
                    className={
                      inputClass
                    }
                  />
                </div>

                {/* ADDRESS */}
                <div className="md:col-span-2">
                  <label
                    className={
                      labelClass
                    }
                  >
                    Street Address
                  </label>

                  <textarea
                    name="address"
                    value={
                      formData.address
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
                    rows={3}
                    placeholder="House / Flat No., Building, Street, Area"
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* CITY */}
                <div>
                  <label
                    className={
                      labelClass
                    }
                  >
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={
                      formData.city
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
                    placeholder="City"
                    className={
                      inputClass
                    }
                  />
                </div>

                {/* STATE */}
                <div>
                  <label
                    className={
                      labelClass
                    }
                  >
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={
                      formData.state
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
                    placeholder="State"
                    className={
                      inputClass
                    }
                  />
                </div>

                {/* PIN */}
                <div>
                  <label
                    className={
                      labelClass
                    }
                  >
                    PIN Code
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    name="pincode"
                    value={
                      formData.pincode
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
                    placeholder="226001"
                    className={
                      inputClass
                    }
                  />
                </div>
              </div>
            </section>

            {/* PAYMENT */}
            <section
              className={
                glassPanelClass
              }
            >
              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-900 text-white">
                  <Banknote className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Payment
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    This assessment
                    uses Cash on
                    Delivery only.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-5 rounded-3xl border-2 border-gray-900 bg-white/60 p-5 shadow-sm">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-white">
                    <Banknote className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-bold text-gray-900">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Pay when your
                      groceries arrive.
                    </p>
                  </div>
                </div>

                <CheckCircle2 className="h-6 w-6 shrink-0 text-gray-900" />
              </div>
            </section>
          </div>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <aside className="lg:col-span-5 lg:sticky lg:top-28">

            <div className={`${glassPanelClass} !p-0 overflow-hidden`}>

              <div className="p-6 lg:p-8">

                <div className="mb-6 flex items-center justify-between">

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Order Summary
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      {
                        cartItems.length
                      }{" "}
                      product
                      {cartItems.length !==
                      1
                        ? "s"
                        : ""}
                    </p>
                  </div>

                  <ShoppingBag className="h-5 w-5 text-gray-400" />
                </div>

                <div className="custom-scrollbar max-h-[390px] space-y-5 overflow-y-auto pr-2">

                  {cartItems.map(
                    (item) => {
                      const name =
                        getProductName(
                          item
                        );

                      const image =
                        getProductImage(
                          item
                        );

                      const price =
                        getProductPrice(
                          item
                        );

                      const quantity =
                        Number(
                          item.quantity ||
                            1
                        );

                      const packSize =
                        getPackSize(
                          item
                        );

                      return (
                        <div
                          key={
                            item.id ||
                            item.product_id
                          }
                          className="flex gap-4"
                        >

                          {/* IMAGE */}
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-white/60 p-2 shadow-sm">

                            {image ? (
                              <img
                                src={
                                  image
                                }
                                alt={
                                  name
                                }
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Package className="h-7 w-7 text-gray-300" />
                            )}
                          </div>

                          {/* INFO */}
                          <div className="flex min-w-0 flex-1 flex-col justify-center">

                            <h4 className="line-clamp-2 text-sm font-bold text-gray-900">
                              {name}
                            </h4>

                            {packSize && (
                              <p className="mt-1 text-xs text-gray-500">
                                {
                                  packSize
                                }
                              </p>
                            )}

                            <div className="mt-2 flex items-center justify-between gap-4">

                              <span className="text-xs font-medium text-gray-500">
                                Qty{" "}
                                {
                                  quantity
                                }
                              </span>

                              <strong className="text-sm text-gray-900">
                                {formatPrice(
                                  price *
                                    quantity
                                )}
                              </strong>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* TOTAL */}
              <div className="space-y-4 bg-black/5 p-6 lg:p-8">

                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600">
                    Subtotal
                  </span>

                  <span className="font-bold text-gray-900">
                    {formatPrice(
                      subtotal
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600">
                    Payment
                  </span>

                  <span className="font-bold text-gray-900">
                    Cash on Delivery
                  </span>
                </div>

                <div className="flex items-end justify-between border-t border-gray-200 pt-5">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Total
                    </p>

                    <p className="mt-1 text-[10px] text-gray-500">
                      Order payable
                      on delivery
                    </p>
                  </div>

                  <span className="text-3xl font-black tracking-tight text-gray-900">
                    {formatPrice(
                      total
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={
                    handlePlaceOrder
                  }
                  disabled={
                    loading ||
                    !cartItems.length
                  }
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-b from-gray-500 to-gray-800 py-5 text-sm font-black uppercase tracking-widest text-white shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.35)] transition hover:from-gray-400 hover:to-gray-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4" />

                      Place Order
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-gray-400">
              <CheckCircle2 className="h-4 w-4" />

              Cash on Delivery
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;