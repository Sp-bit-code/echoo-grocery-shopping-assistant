import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getCart,
  addToCart as addToCartRequest,
  updateCartItem as updateCartItemRequest,
  increaseCartItem as increaseCartItemRequest,
  decreaseCartItem as decreaseCartItemRequest,
  removeCartItem as removeCartItemRequest,
  clearCart as clearCartRequest,
  calculateCartSummary,
} from "../api/cartApi";

import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

const EMPTY_CART_SUMMARY = {
  totalItems: 0,
  subtotal: 0,
  shipping: 0,
  tax: 0,
  discount: 0,
  total: 0,
};

/* =========================================================
   HELPERS
========================================================= */

const getProductId = (item = {}) =>
  item?.product_id ||
  item?.productId ||
  item?.products?.id ||
  item?.product?.id ||
  null;

const upsertCartItem = (
  items = [],
  updatedItem
) => {
  if (
    !updatedItem ||
    typeof updatedItem !== "object"
  ) {
    return items;
  }

  const updatedId =
    updatedItem.id;

  const updatedProductId =
    getProductId(updatedItem);

  const existingIndex =
    items.findIndex((item) => {
      if (
        updatedId &&
        item?.id === updatedId
      ) {
        return true;
      }

      if (
        updatedProductId &&
        getProductId(item) ===
          updatedProductId
      ) {
        return true;
      }

      return false;
    });

  if (existingIndex === -1) {
    return [
      updatedItem,
      ...items,
    ];
  }

  const nextItems = [...items];

  nextItems[existingIndex] =
    updatedItem;

  return nextItems;
};

/* =========================================================
   PROVIDER
========================================================= */

