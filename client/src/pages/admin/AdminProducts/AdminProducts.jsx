import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Edit3,
  Package,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  Upload,
  ImageOff,
  X,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  createAdminProduct,
  getAllProducts,
  syncAdminProductImages,
  updateAdminProduct,
} from "../../../api/adminApi.js";

import ProductForm from "./ProductForm.jsx";

import "./AdminProducts.css";

const PRODUCTS_PER_PAGE = 10;

const UNIT_OPTIONS = [
  "g",
  "kg",
  "ml",
  "L",
  "pcs",
  "pack",
  "dozen",
];

const MAX_PRODUCT_IMAGES = 6;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' rx='28' fill='%23f3f4f6'/%3E%3Cpath d='M68 164l34-38 24 26 18-20 28 32H68z' fill='%23cbd5e1'/%3E%3Ccircle cx='92' cy='91' r='14' fill='%23cbd5e1'/%3E%3C/svg%3E";

const isPublicImageUrl = (value = "") => {
  try {
    const url = new URL(String(value).trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const canLoadImageUrl = (url) =>
  new Promise((resolve) => {
    const image = new Image();
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    const timer = window.setTimeout(() => finish(false), 8000);

    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.referrerPolicy = "no-referrer";
    image.src = url;
  });

const compressImageFile = (file) =>
  new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      reject(new Error("Image must be smaller than 8 MB."));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () =>
      reject(new Error("Unable to read this image."));

    reader.onload = () => {
      const image = new Image();

      image.onerror = () =>
        reject(new Error("Unable to process this image."));

      image.onload = () => {
        const maxDimension = 900;
        const scale = Math.min(
          1,
          maxDimension / Math.max(image.width || 1, image.height || 1)
        );

        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Unable to prepare this image."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        // A compressed data URL lets the existing product_images table
        // store uploaded images without requiring another backend file.
        resolve(canvas.toDataURL("image/webp", 0.78));
      };

      image.src = String(reader.result || "");
    };

    reader.readAsDataURL(file);
  });

/* =========================================================
   BASIC HELPERS
========================================================= */

const extractProducts = (
  response
) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    Array.isArray(
      response?.data
    )
  ) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.products
    )
  ) {
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

const normalizeImageUrls = (
  images = []
) => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => {
      if (
        typeof image ===
        "string"
      ) {
        return image;
      }

      return (
        image?.image_url ||
        image?.url ||
        ""
      );
    })
    .filter(Boolean);
};

const slugify = (
  value
) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );

const createSlug = (
  name
) =>
  `${slugify(
    name
  )}-${Date.now()}`;

const createProductGroupKey = (
  brand,
  name
) =>
  slugify(
    `${brand || ""}-${name || ""}`
  );

const getProductGroupKey = (
  product = {}
) =>
  String(
    product.product_group_key ||
      product.productGroupKey ||
      createProductGroupKey(
        product.brand,
        product.name
      ) ||
      product.id ||
      ""
  )
    .trim()
    .toLowerCase();

/* =========================================================
   STATUS
========================================================= */

const getProductStatus = (
  product
) => {
  if (
    product.is_active ===
    false
  ) {
    return "inactive";
  }

  if (
    Number(
      product.stock || 0
    ) <= 0
  ) {
    return "out-of-stock";
  }

  return "active";
};

const formatStatus = (
  status
) =>
  String(status || "")
    .replace(
      /-/g,
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );

const getStatusClass = (
  status
) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";

    case "out-of-stock":
      return "bg-red-100 text-red-700";

    case "inactive":
      return "bg-gray-200 text-gray-600";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

/* =========================================================
   NORMALIZE SKU
========================================================= */

const normalizeProduct = (
  product = {}
) => {
  const category =
    product.categories ||
    product.category ||
    {};

  const categoryName =
    typeof category ===
    "string"
      ? category
      : category?.name ||
        product.category_name ||
        product.categoryName ||
        "Uncategorized";

  const categoryId =
    product.category_id ||
    product.categoryId ||
    category?.id ||
    "";

  const images =
    normalizeImageUrls(
      product.product_images ||
        product.images ||
        []
    );

  return {
    ...product,

    categoryId,
    categoryName,

    productGroupKey:
      getProductGroupKey(
        product
      ),

    images,

    price:
      Number(
        product.price || 0
      ),

    discountPrice:
      product.discount_price != null
        ? Number(
            product.discount_price
          )
        : null,

    stock:
      Number(
        product.stock || 0
      ),

    quantity:
      product.quantity != null
        ? Number(
            product.quantity
          )
        : "",

    unit:
      product.unit || "",

    packSize:
      product.pack_size ||
      product.packSize ||
      "",

    rating:
      Number(
        product.rating || 0
      ),

    description:
      product.description ||
      product.short_description ||
      "",

    features:
      Array.isArray(
        product.features
      )
        ? product.features
        : [],

    specs:
      product.specs ||
      product.specifications ||
      {},

    variants:
      product.variants || {},

    isFeatured:
      Boolean(
        product.is_featured
      ),

    isActive:
      product.is_active !== false,

    status:
      getProductStatus(
        product
      ),
  };
};

/* =========================================================
   PACK HELPERS
========================================================= */

const getPackLabel = (
  product = {}
) => {
  const packSize =
    product.packSize ||
    product.pack_size;

  if (packSize) {
    return packSize;
  }

  if (
    product.quantity !== "" &&
    product.quantity != null &&
    product.unit
  ) {
    return `${product.quantity} ${product.unit}`;
  }

  return "Default pack";
};

const getSellingPrice = (
  product
) =>
  Number(
    product.discountPrice ??
      product.price ??
      0
  );

/* =========================================================
   GROUP 200 SKUs INTO 48 PRODUCTS
========================================================= */

const buildLogicalProducts = (
  products = []
) => {
  const groups =
    new Map();

  products.forEach(
    (product) => {
      const key =
        getProductGroupKey(
          product
        );

      if (!groups.has(key)) {
        groups.set(
          key,
          []
        );
      }

      groups
        .get(key)
        .push(product);
    }
  );

  return Array.from(
    groups.entries()
  ).map(
    ([
      key,
      variants,
    ]) => {
      const sortedVariants =
        [...variants].sort(
          (
            first,
            second
          ) =>
            Number(
              first.quantity || 0
            ) -
            Number(
              second.quantity || 0
            )
        );

      const representative =
        sortedVariants[0];

      const prices =
        sortedVariants
          .map(
            getSellingPrice
          )
          .filter(
            (price) =>
              price > 0
          );

      const totalStock =
        sortedVariants.reduce(
          (
            total,
            variant
          ) =>
            total +
            Number(
              variant.stock || 0
            ),
          0
        );

      const activeVariants =
        sortedVariants.filter(
          (variant) =>
            variant.isActive
        );

      let status =
        "active";

      if (
        activeVariants.length ===
        0
      ) {
        status =
          "inactive";
      } else if (
        totalStock <= 0
      ) {
        status =
          "out-of-stock";
      }

      return {
        key,

        name:
          representative?.name ||
          "Product",

        brand:
          representative?.brand ||
          "",

        categoryId:
          representative
            ?.categoryId ||
          "",

        categoryName:
          representative
            ?.categoryName ||
          "Uncategorized",

        images:
          representative
            ?.images ||
          [],

        variants:
          sortedVariants,

        variantCount:
          sortedVariants.length,

        packs:
          sortedVariants.map(
            getPackLabel
          ),

        totalStock,

        minPrice:
          prices.length
            ? Math.min(
                ...prices
              )
            : 0,

        maxPrice:
          prices.length
            ? Math.max(
                ...prices
              )
            : 0,

        status,

        isFeatured:
          sortedVariants.some(
            (variant) =>
              variant.isFeatured
          ),

        isActive:
          activeVariants.length >
          0,

        representative,
      };
    }
  );
};

