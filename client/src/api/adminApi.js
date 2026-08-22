/*
  adminApi.js

  Grocery Voice Shopping Assistant
  Admin-side Supabase REST API.

  Handles:
  - Users
  - Grocery products
  - Product image URLs
  - Orders
  - Dashboard data

  Important:
  - roles are lowercase: "user" / "admin"
  - products use category_id
  - products can contain product_group_key
  - product visibility uses is_active
  - stock = 0 means out of stock
  - payment method is COD
  - order lifecycle:
      placed
      confirmed
      packing
      out_for_delivery
      delivered
      cancelled
*/

import {
  getFrontendProductCategory,
} from "../utils/groceryCategories.js";

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

/* =========================================================
   AUTH TOKEN
========================================================= */

const getAccessToken = () =>
  localStorage.getItem(
    "echoo_access_token"
  ) || SUPABASE_KEY;

/* =========================================================
   REST HELPERS
========================================================= */

const parseErrorMessage = (
  text,
  fallback
) => {
  if (!text) {
    return fallback;
  }

  try {
    const parsed =
      JSON.parse(text);

    return (
      parsed?.message ||
      parsed?.details ||
      parsed?.hint ||
      fallback
    );
  } catch {
    return text;
  }
};

const restFetch = async (
  path,
  options = {}
) => {
  const token =
    getAccessToken();

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
    const message =
      parseErrorMessage(
        text,
        "Admin request failed"
      );

    console.error(
      "Admin REST error:",
      response.status,
      message
    );

    throw new Error(
      message
    );
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

const encodeSelect = (
  select
) =>
  encodeURIComponent(
    String(select || "")
      .replace(/\s+/g, "")
  );

const countRows = async (
  table,
  filter = ""
) => {
  const token =
    getAccessToken();

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?select=id${filter}`,
      {
        method: "HEAD",

        headers: {
          apikey:
            SUPABASE_KEY,

          Authorization:
            `Bearer ${token}`,

          Prefer:
            "count=exact",
        },
      }
    );

  if (!response.ok) {
    const text =
      await response.text();

    throw new Error(
      parseErrorMessage(
        text,
        `Count failed for ${table}`
      )
    );
  }

  const range =
    response.headers.get(
      "content-range"
    );

  return Number(
    range
      ?.split("/")
      ?.[1] || 0
  );
};

/* =========================================================
   NORMALIZERS
========================================================= */

const normalizeRole = (
  role
) =>
  String(role || "user")
    .trim()
    .toLowerCase() ===
  "admin"
    ? "admin"
    : "user";

const normalizeOrderStatus = (
  status
) => {
  const value =
    String(
      status || "placed"
    )
      .trim()
      .toLowerCase();

  if (value === "pending") {
    return "placed";
  }

  if (
    value === "processing"
  ) {
    return "packing";
  }

  if (value === "shipped") {
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
   USERS
========================================================= */

export const getAllUsers =
  async (params = {}) => {
    const queryParts = [
      "select=*",
      "order=created_at.desc",
    ];

    if (params.role) {
      queryParts.push(
        `role=eq.${encodeURIComponent(
          normalizeRole(
            params.role
          )
        )}`
      );
    }

    if (params.limit) {
      queryParts.push(
        `limit=${Number(
          params.limit
        )}`
      );
    }

    let users =
      await restFetch(
        `profiles?${queryParts.join(
          "&"
        )}`
      );

    users =
      Array.isArray(users)
        ? users
        : [];

    if (params.search) {
      const search =
        String(
          params.search
        )
          .trim()
          .toLowerCase();

      users =
        users.filter(
          (user) =>
            [
              user.email,
              user.full_name,
              user.phone,
              user.id,
            ].some(
              (value) =>
                String(
                  value || ""
                )
                  .toLowerCase()
                  .includes(search)
            )
        );
    }

    return users.map(
      (user) => ({
        ...user,

        role:
          normalizeRole(
            user.role
          ),
      })
    );
  };

export const getUserById =
  async (userId) => {
    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    const data =
      await restFetch(
        `profiles?select=*&id=eq.${encodeURIComponent(
          userId
        )}&limit=1`
      );

    const user =
      data?.[0] ||
      null;

    if (!user) {
      return null;
    }

    return {
      ...user,

      role:
        normalizeRole(
          user.role
        ),
    };
  };

export const updateUser =
  async (
    userId,
    updateData = {}
  ) => {
    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    const payload = {
      ...updateData,

      ...(updateData.role
        ? {
            role:
              normalizeRole(
                updateData.role
              ),
          }
        : {}),

      updated_at:
        new Date().toISOString(),
    };

    const data =
      await restFetch(
        `profiles?id=eq.${encodeURIComponent(
          userId
        )}`,
        {
          method: "PATCH",
          body: payload,
        }
      );

    return data?.[0] || null;
  };

export const deleteUserProfile =
  async (userId) => {
    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    await restFetch(
      `profiles?id=eq.${encodeURIComponent(
        userId
      )}`,
      {
        method: "DELETE",

        prefer:
          "return=minimal",
      }
    );

    return true;
  };

export const makeUserAdmin =
  async (userId) =>
    updateUser(
      userId,
      {
        role: "admin",
      }
    );

export const makeUserNormal =
  async (userId) =>
    updateUser(
      userId,
      {
        role: "user",
      }
    );

/* =========================================================
   ORDERS
========================================================= */

const ADMIN_ORDER_SELECT = `
  *,
  order_items(
    *,
    products(
      *,
      product_images(*),
      categories(
        id,
        name,
        slug
      )
    )
  )
`;

const attachProfilesToOrders =
  async (orders = []) => {
    if (
      !Array.isArray(
        orders
      ) ||
      !orders.length
    ) {
      return [];
    }

    const userIds = [
      ...new Set(
        orders
          .map(
            (order) =>
              order.user_id
          )
          .filter(Boolean)
      ),
    ];

    if (!userIds.length) {
      return orders.map(
        (order) => ({
          ...order,
          profiles: null,
        })
      );
    }

    const profiles =
      await restFetch(
        "profiles?select=id,email,full_name,phone,role,created_at"
      );

    const profileMap =
      new Map();

    (
      Array.isArray(
        profiles
      )
        ? profiles
        : []
    ).forEach(
      (profile) => {
        profileMap.set(
          String(
            profile.id
          ),
          {
            ...profile,

            role:
              normalizeRole(
                profile.role
              ),
          }
        );
      }
    );

    return orders.map(
      (order) => ({
        ...order,

        order_status:
          normalizeOrderStatus(
            order.order_status ||
              order.status
          ),

        profiles:
          profileMap.get(
            String(
              order.user_id
            )
          ) || null,
      })
    );
  };

export const getAllOrders =
  async (params = {}) => {
    const select =
      encodeSelect(
        ADMIN_ORDER_SELECT
      );

    const queryParts = [
      `select=${select}`,
      "order=created_at.desc",
    ];

    if (
      params.orderStatus
    ) {
      queryParts.push(
        `order_status=eq.${encodeURIComponent(
          normalizeOrderStatus(
            params.orderStatus
          )
        )}`
      );
    }

    if (
      params.paymentStatus
    ) {
      queryParts.push(
        `payment_status=eq.${encodeURIComponent(
          params.paymentStatus
        )}`
      );
    }

    if (params.userId) {
      queryParts.push(
        `user_id=eq.${encodeURIComponent(
          params.userId
        )}`
      );
    }

    if (params.limit) {
      queryParts.push(
        `limit=${Number(
          params.limit
        )}`
      );
    }

    const orders =
      await restFetch(
        `orders?${queryParts.join(
          "&"
        )}`
      );

    return attachProfilesToOrders(
      Array.isArray(orders)
        ? orders
        : []
    );
  };

export const getAdminOrderById =
  async (orderId) => {
    if (!orderId) {
      throw new Error(
        "Order ID is required"
      );
    }

    const select =
      encodeSelect(
        ADMIN_ORDER_SELECT
      );

    const data =
      await restFetch(
        `orders?select=${select}&id=eq.${encodeURIComponent(
          orderId
        )}&limit=1`
      );

    const orders =
      await attachProfilesToOrders(
        Array.isArray(data)
          ? data
          : []
      );

    return (
      orders?.[0] ||
      null
    );
  };

export const updateOrderStatus =
  async (
    orderId,
    orderStatus
  ) => {
    if (!orderId) {
      throw new Error(
        "Order ID is required"
      );
    }

    const status =
      normalizeOrderStatus(
        orderStatus
      );

    if (
      !ORDER_STATUSES.includes(
        status
      )
    ) {
      throw new Error(
        "Invalid order status"
      );
    }

    const body = {
      order_status: status,

      updated_at:
        new Date().toISOString(),
    };

    const data =
      await restFetch(
        `orders?id=eq.${encodeURIComponent(
          orderId
        )}`,
        {
          method: "PATCH",
          body,
        }
      );

    return (
      data?.[0] ||
      null
    );
  };

export const updatePaymentStatus =
  async (
    orderId,
    paymentStatus
  ) => {
    if (!orderId) {
      throw new Error(
        "Order ID is required"
      );
    }

    if (!paymentStatus) {
      throw new Error(
        "Payment status is required"
      );
    }

    const data =
      await restFetch(
        `orders?id=eq.${encodeURIComponent(
          orderId
        )}`,
        {
          method: "PATCH",

          body: {
            payment_status:
              paymentStatus,

            updated_at:
              new Date().toISOString(),
          },
        }
      );

    return (
      data?.[0] ||
      null
    );
  };

export const deleteOrder =
  async (orderId) => {
    if (!orderId) {
      throw new Error(
        "Order ID is required"
      );
    }

    await restFetch(
      `orders?id=eq.${encodeURIComponent(
        orderId
      )}`,
      {
        method: "DELETE",

        prefer:
          "return=minimal",
      }
    );

    return true;
  };

/* =========================================================
   PRODUCTS
========================================================= */

const PRODUCT_SELECT = `
  *,
  categories(
    id,
    name,
    slug
  ),
  product_images(*)
`;

/* =========================================================
   ADMIN CATEGORIES
========================================================= */

const getAdminCategories =
  async () => {
    try {
      const data =
        await restFetch(
          "categories?select=id,name,slug&order=name.asc"
        );

      return Array.isArray(data)
        ? data
        : [];
    } catch (error) {
      console.error(
        "Unable to load admin categories:",
        error
      );

      return [];
    }
  };

/* =========================================================
   ATTACH / INFER PRODUCT CATEGORY

   Some old seeded products have no category_id.

   We use the same grocery classification utility as the
   customer storefront so the admin UI does not display
   everything as "Uncategorized".
========================================================= */

const attachProductCategory = (
  product,
  categoryRows = []
) => {
  if (!product) {
    return product;
  }

  /* ---------------------------------------------------------
     Existing database relation is valid.
  --------------------------------------------------------- */

  if (
    product.categories?.name
  ) {
    return {
      ...product,

      category_name:
        product.categories.name,

      category_slug:
        product.categories.slug,
    };
  }

  /* ---------------------------------------------------------
     Infer category using grocery rules.
  --------------------------------------------------------- */

  let inferred = null;

  try {
    inferred =
      getFrontendProductCategory(
        product
      );
  } catch (error) {
    console.error(
      "Unable to infer product category:",
      product?.name,
      error
    );
  }

  if (
    !inferred?.name
  ) {
    return {
      ...product,

      category_name:
        product.category_name ||
        "Uncategorized",

      category_slug:
        product.category_slug ||
        "",
    };
  }

  /* ---------------------------------------------------------
     Try to match inferred slug with real Supabase category.
  --------------------------------------------------------- */

  const databaseCategory =
    categoryRows.find(
      (category) =>
        String(
          category.slug || ""
        )
          .trim()
          .toLowerCase() ===
        String(
          inferred.slug || ""
        )
          .trim()
          .toLowerCase()
    );

  const resolvedCategory =
    databaseCategory
      ? {
          id:
            databaseCategory.id,

          name:
            databaseCategory.name,

          slug:
            databaseCategory.slug,
        }
      : {
          id: null,

          name:
            inferred.name,

          slug:
            inferred.slug ||
            "",
        };

  return {
    ...product,

    category_id:
      product.category_id ||
      resolvedCategory.id ||
      null,

    categories:
      resolvedCategory,

    category_name:
      resolvedCategory.name,

    category_slug:
      resolvedCategory.slug,
  };
};

/* =========================================================
   PRODUCT GROUP KEY
========================================================= */

const createProductGroupKey = (
  productData = {}
) => {
  const supplied =
    productData.product_group_key ||
    productData.productGroupKey;

  if (
    supplied &&
    String(supplied).trim()
  ) {
    return String(
      supplied
    ).trim();
  }

  const brand =
    String(
      productData.brand || ""
    )
      .trim()
      .toLowerCase();

  const name =
    String(
      productData.name || ""
    )
      .trim()
      .toLowerCase();

  const key =
    `${brand}-${name}`
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  return key || null;
};

/* =========================================================
   PRODUCT PAYLOAD
========================================================= */

const cleanProductPayload = (
  productData = {}
) => {
  const discountPrice =
    productData.discount_price;

  const quantity =
    productData.quantity;

  return {
    name:
      String(
        productData.name ||
          ""
      ).trim(),

    slug:
      String(
        productData.slug ||
          ""
      ).trim(),

    product_group_key:
      createProductGroupKey(
        productData
      ),

    category_id:
      productData.category_id ||
      null,

    brand:
      String(
        productData.brand ||
          ""
      ).trim(),

    description:
      String(
        productData.description ||
          ""
      ).trim(),

    short_description:
      String(
        productData.short_description ||
          productData.description ||
          ""
      ).trim(),

    price:
      Number(
        productData.price ||
          0
      ),

    discount_price:
      discountPrice ===
        "" ||
      discountPrice ===
        null ||
      discountPrice ===
        undefined
        ? null
        : Number(
            discountPrice
          ),

    stock:
      Number(
        productData.stock ||
          0
      ),

    quantity:
      quantity ===
        "" ||
      quantity ===
        null ||
      quantity ===
        undefined
        ? null
        : Number(
            quantity
          ),

    unit:
      String(
        productData.unit ||
          ""
      ).trim(),

    pack_size:
      String(
        productData.pack_size ||
          ""
      ).trim(),

    rating:
      Number(
        productData.rating ||
          0
      ),

    currency:
      productData.currency ||
      "INR",

    is_featured:
      Boolean(
        productData.is_featured
      ),

    is_active:
      productData.is_active !==
      false,

    features:
      Array.isArray(
        productData.features
      )
        ? productData.features
        : [],

    specs:
      productData.specs &&
      typeof productData.specs ===
        "object"
        ? productData.specs
        : {},

    variants:
      productData.variants &&
      typeof productData.variants ===
        "object"
        ? productData.variants
        : {},
  };
};

/* =========================================================
   GET PRODUCTS
========================================================= */

export const getAllProducts =
  async (params = {}) => {
    const select =
      encodeSelect(
        PRODUCT_SELECT
      );

    const queryParts = [
      `select=${select}`,
      "order=created_at.desc",
    ];

    if (params.brand) {
      queryParts.push(
        `brand=eq.${encodeURIComponent(
          params.brand
        )}`
      );
    }

    if (
      params.isActive !==
      undefined
    ) {
      queryParts.push(
        `is_active=eq.${Boolean(
          params.isActive
        )}`
      );
    }

    if (params.limit) {
      queryParts.push(
        `limit=${Number(
          params.limit
        )}`
      );
    }

    const [
      productsResponse,
      categoryRows,
    ] =
      await Promise.all([
        restFetch(
          `products?${queryParts.join(
            "&"
          )}`
        ),

        getAdminCategories(),
      ]);

    let products =
      Array.isArray(
        productsResponse
      )
        ? productsResponse
        : [];

    /* ---------------------------------------------------------
       Attach category display information.
    --------------------------------------------------------- */

    products =
      products.map(
        (product) =>
          attachProductCategory(
            product,
            categoryRows
          )
      );

    /* ---------------------------------------------------------
       Category filter.
    --------------------------------------------------------- */

    if (
      params.categoryId
    ) {
      products =
        products.filter(
          (product) =>
            String(
              product.category_id ||
                ""
            ) ===
            String(
              params.categoryId
            )
        );
    }

    /* ---------------------------------------------------------
       Search.
    --------------------------------------------------------- */

    if (params.search) {
      const search =
        String(
          params.search
        )
          .trim()
          .toLowerCase();

      products =
        products.filter(
          (product) => {
            const categoryName =
              product.categories
                ?.name ||
              product.category_name ||
              "";

            return [
              product.name,
              product.brand,
              categoryName,
              product.pack_size,
              product.unit,
            ].some(
              (value) =>
                String(
                  value || ""
                )
                  .toLowerCase()
                  .includes(
                    search
                  )
            );
          }
        );
    }

    return products;
  };

/* =========================================================
   PRODUCT BY ID
========================================================= */

export const getAdminProductById =
  async (productId) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    const select =
      encodeSelect(
        PRODUCT_SELECT
      );

    const [
      data,
      categoryRows,
    ] =
      await Promise.all([
        restFetch(
          `products?select=${select}&id=eq.${encodeURIComponent(
            productId
          )}&limit=1`
        ),

        getAdminCategories(),
      ]);

    const product =
      data?.[0] ||
      null;

    if (!product) {
      return null;
    }

    return attachProductCategory(
      product,
      categoryRows
    );
  };

/* =========================================================
   CREATE PRODUCT
========================================================= */

export const createAdminProduct =
  async (
    productData
  ) => {
    if (
      !String(
        productData?.name ||
          ""
      ).trim()
    ) {
      throw new Error(
        "Product name is required"
      );
    }

    if (
      Number(
        productData?.price
      ) <= 0
    ) {
      throw new Error(
        "Product price must be greater than zero"
      );
    }

    if (
      !productData?.category_id
    ) {
      throw new Error(
        "Product category is required"
      );
    }

    const cleanData =
      cleanProductPayload(
        productData
      );

    const data =
      await restFetch(
        "products",
        {
          method: "POST",

          body:
            cleanData,
        }
      );

    return Array.isArray(
      data
    )
      ? data[0] ||
          null
      : data;
  };

/* =========================================================
   UPDATE COMPLETE PRODUCT / SKU
========================================================= */

export const updateAdminProduct =
  async (
    productId,
    productData
  ) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    const cleanData = {
      ...cleanProductPayload(
        productData
      ),

      updated_at:
        new Date()
          .toISOString(),
    };

    const data =
      await restFetch(
        `products?id=eq.${encodeURIComponent(
          productId
        )}`,
        {
          method: "PATCH",

          body:
            cleanData,
        }
      );

    return (
      data?.[0] ||
      null
    );
  };

/* =========================================================
   QUICK ACTIVE / INACTIVE UPDATE

   true  = Active
   false = Inactive

   Only is_active is patched.
========================================================= */

export const updateAdminProductActive =
  async (
    productId,
    isActive
  ) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    const data =
      await restFetch(
        `products?id=eq.${encodeURIComponent(
          productId
        )}`,
        {
          method: "PATCH",

          body: {
            is_active:
              Boolean(
                isActive
              ),

            updated_at:
              new Date()
                .toISOString(),
          },
        }
      );

    return (
      data?.[0] ||
      null
    );
  };

/* =========================================================
   QUICK STOCK UPDATE

   stock = 0 => Out of Stock

   Out of Stock is derived from inventory and is not stored
   as a separate status value.
========================================================= */

export const updateAdminProductStock =
  async (
    productId,
    stock
  ) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    const safeStock =
      Number(stock);

    if (
      !Number.isFinite(
        safeStock
      ) ||
      safeStock < 0
    ) {
      throw new Error(
        "Stock must be zero or greater"
      );
    }

    const data =
      await restFetch(
        `products?id=eq.${encodeURIComponent(
          productId
        )}`,
        {
          method: "PATCH",

          body: {
            stock:
              safeStock,

            updated_at:
              new Date()
                .toISOString(),
          },
        }
      );

    return (
      data?.[0] ||
      null
    );
  };

/* =========================================================
   SET ENTIRE LOGICAL PRODUCT ACTIVE / INACTIVE

   Applies the same visibility state to all pack/SKU rows
   sharing product_group_key.
========================================================= */

export const updateAdminProductGroupActive =
  async (
    productGroupKey,
    isActive
  ) => {
    if (
      !productGroupKey
    ) {
      throw new Error(
        "Product group key is required"
      );
    }

    const data =
      await restFetch(
        `products?product_group_key=eq.${encodeURIComponent(
          productGroupKey
        )}`,
        {
          method: "PATCH",

          body: {
            is_active:
              Boolean(
                isActive
              ),

            updated_at:
              new Date()
                .toISOString(),
          },
        }
      );

    return Array.isArray(
      data
    )
      ? data
      : [];
  };

/* =========================================================
   DELETE PRODUCT / SKU
========================================================= */

export const deleteAdminProduct =
  async (productId) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    await restFetch(
      `products?id=eq.${encodeURIComponent(
        productId
      )}`,
      {
        method: "DELETE",

        prefer:
          "return=minimal",
      }
    );

    return true;
  };

/* =========================================================
   PRODUCT IMAGES
========================================================= */

export const deleteProductImagesByProductId =
  async (productId) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    await restFetch(
      `product_images?product_id=eq.${encodeURIComponent(
        productId
      )}`,
      {
        method: "DELETE",

        prefer:
          "return=minimal",
      }
    );

    return true;
  };

export const insertProductImages =
  async (
    productId,
    images = []
  ) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    const cleanedImages = [
      ...new Set(
        (
          Array.isArray(
            images
          )
            ? images
            : []
        )
          .map(
            (image) =>
              String(
                image || ""
              ).trim()
          )
          .filter(Boolean)
      ),
    ];

    if (
      !cleanedImages.length
    ) {
      return [];
    }

    const rows =
      cleanedImages.map(
        (
          imageUrl,
          index
        ) => ({
          product_id:
            productId,

          image_url:
            imageUrl,

          is_primary:
            index === 0,

          sort_order:
            index,
        })
      );

    const data =
      await restFetch(
        "product_images",
        {
          method: "POST",

          body: rows,
        }
      );

    return Array.isArray(
      data
    )
      ? data
      : [];
  };

export const syncAdminProductImages =
  async (
    productId,
    images = []
  ) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    await deleteProductImagesByProductId(
      productId
    );

    if (
      !Array.isArray(
        images
      ) ||
      !images.length
    ) {
      return [];
    }

    return insertProductImages(
      productId,
      images
    );
  };

/* =========================================================
   PAYMENTS
========================================================= */

export const getAllPayments =
  async (params = {}) => {
    const select =
      encodeSelect(`
        *,
        orders(*)
      `);

    const queryParts = [
      `select=${select}`,
      "order=created_at.desc",
    ];

    if (params.status) {
      queryParts.push(
        `status=eq.${encodeURIComponent(
          params.status
        )}`
      );
    }

    if (params.limit) {
      queryParts.push(
        `limit=${Number(
          params.limit
        )}`
      );
    }

    const data =
      await restFetch(
        `payments?${queryParts.join(
          "&"
        )}`
      );

    return Array.isArray(
      data
    )
      ? data
      : [];
  };

/* =========================================================
   DASHBOARD STATS

   Revenue = delivered COD orders.

   Product total = logical product groups, not SKU rows.
========================================================= */

export const getDashboardStats =
  async () => {
    const [
      totalUsers,
      totalOrders,
      deliveredOrders,
      currentOrders,
      productRows,
    ] =
      await Promise.all([
        countRows(
          "profiles"
        ),

        countRows(
          "orders"
        ),

        countRows(
          "orders",
          "&order_status=eq.delivered"
        ),

        Promise.resolve(0),

        restFetch(
          "products?select=id,product_group_key,name,brand"
        ),
      ]);

    /* ---------------------------------------------------------
       Count logical products.

       Prefer database product_group_key.
       Fall back to brand + name.
    --------------------------------------------------------- */

    const productGroups =
      new Set();

    (
      Array.isArray(
        productRows
      )
        ? productRows
        : []
    ).forEach(
      (product) => {
        const key =
          product.product_group_key ||
          `${String(
            product.brand || ""
          )
            .trim()
            .toLowerCase()}-${String(
            product.name || ""
          )
            .trim()
            .toLowerCase()}`
            .replace(
              /[^a-z0-9]+/g,
              "-"
            )
            .replace(
              /^-+|-+$/g,
              ""
            ) ||
          product.id;

        if (key) {
          productGroups.add(
            key
          );
        }
      }
    );

    const totalProducts =
      productGroups.size;

    const orderRows =
      await restFetch(
        "orders?select=id,total_amount,order_status"
      );

    const orders =
      Array.isArray(
        orderRows
      )
        ? orderRows
        : [];

    const totalRevenue =
      orders.reduce(
        (
          total,
          order
        ) => {
          const status =
            normalizeOrderStatus(
              order.order_status
            );

          if (
            status !==
            "delivered"
          ) {
            return total;
          }

          return (
            total +
            Number(
              order.total_amount ||
                0
            )
          );
        },
        0
      );

    const activeOrderCount =
      orders.filter(
        (order) =>
          [
            "placed",
            "confirmed",
            "packing",
            "out_for_delivery",
          ].includes(
            normalizeOrderStatus(
              order.order_status
            )
          )
      ).length;

    const cancelledOrders =
      orders.filter(
        (order) =>
          normalizeOrderStatus(
            order.order_status
          ) ===
          "cancelled"
      ).length;

    return {
      totalUsers,

      totalProducts,

      totalSkuRows:
        Array.isArray(
          productRows
        )
          ? productRows.length
          : 0,

      totalOrders,

      deliveredOrders,

      currentOrders:
        activeOrderCount ||
        currentOrders,

      cancelledOrders,

      totalRevenue,
    };
  };

/* =========================================================
   RECENT ACTIVITY
========================================================= */

export const getRecentActivity =
  async () => {
    const [
      recentOrdersRaw,
      recentUsers,
      recentProducts,
    ] =
      await Promise.all([
        restFetch(
          "orders?select=*&order=created_at.desc&limit=5"
        ),

        restFetch(
          "profiles?select=id,email,full_name,phone,role,created_at&order=created_at.desc&limit=5"
        ),

        restFetch(
          `products?select=${encodeSelect(
            PRODUCT_SELECT
          )}&order=created_at.desc&limit=5`
        ),
      ]);

    const recentOrders =
      await attachProfilesToOrders(
        Array.isArray(
          recentOrdersRaw
        )
          ? recentOrdersRaw
          : []
      );

    const categoryRows =
      await getAdminCategories();

    const recentProductRows =
      (
        Array.isArray(
          recentProducts
        )
          ? recentProducts
          : []
      ).map(
        (product) =>
          attachProductCategory(
            product,
            categoryRows
          )
      );

    return {
      recentOrders,

      recentUsers:
        Array.isArray(
          recentUsers
        )
          ? recentUsers.map(
              (user) => ({
                ...user,

                role:
                  normalizeRole(
                    user.role
                  ),
              })
            )
          : [],

      recentProducts:
        recentProductRows,
    };
  };

/* =========================================================
   OLD NAME COMPATIBILITY
========================================================= */

export const adminGetUsers =
  getAllUsers;

export const adminPatchUser =
  updateUser;

export const adminDeleteUser =
  deleteUserProfile;

export const adminGetOrders =
  getAllOrders;

export const adminPatchOrder =
  updateOrderStatus;

export const adminDeleteOrder =
  deleteOrder;

export const getUsers =
  getAllUsers;

export const getOrders =
  getAllOrders;