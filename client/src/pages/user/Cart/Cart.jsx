import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { toast } from "react-toastify";

import SimpleFooter from "../../../components/layout/SimpleFoot/SimpleFoot.jsx";

import { useAuth } from "../../../context/AuthContext.jsx";
import { useCart } from "../../../context/CartContext.jsx";

import "./Cart.css";

/* =========================================================
   FALLBACK IMAGE
========================================================= */

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='16' fill='%23e5e7eb'/%3E%3C/svg%3E";

/* =========================================================
   PRICE
========================================================= */

const fmt = (price) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(
    Number(price || 0)
  );

/* =========================================================
   NORMALIZE CART ITEM
========================================================= */

const normalizeCartItem = (
  item = {}
) => {
  const product =
    item.products ||
    item.product ||
    {};

  const images =
    Array.isArray(
      product.product_images
    )
      ? product.product_images
      : Array.isArray(
          product.images
        )
      ? product.images
      : [];

  const primaryImage =
    item.product_image ||
    item.productImage ||
    product.primary_image ||
    product.primaryImage ||
    product.image ||
    product.image_url ||
    images.find(
      (image) =>
        image &&
        typeof image ===
          "object" &&
        image.is_primary
    )?.image_url ||
    images.find(
      (image) =>
        image &&
        typeof image ===
          "object" &&
        image.image_url
    )?.image_url ||
    (typeof images[0] ===
    "string"
      ? images[0]
      : images[0]
          ?.image_url) ||
    fallbackImage;

  const price =
    Number(
      item.product_price ??
        item.productPrice ??
        product.discount_price ??
        product.discountPrice ??
        item.price ??
        product.price ??
        0
    );

  const packSize =
    item.pack_size ||
    item.packSize ||
    product.pack_size ||
    product.packSize ||
    (product.quantity &&
    product.unit
      ? `${product.quantity} ${product.unit}`
      : "");

  return {
    ...item,

    product,

    product_id:
      item.product_id ||
      item.productId ||
      product.id ||
      "",

    product_name:
      item.product_name ||
      item.productName ||
      product.name ||
      "Product",

    product_price:
      price,

    product_image:
      primaryImage,

    brand:
      product.brand ||
      item.brand ||
      "",

    pack_size:
      packSize,

    stock:
      Number(
        product.stock ??
          item.stock ??
          0
      ),

    quantity:
      Math.max(
        1,
        Number(
          item.quantity || 1
        )
      ),
  };
};

/* =========================================================
   CART PAGE
========================================================= */

