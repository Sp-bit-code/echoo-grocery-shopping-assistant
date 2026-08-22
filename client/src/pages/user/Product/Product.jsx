import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Package,
  Plus,
  Star,
  ZoomIn,
  X,
} from "lucide-react";

import { toast } from "react-toastify";

import useProducts from "../../../hooks/useProducts.js";

import {
  getProducts,
} from "../../../api/productApi.js";

import {
  useAuth,
} from "../../../context/AuthContext.jsx";

import {
  useCart,
} from "../../../context/CartContext.jsx";

import SimpleFooter from "../../../components/layout/SimpleFoot/SimpleFoot.jsx";

import "./Product.css";

/* =========================================================
   FALLBACK IMAGE
========================================================= */

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='700' height='700' viewBox='0 0 700 700'%3E%3Crect width='700' height='700' rx='40' fill='%23e5e7eb'/%3E%3Ctext x='350' y='350' text-anchor='middle' dominant-baseline='middle' fill='%239ca3af' font-size='28' font-family='Arial'%3ENo Image%3C/text%3E%3C/svg%3E";

/* =========================================================
   ORIGINAL ECHOO BUTTON
========================================================= */

const bubbleButtonClass =
  "bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white transition-all hover:from-gray-400 hover:to-gray-700 hover:scale-[1.02] active:scale-95";

/* =========================================================
   HELPERS
========================================================= */

const getPackLabel = (product) => {
  if (!product) {
    return "";
  }

  return (
    product.pack_size ||
    product.packSize ||
    [
      product.quantity,
      product.unit,
    ]
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          value !== ""
      )
      .join(" ") ||
    ""
  );
};

const getCategoryName = (product) => {
  if (!product) {
    return "";
  }

  if (typeof product.category === "string") {
    return product.category;
  }

  return (
    product.category_name ||
    product.categoryName ||
    product.categories?.name ||
    product.category?.name ||
    ""
  );
};

const getBaseProductName = (product) => {
  if (!product) {
    return "";
  }

  let name =
    String(product.name || "").trim();

  const pack =
    getPackLabel(product);

  if (pack) {
    const escapedPack =
      pack.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    name = name.replace(
      new RegExp(
        `\\s*[-–—]?\\s*${escapedPack}\\s*$`,
        "i"
      ),
      ""
    );
  }

  name = name.replace(
    /\s*[-–—]?\s*\d+(?:\.\d+)?\s*(ml|l|litre|liter|g|gm|kg|pcs?|pieces?|pack)\s*$/i,
    ""
  );

  return name.trim();
};

const getGroupKey = (product) => {
  if (!product) {
    return "";
  }

  return [
    String(product.brand || "")
      .trim()
      .toLowerCase(),

    getBaseProductName(product)
      .trim()
      .toLowerCase(),

    getCategoryName(product)
      .trim()
      .toLowerCase(),
  ].join("::");
};

const getPackSortValue = (product) => {
  if (!product) {
    return Number.MAX_SAFE_INTEGER;
  }

  const pack =
    String(
      getPackLabel(product) || ""
    )
      .trim()
      .toLowerCase();

  const match =
    pack.match(
      /(\d+(?:\.\d+)?)\s*(ml|l|litre|liter|g|gm|kg|pcs?|pieces?)?/
    );

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  const amount =
    Number(match[1]);

  const unit =
    match[2] || "";

  if (
    unit === "l" ||
    unit === "litre" ||
    unit === "liter" ||
    unit === "kg"
  ) {
    return amount * 1000;
  }

  return amount;
};

/* =========================================================
   IMAGES
========================================================= */