/* =========================================================
   ADD PRODUCT FORM
========================================================= */

const createEmptyForm =
  () => ({
    name: "",
    slug: "",

    category_id: "",

    brand: "",

    price: "",
    discount_price: "",

    stock: "",

    quantity: "",
    unit: "",
    pack_size: "",

    rating: "",

    currency: "INR",

    description: "",

    images: [],

    features: [],

    specs: {},

    variants: {},

    is_featured: false,
    is_active: true,
  });

/* =========================================================
   LOGICAL EDIT STATE
========================================================= */

const createEmptyCommonEdit =
  () => ({
    name: "",
    brand: "",

    /*
      Category is recognized automatically by the product API.
      It is shown as read-only in the edit modal.
    */
    category_id: "",
    categoryName: "Uncategorized",

    rating: "",
    description: "",
    images: [],
    features: [],
    specs: {},
    is_featured: false,
    is_active: true,
  });

const createEditableVariant = (
  variant = {},
  index = 0
) => {
  const status =
    variant.status ||
    (variant.isActive === false
      ? "inactive"
      : Number(variant.stock || 0) <= 0
        ? "out-of-stock"
        : "active");

  return {
    localKey:
      variant.id ||
      `new-${Date.now()}-${index}-${Math.random()}`,

    id:
      variant.id ||
      null,

    slug:
      variant.slug ||
      "",

    price:
      variant.price ?? "",

    discountPrice:
      variant.discountPrice ??
      "",

    stock:
      variant.stock ?? "",

    quantity:
      variant.quantity ?? "",

    unit:
      variant.unit || "",

    packSize:
      variant.packSize ||
      "",

    /*
      Explicit admin status:
      active | out-of-stock | inactive
    */
    status,

    isActive:
      status !== "inactive",

    variants:
      variant.variants || {},
  };
};

/* =========================================================
   ADMIN PRODUCTS
========================================================= */

