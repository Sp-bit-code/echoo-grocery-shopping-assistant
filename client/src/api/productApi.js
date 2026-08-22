/*
  productApi.js

  Customer-facing grocery product API.

  Product model:
  - category_id
  - name
  - slug
  - brand
  - description
  - short_description
  - price
  - discount_price
  - stock
  - quantity
  - unit
  - pack_size
  - rating
  - currency
  - is_featured
  - is_active
  - features
  - specs
  - variants

  Related:
  - categories
  - product_images
*/

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
   REST HELPERS
========================================================= */

const getAccessToken = () =>
  localStorage.getItem(
    "echoo_access_token"
  ) || SUPABASE_KEY;

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

const restFetch = async (
  path,
  options = {}
) => {
  const token =
    options.authenticated
      ? getAccessToken()
      : SUPABASE_KEY;

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
      parseError(
        text,
        "Product request failed"
      );

    console.error(
      "Product API error:",
      response.status,
      message
    );

    throw new Error(message);
  }

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
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

/* =========================================================
   SELECT
========================================================= */

const PRODUCT_SELECT = `
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
  created_at,
  updated_at,
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
`;

/* =========================================================
   SLUG
========================================================= */

export const generateSlug = (
  text = ""
) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

/* =========================================================
   NORMALIZE IMAGES
========================================================= */

const normalizeImages = (
  images = []
) => {
  if (!Array.isArray(images)) {
    return [];
  }

  return [...images].sort(
    (a, b) => {
      const aPrimary =
        Boolean(
          typeof a === "object" &&
            a?.is_primary
        );

      const bPrimary =
        Boolean(
          typeof b === "object" &&
            b?.is_primary
        );

      if (
        aPrimary &&
        !bPrimary
      ) {
        return -1;
      }

      if (
        !aPrimary &&
        bPrimary
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

export const normalizeProduct = (
  product = {}
) => {
  const category =
    product.categories ||
    product.category ||
    null;

  const categoryName =
    typeof category === "string"
      ? category
      : category?.name ||
        product.category_name ||
        "";

  const categorySlug =
    typeof category === "object"
      ? category?.slug || ""
      : "";

  const images =
    normalizeImages(
      product.product_images ||
        product.images ||
        []
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
      categoryName,

    categoryName,

    categorySlug,

    product_images:
      images,

    images,

    image:
      typeof images[0] ===
      "string"
        ? images[0]
        : images[0]
            ?.image_url ||
          images[0]?.url ||
          "",

    price:
      Number(
        product.price || 0
      ),

    discount_price:
      discountPrice,

    discountPrice,

    sellingPrice:
      discountPrice ??
      Number(
        product.price || 0
      ),

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

    isFeatured:
      Boolean(
        product.is_featured
      ),

    is_active:
      product.is_active !==
      false,

    isActive:
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
   CATEGORY MATCH
========================================================= */

const matchesCategory = (
  product,
  category
) => {
  if (!category) {
    return true;
  }

  const wanted =
    String(category)
      .trim()
      .toLowerCase();

  return [
    product.category_id,
    product.categoryId,
    product.categoryName,
    product.category,
    product.categorySlug,
  ].some(
    (value) =>
      String(value || "")
        .trim()
        .toLowerCase() ===
      wanted
  );
};

/* =========================================================
   GET PRODUCTS
========================================================= */

export const getProducts =
  async (params = {}) => {
    const queryParts = [
      `select=${encodeSelect(
        PRODUCT_SELECT
      )}`,
      "order=created_at.desc",
    ];

    /*
      Customer catalog shows active
      products by default.
    */

    if (
      params.includeInactive !==
      true
    ) {
      queryParts.push(
        "is_active=eq.true"
      );
    }

    if (
      params.featured !==
      undefined
    ) {
      queryParts.push(
        `is_featured=eq.${Boolean(
          params.featured
        )}`
      );
    }

    if (params.brand) {
      queryParts.push(
        `brand=ilike.${encodeURIComponent(
          params.brand
        )}`
      );
    }

    if (
      params.minPrice !==
        undefined &&
      params.minPrice !== null &&
      params.minPrice !== ""
    ) {
      queryParts.push(
        `price=gte.${Number(
          params.minPrice
        )}`
      );
    }

    if (
      params.maxPrice !==
        undefined &&
      params.maxPrice !== null &&
      params.maxPrice !== ""
    ) {
      queryParts.push(
        `price=lte.${Number(
          params.maxPrice
        )}`
      );
    }

    /*
      Fetch a slightly broader result when
      client-side search/category filtering
      is required.
    */

    const requiresClientFilter =
      Boolean(
        params.search ||
          params.category ||
          params.categoryId
      );

    if (
      params.limit &&
      !requiresClientFilter
    ) {
      queryParts.push(
        `limit=${Number(
          params.limit
        )}`
      );
    }

    const response =
      await restFetch(
        `products?${queryParts.join(
          "&"
        )}`
      );

    let products =
      (
        Array.isArray(
          response
        )
          ? response
          : []
      ).map(
        normalizeProduct
      );

    /* CATEGORY */
    const category =
      params.categoryId ||
      params.category;

    if (category) {
      products =
        products.filter(
          (product) =>
            matchesCategory(
              product,
              category
            )
        );
    }

    /* SEARCH */
    if (params.search) {
      const search =
        String(
          params.search
        )
          .trim()
          .toLowerCase();

      products =
        products.filter(
          (product) =>
            [
              product.name,
              product.brand,
              product.categoryName,
              product.description,
              product.short_description,
              product.packSize,
              product.unit,
            ].some((value) =>
              String(
                value || ""
              )
                .toLowerCase()
                .includes(search)
            )
        );
    }

    if (params.limit) {
      products =
        products.slice(
          0,
          Number(
            params.limit
          )
        );
    }

    return products;
  };

/* =========================================================
   GET PRODUCT BY SLUG
========================================================= */

export const getProductBySlug =
  async (slug) => {
    if (!slug) {
      throw new Error(
        "Product slug is required"
      );
    }

    const select =
      encodeSelect(
        PRODUCT_SELECT
      );

    const data =
      await restFetch(
        `products?select=${select}&slug=eq.${encodeURIComponent(
          slug
        )}&is_active=eq.true&limit=1`
      );

    if (!data?.[0]) {
      throw new Error(
        "Product not found"
      );
    }

    return normalizeProduct(
      data[0]
    );
  };

/* =========================================================
   GET PRODUCT BY ID
========================================================= */

export const getProductById =
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

    const data =
      await restFetch(
        `products?select=${select}&id=eq.${encodeURIComponent(
          productId
        )}&is_active=eq.true&limit=1`
      );

    if (!data?.[0]) {
      throw new Error(
        "Product not found"
      );
    }

    return normalizeProduct(
      data[0]
    );
  };

/* =========================================================
   FEATURED PRODUCTS
========================================================= */

export const getFeaturedProducts =
  async (limit = 8) =>
    getProducts({
      featured: true,
      limit,
    });

/* =========================================================
   CATEGORY PRODUCTS
========================================================= */

export const getProductsByCategory =
  async (
    category,
    limit = 50
  ) => {
    if (!category) {
      return [];
    }

    return getProducts({
      category,
      limit,
    });
  };

/* =========================================================
   BRAND PRODUCTS
========================================================= */

export const getProductsByBrand =
  async (
    brand,
    limit = 50
  ) => {
    if (!brand) {
      return [];
    }

    return getProducts({
      brand,
      limit,
    });
  };

/* =========================================================
   SEARCH
========================================================= */

export const searchProducts =
  async (
    searchText,
    limit = 20
  ) => {
    if (
      !String(
        searchText || ""
      ).trim()
    ) {
      return [];
    }

    return getProducts({
      search:
        searchText,
      limit,
    });
  };

/* =========================================================
   CATEGORIES

   categoryApi.js will become the main category API.
   This helper is kept for compatibility.
========================================================= */

export const getProductCategories =
  async () => {
    const data =
      await restFetch(
        "categories?select=id,name,slug&order=name.asc"
      );

    return Array.isArray(data)
      ? data
      : [];
  };

/* =========================================================
   RELATED PRODUCTS
========================================================= */

export const getRelatedProducts =
  async ({
    category,
    categoryId,
    currentProductId,
    limit = 4,
  } = {}) => {
    const selectedCategory =
      categoryId ||
      category;

    if (
      !selectedCategory
    ) {
      return [];
    }

    const products =
      await getProducts({
        category:
          selectedCategory,

        limit:
          Number(limit) + 1,
      });

    return products
      .filter(
        (product) =>
          String(
            product.id
          ) !==
          String(
            currentProductId
          )
      )
      .slice(
        0,
        Number(limit)
      );
  };

/* =========================================================
   PRODUCT WRITE HELPERS

   AdminProducts uses adminApi.js, but these are retained
   for backwards compatibility with any older imports.
========================================================= */

const formatProductPayload = (
  productData = {}
) => {
  const discountPrice =
    productData.discount_price ??
    productData.discountPrice;

  const quantity =
    productData.quantity;

  return {
    name:
      String(
        productData.name ||
          ""
      ).trim(),

    slug:
      productData.slug ||
      generateSlug(
        productData.name
      ),

    category_id:
      productData.category_id ||
      productData.categoryId ||
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
        productData.price || 0
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
        productData.stock || 0
      ),

    quantity:
      quantity === "" ||
      quantity === null ||
      quantity ===
        undefined
        ? null
        : Number(quantity),

    unit:
      String(
        productData.unit ||
          ""
      ).trim(),

    pack_size:
      String(
        productData.pack_size ||
          productData.packSize ||
          ""
      ).trim(),

    rating:
      Number(
        productData.rating || 0
      ),

    currency:
      productData.currency ||
      "INR",

    is_featured:
      Boolean(
        productData.is_featured ??
          productData.isFeatured
      ),

    is_active:
      productData.is_active ??
      productData.isActive ??
      true,

    features:
      Array.isArray(
        productData.features
      )
        ? productData.features
        : [],

    specs:
      productData.specs ||
      {},

    variants:
      productData.variants ||
      {},
  };
};

/* =========================================================
   CREATE PRODUCT
========================================================= */

export const createProduct =
  async (productData) => {
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
        "Product price is required"
      );
    }

    const data =
      await restFetch(
        "products",
        {
          method: "POST",

          authenticated:
            true,

          body:
            formatProductPayload(
              productData
            ),
        }
      );

    const product =
      Array.isArray(data)
        ? data[0]
        : data;

    return product
      ? normalizeProduct(
          product
        )
      : null;
  };

/* =========================================================
   UPDATE PRODUCT
========================================================= */

export const updateProduct =
  async (
    slug,
    productData
  ) => {
    if (!slug) {
      throw new Error(
        "Product slug is required"
      );
    }

    const data =
      await restFetch(
        `products?slug=eq.${encodeURIComponent(
          slug
        )}`,
        {
          method: "PATCH",

          authenticated:
            true,

          body: {
            ...formatProductPayload(
              productData
            ),

            updated_at:
              new Date().toISOString(),
          },
        }
      );

    return data?.[0]
      ? normalizeProduct(
          data[0]
        )
      : null;
  };

/* =========================================================
   PATCH PRODUCT
========================================================= */

export const patchProduct =
  async (
    slug,
    updateData
  ) => {
    if (!slug) {
      throw new Error(
        "Product slug is required"
      );
    }

    const data =
      await restFetch(
        `products?slug=eq.${encodeURIComponent(
          slug
        )}`,
        {
          method: "PATCH",

          authenticated:
            true,

          body: {
            ...updateData,

            updated_at:
              new Date().toISOString(),
          },
        }
      );

    return data?.[0]
      ? normalizeProduct(
          data[0]
        )
      : null;
  };

/* =========================================================
   DELETE PRODUCT
========================================================= */

export const deleteProduct =
  async (slug) => {
    if (!slug) {
      throw new Error(
        "Product slug is required"
      );
    }

    await restFetch(
      `products?slug=eq.${encodeURIComponent(
        slug
      )}`,
      {
        method: "DELETE",

        authenticated:
          true,

        prefer:
          "return=minimal",
      }
    );

    return true;
  };

/* =========================================================
   PRODUCT IMAGE URL
========================================================= */

export const addProductImage =
  async ({
    productId,
    imageUrl,
    isPrimary = false,
    sortOrder = 0,
  }) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    if (
      !String(
        imageUrl || ""
      ).trim()
    ) {
      throw new Error(
        "Image URL is required"
      );
    }

    const data =
      await restFetch(
        "product_images",
        {
          method: "POST",

          authenticated:
            true,

          body: {
            product_id:
              productId,

            image_url:
              String(
                imageUrl
              ).trim(),

            is_primary:
              Boolean(
                isPrimary
              ),

            sort_order:
              Number(
                sortOrder || 0
              ),
          },
        }
      );

    return Array.isArray(data)
      ? data[0] || null
      : data;
  };

/* =========================================================
   DELETE IMAGE
========================================================= */

export const deleteProductImage =
  async (imageId) => {
    if (!imageId) {
      throw new Error(
        "Image ID is required"
      );
    }

    await restFetch(
      `product_images?id=eq.${encodeURIComponent(
        imageId
      )}`,
      {
        method: "DELETE",

        authenticated:
          true,

        prefer:
          "return=minimal",
      }
    );

    return true;
  };

/* =========================================================
   STOCK
========================================================= */

export const updateProductStock =
  async (
    productId,
    stock
  ) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    const nextStock =
      Number(stock);

    if (
      Number.isNaN(
        nextStock
      ) ||
      nextStock < 0
    ) {
      throw new Error(
        "Invalid stock value"
      );
    }

    const data =
      await restFetch(
        `products?id=eq.${encodeURIComponent(
          productId
        )}`,
        {
          method: "PATCH",

          authenticated:
            true,

          body: {
            stock:
              nextStock,

            updated_at:
              new Date().toISOString(),
          },
        }
      );

    return data?.[0]
      ? normalizeProduct(
          data[0]
        )
      : null;
  };

/* =========================================================
   COMPATIBILITY EXPORTS
========================================================= */

export const getAllProducts =
  getProducts;

export const getProduct =
  getProductBySlug;

export const getProductsByBrandName =
  getProductsByBrand;