const normalizeImages = (product) => {
  if (!product) {
    return [];
  }

  const rawImages =
    product.images ||
    product.product_images ||
    [];

  if (
    Array.isArray(rawImages) &&
    rawImages.length > 0
  ) {
    return rawImages
      .map((image, index) => {
        if (typeof image === "string") {
          return {
            id: `image-${index}`,
            image_url: image,
          };
        }

        if (!image) {
          return null;
        }

        return {
          ...image,

          image_url:
            image.image_url ||
            image.url ||
            "",
        };
      })
      .filter(
        (image) =>
          image?.image_url
      );
  }

  if (product.primary_image) {
    return [
      {
        id: "primary",
        image_url:
          product.primary_image,
      },
    ];
  }

  if (product.image) {
    return [
      {
        id: "image",
        image_url:
          product.image,
      },
    ];
  }

  return [];
};

/* =========================================================
   PRICE
========================================================= */

const getSellingPrice = (product) => {
  if (!product) {
    return 0;
  }

  return Number(
    product.sellingPrice ??
      product.selling_price ??
      product.discount_price ??
      product.discountPrice ??
      product.price ??
      0
  );
};

/* =========================================================
   SPEC KEY NORMALIZATION

   Used to prevent:
   Unit
   Unit

   Pack Size
   Pack Size
========================================================= */

const normalizeSpecKey = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[_\-\s]/g, "")
    .trim();

/* =========================================================
   PAGE
========================================================= */

