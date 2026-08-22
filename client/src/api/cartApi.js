import {
  getCurrentUser,
} from "./authApi.js";

import {
  supabase,
} from "./supabaseClient.js";

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
   FRESH ACCESS TOKEN
========================================================= */

const getAccessToken =
  async () => {
    try {
      const {
        data: {
          session,
        },
      } =
        await supabase.auth.getSession();

      if (
        session?.access_token
      ) {
        localStorage.setItem(
          "echoo_access_token",
          session.access_token
        );

        return session.access_token;
      }

      const {
        data: {
          session:
            refreshedSession,
        },
      } =
        await supabase.auth.refreshSession();

      if (
        refreshedSession?.access_token
      ) {
        localStorage.setItem(
          "echoo_access_token",
          refreshedSession.access_token
        );

        return refreshedSession.access_token;
      }
    } catch (error) {
      console.error(
        "Unable to get fresh session:",
        error
      );
    }

    return (
      localStorage.getItem(
        "echoo_access_token"
      ) || null
    );
  };

/* =========================================================
   ERROR
========================================================= */

const parseError = (
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

/* =========================================================
   REST
========================================================= */

const restFetch = async (
  path,
  options = {},
  retry = true
) => {
  let token =
    await getAccessToken();

  if (!token) {
    throw new Error(
      "Please login first"
    );
  }

  const makeRequest =
    async (
      accessToken
    ) => {
      return fetch(
        `${SUPABASE_URL}/rest/v1/${path}`,
        {
          method:
            options.method ||
            "GET",

          headers: {
            apikey:
              SUPABASE_KEY,

            Authorization:
              `Bearer ${accessToken}`,

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
    };

  let response =
    await makeRequest(
      token
    );

  /* =======================================================
     TOKEN EXPIRED - REFRESH ONCE
  ======================================================= */

  if (
    response.status === 401 &&
    retry
  ) {
    try {
      const {
        data: {
          session,
        },
      } =
        await supabase.auth.refreshSession();

      if (
        session?.access_token
      ) {
        token =
          session.access_token;

        localStorage.setItem(
          "echoo_access_token",
          token
        );

        response =
          await makeRequest(
            token
          );
      }
    } catch (error) {
      console.error(
        "Cart token refresh failed:",
        error
      );
    }
  }

  const text =
    await response.text();

  if (!response.ok) {
    const message =
      parseError(
        text,
        "Cart request failed"
      );

    console.error(
      "Cart REST error:",
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

/* =========================================================
   SELECT HELPER
========================================================= */

const encodeSelect = (
  select
) =>
  encodeURIComponent(
    String(select || "")
      .replace(/\s+/g, "")
  );

/* =========================================================
   CART SELECT
========================================================= */

const CART_SELECT = `
  id,
  user_id,
  product_id,
  quantity,
  created_at,
  updated_at,
  products(
    id,
    category_id,
    name,
    slug,
    brand,
    description,
    short_description,
    price,
    discount_price,
    stock,
    quantity,
    unit,
    pack_size,
    rating,
    currency,
    is_featured,
    is_active,
    features,
    specs,
    variants,
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
`;

/* =========================================================
   USER
========================================================= */

const requireUser =
  async () => {
    const user =
      await getCurrentUser();

    if (!user?.id) {
      throw new Error(
        "Please login first"
      );
    }

    return user;
  };

/* =========================================================
   NORMALIZE IMAGES
========================================================= */

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

  return [...images].sort(
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
          a?.sort_order || 0
        ) -
        Number(
          b?.sort_order || 0
        )
      );
    }
  );
};

/* =========================================================
   NORMALIZE PRODUCT
========================================================= */

const normalizeProduct = (
  product
) => {
  if (!product) {
    return null;
  }

  const images =
    normalizeImages(
      product.product_images ||
        product.images ||
        []
    );

  const category =
    product.categories ||
    null;

  const regularPrice =
    Number(
      product.price || 0
    );

  const discountPrice =
    product.discount_price ===
      null ||
    product.discount_price ===
      undefined ||
    product.discount_price ===
      ""
      ? null
      : Number(
          product.discount_price
        );

  return {
    ...product,

    category_id:
      product.category_id ||
      category?.id ||
      null,

    categoryId:
      product.category_id ||
      category?.id ||
      null,

    category:
      category?.name ||
      product.category ||
      "",

    categoryName:
      category?.name ||
      product.categoryName ||
      "",

    categorySlug:
      category?.slug ||
      product.categorySlug ||
      "",

    product_images:
      images,

    images,

    image:
      images[0]
        ?.image_url ||
      images[0]?.url ||
      "",

    price:
      regularPrice,

    discount_price:
      discountPrice,

    discountPrice,

    sellingPrice:
      discountPrice ??
      regularPrice,

    stock:
      Number(
        product.stock || 0
      ),

    quantity:
      product.quantity ==
      null
        ? null
        : Number(
            product.quantity
          ),

    unit:
      product.unit || "",

    pack_size:
      product.pack_size ||
      "",

    packSize:
      product.pack_size ||
      "",

    rating:
      Number(
        product.rating || 0
      ),

    currency:
      product.currency ||
      "INR",

    is_featured:
      Boolean(
        product.is_featured
      ),

    is_active:
      product.is_active !==
      false,

    features:
      Array.isArray(
        product.features
      )
        ? product.features
        : [],

    specs:
      product.specs &&
      typeof product.specs ===
        "object"
        ? product.specs
        : {},

    variants:
      product.variants &&
      typeof product.variants ===
        "object"
        ? product.variants
        : {},
  };
};

/* =========================================================
   NORMALIZE CART ITEM
========================================================= */

const normalizeCartItem = (
  item = {}
) => {
  const product =
    normalizeProduct(
      item.products ||
        item.product ||
        null
    );

  return {
    ...item,

    id:
      item.id || "",

    product_id:
      item.product_id ||
      product?.id ||
      "",

    quantity:
      Math.max(
        1,
        Number(
          item.quantity || 1
        )
      ),

    products:
      product,

    product:
      product,

    product_name:
      product?.name ||
      item.product_name ||
      "Product",

    product_price:
      Number(
        product
          ?.discount_price ??
          product?.price ??
          item.product_price ??
          0
      ),

    product_image:
      product?.image ||
      item.product_image ||
      "",

    pack_size:
      product?.pack_size ||
      item.pack_size ||
      "",
  };
};

/* =========================================================
   FETCH PRODUCT FALLBACK
========================================================= */

const getProductById =
  async (productId) => {
    if (!productId) {
      return null;
    }

    const select =
      encodeSelect(`
        id,
        category_id,
        name,
        slug,
        brand,
        description,
        short_description,
        price,
        discount_price,
        stock,
        quantity,
        unit,
        pack_size,
        rating,
        currency,
        is_featured,
        is_active,
        features,
        specs,
        variants,
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
      `);

    const data =
      await restFetch(
        `products?select=${select}` +
          `&id=eq.${encodeURIComponent(
            productId
          )}` +
          `&limit=1`
      );

    return data?.[0]
      ? normalizeProduct(
          data[0]
        )
      : null;
  };

/* =========================================================
   GET CART

   IMPORTANT:
   Never discard a real cart row just because the nested
   product relation was temporarily null.
========================================================= */

export const getCart =
  async () => {
    const user =
      await getCurrentUser();

    if (!user?.id) {
      return [];
    }

    const select =
      encodeSelect(
        CART_SELECT
      );

    const data =
      await restFetch(
        `cart_items?select=${select}` +
          `&user_id=eq.${encodeURIComponent(
            user.id
          )}` +
          `&order=created_at.desc`
      );

    const rows =
      Array.isArray(data)
        ? data
        : [];

    /*
      First normalize everything.
      Do NOT .filter(item => item.products)
    */

    const normalized =
      rows.map(
        normalizeCartItem
      );

    /*
      Normally nested product is returned immediately.

      If not, recover only that product instead of deleting
      the cart row and making the cart appear empty.
    */

    const recovered =
      await Promise.all(
        normalized.map(
          async (item) => {
            if (
              item.products ||
              !item.product_id
            ) {
              return item;
            }

            try {
              const product =
                await getProductById(
                  item.product_id
                );

              if (!product) {
                return item;
              }

              return normalizeCartItem({
                ...item,
                products:
                  product,
              });
            } catch (error) {
              console.error(
                "Unable to recover cart product:",
                error
              );

              return item;
            }
          }
        )
      );

    return recovered;
  };

/* =========================================================
   GET CART ITEM
========================================================= */

const getCartItemById =
  async (
    cartItemId,
    userId
  ) => {
    if (
      !cartItemId ||
      !userId
    ) {
      return null;
    }

    const select =
      encodeSelect(
        CART_SELECT
      );

    const data =
      await restFetch(
        `cart_items?select=${select}` +
          `&id=eq.${encodeURIComponent(
            cartItemId
          )}` +
          `&user_id=eq.${encodeURIComponent(
            userId
          )}` +
          `&limit=1`
      );

    if (!data?.[0]) {
      return null;
    }

    return normalizeCartItem(
      data[0]
    );
  };

/* =========================================================
   PRODUCT AVAILABILITY
========================================================= */

const getProductAvailability =
  async (productId) => {
    if (!productId) {
      return null;
    }

    const data =
      await restFetch(
        `products?select=id,name,stock,is_active` +
          `&id=eq.${encodeURIComponent(
            productId
          )}` +
          `&limit=1`
      );

    return data?.[0] ||
      null;
  };

/* =========================================================
   ADD TO CART
========================================================= */

export const addToCart =
  async ({
    productId,
    quantity = 1,
  }) => {
    const user =
      await requireUser();

    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    const quantityToAdd =
      Number(quantity);

    if (
      !Number.isFinite(
        quantityToAdd
      ) ||
      quantityToAdd <= 0
    ) {
      throw new Error(
        "Quantity must be greater than 0"
      );
    }

    /* =======================================================
       CHECK EXISTING ROW + PRODUCT STOCK
       IN ONE REQUEST
    ======================================================= */

    const existingSelect =
      encodeSelect(`
        id,
        quantity,
        product_id,
        products(
          id,
          stock,
          is_active
        )
      `);

    const existing =
      await restFetch(
        `cart_items?select=${existingSelect}` +
          `&user_id=eq.${encodeURIComponent(
            user.id
          )}` +
          `&product_id=eq.${encodeURIComponent(
            productId
          )}` +
          `&limit=1`
      );

    const existingItem =
      existing?.[0];

    /* =======================================================
       EXISTING ITEM
    ======================================================= */

    if (existingItem) {
      const product =
        existingItem.products ||
        {};

      if (
        product.is_active ===
        false
      ) {
        throw new Error(
          "This product is currently unavailable"
        );
      }

      const stock =
        Number(
          product.stock || 0
        );

      const nextQuantity =
        Number(
          existingItem.quantity ||
            0
        ) +
        quantityToAdd;

      if (
        stock > 0 &&
        nextQuantity > stock
      ) {
        throw new Error(
          `Only ${stock} item${
            stock === 1
              ? ""
              : "s"
          } available in stock`
        );
      }

      /*
        PATCH and immediately return the updated row.
      */

      await restFetch(
        `cart_items?` +
          `id=eq.${encodeURIComponent(
            existingItem.id
          )}` +
          `&user_id=eq.${encodeURIComponent(
            user.id
          )}`,
        {
          method:
            "PATCH",

          body: {
            quantity:
              nextQuantity,

            updated_at:
              new Date()
                .toISOString(),
          },

          prefer:
            "return=minimal",
        }
      );

      return getCartItemById(
        existingItem.id,
        user.id
      );
    }

    /* =======================================================
       NEW ITEM
    ======================================================= */

    const product =
      await getProductAvailability(
        productId
      );

    if (!product) {
      throw new Error(
        "Product not found"
      );
    }

    if (
      product.is_active ===
      false
    ) {
      throw new Error(
        "This product is currently unavailable"
      );
    }

    const stock =
      Number(
        product.stock || 0
      );

    if (stock <= 0) {
      throw new Error(
        "This product is out of stock"
      );
    }

    if (
      quantityToAdd >
      stock
    ) {
      throw new Error(
        `Only ${stock} item${
          stock === 1
            ? ""
            : "s"
        } available in stock`
      );
    }

    const inserted =
      await restFetch(
        "cart_items",
        {
          method:
            "POST",

          body: {
            user_id:
              user.id,

            product_id:
              productId,

            quantity:
              quantityToAdd,
          },
        }
      );

    const newItem =
      Array.isArray(
        inserted
      )
        ? inserted[0]
        : inserted;

    if (!newItem?.id) {
      throw new Error(
        "Unable to add product to cart"
      );
    }

    return getCartItemById(
      newItem.id,
      user.id
    );
  };

/* =========================================================
   UPDATE QUANTITY
========================================================= */

export const updateCartItem =
  async (
    cartItemId,
    options = {}
  ) => {
    const user =
      await requireUser();

    if (!cartItemId) {
      throw new Error(
        "Cart item ID is required"
      );
    }

    /*
      Supports BOTH:

      updateCartItem(id, { quantity: 2 })

      and

      updateCartItem(id, 2)

      so older components cannot break it.
    */

    const nextQuantity =
      Number(
        typeof options ===
          "object"
          ? options.quantity
          : options
      );

    if (
      !Number.isFinite(
        nextQuantity
      )
    ) {
      throw new Error(
        "Invalid quantity"
      );
    }

    if (
      nextQuantity <= 0
    ) {
      return removeCartItem(
        cartItemId
      );
    }

    const select =
      encodeSelect(`
        id,
        quantity,
        product_id,
        products(
          id,
          stock,
          is_active
        )
      `);

    const rows =
      await restFetch(
        `cart_items?select=${select}` +
          `&id=eq.${encodeURIComponent(
            cartItemId
          )}` +
          `&user_id=eq.${encodeURIComponent(
            user.id
          )}` +
          `&limit=1`
      );

    const item =
      rows?.[0];

    if (!item) {
      throw new Error(
        "Cart item not found"
      );
    }

    const product =
      item.products ||
      {};

    if (
      product.is_active ===
      false
    ) {
      throw new Error(
        "This product is currently unavailable"
      );
    }

    const stock =
      Number(
        product.stock || 0
      );

    if (
      stock > 0 &&
      nextQuantity >
      stock
    ) {
      throw new Error(
        `Only ${stock} item${
          stock === 1
            ? ""
            : "s"
        } available in stock`
      );
    }

    await restFetch(
      `cart_items?` +
        `id=eq.${encodeURIComponent(
          cartItemId
        )}` +
        `&user_id=eq.${encodeURIComponent(
          user.id
        )}`,
      {
        method:
          "PATCH",

        body: {
          quantity:
            nextQuantity,

          updated_at:
            new Date()
              .toISOString(),
        },

        prefer:
          "return=minimal",
      }
    );

    return getCartItemById(
      cartItemId,
      user.id
    );
  };

/* =========================================================
   INCREASE
========================================================= */

export const increaseCartItem =
  async (
    cartItemId
  ) => {
    const user =
      await requireUser();

    const data =
      await restFetch(
        `cart_items?select=id,quantity` +
          `&id=eq.${encodeURIComponent(
            cartItemId
          )}` +
          `&user_id=eq.${encodeURIComponent(
            user.id
          )}` +
          `&limit=1`
      );

    const item =
      data?.[0];

    if (!item) {
      throw new Error(
        "Cart item not found"
      );
    }

    return updateCartItem(
      cartItemId,
      Number(
        item.quantity || 0
      ) + 1
    );
  };

/* =========================================================
   DECREASE
========================================================= */

export const decreaseCartItem =
  async (
    cartItemId
  ) => {
    const user =
      await requireUser();

    const data =
      await restFetch(
        `cart_items?select=id,quantity` +
          `&id=eq.${encodeURIComponent(
            cartItemId
          )}` +
          `&user_id=eq.${encodeURIComponent(
            user.id
          )}` +
          `&limit=1`
      );

    const item =
      data?.[0];

    if (!item) {
      throw new Error(
        "Cart item not found"
      );
    }

    const next =
      Number(
        item.quantity || 0
      ) - 1;

    if (next <= 0) {
      return removeCartItem(
        cartItemId
      );
    }

    return updateCartItem(
      cartItemId,
      next
    );
  };

/* =========================================================
   REMOVE
========================================================= */

export const removeCartItem =
  async (
    cartItemId
  ) => {
    const user =
      await requireUser();

    if (!cartItemId) {
      throw new Error(
        "Cart item ID is required"
      );
    }

    await restFetch(
      `cart_items?` +
        `id=eq.${encodeURIComponent(
          cartItemId
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

    return true;
  };

/* =========================================================
   REMOVE PRODUCT
========================================================= */

export const removeProductFromCart =
  async (
    productId
  ) => {
    const user =
      await requireUser();

    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    await restFetch(
      `cart_items?` +
        `user_id=eq.${encodeURIComponent(
          user.id
        )}` +
        `&product_id=eq.${encodeURIComponent(
          productId
        )}`,
      {
        method:
          "DELETE",

        prefer:
          "return=minimal",
      }
    );

    return true;
  };

/* =========================================================
   CLEAR
========================================================= */

export const clearCart =
  async () => {
    const user =
      await getCurrentUser();

    if (!user?.id) {
      return true;
    }

    await restFetch(
      `cart_items?user_id=eq.${encodeURIComponent(
        user.id
      )}`,
      {
        method:
          "DELETE",

        prefer:
          "return=minimal",
      }
    );

    return true;
  };

/* =========================================================
   IS PRODUCT IN CART
========================================================= */

export const isProductInCart =
  async (
    productId
  ) => {
    const user =
      await getCurrentUser();

    if (
      !user?.id ||
      !productId
    ) {
      return false;
    }

    const data =
      await restFetch(
        `cart_items?select=id` +
          `&user_id=eq.${encodeURIComponent(
            user.id
          )}` +
          `&product_id=eq.${encodeURIComponent(
            productId
          )}` +
          `&limit=1`
      );

    return Boolean(
      data?.[0]
    );
  };

/* =========================================================
   CART COUNT
========================================================= */

export const getCartCount =
  async () => {
    const items =
      await getCart();

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
  };

/* =========================================================
   TOTAL
========================================================= */

export const calculateCartTotal =
  (
    cartItems = []
  ) =>
    cartItems.reduce(
      (
        total,
        item
      ) => {
        const product =
          item.products ||
          item.product;

        const price =
          Number(
            product
              ?.discount_price ??
              product
                ?.discountPrice ??
              product?.price ??
              item.product_price ??
              0
          );

        return (
          total +
          price *
            Number(
              item.quantity ||
                1
            )
        );
      },
      0
    );

/* =========================================================
   SUMMARY
========================================================= */

export const calculateCartSummary =
  (
    cartItems = []
  ) => {
    const subtotal =
      calculateCartTotal(
        cartItems
      );

    const totalItems =
      cartItems.reduce(
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

    return {
      totalItems,
      subtotal,
      shipping: 0,
      tax: 0,
      discount: 0,
      total:
        subtotal,
    };
  };