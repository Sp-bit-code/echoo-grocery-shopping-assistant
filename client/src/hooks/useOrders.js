import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
} from "../api/orderApi";

import { useAuth } from "../context/AuthContext.jsx";

/* =========================================================
   NORMALIZE ORDER ITEM
========================================================= */

const normalizeOrderItem = (item = {}) => {
  const product =
    item.products ||
    item.product ||
    {};

  const image =
    item.product_image ||
    product.product_images?.find(
      (imageItem) =>
        imageItem?.is_primary
    )?.image_url ||
    product.product_images?.[0]?.image_url ||
    product.images?.[0]?.image_url ||
    product.images?.[0] ||
    product.image ||
    product.image_url ||
    "";

  const quantity =
    Number(
      item.quantity || 1
    );

  const unitPrice =
    Number(
      item.unit_price ??
        item.product_price ??
        item.price ??
        product.discount_price ??
        product.price ??
        0
    );

  const totalPrice =
    Number(
      item.total_price ??
        unitPrice * quantity
    );

  return {
    ...item,

    product,

    product_id:
      item.product_id ||
      product.id ||
      "",

    product_name:
      item.product_name ||
      product.name ||
      "Product",

    quantity,

    unit_price:
      unitPrice,

    price:
      unitPrice,

    total_price:
      totalPrice,

    product_image:
      image,
  };
};

/* =========================================================
   NORMALIZE ORDER
========================================================= */

const normalizeOrder = (order = {}) => {
  const profile =
    order.profiles ||
    order.profile ||
    {};

  const items =
    order.order_items ||
    order.items ||
    [];

  const orderNumber =
    order.order_number ||
    order.orderNumber ||
    null;

  const totalAmount =
    Number(
      order.total_amount ??
        order.total ??
        order.amount ??
        0
    );

  return {
    ...order,

    id:
      order.id ||
      null,

    order_number:
      orderNumber,

    orderNumber,

    user_id:
      order.user_id ||
      profile.id ||
      "",

    userName:
      order.userName ||
      order.user_name ||
      profile.full_name ||
      profile.name ||
      profile.email ||
      "User",

    userEmail:
      order.userEmail ||
      order.user_email ||
      profile.email ||
      "",

    subtotal:
      Number(
        order.subtotal ||
          0
      ),

    discount_amount:
      Number(
        order.discount_amount ||
          order.discount ||
          0
      ),

    delivery_fee:
      Number(
        order.delivery_fee ||
          order.shipping ||
          0
      ),

    total_amount:
      totalAmount,

    total:
      totalAmount,

    order_status:
      order.order_status ||
      order.status ||
      "placed",

    status:
      order.order_status ||
      order.status ||
      "placed",

    payment_method:
      order.payment_method ||
      order.paymentMethod ||
      "cod",

    payment_status:
      order.payment_status ||
      order.paymentStatus ||
      "pending",

    address:
      order.address ||
      order.delivery_address ||
      order.shipping_address ||
      {},

    delivery_address:
      order.delivery_address ||
      order.address ||
      order.shipping_address ||
      {},

    delivery_instructions:
      order.delivery_instructions ||
      "",

    notes:
      order.notes ||
      "",

    created_at:
      order.created_at ||
      order.createdAt ||
      null,

    updated_at:
      order.updated_at ||
      null,

    order_items:
      items.map(
        normalizeOrderItem
      ),

    items:
      items.map(
        normalizeOrderItem
      ),
  };
};

/* =========================================================
   ORDERS HOOK
========================================================= */

