import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct,
} from "../api/productApi";

/* =========================================================
   PRODUCT NORMALIZATION
========================================================= */

const normalizeImages = (product = {}) => {
  if (
    Array.isArray(product.product_images) &&
    product.product_images.length > 0
  ) {
    return [...product.product_images]
      .sort(
        (a, b) =>
          Number(b.is_primary || 0) -
            Number(a.is_primary || 0) ||
          Number(a.sort_order || 0) -
            Number(b.sort_order || 0)
      )
      .map((image) => ({
        id: image.id,
        image_url: image.image_url,
        is_primary: Boolean(image.is_primary),
        sort_order: Number(image.sort_order || 0),
      }));
  }

  if (product.image_url) {
    return [
      {
        image_url: product.image_url,
        is_primary: true,
        sort_order: 0,
      },
    ];
  }

  return [];
};

const getCategory = (product = {}) => {
  const categoryData =
    product.categories ||
    product.category ||
    null;

  if (!categoryData) {
    return {
      id: product.category_id || "",
      name: "",
      slug: "",
    };
  }

  if (typeof categoryData === "string") {
    return {
      id: product.category_id || "",
      name: categoryData,
      slug: categoryData
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-"),
    };
  }

  return {
    id:
      categoryData.id ||
      product.category_id ||
      "",
    name: categoryData.name || "",
    slug: categoryData.slug || "",
  };
};

const normalizeProduct = (product = {}) => {
  const images = normalizeImages(product);
  const category = getCategory(product);

  const price = Number(product.price || 0);

  const discountPrice =
    product.discount_price !== null &&
    product.discount_price !== undefined
      ? Number(product.discount_price)
      : null;

  const sellingPrice =
    discountPrice !== null &&
    discountPrice > 0
      ? discountPrice
      : price;

  const stock = Number(product.stock || 0);

  return {
    ...product,

    price,
    discount_price: discountPrice,
    selling_price: sellingPrice,

    stock,

    images,

    primary_image:
      images.find((image) => image.is_primary)
        ?.image_url ||
      images[0]?.image_url ||
      "",

    category,
    category_id:
      product.category_id ||
      category.id ||
      "",

    category_name: category.name,
    category_slug: category.slug,

    short_description:
      product.short_description ||
      product.description ||
      "",

    description:
      product.description || "",

    brand:
      product.brand || "",

    pack_size:
      product.pack_size || "",

    unit:
      product.unit || "",

    quantity:
      product.quantity || "",

    rating: Number(
      product.rating || 0
    ),

    features:
      Array.isArray(product.features)
        ? product.features
        : [],

    specs:
      product.specs &&
      typeof product.specs === "object"
        ? product.specs
        : {},

    variants:
      product.variants &&
      typeof product.variants === "object"
        ? product.variants
        : {},

    is_featured: Boolean(
      product.is_featured
    ),

    is_active:
      product.is_active !== false,

    status:
      product.is_active === false
        ? "inactive"
        : stock <= 0
          ? "out-of-stock"
          : "active",
  };
};

/* =========================================================
   RESPONSE NORMALIZATION
========================================================= */

const extractProducts = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.products)) {
    return response.products;
  }

  if (
    Array.isArray(
      response?.data?.products
    )
  ) {
    return response.data.products;
  }

  return [];
};

/* =========================================================
   NORMALIZE CATEGORY FOR FILTERING
========================================================= */

const normalizeCategoryKey = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "object") {
    return String(
      value.slug ||
        value.name ||
        value.id ||
        ""
    )
      .trim()
      .toLowerCase();
  }

  return String(value)
    .trim()
    .toLowerCase();
};

/* =========================================================
   USE PRODUCTS
========================================================= */