const CartPage = () => {
  const navigate =
    useNavigate();

  const {
    user: currentUser,
    isAuthenticated,
    authLoading,
  } = useAuth();

  const {
    cartItems = [],
    cartLoading,

    fetchCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  } = useCart();

  const [
    updatingItemId,
    setUpdatingItemId,
  ] = useState(null);

  const [
    clearingCart,
    setClearingCart,
  ] = useState(false);

  /* =========================================================
     IMPORTANT

     Refresh from database whenever Cart page opens.

     This fixes:
     Profile = 1 item
     Cart = empty
  ========================================================= */

  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated
    ) {
      return;
    }

    fetchCart();
  }, [
    authLoading,
    isAuthenticated,
    fetchCart,
  ]);

  /* =========================================================
     NORMALIZED ITEMS
  ========================================================= */

  const items =
    useMemo(() => {
      const safeItems =
        Array.isArray(
          cartItems
        )
          ? cartItems
          : [];

      return safeItems.map(
        normalizeCartItem
      );
    }, [cartItems]);

  /* =========================================================
     TOTALS
  ========================================================= */

  const subtotal =
    useMemo(() => {
      return items.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.product_price ||
              0
          ) *
            Number(
              item.quantity || 1
            ),
        0
      );
    }, [items]);

  const totalQuantity =
    useMemo(() => {
      return items.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.quantity || 0
          ),
        0
      );
    }, [items]);

  const deliveryFee =
    subtotal > 0 &&
    subtotal < 500
      ? 49
      : 0;

  const total =
    subtotal +
    deliveryFee;

  /* =========================================================
     QUANTITY
  ========================================================= */

  const changeQty = async (
    item,
    delta
  ) => {
    if (
      !item?.id ||
      updatingItemId
    ) {
      return;
    }

    const currentQuantity =
      Number(
        item.quantity || 1
      );

    const nextQuantity =
      currentQuantity +
      delta;

    if (nextQuantity <= 0) {
      try {
        setUpdatingItemId(
          item.id
        );

        await removeCartItem(
          item.id
        );
      } catch (error) {
        console.error(
          "Failed to remove cart item:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to remove item."
        );
      } finally {
        setUpdatingItemId(
          null
        );
      }

      return;
    }

    if (
      delta > 0 &&
      item.stock > 0 &&
      nextQuantity >
        item.stock
    ) {
      toast.info(
        "Maximum available stock reached."
      );

      return;
    }

    try {
      setUpdatingItemId(
        item.id
      );

      await updateCartItem(
        item.id,
        nextQuantity
      );
    } catch (error) {
      console.error(
        "Failed to update cart quantity:",
        error
      );

      toast.error(
        error?.message ||
          "Unable to update quantity."
      );
    } finally {
      setUpdatingItemId(
        null
      );
    }
  };

  /* =========================================================
     REMOVE
  ========================================================= */

  const removeItem =
    async (itemId) => {
      if (
        !itemId ||
        updatingItemId
      ) {
        return;
      }

      try {
        setUpdatingItemId(
          itemId
        );

        await removeCartItem(
          itemId
        );

        toast.success(
          "Item removed from cart."
        );
      } catch (error) {
        console.error(
          "Failed to remove cart item:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to remove item."
        );
      } finally {
        setUpdatingItemId(
          null
        );
      }
    };

  /* =========================================================
     CLEAR
  ========================================================= */

  const handleClearCart =
    async () => {
      if (
        clearingCart ||
        items.length === 0
      ) {
        return;
      }

      try {
        setClearingCart(
          true
        );

        await clearCart();

        toast.success(
          "Cart cleared."
        );
      } catch (error) {
        console.error(
          "Failed to clear cart:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to clear cart."
        );
      } finally {
        setClearingCart(
          false
        );
      }
    };

  /* =========================================================
     AUTH LOADING
  ========================================================= */

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-gray-300 border-t-gray-700 animate-spin" />

          <p className="text-gray-500 text-sm font-medium">
            Loading your cart...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     NOT LOGGED IN
  ========================================================= */

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] flex flex-col items-center justify-center gap-4 p-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Please Sign In
        </h2>

        <p className="text-sm text-gray-500 text-center">
          Sign in to view and manage
          your grocery cart.
        </p>

        <Link
          to="/sign_in"
          className="px-8 py-3 rounded-full bg-gradient-to-b from-gray-500 to-gray-800 text-white font-semibold shadow-md"
        >
          Sign In
        </Link>
      </div>
    );
  }

  /* =========================================================
     INITIAL CART FETCH

     Only show loader if there are currently no items.
  ========================================================= */

  if (
    cartLoading &&
    items.length === 0
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-gray-300 border-t-gray-700 animate-spin" />

          <p className="text-gray-500 text-sm font-medium">
            Loading your cart...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     EMPTY
  ========================================================= */

  if (items.length === 0) {
    const firstName =
      currentUser
        ?.user_metadata
        ?.full_name
        ?.split(" ")[0] ||
      currentUser
        ?.full_name
        ?.split(" ")[0] ||
      currentUser?.name
        ?.split(" ")[0] ||
      "there";

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] flex flex-col items-center justify-center gap-4 p-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Your Bag is Empty
        </h2>

        <p className="text-gray-500 text-sm">
          Hey {firstName}! Nothing
          here yet.
        </p>

        <Link
          to="/categories"
          className="px-8 py-3 rounded-full bg-gradient-to-b from-gray-500 to-gray-800 text-white font-semibold shadow-md"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  /* =========================================================
     CART
  ========================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] pt-20 pb-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6">

        {/* HEADER */}

        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
              EchOo Grocery
            </p>

            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900">
              Shopping Bag
            </h1>

            <p className="text-gray-500 mt-2 text-sm">
              {totalQuantity}{" "}
              {totalQuantity === 1
                ? "item"
                : "items"}
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleClearCart
            }
            disabled={
              clearingCart
            }
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white/70 text-sm font-medium text-red-500 hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
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
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>

            {clearingCart
              ? "Clearing..."
              : "Clear All"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* CART ITEMS */}

          <div className="lg:w-2/3 space-y-4">
            <AnimatePresence>
              {items.map(
                (item) => {
                  const updating =
                    updatingItemId ===
                    item.id;

                  return (
                    <motion.div
                      key={
                        item.id
                      }
                      layout
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -40,
                        height: 0,
                      }}
                      transition={{
                        duration:
                          0.15,
                      }}
                      className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-4 sm:p-5 flex gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
                    >
                      {/* IMAGE */}

                      <Link
                        to={`/product/${
                          item.product
                            ?.slug ||
                          item.product_id
                        }`}
                        className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-[#d9e8f5] to-[#f4f7fa] rounded-2xl p-2 flex-shrink-0 flex items-center justify-center"
                      >
                        <img
                          src={
                            item.product_image
                          }
                          alt={
                            item.product_name
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
                      </Link>

                      {/* DETAILS */}

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            {item.brand && (
                              <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">
                                {
                                  item.brand
                                }
                              </p>
                            )}

                            <Link
                              to={`/product/${
                                item.product
                                  ?.slug ||
                                item.product_id
                              }`}
                            >
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2 hover:text-gray-600 transition-colors">
                                {
                                  item.product_name
                                }
                              </h3>
                            </Link>

                            {item.pack_size && (
                              <p className="text-xs text-gray-500 mt-1">
                                {
                                  item.pack_size
                                }
                              </p>
                            )}

                            <p className="text-base font-bold text-gray-900 mt-2">
                              {fmt(
                                item.product_price
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.id
                              )
                            }
                            disabled={
                              updating
                            }
                            className="w-8 h-8 rounded-full bg-white/60 border border-white/80 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 disabled:opacity-40"
                            aria-label={`Remove ${item.product_name}`}
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
                                strokeWidth={
                                  2
                                }
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* QUANTITY */}

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() =>
                              changeQty(
                                item,
                                -1
                              )
                            }
                            disabled={
                              updating
                            }
                            className="w-8 h-8 rounded-full bg-white/60 border border-white/80 flex items-center justify-center text-gray-700 font-bold hover:bg-white transition-all text-sm shadow-sm disabled:opacity-40"
                          >
                            −
                          </button>

                          <span className="w-7 text-center font-semibold text-gray-900 text-sm">
                            {
                              item.quantity
                            }
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              changeQty(
                                item,
                                1
                              )
                            }
                            disabled={
                              updating ||
                              (item.stock >
                                0 &&
                                item.quantity >=
                                  item.stock)
                            }
                            className="w-8 h-8 rounded-full bg-white/60 border border-white/80 flex items-center justify-center text-gray-700 font-bold hover:bg-white transition-all text-sm shadow-sm disabled:opacity-40"
                          >
                            +
                          </button>

                          <span className="ml-auto text-sm font-semibold text-gray-600">
                            {fmt(
                              item.product_price *
                                item.quantity
                            )}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              )}
            </AnimatePresence>
          </div>

          {/* ORDER SUMMARY */}

          <div className="lg:w-1/3">
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">

                <div className="flex justify-between text-gray-600">
                  <span>
                    Subtotal (
                    {
                      totalQuantity
                    }{" "}
                    {totalQuantity ===
                    1
                      ? "item"
                      : "items"}
                    )
                  </span>

                  <span className="font-medium text-gray-900">
                    {fmt(
                      subtotal
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>
                    Delivery
                  </span>

                  <span
                    className={`font-medium ${
                      deliveryFee ===
                      0
                        ? "text-emerald-600"
                        : "text-gray-900"
                    }`}
                  >
                    {deliveryFee ===
                    0
                      ? "Free"
                      : fmt(
                          deliveryFee
                        )}
                  </span>
                </div>

                {deliveryFee > 0 && (
                  <p className="text-xs text-gray-400 bg-blue-50 rounded-xl px-3 py-2">
                    Add{" "}
                    {fmt(
                      Math.max(
                        0,
                        500 -
                          subtotal
                      )
                    )}{" "}
                    more for free
                    delivery.
                  </p>
                )}

                <div className="h-px bg-white/80 my-2" />

                <div className="flex justify-between font-bold text-base text-gray-900">
                  <span>
                    Total
                  </span>

                  <span>
                    {fmt(total)}
                  </span>
                </div>
              </div>

              <div className="mt-5 px-3 py-3 rounded-xl bg-white/40 border border-white/60">
                <p className="text-xs text-gray-500">
                  Payment method
                </p>

                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  Cash on Delivery
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/checkout"
                  )
                }
                className="w-full mt-6 py-4 rounded-full font-bold text-sm tracking-wide bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white hover:from-gray-400 hover:to-gray-700 transition-all"
              >
                Checkout →
              </button>

              <Link
                to="/categories"
                className="block text-center mt-4 text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <SimpleFooter />
      </div>
    </div>
  );
};

export default CartPage;