const useOrders = (options = {}) => {
  const {
    autoFetch = true,
  } = options;

  const {
    user,
    isAuthenticated,
    authLoading,
  } = useAuth();

  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    ordersLoading,
    setOrdersLoading,
  ] = useState(autoFetch);

  const [
    ordersError,
    setOrdersError,
  ] = useState("");

  /* =======================================================
     FETCH USER ORDERS
  ======================================================= */

  const fetchOrders =
    useCallback(
      async () => {
        if (authLoading) {
          return [];
        }

        if (
          !isAuthenticated ||
          !user?.id
        ) {
          setOrders([]);
          setOrdersLoading(false);

          return [];
        }

        try {
          setOrdersLoading(true);
          setOrdersError("");

          const response =
            await getUserOrders(
              user.id
            );

          const list =
            Array.isArray(response)
              ? response
              : Array.isArray(
                    response?.data
                  )
                ? response.data
                : Array.isArray(
                      response?.orders
                    )
                  ? response.orders
                  : [];

          const normalizedOrders =
            list.map(
              normalizeOrder
            );

          setOrders(
            normalizedOrders
          );

          return normalizedOrders;
        } catch (error) {
          console.error(
            "Failed to fetch orders:",
            error
          );

          setOrdersError(
            error?.message ||
              "Failed to fetch orders."
          );

          setOrders([]);

          return [];
        } finally {
          setOrdersLoading(false);
        }
      },
      [
        authLoading,
        isAuthenticated,
        user?.id,
      ]
    );

  /* =======================================================
     FETCH ONE ORDER
  ======================================================= */

  const fetchOrderById =
    useCallback(
      async (
        orderId
      ) => {
        if (!orderId) {
          throw new Error(
            "Order ID is required."
          );
        }

        const response =
          await getOrderById(
            orderId
          );

        const rawOrder =
          response?.order ||
          response?.data?.order ||
          response?.data ||
          response;

        return normalizeOrder(
          rawOrder
        );
      },
      []
    );

  /* =======================================================
     PLACE ORDER

     IMPORTANT FIX:

     orderApi.createOrder() returns:

     {
       order: {...},
       orderItems: [...],
       orderNumber: "...",
       reused: false
     }

     So we MUST extract response.order.
  ======================================================= */

  const placeOrder =
    useCallback(
      async (
        payload
      ) => {
        if (
          !isAuthenticated ||
          !user?.id
        ) {
          throw new Error(
            "Please sign in to place an order."
          );
        }

        const finalPayload = {
          ...payload,

          user_id:
            payload?.user_id ||
            user.id,

          paymentMethod:
            "cod",

          payment_method:
            "cod",
        };

        const response =
          await createOrder(
            finalPayload
          );

        console.log(
          "createOrder response:",
          response
        );

        /* =================================================
           EXTRACT ACTUAL ORDER
        ================================================= */

        const rawOrder =
          response?.order ||
          response?.data?.order ||
          null;

        if (
          !rawOrder?.id
        ) {
          console.error(
            "Invalid createOrder response:",
            response
          );

          throw new Error(
            "Order was created but the order details could not be loaded."
          );
        }

        /* =================================================
           ATTACH RETURNED ORDER ITEMS

           createOrder returns orderItems separately.
        ================================================= */

        const returnedItems =
          response?.orderItems ||
          response?.order_items ||
          response?.data?.orderItems ||
          response?.data?.order_items ||
          rawOrder.order_items ||
          rawOrder.items ||
          [];

        const completeOrder = {
          ...rawOrder,

          order_number:
            rawOrder.order_number ||
            response?.orderNumber ||
            rawOrder.orderNumber ||
            null,

          orderNumber:
            rawOrder.order_number ||
            response?.orderNumber ||
            rawOrder.orderNumber ||
            null,

          order_items:
            returnedItems,

          items:
            returnedItems,
        };

        const normalized =
          normalizeOrder(
            completeOrder
          );

        /* =================================================
           UPDATE LOCAL ORDERS IMMEDIATELY

           This prevents frontend order count from
           waiting for another fetch.
        ================================================= */

        setOrders(
          (previous) => {
            const alreadyExists =
              previous.some(
                (existingOrder) =>
                  String(
                    existingOrder.id
                  ) ===
                  String(
                    normalized.id
                  )
              );

            if (
              alreadyExists
            ) {
              return previous.map(
                (
                  existingOrder
                ) =>
                  String(
                    existingOrder.id
                  ) ===
                  String(
                    normalized.id
                  )
                    ? normalized
                    : existingOrder
              );
            }

            return [
              normalized,
              ...previous,
            ];
          }
        );

        /*
          Refresh from DB as well, but the returned order
          does not depend on this request succeeding.
        */

        try {
          await fetchOrders();
        } catch (error) {
          console.warn(
            "Order created but order-list refresh failed:",
            error
          );
        }

        return normalized;
      },
      [
        fetchOrders,
        isAuthenticated,
        user?.id,
      ]
    );

  /* =======================================================
     CANCEL ORDER
  ======================================================= */

  const cancelUserOrder =
    useCallback(
      async (
        orderId
      ) => {
        if (!orderId) {
          throw new Error(
            "Order ID is required."
          );
        }

        const response =
          await cancelOrder(
            orderId
          );

        const rawOrder =
          response?.order ||
          response?.data?.order ||
          response?.data ||
          response;

        const normalized =
          rawOrder
            ? normalizeOrder(
                rawOrder
              )
            : null;

        await fetchOrders();

        return normalized;
      },
      [
        fetchOrders,
      ]
    );

  /* =======================================================
     AUTO FETCH
  ======================================================= */

  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [
    autoFetch,
    fetchOrders,
  ]);

  /* =======================================================
     ORDER STATS
  ======================================================= */

  const orderStats =
    useMemo(() => {
      const totalOrders =
        orders.length;

      const totalSpent =
        orders.reduce(
          (
            sum,
            order
          ) =>
            sum +
            Number(
              order.total ||
                0
            ),
          0
        );

      const activeOrders =
        orders.filter(
          (order) =>
            [
              "placed",
              "confirmed",
              "packing",
              "out_for_delivery",
            ].includes(
              order.status
            )
        ).length;

      const deliveredOrders =
        orders.filter(
          (order) =>
            order.status ===
            "delivered"
        ).length;

      const cancelledOrders =
        orders.filter(
          (order) =>
            order.status ===
            "cancelled"
        ).length;

      return {
        totalOrders,
        totalSpent,
        activeOrders,
        deliveredOrders,
        cancelledOrders,
      };
    }, [
      orders,
    ]);

  return {
    orders,
    ordersLoading,
    ordersError,
    orderStats,

    fetchOrders,
    fetchOrderById,
    placeOrder,
    cancelUserOrder,

    setOrders,
  };
};

export default useOrders;
export {
  useOrders,
};