const AdminProducts = () => {
  const [
    rawProducts,
    setRawProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* =======================================================
     FILTERS
  ======================================================= */

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const deferredSearchTerm =
    useDeferredValue(
      searchTerm
    );

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("all");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("all");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  /* =======================================================
     ADD MODAL
  ======================================================= */

  const [
    showAddModal,
    setShowAddModal,
  ] = useState(false);

  const [
    addForm,
    setAddForm,
  ] = useState(
    createEmptyForm()
  );

  const [
    tempImageUrl,
    setTempImageUrl,
  ] = useState("");

  const [
    tempFeature,
    setTempFeature,
  ] = useState("");

  const [
    tempSpecKey,
    setTempSpecKey,
  ] = useState("");

  const [
    tempSpecValue,
    setTempSpecValue,
  ] = useState("");

  /* =======================================================
     LOGICAL PRODUCT EDIT MODAL
  ======================================================= */

  const [
    showEditModal,
    setShowEditModal,
  ] = useState(false);

  const [
    editingGroup,
    setEditingGroup,
  ] = useState(null);

  const [
    editCommon,
    setEditCommon,
  ] = useState(
    createEmptyCommonEdit()
  );

  const [
    editVariants,
    setEditVariants,
  ] = useState([]);

  const [
    editImageInput,
    setEditImageInput,
  ] = useState("");

  const [
    imageUploading,
    setImageUploading,
  ] = useState(false);

  const [
    editFeatureInput,
    setEditFeatureInput,
  ] = useState("");

  const [
    editSpecKey,
    setEditSpecKey,
  ] = useState("");

  const [
    editSpecValue,
    setEditSpecValue,
  ] = useState("");

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  const fetchProducts =
    async ({
      silent = false,
    } = {}) => {
      try {
        if (silent) {
          setRefreshing(
            true
          );
        } else {
          setLoading(
            true
          );
        }

        setError("");

        const response =
          await getAllProducts();

        setRawProducts(
          extractProducts(
            response
          )
        );
      } catch (
        fetchError
      ) {
        console.error(
          "Error loading products:",
          fetchError
        );

        setError(
          fetchError?.message ||
            "Failed to load products."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* =======================================================
     NORMALIZED SKUS
  ======================================================= */

  const allProducts =
    useMemo(
      () =>
        rawProducts.map(
          normalizeProduct
        ),
      [rawProducts]
    );

  /* =======================================================
     LOGICAL PRODUCTS
  ======================================================= */

  const logicalProducts =
    useMemo(
      () =>
        buildLogicalProducts(
          allProducts
        ),
      [allProducts]
    );

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories =
    useMemo(() => {
      const map =
        new Map();

      allProducts.forEach(
        (product) => {
          if (
            !product.categoryId
          ) {
            return;
          }

          map.set(
            String(
              product.categoryId
            ),
            {
              id:
                product.categoryId,

              name:
                product.categoryName,
            }
          );
        }
      );

      return Array.from(
        map.values()
      ).sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );
    }, [allProducts]);

  /*
    Category filter is intentionally based on recognized
    category names, not category_id.

    Older seeded SKU rows can have a correct category name
    while category_id is still null. This keeps the admin
    filter working for those products too.
  */
  const filterCategories =
    useMemo(() => {
      const map =
        new Map();

      logicalProducts.forEach(
        (product) => {
          const name =
            String(
              product.categoryName ||
                ""
            ).trim();

          if (
            !name ||
            name.toLowerCase() ===
              "uncategorized"
          ) {
            return;
          }

          const value =
            slugify(name);

          if (!value) {
            return;
          }

          if (!map.has(value)) {
            map.set(
              value,
              {
                value,
                name,
              }
            );
          }
        }
      );

      return Array.from(
        map.values()
      ).sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );
    }, [logicalProducts]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredProducts =
    useMemo(() => {
      let list = [
        ...logicalProducts,
      ];

      const query =
        deferredSearchTerm
          .trim()
          .toLowerCase();

      if (query) {
        list =
          list.filter(
            (product) =>
              [
                product.name,
                product.brand,
                product.categoryName,
                ...product.packs,
              ].some(
                (value) =>
                  String(
                    value || ""
                  )
                    .toLowerCase()
                    .includes(
                      query
                    )
              )
          );
      }

      if (
        selectedCategory !==
        "all"
      ) {
        list =
          list.filter(
            (product) =>
              slugify(
                product.categoryName
              ) ===
              selectedCategory
          );
      }

      if (
        selectedStatus !==
        "all"
      ) {
        list =
          list.filter(
            (product) =>
              product.status ===
              selectedStatus
          );
      }

      return list;
    }, [
      logicalProducts,
      deferredSearchTerm,
      selectedCategory,
      selectedStatus,
    ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredProducts.length /
          PRODUCTS_PER_PAGE
      )
    );

  const paginatedProducts =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        PRODUCTS_PER_PAGE;

      return filteredProducts.slice(
        start,
        start +
          PRODUCTS_PER_PAGE
      );
    }, [
      filteredProducts,
      currentPage,
    ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    deferredSearchTerm,
    selectedCategory,
    selectedStatus,
  ]);

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(() => {
      const inventoryValue =
        allProducts.reduce(
          (sum, product) =>
            sum +
            getSellingPrice(product) *
              Number(product.stock || 0),
          0
        );

      const stockUnits =
        allProducts.reduce(
          (sum, product) =>
            sum + Number(product.stock || 0),
          0
        );

      const activeSkus =
        allProducts.filter(
          (product) =>
            product.status === "active"
        ).length;

      const outOfStockSkus =
        allProducts.filter(
          (product) =>
            product.status === "out-of-stock"
        ).length;

      const inactiveSkus =
        allProducts.filter(
          (product) =>
            product.status === "inactive"
        ).length;

      const featuredSkus =
        allProducts.filter(
          (product) => product.isFeatured
        ).length;

      const activeLogical =
        logicalProducts.filter(
          (product) =>
            product.status === "active"
        ).length;

      const outOfStockLogical =
        logicalProducts.filter(
          (product) =>
            product.status === "out-of-stock"
        ).length;

      const inactiveLogical =
        logicalProducts.filter(
          (product) =>
            product.status === "inactive"
        ).length;

      const featuredLogical =
        logicalProducts.filter(
          (product) => product.isFeatured
        ).length;

      return {
        totalProducts: logicalProducts.length,
        skuCount: allProducts.length,

        activeSkus,
        outOfStockSkus,
        inactiveSkus,
        featuredSkus,

        activeLogical,
        outOfStockLogical,
        inactiveLogical,
        featuredLogical,

        stockUnits,
        inventoryValue,
      };
    }, [logicalProducts, allProducts]);

  /* =======================================================
     PRICE
  ======================================================= */

  const formatPrice = (
    value
  ) =>
    new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        minimumFractionDigits:
          0,
        maximumFractionDigits:
          0,
      }
    ).format(
      Number(value || 0)
    );

  const formatPriceRange = (
    product
  ) => {
    if (
      product.minPrice ===
      product.maxPrice
    ) {
      return formatPrice(
        product.minPrice
      );
    }

    return `${formatPrice(
      product.minPrice
    )} – ${formatPrice(
      product.maxPrice
    )}`;
  };

  /* =======================================================
     ADD PAYLOAD
  ======================================================= */

  const formatProductPayload = (
    form,
    existingSlug = ""
  ) => ({
    name:
      form.name.trim(),

    slug:
      existingSlug ||
      form.slug ||
      createSlug(
        form.name
      ),

    product_group_key:
      createProductGroupKey(
        form.brand,
        form.name
      ),

    category_id:
      form.category_id ||
      null,

    brand:
      form.brand.trim(),

    price:
      Number(
        form.price || 0
      ),

    discount_price:
      form.discount_price ===
        "" ||
      form.discount_price ==
        null
        ? null
        : Number(
            form.discount_price
          ),

    stock:
      Number(
        form.stock || 0
      ),

    quantity:
      form.quantity === "" ||
      form.quantity == null
        ? null
        : Number(
            form.quantity
          ),

    unit:
      form.unit.trim(),

    pack_size:
      form.pack_size.trim(),

    rating:
      form.rating === "" ||
      form.rating == null
        ? 0
        : Number(
            form.rating
          ),

    currency: "INR",

    description:
      form.description.trim(),

    short_description:
      form.description.trim(),

    features:
      Array.isArray(
        form.features
      )
        ? form.features
        : [],

    specs:
      form.specs || {},

    variants:
      form.variants || {},

    is_featured:
      Boolean(
        form.is_featured
      ),

    is_active:
      Boolean(
        form.is_active
      ),
  });

  /* =======================================================
     ADD PRODUCT VALIDATION
  ======================================================= */

  const validateProductForm = (
    form
  ) => {
    if (!form.name.trim()) {
      toast.error(
        "Product name is required."
      );

      return false;
    }

    if (!form.category_id) {
      toast.error(
        "Please select a category."
      );

      return false;
    }

    if (
      Number(
        form.price
      ) <= 0
    ) {
      toast.error(
        "Product price must be greater than zero."
      );

      return false;
    }

    if (
      Number(
        form.stock
      ) < 0
    ) {
      toast.error(
        "Stock cannot be negative."
      );

      return false;
    }

    return true;
  };

  /* =======================================================
     ADD FORM HELPERS
  ======================================================= */

  const clearTempFields =
    () => {
      setTempImageUrl("");
      setTempFeature("");
      setTempSpecKey("");
      setTempSpecValue("");
    };

  const handleAddImage =
    () => {
      const url =
        tempImageUrl.trim();

      if (!url) {
        return;
      }

      if (
        addForm.images.includes(
          url
        )
      ) {
        toast.info(
          "Image already added."
        );

        return;
      }

      setAddForm(
        (current) => ({
          ...current,

          images: [
            ...current.images,
            url,
          ],
        })
      );

      setTempImageUrl("");
    };

  const handleRemoveImage = (
    index
  ) => {
    setAddForm(
      (current) => ({
        ...current,

        images:
          current.images.filter(
            (
              _,
              imageIndex
            ) =>
              imageIndex !==
              index
          ),
      })
    );
  };

  const handleAddFeature =
    () => {
      const value =
        tempFeature.trim();

      if (!value) {
        return;
      }

      setAddForm(
        (current) => ({
          ...current,

          features: [
            ...current.features,
            value,
          ],
        })
      );

      setTempFeature("");
    };

  const handleRemoveFeature = (
    index
  ) => {
    setAddForm(
      (current) => ({
        ...current,

        features:
          current.features.filter(
            (
              _,
              itemIndex
            ) =>
              itemIndex !==
              index
          ),
      })
    );
  };

  const handleAddSpec =
    () => {
      const key =
        tempSpecKey.trim();

      const value =
        tempSpecValue.trim();

      if (!key || !value) {
        return;
      }

      setAddForm(
        (current) => ({
          ...current,

          specs: {
            ...current.specs,
            [key]: value,
          },
        })
      );

      setTempSpecKey("");
      setTempSpecValue("");
    };

  const handleRemoveSpec = (
    key
  ) => {
    setAddForm(
      (current) => {
        const specs = {
          ...current.specs,
        };

        delete specs[key];

        return {
          ...current,
          specs,
        };
      }
    );
  };

  const getAddFormProps =
    () => ({
      form:
        addForm,

      setForm:
        setAddForm,

      categories,

      tempImageUrl,
      setTempImageUrl,

      tempFeature,
      setTempFeature,

      tempSpecKey,
      setTempSpecKey,

      tempSpecValue,
      setTempSpecValue,

      onAddImage:
        handleAddImage,

      onRemoveImage:
        handleRemoveImage,

      onAddFeature:
        handleAddFeature,

      onRemoveFeature:
        handleRemoveFeature,

      onAddSpec:
        handleAddSpec,

      onRemoveSpec:
        handleRemoveSpec,
    });

  /* =======================================================
     ADD PRODUCT
  ======================================================= */

  const openAddModal =
    () => {
      clearTempFields();

      const form =
        createEmptyForm();

      if (
        categories.length
      ) {
        form.category_id =
          categories[0].id;
      }

      setAddForm(form);
      setShowAddModal(true);
    };

  const closeAddModal =
    () => {
      if (saving) {
        return;
      }

      setShowAddModal(false);

      setAddForm(
        createEmptyForm()
      );

      clearTempFields();
    };

  const handleSaveNewProduct =
    async () => {
      if (
        !validateProductForm(
          addForm
        )
      ) {
        return;
      }

      try {
        setSaving(true);

        const payload =
          formatProductPayload(
            addForm
          );

        const created =
          await createAdminProduct(
            payload
          );

        const product =
          created?.data ||
          created;

        if (!product?.id) {
          throw new Error(
            "Product ID was not returned."
          );
        }

        await syncAdminProductImages(
          product.id,
          addForm.images
        );

        toast.success(
          "Product added successfully."
        );

        setShowAddModal(false);

        setAddForm(
          createEmptyForm()
        );

        clearTempFields();

        await fetchProducts({
          silent: true,
        });
      } catch (
        saveError
      ) {
        console.error(
          "Create product error:",
          saveError
        );

        toast.error(
          saveError?.message ||
            "Failed to add product."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =========================================================
     OPEN COMPLETE PRODUCT EDITOR

     One modal contains ALL pack sizes.
  ========================================================= */

  const openEditProduct = (
    group
  ) => {
    const representative =
      group.representative;

    setEditingGroup(group);

    setEditCommon({
      name:
        group.name || "",

      brand:
        group.brand || "",

      category_id:
        group.categoryId ||
        representative?.categoryId ||
        representative?.category_id ||
        "",

      categoryName:
        group.categoryName ||
        representative?.categoryName ||
        representative?.category_name ||
        "Uncategorized",

      rating:
        representative?.rating ??
        "",

      description:
        representative?.description ||
        "",

      images:
        representative?.images ||
        [],

      features:
        representative?.features ||
        [],

      specs:
        representative?.specs ||
        {},

      is_featured:
        group.isFeatured,

      is_active:
        group.isActive,
    });

    setEditVariants(
      group.variants.map(
        (
          variant,
          index
        ) =>
          createEditableVariant(
            variant,
            index
          )
      )
    );

    setEditImageInput("");
    setEditFeatureInput("");
    setEditSpecKey("");
    setEditSpecValue("");

    setShowEditModal(true);
  };

  const closeEditProduct =
    () => {
      if (saving) {
        return;
      }

      setShowEditModal(false);

      setEditingGroup(null);

      setEditCommon(
        createEmptyCommonEdit()
      );

      setEditVariants([]);
      setEditImageInput("");
      setImageUploading(false);
    };

  /* =========================================================
     EDIT COMMON PRODUCT
  ========================================================= */

  const updateCommon = (
    field,
    value
  ) => {
    setEditCommon(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  /* =========================================================
     EDIT PACK VARIANT
  ========================================================= */

  const updateVariant = (
    index,
    field,
    value
  ) => {
    setEditVariants(
      (current) =>
        current.map(
          (
            variant,
            variantIndex
          ) =>
            variantIndex ===
            index
              ? {
                  ...variant,
                  [field]: value,
                }
              : variant
        )
    );
  };

  /* =========================================================
     CHANGE PACK STATUS

     Active       -> available and must have stock > 0
     Out of Stock -> available product with stock forced to 0
     Inactive     -> hidden/unavailable pack
  ========================================================= */

  const updateVariantStatus = (
    index,
    status
  ) => {
    setEditVariants(
      (current) =>
        current.map(
          (variant, variantIndex) => {
            if (variantIndex !== index) {
              return variant;
            }

            if (status === "out-of-stock") {
              return {
                ...variant,
                status,
                isActive: true,
                stock: 0,
              };
            }

            if (status === "inactive") {
              return {
                ...variant,
                status,
                isActive: false,
              };
            }

            return {
              ...variant,
              status: "active",
              isActive: true,
            };
          }
        )
    );
  };

  /* =========================================================
     ADD A NEW PACK SIZE
  ========================================================= */

  const addPackVariant =
    () => {
      setEditVariants(
        (current) => [
          ...current,

          createEditableVariant(
            {},
            current.length
          ),
        ]
      );
    };

  /* =========================================================
     REMOVE UNSAVED NEW PACK

     Existing database SKUs are not deleted here because
     old carts/orders may reference their IDs.

     Existing packs can instead be made unavailable.
  ========================================================= */

  const removeNewVariant = (
    index
  ) => {
    const variant =
      editVariants[index];

    if (variant?.id) {
      toast.info(
        "Existing pack sizes are preserved for order history. Set its status to Inactive instead."
      );

      return;
    }

    setEditVariants(
      (current) =>
        current.filter(
          (
            _,
            variantIndex
          ) =>
            variantIndex !==
            index
        )
    );
  };

  /* =========================================================
     EDIT IMAGES
  ========================================================= */

  const addEditImage =
    async () => {
      const value =
        editImageInput.trim();

      if (!value) {
        return;
      }

      if (editCommon.images.length >= MAX_PRODUCT_IMAGES) {
        toast.error(`You can add up to ${MAX_PRODUCT_IMAGES} images.`);
        return;
      }

      if (!isPublicImageUrl(value)) {
        toast.error("Please paste a valid http/https image URL.");
        return;
      }

      if (editCommon.images.includes(value)) {
        toast.info("Image already added.");
        return;
      }

      try {
        setImageUploading(true);

        const loadable =
          await canLoadImageUrl(value);

        if (!loadable) {
          toast.error(
            "This URL does not expose a directly loadable image. Try a direct image URL or use Upload Photo."
          );
          return;
        }

        setEditCommon(
          (current) => ({
            ...current,
            images: [
              ...current.images,
              value,
            ],
          })
        );

        setEditImageInput("");
      } finally {
        setImageUploading(false);
      }
    };

  const handleEditImageUpload =
    async (event) => {
      const files =
        Array.from(event.target.files || []);

      // Allows selecting the same file again later.
      event.target.value = "";

      if (!files.length) {
        return;
      }

      const remainingSlots =
        MAX_PRODUCT_IMAGES -
        editCommon.images.length;

      if (remainingSlots <= 0) {
        toast.error(`You can add up to ${MAX_PRODUCT_IMAGES} images.`);
        return;
      }

      try {
        setImageUploading(true);

        const selectedFiles =
          files.slice(0, remainingSlots);

        const uploadedImages = [];

        for (const file of selectedFiles) {
          const dataUrl =
            await compressImageFile(file);

          uploadedImages.push(dataUrl);
        }

        setEditCommon(
          (current) => ({
            ...current,
            images: [
              ...current.images,
              ...uploadedImages,
            ].slice(0, MAX_PRODUCT_IMAGES),
          })
        );

        toast.success(
          `${uploadedImages.length} image${
            uploadedImages.length === 1 ? "" : "s"
          } ready to save.`
        );
      } catch (uploadError) {
        console.error(
          "Product image upload error:",
          uploadError
        );

        toast.error(
          uploadError?.message ||
            "Unable to upload image."
        );
      } finally {
        setImageUploading(false);
      }
    };

  const removeEditImage = (
    index
  ) => {
    setEditCommon(
      (current) => ({
        ...current,

        images:
          current.images.filter(
            (
              _,
              imageIndex
            ) =>
              imageIndex !==
              index
          ),
      })
    );
  };

  /* =========================================================
     EDIT FEATURES
  ========================================================= */

  const addEditFeature =
    () => {
      const value =
        editFeatureInput.trim();

      if (!value) {
        return;
      }

      setEditCommon(
        (current) => ({
          ...current,

          features: [
            ...current.features,
            value,
          ],
        })
      );

      setEditFeatureInput("");
    };

  const removeEditFeature = (
    index
  ) => {
    setEditCommon(
      (current) => ({
        ...current,

        features:
          current.features.filter(
            (
              _,
              itemIndex
            ) =>
              itemIndex !==
              index
          ),
      })
    );
  };

  /* =========================================================
     EDIT SPECS
  ========================================================= */

  const addEditSpec =
    () => {
      const key =
        editSpecKey.trim();

      const value =
        editSpecValue.trim();

      if (!key || !value) {
        return;
      }

      setEditCommon(
        (current) => ({
          ...current,

          specs: {
            ...current.specs,
            [key]: value,
          },
        })
      );

      setEditSpecKey("");
      setEditSpecValue("");
    };

  const removeEditSpec = (
    key
  ) => {
    setEditCommon(
      (current) => {
        const specs = {
          ...current.specs,
        };

        delete specs[key];

        return {
          ...current,
          specs,
        };
      }
    );
  };

  /* =========================================================
     VALIDATE COMPLETE PRODUCT
  ========================================================= */

  const validateLogicalProduct =
    () => {
      if (
        !editCommon.name.trim()
      ) {
        toast.error(
          "Product name is required."
        );

        return false;
      }

      if (
        editVariants.length ===
        0
      ) {
        toast.error(
          "At least one pack size is required."
        );

        return false;
      }

      for (
        let index = 0;
        index <
        editVariants.length;
        index += 1
      ) {
        const variant =
          editVariants[index];

        if (
          Number(
            variant.price
          ) <= 0
        ) {
          toast.error(
            `Pack ${
              index + 1
            }: MRP must be greater than zero.`
          );

          return false;
        }

        if (
          Number(
            variant.stock
          ) < 0
        ) {
          toast.error(
            `Pack ${
              index + 1
            }: stock cannot be negative.`
          );

          return false;
        }

        if (
          variant.status ===
            "active" &&
          Number(variant.stock || 0) <= 0
        ) {
          toast.error(
            `Pack ${
              index + 1
            }: Active packs must have stock greater than zero. Choose Out of Stock if inventory is zero.`
          );

          return false;
        }

        if (
          variant.discountPrice !==
            "" &&
          variant.discountPrice !=
            null &&
          Number(
            variant.discountPrice
          ) >
            Number(
              variant.price
            )
        ) {
          toast.error(
            `Pack ${
              index + 1
            }: discount price cannot exceed MRP.`
          );

          return false;
        }
      }

      return true;
    };

  /* =========================================================
     SAVE COMPLETE LOGICAL PRODUCT

     Updates ALL existing SKU rows and creates new rows for
     any new pack sizes added in this editor.
  ========================================================= */

  const handleSaveLogicalProduct =
    async () => {
      if (
        !editingGroup ||
        !validateLogicalProduct()
      ) {
        return;
      }

      try {
        setSaving(true);

        const groupKey =
          createProductGroupKey(
            editCommon.brand,
            editCommon.name
          );

        for (
          let index = 0;
          index <
          editVariants.length;
          index += 1
        ) {
          const variant =
            editVariants[index];

          const packLabel =
            variant.packSize ||
            (
              variant.quantity &&
              variant.unit
                ? `${variant.quantity}-${variant.unit}`
                : `pack-${index + 1}`
            );

          const payload = {
            name:
              editCommon.name.trim(),

            slug:
              variant.slug ||
              `${slugify(
                editCommon.name
              )}-${slugify(
                packLabel
              )}-${Date.now()}-${index}`,

            product_group_key:
              groupKey,

            category_id:
              editCommon.category_id ||
              editingGroup.categoryId ||
              editingGroup.representative?.categoryId ||
              editingGroup.representative?.category_id ||
              null,

            brand:
              editCommon.brand.trim(),

            price:
              Number(
                variant.price || 0
              ),

            discount_price:
              variant.discountPrice ===
                "" ||
              variant.discountPrice ==
                null
                ? null
                : Number(
                    variant.discountPrice
                  ),

            stock:
              variant.status ===
              "out-of-stock"
                ? 0
                : Number(
                    variant.stock || 0
                  ),

            quantity:
              variant.quantity ===
                "" ||
              variant.quantity ==
                null
                ? null
                : Number(
                    variant.quantity
                  ),

            unit:
              String(
                variant.unit || ""
              ).trim(),

            pack_size:
              String(
                variant.packSize ||
                  ""
              ).trim(),

            rating:
              Number(
                editCommon.rating ||
                  0
              ),

            currency:
              "INR",

            description:
              editCommon.description.trim(),

            short_description:
              editCommon.description.trim(),

            features:
              editCommon.features,

            specs:
              editCommon.specs,

            variants:
              variant.variants ||
              {},

            is_featured:
              Boolean(
                editCommon.is_featured
              ),

            /*
              Product-level Inactive hides every pack.
              Otherwise each pack uses its selected status.
              Out of Stock remains active but stock is saved as 0.
            */
            is_active:
              Boolean(
                editCommon.is_active
              ) &&
              variant.status !==
                "inactive",
          };

          let productId =
            variant.id;

          if (variant.id) {
            await updateAdminProduct(
              variant.id,
              payload
            );
          } else {
            const created =
              await createAdminProduct(
                payload
              );

            const createdProduct =
              created?.data ||
              created;

            productId =
              createdProduct?.id;

            if (!productId) {
              throw new Error(
                `Unable to create ${packLabel} pack.`
              );
            }
          }

          /*
            Apply the common product images to every pack.
            This keeps pack rows visually consistent.
          */

          await syncAdminProductImages(
            productId,
            editCommon.images
          );
        }

        toast.success(
          "Product and all pack sizes updated successfully."
        );

        setShowEditModal(false);

        setEditingGroup(null);

        setEditVariants([]);

        await fetchProducts({
          silent: true,
        });
      } catch (
        saveError
      ) {
        console.error(
          "Logical product update error:",
          saveError
        );

        toast.error(
          saveError?.message ||
            "Failed to save product."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />

          <p className="mt-3 text-sm text-gray-600">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="admin-products space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
            Grocery Catalog
          </p>

          <h1 className="text-2xl font-bold text-gray-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Manage each product and
            all its available pack sizes
            from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              fetchProducts({
                silent: true,
              })
            }
            disabled={
              refreshing
            }
            className="flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-4 py-2 text-sm font-semibold text-gray-700 backdrop-blur-xl hover:bg-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={
              openAddModal
            }
            className="flex items-center gap-2 rounded-full bg-gradient-to-b from-gray-500 to-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-md"
          >
            <Plus className="h-4 w-4" />

            Add Product
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">
        {[
          {
            label: "Products",
            value: stats.totalProducts,
            sub: "Logical grocery products",
          },
          {
            label: "SKUs",
            value: stats.skuCount,
            sub: "Pack variants",
          },
          {
            label: "Active SKUs",
            value: stats.activeSkus,
            sub: `${stats.activeLogical} active products`,
          },
          {
            label: "Out of Stock",
            value: stats.outOfStockSkus,
            sub: `${stats.outOfStockLogical} affected products`,
          },
          {
            label: "Inactive SKUs",
            value: stats.inactiveSkus,
            sub: `${stats.inactiveLogical} inactive products`,
          },
          {
            label: "Featured SKUs",
            value: stats.featuredSkus,
            sub: `${stats.featuredLogical} featured products`,
          },
          {
            label: "Inventory Value",
            value: formatPrice(stats.inventoryValue),
            sub: `${stats.stockUnits.toLocaleString("en-IN")} units in stock`,
            compact: true,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/60 bg-white/40 p-4 backdrop-blur-xl"
          >
            <p className="text-xs text-gray-500">
              {card.label}
            </p>

            <p
              className={`mt-1 font-bold text-gray-900 ${
                card.compact
                  ? "text-lg xl:text-xl"
                  : "text-2xl"
              }`}
            >
              {card.value}
            </p>

            <p className="mt-1 text-[11px] text-gray-400">
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="rounded-[2rem] border border-white/60 bg-white/40 p-4 backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_200px_180px]">

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={
                searchTerm
              }
              onChange={(
                event
              ) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search product, brand, category, pack..."
              className="h-11 w-full rounded-2xl border border-white/70 bg-white/60 pl-11 pr-4 text-sm outline-none"
            />
          </div>

          <select
            value={
              selectedCategory
            }
            onChange={(
              event
            ) =>
              setSelectedCategory(
                event.target.value
              )
            }
            className="h-11 rounded-2xl border border-white/70 bg-white/60 px-4 text-sm"
          >
            <option value="all">
              All Categories
            </option>

            {filterCategories.map(
              (category) => (
                <option
                  key={
                    category.value
                  }
                  value={
                    category.value
                  }
                >
                  {
                    category.name
                  }
                </option>
              )
            )}
          </select>

          <select
            value={
              selectedStatus
            }
            onChange={(
              event
            ) =>
              setSelectedStatus(
                event.target.value
              )
            }
            className="h-11 rounded-2xl border border-white/70 bg-white/60 px-4 text-sm"
          >
            <option value="all">
              All Statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="out-of-stock">
              Out of Stock
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>
      </div>

      {/* =====================================================
          PRODUCT TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-xl">

        <div className="border-b border-gray-200/50 px-5 py-4">
          <h2 className="font-bold text-gray-900">
            Grocery Catalog
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            {
              filteredProducts.length
            }{" "}
            products found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">

            <thead>
              <tr className="border-b border-gray-200/50">
                {[
                  "Product",
                  "Category",
                  "Price Range",
                  "Stock",
                  "Status",
                  "Pack Sizes",
                  "Actions",
                ].map(
                  (heading) => (
                    <th
                      key={
                        heading
                      }
                      className={`px-5 py-3 text-[10px] font-semibold uppercase text-gray-400 ${
                        heading ===
                        "Actions"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {paginatedProducts.map(
                (product) => (
                  <tr
                    key={
                      product.key
                    }
                    className="border-b border-gray-100/70 hover:bg-white/35"
                  >

                    {/* PRODUCT */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/70">
                          {product.images
                            ?.length ? (
                            <img
                              src={
                                product.images[0]
                              }
                              alt={
                                product.name
                              }
                              className="h-full w-full object-contain p-1"
                              referrerPolicy="no-referrer"
                              onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = IMAGE_PLACEHOLDER;
                              }}
                            />
                          ) : (
                            <Package className="h-5 w-5 text-gray-300" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="max-w-[240px] truncate text-sm font-semibold text-gray-900">
                              {
                                product.name
                              }
                            </p>

                            {product.isFeatured && (
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            )}
                          </div>

                          <p className="mt-1 text-xs text-gray-500">
                            {product.brand ||
                              "Grocery"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {
                        product.categoryName
                      }
                    </td>

                    {/* PRICE */}

                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                      {formatPriceRange(
                        product
                      )}
                    </td>

                    {/* STOCK */}

                    <td className="px-5 py-4 text-sm font-semibold">
                      {
                        product.totalStock
                      }
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          product.status
                        )}`}
                      >
                        {formatStatus(
                          product.status
                        )}
                      </span>
                    </td>

                    {/* PACKS */}

                    <td className="px-5 py-4">
                      <div className="flex max-w-[220px] flex-wrap gap-1.5">
                        {product.packs
                          .slice(
                            0,
                            4
                          )
                          .map(
                            (
                              pack,
                              index
                            ) => (
                              <span
                                key={`${pack}-${index}`}
                                className="rounded-full border border-white bg-white/60 px-2.5 py-1 text-[11px] text-gray-600"
                              >
                                {pack}
                              </span>
                            )
                          )}

                        {product.packs
                          .length >
                          4 && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-500">
                            +
                            {product.packs
                              .length -
                              4}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* EDIT WHOLE PRODUCT */}

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          openEditProduct(
                            product
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-white"
                      >
                        <Edit3 className="h-3.5 w-3.5" />

                        Edit
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        {filteredProducts.length >
          PRODUCTS_PER_PAGE && (
          <div className="flex items-center justify-between border-t border-gray-200/50 px-5 py-4">
            <p className="text-xs text-gray-500">
              Page {currentPage} of{" "}
              {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  currentPage <= 1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
                className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  currentPage >=
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
                className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          ADD PRODUCT MODAL
      ===================================================== */}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b px-6 py-5">
              <h3 className="text-lg font-bold">
                Add Grocery Product
              </h3>

              <button
                type="button"
                onClick={
                  closeAddModal
                }
              >
                <X />
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto p-6">
              <ProductForm
                {...getAddFormProps()}
              />
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-5">
              <button
                type="button"
                onClick={
                  closeAddModal
                }
                className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveNewProduct
                }
                disabled={
                  saving
                }
                className="rounded-full bg-gradient-to-b from-gray-500 to-gray-800 px-5 py-2.5 text-sm font-semibold text-white"
              >
                {saving
                  ? "Adding..."
                  : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          COMPLETE PRODUCT EDIT MODAL
      ===================================================== */}

      {showEditModal &&
        editingGroup && (
          <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/45 p-4 backdrop-blur-sm">

            <div className="mx-auto my-6 w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white bg-[#f7f9fb] shadow-2xl">

              {/* HEADER */}

              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white/95 px-7 py-5 backdrop-blur-xl">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Edit Product
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    {
                      editCommon.name
                    }
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Manage product details and
                    all available pack sizes
                    together.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeEditProduct
                  }
                  disabled={
                    saving
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[76vh] space-y-6 overflow-y-auto p-7">

                {/* =============================================
                    PRODUCT DETAILS
                ============================================= */}

                <section className="rounded-3xl border border-white bg-white/75 p-6 shadow-sm">
                  <h3 className="text-base font-bold text-gray-900">
                    Product Details
                  </h3>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">

                    <label className="block">
                      <span className="text-xs font-semibold text-gray-500">
                        Product Name
                      </span>

                      <input
                        value={
                          editCommon.name
                        }
                        onChange={(
                          event
                        ) =>
                          updateCommon(
                            "name",
                            event.target.value
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-gray-500">
                        Brand
                      </span>

                      <input
                        value={
                          editCommon.brand
                        }
                        onChange={(
                          event
                        ) =>
                          updateCommon(
                            "brand",
                            event.target.value
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none"
                      />
                    </label>

                    <div>
                      <span className="text-xs font-semibold text-gray-500">
                        Category
                      </span>

                      <div className="mt-2 flex h-11 w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-700">
                        {
                          editCommon.categoryName ||
                          editingGroup.categoryName ||
                          "Uncategorized"
                        }
                      </div>

                      <p className="mt-1.5 text-[11px] text-gray-400">
                        Category is recognized automatically from the grocery catalog.
                      </p>
                    </div>

                    <label>
                      <span className="text-xs font-semibold text-gray-500">
                        Rating
                      </span>

                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={
                          editCommon.rating
                        }
                        onChange={(
                          event
                        ) =>
                          updateCommon(
                            "rating",
                            event.target.value
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-4"
                      />
                    </label>
                  </div>

                  <label className="mt-4 block">
                    <span className="text-xs font-semibold text-gray-500">
                      Description
                    </span>

                    <textarea
                      rows={4}
                      value={
                        editCommon.description
                      }
                      onChange={(
                        event
                      ) =>
                        updateCommon(
                          "description",
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-4 text-sm outline-none"
                    />
                  </label>

                  {/* STATUS */}

                  <div className="mt-5 flex flex-wrap gap-5">
                    <label className="flex items-center gap-3 text-sm font-medium">
                      <span className="text-xs font-semibold text-gray-500">
                        Product Status
                      </span>

                      <select
                        value={
                          editCommon.is_active
                            ? "active"
                            : "inactive"
                        }
                        onChange={(event) =>
                          updateCommon(
                            "is_active",
                            event.target.value ===
                              "active"
                          )
                        }
                        className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 outline-none"
                      >
                        <option value="active">
                          Active
                        </option>

                        <option value="inactive">
                          Inactive
                        </option>
                      </select>
                    </label>

                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={
                          editCommon.is_featured
                        }
                        onChange={(
                          event
                        ) =>
                          updateCommon(
                            "is_featured",
                            event.target.checked
                          )
                        }
                      />

                      Featured Product
                    </label>
                  </div>
                </section>

                {/* =============================================
                    PACK SIZES
                ============================================= */}

                <section className="rounded-3xl border border-white bg-white/75 p-6 shadow-sm">

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Pack Sizes & Inventory
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Each pack can have its own
                        size, price, stock and
                        availability.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        addPackVariant
                      }
                      className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />

                      Add Pack
                    </button>
                  </div>

                  <div className="mt-5 space-y-4">
                    {editVariants.map(
                      (
                        variant,
                        index
                      ) => (
                        <div
                          key={
                            variant.localKey
                          }
                          className="rounded-2xl border border-gray-200 bg-[#f8fafc] p-5"
                        >

                          <div className="mb-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                Pack {index + 1}
                              </p>

                              <p className="text-xs text-gray-400">
                                {variant.id
                                  ? `Existing SKU ${String(
                                      variant.id
                                    ).slice(
                                      0,
                                      8
                                    )}`
                                  : "New pack size"}
                              </p>
                            </div>

                            {!variant.id && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeNewVariant(
                                    index
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                            {/* PACK LABEL */}

                            <label>
                              <span className="text-[11px] font-semibold text-gray-500">
                                Pack Label
                              </span>

                              <input
                                value={
                                  variant.packSize
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateVariant(
                                    index,
                                    "packSize",
                                    event.target.value
                                  )
                                }
                                placeholder="e.g. 500 g"
                                className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm"
                              />
                            </label>

                            {/* QUANTITY */}

                            <label>
                              <span className="text-[11px] font-semibold text-gray-500">
                                Quantity
                              </span>

                              <input
                                type="number"
                                min="0"
                                value={
                                  variant.quantity
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateVariant(
                                    index,
                                    "quantity",
                                    event.target.value
                                  )
                                }
                                placeholder="500"
                                className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm"
                              />
                            </label>

                            {/* UNIT */}

                            <label>
                              <span className="text-[11px] font-semibold text-gray-500">
                                Unit
                              </span>

                              <select
                                value={
                                  variant.unit
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateVariant(
                                    index,
                                    "unit",
                                    event.target.value
                                  )
                                }
                                className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none"
                              >
                                <option value="">
                                  Select unit
                                </option>

                                {variant.unit &&
                                  !UNIT_OPTIONS.includes(
                                    variant.unit
                                  ) && (
                                    <option
                                      value={
                                        variant.unit
                                      }
                                    >
                                      {
                                        variant.unit
                                      }
                                    </option>
                                  )}

                                {UNIT_OPTIONS.map(
                                  (unit) => (
                                    <option
                                      key={
                                        unit
                                      }
                                      value={
                                        unit
                                      }
                                    >
                                      {
                                        unit
                                      }
                                    </option>
                                  )
                                )}
                              </select>
                            </label>

                            {/* STOCK */}

                            <label>
                              <span className="text-[11px] font-semibold text-gray-500">
                                Stock
                              </span>

                              <input
                                type="number"
                                min="0"
                                value={
                                  variant.stock
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateVariant(
                                    index,
                                    "stock",
                                    event.target.value
                                  )
                                }
                                className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm"
                              />
                            </label>

                            {/* MRP */}

                            <label>
                              <span className="text-[11px] font-semibold text-gray-500">
                                MRP ₹
                              </span>

                              <input
                                type="number"
                                min="0"
                                value={
                                  variant.price
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateVariant(
                                    index,
                                    "price",
                                    event.target.value
                                  )
                                }
                                className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm"
                              />
                            </label>

                            {/* DISCOUNT */}

                            <label>
                              <span className="text-[11px] font-semibold text-gray-500">
                                Discount Price ₹
                              </span>

                              <input
                                type="number"
                                min="0"
                                value={
                                  variant.discountPrice
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateVariant(
                                    index,
                                    "discountPrice",
                                    event.target.value
                                  )
                                }
                                placeholder="Optional"
                                className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm"
                              />
                            </label>

                            {/* STATUS */}

                            <label>
                              <span className="text-[11px] font-semibold text-gray-500">
                                Status
                              </span>

                              <select
                                value={
                                  variant.status
                                }
                                onChange={(event) =>
                                  updateVariantStatus(
                                    index,
                                    event.target.value
                                  )
                                }
                                className={`mt-1.5 h-10 w-full rounded-xl border px-3 text-sm font-semibold outline-none ${
                                  variant.status ===
                                  "active"
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : variant.status ===
                                        "out-of-stock"
                                      ? "border-red-200 bg-red-50 text-red-700"
                                      : "border-gray-200 bg-gray-100 text-gray-600"
                                }`}
                              >
                                <option value="active">
                                  Active
                                </option>

                                <option value="out-of-stock">
                                  Out of Stock
                                </option>

                                <option value="inactive">
                                  Inactive
                                </option>
                              </select>
                            </label>

                            {/* STATUS NOTE */}

                            <div className="flex items-end">
                              <div className="min-h-10 w-full rounded-xl bg-white px-3 py-2 text-[11px] leading-5 text-gray-500">
                                {variant.status ===
                                "out-of-stock"
                                  ? "Stock is automatically saved as 0."
                                  : variant.status ===
                                      "inactive"
                                    ? "This pack will not be available to shoppers."
                                    : "Active packs must have stock greater than 0."}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </section>

                {/* =============================================
                    IMAGES
                ============================================= */}

                <section className="rounded-3xl border border-white bg-white/75 p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Product Images
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Paste a direct public image URL or upload from your computer.
                        The first image is used as the primary image.
                      </p>
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-500">
                      {editCommon.images.length}/{MAX_PRODUCT_IMAGES} images
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                    <input
                      type="url"
                      value={editImageInput}
                      onChange={(event) =>
                        setEditImageInput(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addEditImage();
                        }
                      }}
                      placeholder="Paste direct image URL (https://...)"
                      className="h-11 min-w-0 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-gray-400"
                    />

                    <button
                      type="button"
                      onClick={addEditImage}
                      disabled={
                        imageUploading ||
                        !editImageInput.trim() ||
                        editCommon.images.length >= MAX_PRODUCT_IMAGES
                      }
                      className="h-11 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {imageUploading ? "Checking..." : "Add URL"}
                    </button>

                    <label
                      className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50 ${
                        imageUploading ||
                        editCommon.images.length >= MAX_PRODUCT_IMAGES
                          ? "pointer-events-none opacity-50"
                          : ""
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      Upload Photo

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        multiple
                        onChange={handleEditImageUpload}
                        className="hidden"
                        disabled={
                          imageUploading ||
                          editCommon.images.length >= MAX_PRODUCT_IMAGES
                        }
                      />
                    </label>
                  </div>

                  <p className="mt-2 text-[11px] text-gray-400">
                    Uploads are compressed before saving. Maximum 8 MB per file.
                    If a website blocks image hotlinking, use Upload Photo instead.
                  </p>

                  {editCommon.images.length > 0 ? (
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                      {editCommon.images.map((image, index) => (
                        <div
                          key={`${String(image).slice(0, 40)}-${index}`}
                          className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-white"
                        >
                          <img
                            src={image}
                            alt={`${editCommon.name || "Product"} ${index + 1}`}
                            className="h-full w-full object-contain p-2"
                            referrerPolicy="no-referrer"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = IMAGE_PLACEHOLDER;
                            }}
                          />

                          {index === 0 && (
                            <span className="absolute bottom-2 left-2 rounded-full bg-gray-900/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                              Primary
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => removeEditImage(index)}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
                            title="Remove image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 flex min-h-28 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/70">
                      <div className="text-center">
                        <ImageOff className="mx-auto h-6 w-6 text-gray-300" />
                        <p className="mt-2 text-xs text-gray-400">
                          No product image added yet.
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* =============================================
                    FEATURES
                ============================================= */}

                <section className="rounded-3xl border border-white bg-white/75 p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900">
                    Features
                  </h3>

                  <div className="mt-4 flex gap-2">
                    <input
                      value={
                        editFeatureInput
                      }
                      onChange={(
                        event
                      ) =>
                        setEditFeatureInput(
                          event.target.value
                        )
                      }
                      placeholder="Add feature"
                      className="h-10 flex-1 rounded-xl border border-gray-200 px-4"
                    />

                    <button
                      type="button"
                      onClick={
                        addEditFeature
                      }
                      className="rounded-xl bg-gray-900 px-4 text-sm text-white"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {editCommon.features.map(
                      (
                        feature,
                        index
                      ) => (
                        <span
                          key={`${feature}-${index}`}
                          className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs"
                        >
                          {feature}

                          <button
                            type="button"
                            onClick={() =>
                              removeEditFeature(
                                index
                              )
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )
                    )}
                  </div>
                </section>

                {/* =============================================
                    SPECIFICATIONS
                ============================================= */}

                <section className="rounded-3xl border border-white bg-white/75 p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900">
                    Specifications
                  </h3>

                  <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <input
                      value={
                        editSpecKey
                      }
                      onChange={(
                        event
                      ) =>
                        setEditSpecKey(
                          event.target.value
                        )
                      }
                      placeholder="Key"
                      className="h-10 rounded-xl border border-gray-200 px-4"
                    />

                    <input
                      value={
                        editSpecValue
                      }
                      onChange={(
                        event
                      ) =>
                        setEditSpecValue(
                          event.target.value
                        )
                      }
                      placeholder="Value"
                      className="h-10 rounded-xl border border-gray-200 px-4"
                    />

                    <button
                      type="button"
                      onClick={
                        addEditSpec
                      }
                      className="rounded-xl bg-gray-900 px-5 text-sm text-white"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    {Object.entries(
                      editCommon.specs
                    ).map(
                      ([
                        key,
                        value,
                      ]) => (
                        <div
                          key={
                            key
                          }
                          className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm"
                        >
                          <span>
                            <strong>
                              {key}:
                            </strong>{" "}
                            {String(
                              value
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeEditSpec(
                                key
                              )
                            }
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </section>
              </div>

              {/* SAVE */}

              <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-200 bg-white/95 px-7 py-5 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={
                    closeEditProduct
                  }
                  disabled={
                    saving
                  }
                  className="rounded-full bg-gray-100 px-6 py-2.5 text-sm font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleSaveLogicalProduct
                  }
                  disabled={
                    saving
                  }
                  className="rounded-full bg-gradient-to-b from-gray-500 to-gray-800 px-7 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Product"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminProducts;