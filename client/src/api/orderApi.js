import { supabase } from "./supabaseClient.js";
import { getCart } from "./cartApi.js";

/* =========================================================
   CONFIG
========================================================= */

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL;

const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    "Missing VITE_SUPABASE_URL"
  );
}

if (!SUPABASE_KEY) {
  throw new Error(
    "Missing VITE_SUPABASE_ANON_KEY"
  );
}

/* =========================================================
   CONSTANTS
========================================================= */

const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "packing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

let createOrderInProgress = false;

/* =========================================================
   JWT
========================================================= */

const decodeJwtPayload = (
  token
) => {
  if (
    !token ||
    !token.includes(".")
  ) {
    return null;
  }

  try {
    let base64 =
      token
        .split(".")[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    while (
      base64.length % 4
    ) {
      base64 += "=";
    }

    return JSON.parse(
      atob(base64)
    );
  } catch (error) {
    console.error(
      "JWT decode error:",
      error
    );

    return null;
  }
};

/* =========================================================
   SESSION
========================================================= */

const saveSessionTokens = (
  session
) => {
  if (
    !session?.access_token
  ) {
    return;
  }

  localStorage.setItem(
    "echoo_access_token",
    session.access_token
  );

  if (
    session.refresh_token
  ) {
    localStorage.setItem(
      "echoo_refresh_token",
      session.refresh_token
    );
  }
};

const getFreshAccessToken =
  async () => {
    const storedToken =
      localStorage.getItem(
        "echoo_access_token"
      );

    const payload =
      decodeJwtPayload(
        storedToken
      );

    if (
      storedToken &&
      payload?.exp &&
      payload.exp * 1000 >
        Date.now() + 15000
    ) {
      return storedToken;
    }

    try {
      const { data } =
        await supabase.auth.getSession();

      if (
        data?.session?.access_token
      ) {
        saveSessionTokens(
          data.session
        );

        return data.session
          .access_token;
      }
    } catch (error) {
      console.warn(
        "Session read failed:",
        error
      );
    }

    try {
      const { data } =
        await supabase.auth.refreshSession();

      if (
        data?.session?.access_token
      ) {
        saveSessionTokens(
          data.session
        );

        return data.session
          .access_token;
      }
    } catch (error) {
      console.warn(
        "Session refresh failed:",
        error
      );
    }

    return null;
  };

/* =========================================================
   ERROR
========================================================= */

const parseError = (
  text,
  fallback
) => {
  if (!text) {
    return {
      message: fallback,
    };
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
};

/* =========================================================
   REST FETCH
========================================================= */

const restFetch = async (
  path,
  options = {},
  retry = true
) => {
  const token =
    await getFreshAccessToken();

  if (!token) {
    throw new Error(
      "Please login first"
    );
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/${path}`,
      {
        method:
          options.method ||
          "GET",

        headers: {
          apikey:
            SUPABASE_KEY,

          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",

          Prefer:
            options.prefer ||
            "return=representation",

          ...(options.headers ||
            {}),
        },

        body:
          options.body !==
          undefined
            ? JSON.stringify(
                options.body
              )
            : undefined,
      }
    );

  const text =
    await response.text();

  if (!response.ok) {
    const parsed =
      parseError(
        text,
        "Order request failed"
      );

    const message =
      String(
        parsed?.message ||
          ""
      );

    const jwtExpired =
      response.status === 401 ||
      parsed?.code ===
        "PGRST303" ||
      message
        .toLowerCase()
        .includes(
          "jwt expired"
        );

    if (
      jwtExpired &&
      retry
    ) {
      try {
        const { data } =
          await supabase.auth.refreshSession();

        if (
          data?.session
        ) {
          saveSessionTokens(
            data.session
          );
        }
      } catch (
        refreshError
      ) {
        console.error(
          "Session refresh failed:",
          refreshError
        );
      }

      return restFetch(
        path,
        options,
        false
      );
    }

    console.error(
      "Order REST error:",
      response.status,
      parsed
    );

    const error =
      new Error(
        parsed?.message ||
          text ||
          "Order request failed"
      );

    error.status =
      response.status;

    error.code =
      parsed?.code;

    error.details =
      parsed?.details;

    error.hint =
      parsed?.hint;

    error.raw =
      parsed;

    throw error;
  }

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(
      text
    );
  } catch {
    return text;
  }
};

/* =========================================================
   HELPERS
========================================================= */

const encodeSelect = (
  select
) =>
  encodeURIComponent(
    String(
      select || ""
    ).replace(
      /\s+/g,
      ""
    )
  );

const requireUser =
  async () => {
    const token =
      await getFreshAccessToken();

    if (!token) {
      throw new Error(
        "Please login first"
      );
    }

    const payload =
      decodeJwtPayload(
        token
      );

    if (!payload?.sub) {
      throw new Error(
        "Session invalid. Please login again."
      );
    }

    return {
      id:
        payload.sub,

      email:
        payload.email ||
        "",
    };
  };

/* =========================================================
   STATUS
========================================================= */

const normalizeOrderStatus = (
  status
) => {
  const value =
    String(
      status ||
        "placed"
    )
      .trim()
      .toLowerCase();

  if (
    value === "pending"
  ) {
    return "placed";
  }

  if (
    value === "processing"
  ) {
    return "packing";
  }

  if (
    value === "shipped"
  ) {
    return "out_for_delivery";
  }

  if (
    value === "completed"
  ) {
    return "delivered";
  }

  return ORDER_STATUSES.includes(
    value
  )
    ? value
    : "placed";
};

/* =========================================================
   ORDER SELECT
========================================================= */

const ORDER_SELECT = `
  *,
  order_items(
    *,
    products(
      id,
      category_id,
      name,
      slug,
      brand,
      price,
      discount_price,
      stock,
      quantity,
      unit,
      pack_size,
      rating,
      currency,
      is_active,
      categories(
        id,
        name,
        slug
      ),
      product_images(
        id,
        product_id,
        image_url,
        is_primary,
        sort_order
      )
    )
  )
`;

/* =========================================================
   PRODUCT
========================================================= */

const getProductId = (
  item = {}
) => {
  const product =
    item.products ||
    item.product ||
    {};

  return (
    item.product_id ||
    item.productId ||
    product.id ||
    null
  );
};

const normalizeImages = (
  images = []
) => {
  if (
    !Array.isArray(
      images
    )
  ) {
    return [];
  }

  return [
    ...images,
  ].sort(
    (a, b) => {
      if (
        a?.is_primary &&
        !b?.is_primary
      ) {
        return -1;
      }

      if (
        !a?.is_primary &&
        b?.is_primary
      ) {
        return 1;
      }

      return (
        Number(
          a?.sort_order ||
            0
        ) -
        Number(
          b?.sort_order ||
            0
        )
      );
    }
  );
};

/* =========================================================
   NORMALIZE ORDER ITEM
========================================================= */

const normalizeOrderItem = (
  item = {}
) => {
  const product =
    item.products ||
    item.product ||
    {};

  const images =
    normalizeImages(
      product.product_images ||
        []
    );

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

  return {
    ...item,

    product_id:
      item.product_id ||
      product.id ||
      null,

    product_name:
      item.product_name ||
      product.name ||
      "Product",

    quantity,

    unit_price:
      unitPrice,

    price:
      unitPrice,

    unitPrice,

    total_price:
      totalPrice,

    totalPrice,

    itemTotal:
      totalPrice,

    products: {
      ...product,

      product_images:
        images,

      images,

      image:
        images[0]
          ?.image_url ||
        "",

      price:
        Number(
          product.price ||
            0
        ),

      discount_price:
        product.discount_price ==
        null
          ? null
          : Number(
              product.discount_price
            ),

      stock:
        Number(
          product.stock ||
            0
        ),

      quantity:
        product.quantity ==
        null
          ? null
          : Number(
              product.quantity
            ),

      packSize:
        product.pack_size ||
        "",

      categoryName:
        product.categories
          ?.name ||
        "",
    },
  };
};

/* =========================================================
   NORMALIZE ORDER
========================================================= */

export const normalizeOrder = (
  order = {}
) => {
  const orderItems =
    Array.isArray(
      order.order_items
    )
      ? order.order_items.map(
          normalizeOrderItem
        )
      : [];

  const orderNumber =
    order.order_number ||
    order.orderNumber ||
    null;

  return {
    ...order,

    order_number:
      orderNumber,

    orderNumber,

    total_amount:
      Number(
        order.total_amount ||
          0
      ),

    total:
      Number(
        order.total_amount ||
          0
      ),

    payment_method:
      order.payment_method ||
      "cod",

    paymentMethod:
      order.payment_method ||
      "cod",

    payment_status:
      order.payment_status ||
      "pending",

    order_status:
      normalizeOrderStatus(
        order.order_status ||
          order.status
      ),

    status:
      normalizeOrderStatus(
        order.order_status ||
          order.status
      ),

    address:
      order.address ||
      order.delivery_address ||
      null,

    delivery_address:
      order.delivery_address ||
      order.address ||
      null,

    order_items:
      orderItems,

    items:
      orderItems,
  };
};

/* =========================================================
   CART AGGREGATION
========================================================= */

const aggregateRequestedItems = (
  items = []
) => {
  const map =
    new Map();

  for (
    const item of items
  ) {
    const productId =
      getProductId(
        item
      );

    if (!productId) {
      throw new Error(
        "A cart product is missing its product ID"
      );
    }

    const quantity =
      Number(
        item.quantity ||
          1
      );

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      throw new Error(
        "Invalid product quantity"
      );
    }

    const key =
      String(
        productId
      );

    const existing =
      map.get(
        key
      );

    if (existing) {
      existing.quantity +=
        quantity;
    } else {
      map.set(
        key,
        {
          productId,
          quantity,
        }
      );
    }
  }

  return [
    ...map.values(),
  ];
};

/* =========================================================
   FETCH LIVE PRODUCTS
========================================================= */

const getFreshOrderProducts =
  async (
    requestedItems
  ) => {
    const productIds =
      requestedItems.map(
        (item) =>
          item.productId
      );

    if (
      !productIds.length
    ) {
      return [];
    }

    const ids =
      productIds
        .map(
          (id) =>
            encodeURIComponent(
              id
            )
        )
        .join(",");

    const select =
      encodeSelect(`
        id,
        name,
        price,
        discount_price,
        stock,
        is_active,
        pack_size,
        unit
      `);

    const products =
      await restFetch(
        `products?select=${select}&id=in.(${ids})`
      );

    return Array.isArray(
      products
    )
      ? products
      : [];
  };

/* =========================================================
   VERIFY ORDER
========================================================= */

const verifyAndBuildOrder =
  async (
    items = []
  ) => {
    const requestedItems =
      aggregateRequestedItems(
        items
      );

    const products =
      await getFreshOrderProducts(
        requestedItems
      );

    const productMap =
      new Map(
        products.map(
          (product) => [
            String(
              product.id
            ),
            product,
          ]
        )
      );

    const orderItems =
      [];

    let totalAmount =
      0;

    for (
      const requested of
        requestedItems
    ) {
      const product =
        productMap.get(
          String(
            requested.productId
          )
        );

      if (!product) {
        throw new Error(
          "One of the products in your cart no longer exists."
        );
      }

      if (
        product.is_active ===
        false
      ) {
        throw new Error(
          `${product.name} is currently unavailable.`
        );
      }

      const stock =
        Number(
          product.stock ||
            0
        );

      if (
        stock <
        requested.quantity
      ) {
        throw new Error(
          `${product.name} has only ${stock} available.`
        );
      }

      const unitPrice =
        product.discount_price !==
          null &&
        product.discount_price !==
          undefined
          ? Number(
              product.discount_price
            )
          : Number(
              product.price ||
                0
            );

      if (
        !Number.isFinite(
          unitPrice
        ) ||
        unitPrice < 0
      ) {
        throw new Error(
          `Invalid price for ${product.name}.`
        );
      }

      const totalPrice =
        Number(
          (
            unitPrice *
            requested.quantity
          ).toFixed(
            2
          )
        );

      totalAmount +=
        totalPrice;

      orderItems.push({
        product_id:
          product.id,

        product_name:
          product.name,

        quantity:
          requested.quantity,

        unit_price:
          unitPrice,

        total_price:
          totalPrice,
      });
    }

    return {
      orderItems,

      totalAmount:
        Number(
          totalAmount.toFixed(
            2
          )
        ),
    };
  };

/* =========================================================
   SIGNATURE
========================================================= */

const getItemSignature = (
  items = []
) =>
  items
    .map(
      (item) => ({
        productId:
          getProductId(
            item
          ) ||
          item.product_id,

        quantity:
          Number(
            item.quantity ||
              1
          ),
      })
    )
    .sort(
      (a, b) =>
        String(
          a.productId
        ).localeCompare(
          String(
            b.productId
          )
        )
    )
    .map(
      (item) =>
        `${item.productId}:${item.quantity}`
    )
    .join("|");

/* =========================================================
   FETCH ORDER ITEMS
========================================================= */

const getOrderItemsByOrderId =
  async (
    orderId
  ) => {
    if (!orderId) {
      return [];
    }

    const data =
      await restFetch(
        `order_items?select=*&order_id=eq.${encodeURIComponent(
          orderId
        )}`
      );

    return Array.isArray(
      data
    )
      ? data
      : [];
  };

/* =========================================================
   FETCH SINGLE ORDER HEADER
========================================================= */

const getOrderHeaderById =
  async ({
    orderId,
    userId,
  }) => {
    if (
      !orderId ||
      !userId
    ) {
      return null;
    }

    const data =
      await restFetch(
        `orders?select=*` +
          `&id=eq.${encodeURIComponent(
            orderId
          )}` +
          `&user_id=eq.${encodeURIComponent(
            userId
          )}` +
          `&limit=1`
      );

    return data?.[0] ||
      null;
  };

/* =========================================================
   RECOVER NEWLY INSERTED ORDER

   This is the important fix.

   If POST /orders succeeds in DB but PostgREST does not
   return the inserted row, fetch that row again.
========================================================= */

const recoverCreatedOrder =
  async ({
    userId,
    totalAmount,
    createdAfter,
  }) => {
    const data =
      await restFetch(
        `orders?select=*` +
          `&user_id=eq.${encodeURIComponent(
            userId
          )}` +
          `&total_amount=eq.${encodeURIComponent(
            totalAmount
          )}` +
          `&payment_method=eq.cod` +
          `&order_status=eq.placed` +
          `&created_at=gte.${encodeURIComponent(
            createdAfter
          )}` +
          `&order=created_at.desc` +
          `&limit=1`
      );

    return data?.[0] ||
      null;
  };

/* =========================================================
   DUPLICATE CHECK

   Only reuse an order if it already contains the SAME
   order_items. Header-only failed test orders are ignored.
========================================================= */

const findRecentMatchingOrder =
  async ({
    userId,
    items,
    withinMinutes = 2,
  }) => {
    const since =
      new Date(
        Date.now() -
          withinMinutes *
            60 *
            1000
      ).toISOString();

    const recentOrders =
      await restFetch(
        `orders?select=*` +
          `&user_id=eq.${encodeURIComponent(
            userId
          )}` +
          `&payment_method=eq.cod` +
          `&order_status=eq.placed` +
          `&created_at=gte.${encodeURIComponent(
            since
          )}` +
          `&order=created_at.desc` +
          `&limit=5`
      );

    if (
      !Array.isArray(
        recentOrders
      )
    ) {
      return null;
    }

    const requestedSignature =
      getItemSignature(
        items
      );

    for (
      const order of
        recentOrders
    ) {
      const orderItems =
        await getOrderItemsByOrderId(
          order.id
        );

      /*
        Header-only failed orders are ignored.
      */
      if (
        !orderItems.length
      ) {
        continue;
      }

      if (
        getItemSignature(
          orderItems
        ) ===
        requestedSignature
      ) {
        return {
          order,
          orderItems,
        };
      }
    }

    return null;
  };

/* =========================================================
   CREATE FROM CART
========================================================= */

export const createOrderFromCart =
  async ({
    address,
    notes = "",
  } = {}) => {
    await requireUser();

    const cartItems =
      await getCart();

    if (
      !cartItems.length
    ) {
      throw new Error(
        "Cart is empty"
      );
    }

    return createOrder({
      items:
        cartItems,

      address,

      paymentMethod:
        "cod",

      notes,
    });
  };

/* =========================================================
   CREATE ORDER
========================================================= */

export const createOrder =
  async ({
    items = [],
    address,
    totalAmount: _clientTotal,
    paymentMethod = "cod",
    notes = "",
  }) => {
    if (
      createOrderInProgress
    ) {
      throw new Error(
        "Order is already being created. Please wait."
      );
    }

    if (
      String(
        paymentMethod ||
          "cod"
      ).toLowerCase() !==
      "cod"
    ) {
      throw new Error(
        "Only Cash on Delivery is available."
      );
    }

    if (
      !Array.isArray(
        items
      ) ||
      !items.length
    ) {
      throw new Error(
        "Order items are required"
      );
    }

    if (!address) {
      throw new Error(
        "Delivery address is required"
      );
    }

    createOrderInProgress =
      true;

    let createdOrderId =
      null;

    try {
      const user =
        await requireUser();

      const verified =
        await verifyAndBuildOrder(
          items
        );

      /* =====================================================
         CHECK EXISTING COMPLETE ORDER
      ===================================================== */

      const duplicate =
        await findRecentMatchingOrder({
          userId:
            user.id,

          items:
            verified.orderItems,
        });

      if (
        duplicate?.order?.id
      ) {
        const normalized =
          normalizeOrder(
            duplicate.order
          );

        return {
          order:
            normalized,

          orderNumber:
            normalized.order_number ||
            normalized.id,

          orderItems:
            duplicate.orderItems.map(
              normalizeOrderItem
            ),

          reused:
            true,
        };
      }

      /* =====================================================
         ADDRESS
      ===================================================== */

      const deliveryAddress =
        typeof address ===
          "object" &&
        address !== null &&
        !Array.isArray(
          address
        )
          ? {
              ...address,
            }
          : {
              address:
                String(
                  address ||
                    ""
                ).trim(),

              address_line_1:
                String(
                  address ||
                    ""
                ).trim(),
            };

      /*
        Start timestamp slightly before POST so recovery
        can safely find the row just inserted.
      */
      const createdAfter =
        new Date(
          Date.now() -
            5000
        ).toISOString();

      /* =====================================================
         INSERT ORDER HEADER
      ===================================================== */

      const insertedOrder =
        await restFetch(
          "orders",
          {
            method:
              "POST",

            prefer:
              "return=representation",

            body: {
              user_id:
                user.id,

              total_amount:
                verified.totalAmount,

              payment_method:
                "cod",

              payment_status:
                "pending",

              order_status:
                "placed",

              address:
                deliveryAddress,

              delivery_address:
                deliveryAddress,

              notes:
                String(
                  notes ||
                    ""
                ).trim(),
            },
          }
        );

      /*
        Normally PostgREST returns:
        [
          {
            id,
            order_number,
            ...
          }
        ]

        But if it doesn't, recover the row.
      */
      let order =
        Array.isArray(
          insertedOrder
        )
          ? insertedOrder[0]
          : insertedOrder;

      /* =====================================================
         RECOVERY
      ===================================================== */

      if (
        !order?.id
      ) {
        console.warn(
          "Order POST returned no row. Recovering created order..."
        );

        order =
          await recoverCreatedOrder({
            userId:
              user.id,

            totalAmount:
              verified.totalAmount,

            createdAfter,
          });
      }

      if (
        !order?.id
      ) {
        throw new Error(
          "Order was inserted but could not be loaded. Please refresh your orders before trying again."
        );
      }

      createdOrderId =
        order.id;

      /* =====================================================
         CHECK WHETHER ITEMS ALREADY EXIST

         Protects against retries.
      ===================================================== */

      const existingItems =
        await getOrderItemsByOrderId(
          order.id
        );

      let createdItems =
        existingItems;

      if (
        !existingItems.length
      ) {
        /* ===================================================
           INSERT ORDER ITEMS

           Matches EXACT Supabase schema:
           order_id
           product_id
           product_name
           quantity
           unit_price
           total_price
        =================================================== */

        const rows =
          verified.orderItems.map(
            (item) => ({
              order_id:
                order.id,

              product_id:
                item.product_id,

              product_name:
                item.product_name,

              quantity:
                item.quantity,

              unit_price:
                item.unit_price,

              total_price:
                item.total_price,
            })
          );

        const insertedItems =
          await restFetch(
            "order_items",
            {
              method:
                "POST",

              prefer:
                "return=representation",

              body:
                rows,
            }
          );

        createdItems =
          Array.isArray(
            insertedItems
          )
            ? insertedItems
            : [];
      }

      /* =====================================================
         FETCH FINAL ORDER AGAIN

         Guarantees latest order_number is available.
      ===================================================== */

      const finalOrder =
        (
          await getOrderHeaderById({
            orderId:
              order.id,

            userId:
              user.id,
          })
        ) ||
        order;

      const normalizedOrder =
        normalizeOrder(
          finalOrder
        );

      return {
        order:
          normalizedOrder,

        orderNumber:
          normalizedOrder
            .order_number ||
          normalizedOrder.id,

        orderItems:
          createdItems.map(
            normalizeOrderItem
          ),

        reused:
          false,
      };
    } catch (error) {
      /*
        Only delete an incomplete order created during
        THIS request.

        Never delete an order if it already has items.
      */

      if (
        createdOrderId
      ) {
        try {
          const existingItems =
            await getOrderItemsByOrderId(
              createdOrderId
            );

          if (
            !existingItems.length
          ) {
            const user =
              await requireUser();

            await restFetch(
              `orders?` +
                `id=eq.${encodeURIComponent(
                  createdOrderId
                )}` +
                `&user_id=eq.${encodeURIComponent(
                  user.id
                )}`,
              {
                method:
                  "DELETE",

                prefer:
                  "return=minimal",
              }
            );
          }
        } catch (
          cleanupError
        ) {
          console.error(
            "Incomplete order cleanup failed:",
            cleanupError
          );
        }
      }

      throw error;
    } finally {
      createOrderInProgress =
        false;
    }
  };

/* =========================================================
   GET MY ORDERS
========================================================= */

export const getMyOrders =
  async () => {
    const user =
      await requireUser();

    const select =
      encodeSelect(
        ORDER_SELECT
      );

    const data =
      await restFetch(
        `orders?select=${select}` +
          `&user_id=eq.${encodeURIComponent(
            user.id
          )}` +
          `&order=created_at.desc`
      );

    return (
      Array.isArray(
        data
      )
        ? data
        : []
    ).map(
      normalizeOrder
    );
  };

/* =========================================================
   GET USER ORDERS
========================================================= */

export const getUserOrders =
  async (
    userId
  ) => {
    const user =
      await requireUser();

    if (!userId) {
      return [];
    }

    if (
      String(
        user.id
      ) !==
      String(
        userId
      )
    ) {
      throw new Error(
        "You cannot access another user's orders."
      );
    }

    return getMyOrders();
  };

/* =========================================================
   GET ORDER
========================================================= */

export const getOrderById =
  async (
    orderId
  ) => {
    const user =
      await requireUser();

    if (!orderId) {
      throw new Error(
        "Order ID is required"
      );
    }

    const select =
      encodeSelect(
        ORDER_SELECT
      );

    const data =
      await restFetch(
        `orders?select=${select}` +
          `&id=eq.${encodeURIComponent(
            orderId
          )}` +
          `&user_id=eq.${encodeURIComponent(
            user.id
          )}` +
          `&limit=1`
      );

    if (
      !data?.[0]
    ) {
      throw new Error(
        "Order not found"
      );
    }

    return normalizeOrder(
      data[0]
    );
  };

/* =========================================================
   CANCEL ORDER
========================================================= */

export const cancelOrder =
  async (
    orderId
  ) => {
    const user =
      await requireUser();

    if (!orderId) {
      throw new Error(
        "Order ID is required"
      );
    }

    const current =
      await restFetch(
        `orders?select=id,order_status` +
          `&id=eq.${encodeURIComponent(
            orderId
          )}` +
          `&user_id=eq.${encodeURIComponent(
            user.id
          )}` +
          `&limit=1`
      );

    const order =
      current?.[0];

    if (!order) {
      throw new Error(
        "Order not found"
      );
    }

    const currentStatus =
      normalizeOrderStatus(
        order.order_status
      );

    if (
      currentStatus ===
      "cancelled"
    ) {
      return normalizeOrder(
        order
      );
    }

    if (
      ![
        "placed",
        "confirmed",
      ].includes(
        currentStatus
      )
    ) {
      throw new Error(
        "This order can no longer be cancelled."
      );
    }

    const data =
      await restFetch(
        `orders?` +
          `id=eq.${encodeURIComponent(
            orderId
          )}` +
          `&user_id=eq.${encodeURIComponent(
            user.id
          )}`,
        {
          method:
            "PATCH",

          body: {
            order_status:
              "cancelled",

            updated_at:
              new Date()
                .toISOString(),
          },
        }
      );

    return data?.[0]
      ? normalizeOrder(
          data[0]
        )
      : null;
  };

/* =========================================================
   SUMMARY
========================================================= */

export const getOrderSummary = (
  order
) => {
  if (!order) {
    return {
      totalItems:
        0,

      subtotal:
        0,

      totalAmount:
        0,
    };
  }

  const items =
    order.order_items ||
    order.items ||
    [];

  const totalItems =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.quantity ||
            0
        ),
      0
    );

  const subtotal =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.total_price ??
            item.totalPrice ??
            (
              Number(
                item.unit_price ??
                  item.price ??
                  0
              ) *
              Number(
                item.quantity ||
                  1
              )
            )
        ),
      0
    );

  return {
    totalItems,

    subtotal,

    totalAmount:
      Number(
        order.total_amount ??
          order.total ??
          subtotal
      ),
  };
};

/* =========================================================
   COMPATIBILITY
========================================================= */

export const getOrders =
  getMyOrders;

export const getOrder =
  getOrderById;