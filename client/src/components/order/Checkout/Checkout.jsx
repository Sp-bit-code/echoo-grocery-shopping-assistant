import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../../../context/AuthContext.jsx";
import { useCart } from "../../../context/CartContext.jsx";
import { useOrderContext } from "../../../context/OrderContext.jsx";

import useOrders from "../../../hooks/useOrders.js";

import "./Checkout.css";

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' fill='%23e5e7eb'%3E%3Crect width='80' height='80' rx='8'/%3E%3C/svg%3E";

const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  deliveryInstructions: "",
};

/* =========================================================
   PRODUCT HELPERS
========================================================= */

const getProduct = (item = {}) => {
  return item.products || item.product || {};
};

const getProductName = (item = {}) => {
  const product = getProduct(item);

  return (
    item.product_name ||
    product.name ||
    "Product"
  );
};

const getProductImage = (item = {}) => {
  const product = getProduct(item);

  const images =
    product.product_images ||
    product.images ||
    [];

  return (
    item.product_image ||
    images.find?.(
      (image) => image?.is_primary
    )?.image_url ||
    images?.[0]?.image_url ||
    product.primary_image ||
    product.image_url ||
    fallbackImage
  );
};

const getProductPrice = (item = {}) => {
  const product = getProduct(item);

  return Number(
    product.discount_price ||
      item.product_price ||
      item.price ||
      product.price ||
      0
  );
};

const getPackSize = (item = {}) => {
  const product = getProduct(item);

  if (product.pack_size) {
    return product.pack_size;
  }

  if (
    product.quantity &&
    product.unit
  ) {
    return `${product.quantity} ${product.unit}`;
  }

  return product.unit || "";
};

/* =========================================================
   CHECKOUT
========================================================= */

const Checkout = () => {
  const navigate = useNavigate();

  const placingOrderRef = useRef(false);

  const {
    user,
    profile,
    isAuthenticated,
    authLoading,
  } = useAuth();

  const {
    cartItems,
    cartSummary,
    cartLoading,
    clearCart,
  } = useCart();

  const {
    setLatestOrder,
  } = useOrderContext();

  const {
    placeOrder,
  } = useOrders({
    autoFetch: false,
  });

  const [loading, setLoading] =
    useState(false);

  const [
    formData,
    setFormData,
  ] = useState(initialFormData);

  /* =========================================================
     PREFILL CUSTOMER DETAILS
  ========================================================= */

  useEffect(() => {
    if (!user && !profile) {
      return;
    }

    const account =
      profile || user;

    const fullName =
      account?.full_name ||
      account?.name ||
      user?.user_metadata
        ?.full_name ||
      "";

    const address =
      account?.address;

    setFormData((previous) => ({
      ...previous,

      firstName:
        previous.firstName ||
        fullName
          .split(" ")[0] ||
        "",

      lastName:
        previous.lastName ||
        fullName
          .split(" ")
          .slice(1)
          .join(" ") ||
        "",

      email:
        previous.email ||
        account?.email ||
        "",

      phone:
        previous.phone ||
        account?.phone ||
        "",

      address:
        previous.address ||
        address?.address ||
        address?.street ||
        "",

      city:
        previous.city ||
        address?.city ||
        "",

      state:
        previous.state ||
        address?.state ||
        "",

      pincode:
        previous.pincode ||
        address?.pincode ||
        address?.postal_code ||
        "",
    }));
  }, [user, profile]);

  /* =========================================================
     TOTALS
  ========================================================= */

  const subtotal = useMemo(() => {
    if (
      Number(cartSummary?.subtotal) >
      0
    ) {
      return Number(
        cartSummary.subtotal
      );
    }

    return (
      cartItems || []
    ).reduce((total, item) => {
      return (
        total +
        getProductPrice(item) *
          Number(
            item.quantity || 1
          )
      );
    }, 0);
  }, [
    cartItems,
    cartSummary?.subtotal,
  ]);

  const deliveryFee = Number(
    cartSummary?.shipping ||
      cartSummary?.deliveryFee ||
      0
  );

  const discount = Number(
    cartSummary?.discount || 0
  );

  const total =
    Number(cartSummary?.total) ||
    Math.max(
      0,
      subtotal +
        deliveryFee -
        discount
    );

  /* =========================================================
     FORM
  ========================================================= */

  const handleInputChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     DELIVERY ADDRESS
  ========================================================= */

  const buildDeliveryAddress = () => {
    return {
      full_name:
        `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),

      first_name:
        formData.firstName.trim(),

      last_name:
        formData.lastName.trim(),

      email:
        formData.email.trim(),

      phone:
        formData.phone.trim(),

      address:
        formData.address.trim(),

      city:
        formData.city.trim(),

      state:
        formData.state.trim(),

      pincode:
        formData.pincode.trim(),

      country: "India",
    };
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateCheckout = () => {
    if (!isAuthenticated) {
      toast.error(
        "Please sign in first."
      );

      navigate("/sign_in");

      return false;
    }

    if (!cartItems?.length) {
      toast.error(
        "Your cart is empty."
      );

      navigate("/cart");

      return false;
    }

    const requiredFields = [
      "firstName",
      "lastName",
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
            formData[field] || ""
          ).trim()
      );

    if (missingField) {
      toast.error(
        "Please complete all delivery details."
      );

      return false;
    }

    if (
      !/^\S+@\S+\.\S+$/.test(
        formData.email.trim()
      )
    ) {
      toast.error(
        "Please enter a valid email address."
      );

      return false;
    }

    if (
      !/^\d{6}$/.test(
        formData.pincode.trim()
      )
    ) {
      toast.error(
        "Please enter a valid 6-digit PIN code."
      );

      return false;
    }

    return true;
  };

  /* =========================================================
     PLACE COD ORDER
  ========================================================= */

  const handlePlaceOrder =
    async () => {
      if (
        placingOrderRef.current ||
        loading
      ) {
        return;
      }

      if (!validateCheckout()) {
        return;
      }

      placingOrderRef.current = true;
      setLoading(true);

      try {
        const deliveryAddress =
          buildDeliveryAddress();

        /*
          createOrder/orderApi will eventually use the
          secure Supabase COD RPC.

          Prices should be calculated by Supabase rather
          than trusted from the browser.
        */

        const order =
          await placeOrder({
            items: cartItems,

            delivery_address:
              deliveryAddress,

            address:
              deliveryAddress,

            delivery_instructions:
              formData.deliveryInstructions
                .trim(),

            notes:
              formData.deliveryInstructions
                .trim(),

            payment_method: "cod",

            subtotal,

            discount_amount:
              discount,

            delivery_fee:
              deliveryFee,

            total_amount: total,
          });

        if (!order?.id) {
          throw new Error(
            "Order could not be created."
          );
        }

        setLatestOrder(order);

        await clearCart();

        toast.success(
          "Your order has been placed!"
        );

        navigate(
          `/order-confirmation/${order.id}`,
          {
            replace: true,

            state: {
              order,
            },
          }
        );
      } catch (error) {
        console.error(
          "Checkout error:",
          error
        );

        if (
          error?.code ===
            "PGRST303" ||
          error?.message?.includes(
            "JWT expired"
          )
        ) {
          toast.error(
            "Your session has expired. Please sign in again."
          );

          navigate(
            "/sign_in"
          );
        } else {
          toast.error(
            error?.message ||
              "Unable to place order. Please try again."
          );
        }
      } finally {
        placingOrderRef.current =
          false;

        setLoading(false);
      }
    };

  /* =========================================================
     SHARED CLASSES
  ========================================================= */

  const inputClass =
    "w-full bg-white/50 border border-white/80 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all placeholder:text-gray-400 text-gray-800 text-sm";

  const labelClass =
    "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1";

  const bubbleButtonClass =
    "bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white transition-all hover:from-gray-400 hover:to-gray-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  const glassPanelClass =
    "bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6 lg:p-8";

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    authLoading ||
    cartLoading
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-7 h-7 border-[3px] border-gray-300 border-t-gray-700 rounded-full animate-spin" />

          Loading checkout...
        </div>
      </div>
    );
  }

  /* =========================================================
     EMPTY CART
  ========================================================= */

  if (!cartItems?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] flex flex-col items-center justify-center gap-5 px-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Your cart is empty
        </h2>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/categories"
            )
          }
          className={`px-7 py-3 rounded-full text-sm font-semibold ${bubbleButtonClass}`}
        >
          Browse Groceries
        </button>
      </div>
    );
  }

  /* =========================================================
     CHECKOUT UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] font-sans pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/cart")
              }
              disabled={loading}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold text-xs uppercase tracking-widest mb-4 disabled:opacity-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M15 19l-7-7 7-7"
                />
              </svg>

              Review Cart
            </button>

            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900 leading-none">
              Checkout
            </h1>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
            <span className="text-gray-900 border-b-2 border-gray-900 pb-1">
              Delivery
            </span>

            <span>➔</span>

            <span className="text-gray-900">
              COD
            </span>

            <span>➔</span>

            <span>
              Success
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="lg:col-span-7 space-y-8 w-full">

            {/* DELIVERY DETAILS */}
            <div
              className={
                glassPanelClass
              }
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center text-white">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-gray-900">
                  Delivery Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label
                    className={
                      labelClass
                    }
                  >
                    First Name
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={
                      formData.firstName
                    }
                    onChange={
                      handleInputChange
                    }
                    className={
                      inputClass
                    }
                    placeholder="First name"
                    disabled={
                      loading
                    }
                  />
                </div>

                <div>
                  <label
                    className={
                      labelClass
                    }
                  >
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={
                      formData.lastName
                    }
                    onChange={
                      handleInputChange
                    }
                    className={
                      inputClass
                    }
                    placeholder="Last name"
                    disabled={
                      loading
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    className={
                      labelClass
                    }
                  >
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleInputChange
                    }
                    className={
                      inputClass
                    }
                    placeholder="you@example.com"
                    disabled={
                      loading
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    className={
                      labelClass
                    }
                  >
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleInputChange
                    }
                    className={
                      inputClass
                    }
                    placeholder="+91 00000 00000"
                    disabled={
                      loading
                    }
                  />
                </div>

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
                      handleInputChange
                    }
                    rows="2"
                    className={`${inputClass} resize-none`}
                    placeholder="House no., building, street, area..."
                    disabled={
                      loading
                    }
                  />
                </div>

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
                      handleInputChange
                    }
                    className={
                      inputClass
                    }
                    placeholder="City"
                    disabled={
                      loading
                    }
                  />
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-4">
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
                          handleInputChange
                        }
                        className={
                          inputClass
                        }
                        placeholder="State"
                        disabled={
                          loading
                        }
                      />
                    </div>

                    <div>
                      <label
                        className={
                          labelClass
                        }
                      >
                        PIN
                      </label>

                      <input
                        type="text"
                        name="pincode"
                        maxLength={6}
                        value={
                          formData.pincode
                        }
                        onChange={
                          handleInputChange
                        }
                        className={
                          inputClass
                        }
                        placeholder="000000"
                        disabled={
                          loading
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label
                    className={
                      labelClass
                    }
                  >
                    Delivery Instructions
                    <span className="normal-case tracking-normal font-normal ml-1">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    name="deliveryInstructions"
                    value={
                      formData.deliveryInstructions
                    }
                    onChange={
                      handleInputChange
                    }
                    rows="2"
                    className={`${inputClass} resize-none`}
                    placeholder="Gate number, landmark, delivery preference..."
                    disabled={
                      loading
                    }
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT */}
            <div
              className={
                glassPanelClass
              }
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center text-white">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-gray-900">
                  Payment Method
                </h2>
              </div>

              <div className="relative flex items-center gap-5 p-5 rounded-3xl border-2 border-gray-900 bg-white/60 shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold">
                    ₹
                  </span>
                </div>

                <div>
                  <span className="block font-bold text-gray-900">
                    Cash on Delivery
                  </span>

                  <span className="block text-xs text-gray-500 mt-1">
                    Pay when your groceries arrive at your doorstep
                  </span>
                </div>

                <div className="ml-auto w-5 h-5 rounded-full border-[5px] border-gray-900 bg-white" />
              </div>
            </div>
          </div>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <div className="lg:col-span-5 w-full sticky top-28">
            <div
              className={`${glassPanelClass} !p-0 overflow-hidden`}
            >
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map(
                    (item) => {
                      const productName =
                        getProductName(
                          item
                        );

                      const productImage =
                        getProductImage(
                          item
                        );

                      const productPrice =
                        getProductPrice(
                          item
                        );

                      const packSize =
                        getPackSize(
                          item
                        );

                      return (
                        <div
                          key={
                            item.id
                          }
                          className="flex gap-4"
                        >
                          <div className="w-20 h-20 bg-white/60 rounded-2xl flex items-center justify-center p-2 border border-white/80 shadow-sm shrink-0">
                            <img
                              src={
                                productImage
                              }
                              alt={
                                productName
                              }
                              className="w-full h-full object-contain mix-blend-multiply"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.onerror =
                                  null;

                                event.currentTarget.src =
                                  fallbackImage;
                              }}
                            />
                          </div>

                          <div className="flex-1 flex flex-col justify-center min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                              {
                                productName
                              }
                            </h4>

                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              {packSize && (
                                <>
                                  <span>
                                    {
                                      packSize
                                    }
                                  </span>

                                  <span>
                                    •
                                  </span>
                                </>
                              )}

                              <span>
                                Qty{" "}
                                {
                                  item.quantity
                                }
                              </span>
                            </div>

                            <p className="font-bold text-gray-900 mt-1">
                              ₹
                              {(
                                productPrice *
                                Number(
                                  item.quantity ||
                                    1
                                )
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="bg-black/5 p-8 space-y-4">

                <div className="flex justify-between text-sm text-gray-600 font-medium">
                  <span>
                    Subtotal
                  </span>

                  <span className="text-gray-900 font-bold">
                    ₹
                    {subtotal.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-600 font-medium">
                  <span>
                    Delivery
                  </span>

                  <span
                    className={
                      deliveryFee ===
                      0
                        ? "text-green-600 font-bold uppercase tracking-widest text-[10px]"
                        : "text-gray-900 font-bold"
                    }
                  >
                    {deliveryFee ===
                    0
                      ? "FREE"
                      : `₹${deliveryFee.toLocaleString(
                          "en-IN"
                        )}`}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm text-gray-600 font-medium">
                    <span>
                      Discount
                    </span>

                    <span className="text-green-600 font-bold">
                      − ₹
                      {discount.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase text-gray-400">
                      Total Payable
                    </span>

                    <span className="text-[10px] text-gray-500">
                      Pay on delivery
                    </span>
                  </div>

                  <span className="text-3xl font-black text-gray-900 tracking-tight">
                    ₹
                    {total.toLocaleString(
                      "en-IN"
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
                  className={`w-full mt-6 py-5 rounded-3xl font-black uppercase tracking-widest text-sm ${bubbleButtonClass}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                      Placing Order...
                    </div>
                  ) : (
                    "Place COD Order"
                  )}
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 opacity-40">
              <span className="text-[10px] font-bold">
                CASH ON DELIVERY
              </span>

              <span className="text-[10px] font-bold">
                SAFE CHECKOUT
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;