const ProductPage = () => {
  const { slug } =
    useParams();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    isAuthenticated,
  } = useAuth();

  const {
    addToCart,
  } = useCart();

  const {
    fetchProductBySlug,
  } = useProducts({
    autoFetch: false,
  });

  /* =========================================================
     STATE
  ========================================================= */

  const [
    initialProduct,
    setInitialProduct,
  ] = useState(null);

  const [
    variants,
    setVariants,
  ] = useState([]);

  const [
    selectedVariantId,
    setSelectedVariantId,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    activeImageIndex,
    setActiveImageIndex,
  ] = useState(0);

  const [
    isZoomed,
    setIsZoomed,
  ] = useState(false);

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    addingToCart,
    setAddingToCart,
  ] = useState(false);

  /* =========================================================
     LOAD PRODUCT + VARIANTS
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);

        const foundProduct =
          await fetchProductBySlug(
            slug
          );

        if (!mounted) {
          return;
        }

        if (!foundProduct?.id) {
          setInitialProduct(null);
          setVariants([]);
          return;
        }

        setInitialProduct(
          foundProduct
        );

        setSelectedVariantId(
          foundProduct.id
        );

        let allProducts = [];

        try {
          const response =
            await getProducts();

          allProducts =
            Array.isArray(response)
              ? response
              : response?.data || [];
        } catch (error) {
          console.warn(
            "Unable to load product variants:",
            error
          );
        }

        if (!mounted) {
          return;
        }

        const groupKey =
          getGroupKey(
            foundProduct
          );

        const matchingVariants =
          allProducts
            .filter(
              (item) =>
                item?.id &&
                getGroupKey(item) ===
                  groupKey
            )
            .sort(
              (a, b) =>
                getPackSortValue(a) -
                getPackSortValue(b)
            );

        const clickedIncluded =
          matchingVariants.some(
            (variant) =>
              String(
                variant.id
              ) ===
              String(
                foundProduct.id
              )
          );

        const finalVariants =
          clickedIncluded
            ? matchingVariants
            : [
                foundProduct,
                ...matchingVariants,
              ];

        setVariants(
          finalVariants.length
            ? finalVariants
            : [foundProduct]
        );

        setQuantity(1);
        setActiveImageIndex(0);
      } catch (error) {
        console.error(
          "Error fetching product:",
          error
        );

        if (mounted) {
          toast.error(
            "Failed to load product details."
          );

          setInitialProduct(null);
          setVariants([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [
    slug,
    fetchProductBySlug,
  ]);

  /* =========================================================
     SELECTED PRODUCT
  ========================================================= */

  const product =
    useMemo(() => {
      if (!initialProduct) {
        return null;
      }

      return (
        variants.find(
          (variant) =>
            String(
              variant?.id
            ) ===
            String(
              selectedVariantId
            )
        ) ||
        initialProduct
      );
    }, [
      variants,
      selectedVariantId,
      initialProduct,
    ]);

  /* =========================================================
     PRODUCT VALUES
  ========================================================= */

  const images =
    useMemo(
      () =>
        normalizeImages(
          product
        ),
      [product]
    );

  const activeImage =
    images[
      activeImageIndex
    ]?.image_url ||
    product?.primary_image ||
    product?.image ||
    fallbackImage;

  const packLabel =
    getPackLabel(
      product
    );

  const categoryName =
    getCategoryName(
      product
    );

  const displayName =
    getBaseProductName(
      product
    ) ||
    product?.name ||
    "";

  const stock =
    Number(
      product?.stock || 0
    );

  const originalPrice =
    Number(
      product?.price || 0
    );

  const sellingPrice =
    getSellingPrice(
      product
    );

  const discountPrice =
    product?.discount_price ??
    product?.discountPrice;

  const hasDiscount =
    discountPrice !== null &&
    discountPrice !== undefined &&
    Number(discountPrice) <
      originalPrice;

  const discountPercent =
    hasDiscount &&
    originalPrice > 0
      ? Math.round(
          ((originalPrice -
            sellingPrice) /
            originalPrice) *
            100
        )
      : 0;

  /* =========================================================
     REMOVE DUPLICATE SPECS
  ========================================================= */

  const filteredSpecs =
    useMemo(() => {
      if (!product) {
        return [];
      }

      const blockedKeys =
        new Set([
          "brand",
          "packsize",
          "quantity",
          "unit",
          "availability",
          "stock",
          "category",
          "categoryname",
          "price",
          "mrp",
        ]);

      const seenKeys =
        new Set();

      return Object.entries(
        product.specs || {}
      ).filter(
        ([key, value]) => {
          if (
            value === null ||
            value === undefined ||
            value === ""
          ) {
            return false;
          }

          const normalizedKey =
            normalizeSpecKey(
              key
            );

          if (
            blockedKeys.has(
              normalizedKey
            )
          ) {
            return false;
          }

          if (
            seenKeys.has(
              normalizedKey
            )
          ) {
            return false;
          }

          seenKeys.add(
            normalizedKey
          );

          return true;
        }
      );
    }, [product]);

  /* =========================================================
     CORE PRODUCT DETAILS
  ========================================================= */

  const productDetails =
    useMemo(() => {
      if (!product) {
        return [];
      }

      return [
        [
          "Brand",
          product.brand,
        ],

        [
          "Pack Size",
          packLabel,
        ],

        [
          "Availability",
          stock > 0
            ? `${stock} in stock`
            : "Out of stock",
        ],

        [
          "Category",
          categoryName,
        ],

        [
          "Unit",
          product.unit,
        ],
      ].filter(
        ([, value]) =>
          value !== null &&
          value !== undefined &&
          value !== ""
      );
    }, [
      product,
      packLabel,
      stock,
      categoryName,
    ]);

  /* =========================================================
     PACK CHANGE
  ========================================================= */

  const handleVariantChange = (
    variant
  ) => {
    if (!variant?.id) {
      return;
    }

    setSelectedVariantId(
      variant.id
    );

    setQuantity(1);
    setActiveImageIndex(0);
  };

  /* =========================================================
     IMAGE CONTROLS
  ========================================================= */

  const handleNextImage = () => {
    if (
      images.length <= 1
    ) {
      return;
    }

    setActiveImageIndex(
      (current) =>
        current + 1 >=
        images.length
          ? 0
          : current + 1
    );
  };

  const handlePrevImage = () => {
    if (
      images.length <= 1
    ) {
      return;
    }

    setActiveImageIndex(
      (current) =>
        current - 1 < 0
          ? images.length - 1
          : current - 1
    );
  };

  /* =========================================================
     QUANTITY
  ========================================================= */

  const increaseQuantity = () => {
    if (
      stock <= 0 ||
      quantity >= stock
    ) {
      return;
    }

    setQuantity(
      (current) =>
        current + 1
    );
  };

  const decreaseQuantity = () => {
    setQuantity(
      (current) =>
        Math.max(
          1,
          current - 1
        )
    );
  };

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const handleAddToCart =
    async () => {
      if (
        addingToCart ||
        !product?.id ||
        stock <= 0
      ) {
        return;
      }

      if (!isAuthenticated) {
        toast.info(
          "Please sign in to add groceries to your cart."
        );

        navigate(
          "/sign_in",
          {
            state: {
              from: location,
            },
          }
        );

        return;
      }

      try {
        setAddingToCart(
          true
        );

        await addToCart(
          product.id,
          quantity
        );

        toast.success(
          `${displayName}${
            packLabel
              ? ` (${packLabel})`
              : ""
          } added to cart`
        );
      } catch (error) {
        console.error(
          "Cart error:",
          error
        );

        toast.error(
          error?.message ||
            "Failed to add product to cart."
        );
      } finally {
        setAddingToCart(
          false
        );
      }
    };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="product-page font-dm-sans min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600 font-medium">
          <div className="w-7 h-7 border-[3px] border-gray-300 border-b-gray-800 rounded-full animate-spin" />

          Loading product...
        </div>
      </div>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!product) {
    return (
      <div className="product-page font-dm-sans min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] flex flex-col gap-5 items-center justify-center">

        <div className="text-gray-700 font-semibold text-lg">
          Product not found
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/categories"
            )
          }
          className={`${bubbleButtonClass} px-6 py-3 rounded-full text-sm font-semibold`}
        >
          Browse groceries
        </button>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="product-page font-dm-sans min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] pt-20 pb-12 overflow-x-hidden">

      {/* =====================================================
          PREVIEW
      ===================================================== */}

      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-5"
            onClick={() =>
              setIsZoomed(false)
            }
          >
            <button
              type="button"
              onClick={() =>
                setIsZoomed(false)
              }
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/20 text-white flex items-center justify-center border border-white/30 hover:bg-white/30"
            >
              <X size={22} />
            </button>

            <motion.img
              src={
                activeImage
              }
              alt={
                displayName
              }
              className="max-w-[94vw] max-h-[90vh] object-contain drop-shadow-2xl"
              initial={{
                scale: 0.88,
              }}
              animate={{
                scale: 1,
              }}
              exit={{
                scale: 0.88,
              }}
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
              onError={(
                event
              ) => {
                event.currentTarget.onerror =
                  null;

                event.currentTarget.src =
                  fallbackImage;
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          BACK
      ===================================================== */}

      <div className="max-w-[1450px] mx-auto px-6 mb-5">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/categories"
            )
          }
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-semibold"
        >
          <ChevronLeft
            size={19}
          />

          Back to Groceries
        </button>
      </div>

      {/* =====================================================
          TOP AREA
      ===================================================== */}

      <div className="max-w-[1450px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ===================================================
            PRODUCT INFO
        =================================================== */}

        <div className="lg:col-span-3">

          <section className="product-info-card h-full p-7">

            <p className="text-gray-500 font-semibold uppercase tracking-[0.15em] text-[11px] mb-3">
              {product.brand ||
                categoryName ||
                "Grocery"}
            </p>

            <h1 className="font-dm-sans text-4xl lg:text-[3.05rem] font-semibold leading-[1.02] tracking-[-0.045em] mb-5">
              {displayName}
            </h1>

            {packLabel && (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/55 border border-white/75 text-sm text-gray-600">

                <Package
                  size={15}
                />

                {
                  packLabel
                }
              </div>
            )}

            <div className="flex items-center flex-wrap gap-5 mt-6">

              <div className="flex items-center gap-2">

                <span
                  className={`w-2 h-2 rounded-full ${
                    stock > 0
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />

                <span
                  className={`text-sm font-semibold ${
                    stock > 0
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {stock > 0
                    ? "In Stock"
                    : "Out of Stock"}
                </span>
              </div>

              {Number(
                product.rating
              ) > 0 && (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">

                  <Star
                    size={15}
                    className="text-amber-500 fill-amber-500"
                  />

                  {Number(
                    product.rating
                  ).toFixed(1)}
                </div>
              )}
            </div>

            {product.short_description && (
              <p className="mt-7 text-gray-600 leading-7 text-sm">
                {
                  product.short_description
                }
              </p>
            )}
          </section>
        </div>

        {/* ===================================================
            IMAGE
        =================================================== */}

        <div className="lg:col-span-6">

          <div className="product-image-card relative h-full min-h-[540px] lg:min-h-[610px] flex items-center justify-center p-6">

            <button
              type="button"
              onClick={() =>
                setIsZoomed(true)
              }
              className={`${bubbleButtonClass} absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold`}
            >
              <ZoomIn
                size={15}
              />

              Preview
            </button>

            <motion.img
              key={`${product.id}-${activeImage}`}
              src={
                activeImage
              }
              alt={
                displayName
              }
              onClick={() =>
                setIsZoomed(true)
              }
              className="relative z-10 w-[78%] h-[78%] max-h-[500px] object-contain cursor-zoom-in"
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.25,
              }}
              onError={(
                event
              ) => {
                event.currentTarget.onerror =
                  null;

                event.currentTarget.src =
                  fallbackImage;
              }}
            />

            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">

                <button
                  type="button"
                  onClick={
                    handlePrevImage
                  }
                  className={`${bubbleButtonClass} w-10 h-10 rounded-full flex items-center justify-center`}
                >
                  <ChevronLeft
                    size={18}
                  />
                </button>

                <span className="text-xs font-semibold text-gray-500">
                  {activeImageIndex +
                    1}{" "}
                  /{" "}
                  {images.length}
                </span>

                <button
                  type="button"
                  onClick={
                    handleNextImage
                  }
                  className={`${bubbleButtonClass} w-10 h-10 rounded-full flex items-center justify-center`}
                >
                  <ChevronRight
                    size={18}
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================
            PURCHASE CARD
        =================================================== */}

        <div className="lg:col-span-3">

          <section className="product-purchase-card p-6">

            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 mb-2">
              Price
            </p>

            <div className="flex items-end flex-wrap gap-3">

              <span className="text-3xl font-bold tracking-tight text-gray-900">
                ₹
                {sellingPrice.toLocaleString(
                  "en-IN"
                )}
              </span>

              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through mb-1">
                  ₹
                  {originalPrice.toLocaleString(
                    "en-IN"
                  )}
                </span>
              )}
            </div>

            {hasDiscount && (
              <span className="inline-flex mt-3 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                {
                  discountPercent
                }
                % off
              </span>
            )}

            {/* PACK */}

            <div className="mt-7 pt-6 border-t border-gray-200/60">

              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 mb-3">
                Choose pack size
              </p>

              <div className="product-pack-options">

                {variants.map(
                  (variant) => {
                    const variantPack =
                      getPackLabel(
                        variant
                      );

                    const selected =
                      String(
                        variant.id
                      ) ===
                      String(
                        product.id
                      );

                    const unavailable =
                      Number(
                        variant.stock ||
                          0
                      ) <= 0 ||
                      variant.is_active ===
                        false;

                    return (
                      <button
                        key={
                          variant.id
                        }
                        type="button"
                        disabled={
                          unavailable
                        }
                        onClick={() =>
                          handleVariantChange(
                            variant
                          )
                        }
                        className={`product-pack-option ${
                          selected
                            ? "product-pack-option-active"
                            : ""
                        } ${
                          unavailable
                            ? "product-pack-option-disabled"
                            : ""
                        }`}
                      >
                        {variantPack ||
                          "Pack"}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* QUANTITY */}

            <div className="mt-7">

              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 mb-3">
                Quantity
              </p>

              <div className="product-quantity-control">

                <button
                  type="button"
                  onClick={
                    decreaseQuantity
                  }
                  disabled={
                    quantity <= 1
                  }
                  className="product-quantity-button"
                >
                  <Minus
                    size={17}
                  />
                </button>

                <span className="font-bold text-gray-900">
                  {
                    quantity
                  }
                </span>

                <button
                  type="button"
                  onClick={
                    increaseQuantity
                  }
                  disabled={
                    stock <= 0 ||
                    quantity >=
                      stock
                  }
                  className="product-quantity-button"
                >
                  <Plus
                    size={17}
                  />
                </button>
              </div>
            </div>

            {/* ORDER INFO */}

            <div className="product-order-info mt-6 space-y-3 text-sm">

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Pack size
                </span>

                <strong className="font-semibold text-gray-900">
                  {packLabel ||
                    "—"}
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Stock
                </span>

                <strong className="font-semibold text-gray-900">
                  {stock > 0
                    ? stock
                    : "Unavailable"}
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Payment
                </span>

                <strong className="font-semibold text-gray-900 text-right">
                  Cash on Delivery
                </strong>
              </div>
            </div>

            {/* TOTAL */}

            <div className="mt-6 pt-5 border-t border-dashed border-gray-300/70">

              <div className="flex items-end justify-between gap-4">

                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                    Total
                  </span>

                  <span className="text-xs text-gray-500">
                    {
                      quantity
                    }{" "}
                    {quantity === 1
                      ? "item"
                      : "items"}
                  </span>
                </div>

                <span className="text-2xl font-bold text-gray-900">
                  ₹
                  {(
                    sellingPrice *
                    quantity
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={
                handleAddToCart
              }
              disabled={
                addingToCart ||
                stock <= 0
              }
              className={`product-primary-button mt-6 ${
                addingToCart ||
                stock <= 0
                  ? "opacity-50"
                  : ""
              }`}
            >
              {addingToCart
                ? "Adding..."
                : stock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
            </button>
          </section>
        </div>

        {/* ===================================================
            BOTTOM CARDS
        =================================================== */}

        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">

          {/* OVERVIEW */}

          <section className="product-overview-card p-7 md:p-8">

            <h2 className="font-dm-sans text-xl font-semibold tracking-[-0.025em]">
              Product Overview
            </h2>

            <p className="mt-5 text-gray-600 leading-7 text-[15px]">
              {product.description ||
                product.short_description ||
                "Product details are currently unavailable."}
            </p>

            {Array.isArray(
              product.features
            ) &&
              product.features.length >
                0 && (
                <div className="mt-8">

                  <h3 className="font-dm-sans text-base font-semibold mb-4">
                    Highlights
                  </h3>

                  <div className="space-y-3">

                    {product.features.map(
                      (
                        feature,
                        index
                      ) => (
                        <div
                          key={`${feature}-${index}`}
                          className="product-highlight-item"
                        >
                          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                            <Check
                              size={14}
                            />
                          </div>

                          <span className="text-sm leading-6">
                            {
                              feature
                            }
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </section>

          {/* DETAILS */}

          <section className="product-details-card p-7 md:p-8">

            <h2 className="font-dm-sans text-xl font-semibold tracking-[-0.025em] mb-6">
              Product Details
            </h2>

            <div className="overflow-hidden rounded-2xl border border-white/70">

              {/* CORE DETAILS */}

              {productDetails.map(
                ([label, value]) => (
                  <div
                    key={
                      label
                    }
                    className="product-detail-row"
                  >
                    <div className="product-detail-label">
                      {
                        label
                      }
                    </div>

                    <div className="product-detail-value">
                      {
                        value
                      }
                    </div>
                  </div>
                )
              )}

              {/* EXTRA SPECS ONLY */}

              {filteredSpecs.map(
                ([key, value]) => (
                  <div
                    key={
                      key
                    }
                    className="product-detail-row"
                  >
                    <div className="product-detail-label capitalize">
                      {String(
                        key
                      ).replace(
                        /_/g,
                        " "
                      )}
                    </div>

                    <div className="product-detail-value">
                      {String(
                        value
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="mt-16">
        <SimpleFooter />
      </div>
    </div>
  );
};

export default ProductPage;