const useProducts = (options = {}) => {
  const {
    autoFetch = true,
    initialParams = {},
    category = "all",
    search = "",
    status = "all",
  } = options;

  const [products, setProducts] =
    useState([]);

  const [
    productsLoading,
    setProductsLoading,
  ] = useState(autoFetch);

  const [
    productsError,
    setProductsError,
  ] = useState("");

  /*
    String key prevents a new {} object from
    recreating fetchProducts every render.
  */
  const initialParamsKey =
    JSON.stringify(initialParams);

  /* =======================================================
     FETCH PRODUCTS
  ======================================================= */

  const fetchProducts = useCallback(
    async (params = null) => {
      try {
        setProductsLoading(true);
        setProductsError("");

        const requestParams =
          params ||
          JSON.parse(initialParamsKey);

        const response =
          await getProducts(requestParams);

        const list =
          extractProducts(response);

        const normalizedProducts =
          list.map(normalizeProduct);

        setProducts(normalizedProducts);

        return normalizedProducts;
      } catch (error) {
        console.error(
          "Failed to fetch products:",
          error
        );

        setProductsError(
          error?.message ||
            "Failed to fetch products."
        );

        setProducts([]);

        return [];
      } finally {
        setProductsLoading(false);
      }
    },
    [initialParamsKey]
  );

  /* =======================================================
     FETCH ONE PRODUCT
  ======================================================= */

  const fetchProductBySlug =
    useCallback(async (slug) => {
      if (!slug) {
        throw new Error(
          "Product slug is required."
        );
      }

      const response =
        await getProductBySlug(slug);

      const product =
        response?.data || response;

      return normalizeProduct(product);
    }, []);

  /* =======================================================
     CREATE PRODUCT
  ======================================================= */

  const addProduct = useCallback(
    async (payload) => {
      const response =
        await createProduct(payload);

      const product =
        normalizeProduct(
          response?.data || response
        );

      await fetchProducts();

      return product;
    },
    [fetchProducts]
  );

  /* =======================================================
     UPDATE PRODUCT
  ======================================================= */

  const editProduct = useCallback(
    async (slugOrId, payload) => {
      const response =
        await updateProduct(
          slugOrId,
          payload
        );

      const product =
        normalizeProduct(
          response?.data || response
        );

      await fetchProducts();

      return product;
    },
    [fetchProducts]
  );

  /* =======================================================
     PATCH PRODUCT
  ======================================================= */

  const patchProductData =
    useCallback(
      async (slugOrId, payload) => {
        const response =
          await patchProduct(
            slugOrId,
            payload
          );

        const product =
          normalizeProduct(
            response?.data || response
          );

        await fetchProducts();

        return product;
      },
      [fetchProducts]
    );

  /* =======================================================
     DELETE PRODUCT
  ======================================================= */

  const removeProduct = useCallback(
    async (slugOrId) => {
      await deleteProduct(slugOrId);

      await fetchProducts();

      return true;
    },
    [fetchProducts]
  );

  /* =======================================================
     AUTO FETCH
  ======================================================= */

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [autoFetch, fetchProducts]);

  /* =======================================================
     LOCAL FILTERING
  ======================================================= */

  const filteredProducts = useMemo(() => {
    let list = [...products];

    const query = String(
      search || ""
    )
      .trim()
      .toLowerCase();

    if (query) {
      list = list.filter((product) => {
        return (
          product.name
            ?.toLowerCase()
            .includes(query) ||
          product.brand
            ?.toLowerCase()
            .includes(query) ||
          product.category_name
            ?.toLowerCase()
            .includes(query) ||
          product.short_description
            ?.toLowerCase()
            .includes(query)
        );
      });
    }

    if (
      category &&
      category !== "all"
    ) {
      const selectedCategory =
        normalizeCategoryKey(category);

      list = list.filter((product) => {
        return [
          product.category_id,
          product.category_name,
          product.category_slug,
        ].some(
          (value) =>
            normalizeCategoryKey(value) ===
            selectedCategory
        );
      });
    }

    if (
      status &&
      status !== "all"
    ) {
      list = list.filter(
        (product) =>
          product.status === status
      );
    }

    return list;
  }, [
    products,
    search,
    category,
    status,
  ]);

  return {
    products,
    filteredProducts,

    productsLoading,
    productsError,

    fetchProducts,
    fetchProductBySlug,

    addProduct,
    editProduct,
    patchProductData,
    removeProduct,

    setProducts,

    normalizeProduct,
  };
};

export default useProducts;
export { useProducts };