export const CartProvider = ({
  children,
}) => {
  const {
    isAuthenticated,
    authLoading,
  } = useAuth();

  const [
    cartItems,
    setCartItems,
  ] = useState([]);

  const [
    cartCount,
    setCartCount,
  ] = useState(0);

  const [
    cartSummary,
    setCartSummary,
  ] = useState(
    EMPTY_CART_SUMMARY
  );

  const [
    cartLoading,
    setCartLoading,
  ] = useState(false);

  /*
    Ref always contains the newest cart.

    This prevents async operations from using
    an old React state snapshot.
  */
  const cartItemsRef =
    useRef([]);

  /*
    Prevent old fetch requests from overwriting
    newer cart mutations.
  */
  const fetchRequestRef =
    useRef(0);

  const mutationVersionRef =
    useRef(0);

  /* =========================================================
     APPLY CART STATE
  ========================================================= */

  const applyCartState =
    useCallback((items = []) => {
      const safeItems =
        Array.isArray(items)
          ? items
          : [];

      const summary =
        calculateCartSummary(
          safeItems
        );

      cartItemsRef.current =
        safeItems;

      setCartItems(safeItems);

      setCartCount(
        Number(
          summary.totalItems || 0
        )
      );

      setCartSummary({
        ...EMPTY_CART_SUMMARY,
        ...summary,
      });
    }, []);

  /* =========================================================
     RESET CART
  ========================================================= */

  const resetCart =
    useCallback(() => {
      /*
        Invalidate any currently running fetch.
      */
      fetchRequestRef.current += 1;

      mutationVersionRef.current += 1;

      applyCartState([]);
    }, [applyCartState]);

  /* =========================================================
     FETCH CART
  ========================================================= */

  const fetchCart =
    useCallback(async () => {
      if (authLoading) {
        return (
          cartItemsRef.current ||
          []
        );
      }

      if (!isAuthenticated) {
        resetCart();

        return [];
      }

      const requestId =
        ++fetchRequestRef.current;

      const mutationVersion =
        mutationVersionRef.current;

      try {
        setCartLoading(true);

        const items =
          await getCart();

        const safeItems =
          Array.isArray(items)
            ? items
            : [];

        /*
          Very important:

          Ignore this response if another
          cart mutation happened while the
          request was running.

          This prevents:
          add item -> old fetch returns []
                   -> cart suddenly becomes empty.
        */
        if (
          requestId !==
            fetchRequestRef.current ||
          mutationVersion !==
            mutationVersionRef.current
        ) {
          return (
            cartItemsRef.current
          );
        }

        applyCartState(
          safeItems
        );

        return safeItems;
      } catch (error) {
        console.error(
          "Failed to fetch cart:",
          error
        );

        /*
          DO NOT reset the cart here.

          A temporary API/network error should
          not make the UI suddenly show an
          empty cart.
        */
        return (
          cartItemsRef.current ||
          []
        );
      } finally {
        if (
          requestId ===
          fetchRequestRef.current
        ) {
          setCartLoading(false);
        }
      }
    }, [
      authLoading,
      isAuthenticated,
      resetCart,
      applyCartState,
    ]);

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const addToCart =
    useCallback(
      async (
        productId,
        quantity = 1
      ) => {
        if (!productId) {
          throw new Error(
            "Product ID is required."
          );
        }

        if (!isAuthenticated) {
          throw new Error(
            "Please login first."
          );
        }

        const safeQuantity =
          Math.max(
            1,
            Number(quantity) || 1
          );

        const previousItems =
          cartItemsRef.current;

        /*
          Mutation starts.

          This invalidates older fetchCart()
          responses.
        */
        mutationVersionRef.current += 1;

        /*
          IMMEDIATE navbar feedback.

          User sees cart count change as soon
          as + / Add to cart is clicked.
        */
        setCartCount(
          (previousCount) =>
            previousCount +
            safeQuantity
        );

        setCartSummary(
          (previousSummary) => ({
            ...previousSummary,

            totalItems:
              Number(
                previousSummary
                  ?.totalItems || 0
              ) +
              safeQuantity,
          })
        );

        try {
          /*
            cartApi already returns the
            complete updated cart item.

            Therefore DO NOT call fetchCart()
            again after this.
          */
          const item =
            await addToCartRequest({
              productId,
              quantity:
                safeQuantity,
            });

          if (item) {
            const nextItems =
              upsertCartItem(
                cartItemsRef.current,
                item
              );

            applyCartState(
              nextItems
            );
          } else {
            /*
              Rare fallback:
              API succeeded but returned no row.
            */
            mutationVersionRef.current +=
              1;

            await fetchCart();
          }

          return item;
        } catch (error) {
          /*
            Roll back optimistic UI if
            database request fails.
          */
          applyCartState(
            previousItems
          );

          console.error(
            "Failed to add to cart:",
            error
          );

          throw error;
        } finally {
          mutationVersionRef.current += 1;
        }
      },
      [
        isAuthenticated,
        applyCartState,
        fetchCart,
      ]
    );

  /* =========================================================
     UPDATE CART ITEM
  ========================================================= */

  const updateCartItem =
    useCallback(
      async (
        cartItemId,
        quantity
      ) => {
        if (!cartItemId) {
          throw new Error(
            "Cart item ID is required."
          );
        }

        const safeQuantity =
          Math.max(
            1,
            Number(quantity) || 1
          );

        const previousItems =
          cartItemsRef.current;

        mutationVersionRef.current += 1;

        /*
          Optimistic quantity update.
        */
        const optimisticItems =
          previousItems.map(
            (item) =>
              item.id ===
              cartItemId
                ? {
                    ...item,
                    quantity:
                      safeQuantity,
                  }
                : item
          );

        applyCartState(
          optimisticItems
        );

        try {
          const item =
            await updateCartItemRequest(
              cartItemId,
              {
                quantity:
                  safeQuantity,
              }
            );

          if (
            item &&
            typeof item ===
              "object"
          ) {
            applyCartState(
              upsertCartItem(
                cartItemsRef.current,
                item
              )
            );
          }

          return item;
        } catch (error) {
          applyCartState(
            previousItems
          );

          console.error(
            "Failed to update cart item:",
            error
          );

          throw error;
        } finally {
          mutationVersionRef.current += 1;
        }
      },
      [applyCartState]
    );

  /* =========================================================
     INCREASE QUANTITY
  ========================================================= */

  const increaseCartItem =
    useCallback(
      async (cartItemId) => {
        if (!cartItemId) {
          return null;
        }

        const previousItems =
          cartItemsRef.current;

        const currentItem =
          previousItems.find(
            (item) =>
              item.id ===
              cartItemId
          );

        if (!currentItem) {
          return null;
        }

        mutationVersionRef.current += 1;

        const nextQuantity =
          Number(
            currentItem.quantity ||
              0
          ) + 1;

        applyCartState(
          previousItems.map(
            (item) =>
              item.id ===
              cartItemId
                ? {
                    ...item,
                    quantity:
                      nextQuantity,
                  }
                : item
          )
        );

        try {
          const item =
            await increaseCartItemRequest(
              cartItemId
            );

          if (
            item &&
            typeof item ===
              "object"
          ) {
            applyCartState(
              upsertCartItem(
                cartItemsRef.current,
                item
              )
            );
          }

          return item;
        } catch (error) {
          applyCartState(
            previousItems
          );

          console.error(
            "Failed to increase cart item:",
            error
          );

          throw error;
        } finally {
          mutationVersionRef.current += 1;
        }
      },
      [applyCartState]
    );

  /* =========================================================
     DECREASE QUANTITY
  ========================================================= */

  const decreaseCartItem =
    useCallback(
      async (cartItemId) => {
        if (!cartItemId) {
          return null;
        }

        const previousItems =
          cartItemsRef.current;

        const currentItem =
          previousItems.find(
            (item) =>
              item.id ===
              cartItemId
          );

        if (!currentItem) {
          return null;
        }

        mutationVersionRef.current += 1;

        const nextQuantity =
          Number(
            currentItem.quantity ||
              1
          ) - 1;

        if (nextQuantity <= 0) {
          applyCartState(
            previousItems.filter(
              (item) =>
                item.id !==
                cartItemId
            )
          );
        } else {
          applyCartState(
            previousItems.map(
              (item) =>
                item.id ===
                cartItemId
                  ? {
                      ...item,
                      quantity:
                        nextQuantity,
                    }
                  : item
            )
          );
        }

        try {
          const item =
            await decreaseCartItemRequest(
              cartItemId
            );

          if (
            item &&
            typeof item ===
              "object"
          ) {
            applyCartState(
              upsertCartItem(
                cartItemsRef.current,
                item
              )
            );
          }

          return item;
        } catch (error) {
          applyCartState(
            previousItems
          );

          console.error(
            "Failed to decrease cart item:",
            error
          );

          throw error;
        } finally {
          mutationVersionRef.current += 1;
        }
      },
      [applyCartState]
    );

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

  const removeCartItem =
    useCallback(
      async (cartItemId) => {
        if (!cartItemId) {
          return false;
        }

        const previousItems =
          cartItemsRef.current;

        mutationVersionRef.current += 1;

        /*
          Remove immediately from UI.
        */
        applyCartState(
          previousItems.filter(
            (item) =>
              item.id !==
              cartItemId
          )
        );

        try {
          await removeCartItemRequest(
            cartItemId
          );

          return true;
        } catch (error) {
          applyCartState(
            previousItems
          );

          console.error(
            "Failed to remove cart item:",
            error
          );

          throw error;
        } finally {
          mutationVersionRef.current += 1;
        }
      },
      [applyCartState]
    );

  /* =========================================================
     CLEAR CART
  ========================================================= */

  const clearCart =
    useCallback(async () => {
      const previousItems =
        cartItemsRef.current;

      mutationVersionRef.current += 1;

      /*
        Clear immediately in UI.
      */
      applyCartState([]);

      try {
        await clearCartRequest();

        return true;
      } catch (error) {
        applyCartState(
          previousItems
        );

        console.error(
          "Failed to clear cart:",
          error
        );

        throw error;
      } finally {
        mutationVersionRef.current += 1;
      }
    }, [applyCartState]);

  /* =========================================================
     LOAD CART AFTER AUTH
  ========================================================= */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      resetCart();

      return;
    }

    fetchCart();
  }, [
    authLoading,
    isAuthenticated,
    fetchCart,
    resetCart,
  ]);

  /* =========================================================
     CLEAR CART ON LOGOUT
  ========================================================= */

  useEffect(() => {
    const handleLogout = () => {
      resetCart();
    };

    window.addEventListener(
      "auth:logout",
      handleLogout
    );

    return () => {
      window.removeEventListener(
        "auth:logout",
        handleLogout
      );
    };
  }, [resetCart]);

  /* =========================================================
     CONTEXT VALUE
  ========================================================= */

  const cartValue =
    useMemo(
      () => ({
        cartItems,
        cartCount,
        cartSummary,
        cartLoading,

        fetchCart,
        addToCart,
        updateCartItem,
        increaseCartItem,
        decreaseCartItem,
        removeCartItem,
        clearCart,

        setCartItems,
        setCartCount,
        setCartSummary,
      }),
      [
        cartItems,
        cartCount,
        cartSummary,
        cartLoading,
        fetchCart,
        addToCart,
        updateCartItem,
        increaseCartItem,
        decreaseCartItem,
        removeCartItem,
        clearCart,
      ]
    );

  return (
    <CartContext.Provider
      value={cartValue}
    >
      {children}
    </CartContext.Provider>
  );
};

/* =========================================================
   HOOK
========================================================= */

export const useCart = () => {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within CartProvider"
    );
  }

  return context;
};

export default CartContext;