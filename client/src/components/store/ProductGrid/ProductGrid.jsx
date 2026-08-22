import {
  Package,
  Plus,
  ShoppingBag,
  Star,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import {
  getCurrentUser,
} from "../../../api/authApi.js";

import {
  addToCart,
} from "../../../api/cartApi.js";

import {
  getCategoryProductImage,
  getProductPackLabel,
  groupLogicalProducts,
} from "../../../utils/groceryCategories.js";

import "./ProductGrid.css";


/* =========================================================
   FALLBACK IMAGE
========================================================= */

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' rx='40' fill='%23f1f5f9'/%3E%3Ccircle cx='250' cy='205' r='90' fill='%23dbeafe'/%3E%3Cpath d='M185 215h130l-16 110H201z' fill='%2393c5fd'/%3E%3Cpath d='M210 215c0-37 18-62 40-62s40 25 40 62' fill='none' stroke='%234b5563' stroke-width='13' stroke-linecap='round'/%3E%3Ctext x='250' y='385' text-anchor='middle' fill='%236b7280' font-family='Arial,sans-serif' font-size='22'%3EGrocery Product%3C/text%3E%3C/svg%3E";


/* =========================================================
   PRICE
========================================================= */

const formatPrice = (
  value
) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(value || 0)
  );


/* =========================================================
   PRODUCT IMAGE

   Uses SAME shared image helper used by category/search.
========================================================= */

const getProductImage = (
  product
) => {
  return (
    getCategoryProductImage(
      product
    ) ||
    FALLBACK_IMAGE
  );
};


/* =========================================================
   SELLING PRICE
========================================================= */

const getSellingPrice = (
  product
) =>
  Number(
    product?.discount_price ??
      product?.discountPrice ??
      product?.selling_price ??
      product?.sellingPrice ??
      product?.price ??
      0
  );


/* =========================================================
   PRODUCT GRID
========================================================= */

const ProductGrid = ({
  products = [],
  loading = false,
}) => {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    addingProductId,
    setAddingProductId,
  ] = useState(null);

  /*
    Stores selected SKU/pack
    separately for each logical product.

    Example:

    {
      "dairy-eggs::amul::amul taaza toned milk":
        "selected-sku-id"
    }
  */

  const [
    selectedVariants,
    setSelectedVariants,
  ] = useState({});


  /* =========================================================
     GROUP PRODUCTS

     IMPORTANT:

     This is now THE SAME grouping function used by:

     - Categories count
     - Category sidebar
     - Navbar search
     - ProductGrid

     200 SKU rows
         ↓
     48 logical products
  ========================================================= */

  const groupedProducts =
    useMemo(() => {
      return groupLogicalProducts(
        products
      );
    }, [products]);


  /* =========================================================
     GET SELECTED VARIANT
  ========================================================= */

  const getSelectedVariant = (
    group
  ) => {
    if (
      !group?.variants?.length
    ) {
      return null;
    }

    const selectedId =
      selectedVariants[
        group.key
      ];

    /* User-selected pack */

    if (selectedId) {
      const selected =
        group.variants.find(
          (variant) =>
            String(
              variant.id
            ) ===
            String(
              selectedId
            )
        );

      if (selected) {
        return selected;
      }
    }

    /*
      Default selection:

      1. active + in stock
      2. representative SKU
      3. first SKU
    */

    return (
      group.variants.find(
        (variant) =>
          Number(
            variant?.stock || 0
          ) > 0 &&
          variant?.is_active !==
            false
      ) ||
      group.representative ||
      group.variants[0] ||
      null
    );
  };


  /* =========================================================
     CHANGE PACK
  ========================================================= */

  const handleVariantChange = (
    event,
    groupKey,
    productId
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setSelectedVariants(
      (current) => ({
        ...current,

        [groupKey]:
          productId,
      })
    );
  };


  /* =========================================================
     OPEN PRODUCT
  ========================================================= */

  const handleOpenProduct = (
    product
  ) => {
    if (
      !product?.slug
    ) {
      return;
    }

    navigate(
      `/product/${product.slug}`
    );
  };


  /* =========================================================
     KEYBOARD CARD NAVIGATION
  ========================================================= */

  const handleCardKeyDown = (
    event,
    product
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      handleOpenProduct(
        product
      );
    }
  };


  /* =========================================================
     ADD TO CART
  ========================================================= */

  const handleAddToCart =
    async (
      event,
      product
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        !product?.id ||
        Number(
          product.stock || 0
        ) <= 0 ||
        product.is_active ===
          false ||
        addingProductId
      ) {
        return;
      }

      try {
        const user =
          await getCurrentUser();

        if (!user) {
          toast.info(
            "Please sign in to add groceries to your cart."
          );

          navigate(
            "/sign_in",
            {
              state: {
                from:
                  location.pathname +
                  location.search,
              },
            }
          );

          return;
        }

        setAddingProductId(
          product.id
        );

        /*
          IMPORTANT:

          Cart receives actual selected SKU ID.

          Example:

          Logical product:
          Amul Taaza

          Selected:
          2 L

          Cart receives:
          Amul Taaza 2 L SKU UUID
        */

        await addToCart({
          productId:
            product.id,

          quantity: 1,
        });

        const pack =
          getProductPackLabel(
            product
          );

        toast.success(
          `${product.name}${
            pack
              ? ` (${pack})`
              : ""
          } added to cart.`
        );

        /*
          Navbar/cart-count refresh
        */

        window.dispatchEvent(
          new CustomEvent(
            "cart:updated"
          )
        );
      } catch (error) {
        console.error(
          "Quick add cart error:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to add this product to cart."
        );
      } finally {
        setAddingProductId(
          null
        );
      }
    };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="product-grid">

        <div className="product-grid-inner">

          {Array.from({
            length: 8,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="product-grid-skeleton"
              >
                <div className="product-grid-skeleton-image" />

                <div className="product-grid-skeleton-line product-grid-skeleton-small" />

                <div className="product-grid-skeleton-line" />

                <div className="product-grid-skeleton-line product-grid-skeleton-price" />
              </div>
            )
          )}

        </div>

      </div>
    );
  }


  /* =========================================================
     EMPTY
  ========================================================= */

  if (
    !groupedProducts.length
  ) {
    return (
      <div className="product-grid-empty">

        <div className="product-grid-empty-icon">

          <ShoppingBag
            size={28}
          />

        </div>

        <h3>
          No groceries found
        </h3>

        <p>
          Try another category or
          search for a different
          product.
        </p>

      </div>
    );
  }


  /* =========================================================
     PRODUCTS
  ========================================================= */

  return (
    <div className="product-grid">

      <div className="product-grid-inner">

        {groupedProducts.map(
          (group) => {
            const product =
              getSelectedVariant(
                group
              );

            if (!product) {
              return null;
            }


            /* ===============================================
               PRICE
            =============================================== */

            const sellingPrice =
              getSellingPrice(
                product
              );

            const originalPrice =
              Number(
                product.price || 0
              );

            const discountPrice =
              product.discount_price ??
              product.discountPrice;

            const hasDiscount =
              discountPrice !==
                null &&
              discountPrice !==
                undefined &&
              Number(
                discountPrice
              ) <
                originalPrice;

            const discountPercent =
              hasDiscount &&
              originalPrice > 0
                ? Math.round(
                    (
                      (
                        originalPrice -
                        sellingPrice
                      ) /
                      originalPrice
                    ) *
                      100
                  )
                : 0;


            /* ===============================================
               STOCK
            =============================================== */

            const stock =
              Number(
                product.stock || 0
              );

            const isOutOfStock =
              stock <= 0 ||
              product.is_active ===
                false;


            /* ===============================================
               PACK
            =============================================== */

            const packSize =
              getProductPackLabel(
                product
              );


            /* ===============================================
               RATING
            =============================================== */

            const rating =
              Number(
                product.rating || 0
              );


            /* ===============================================
               ADDING STATE
            =============================================== */

            const isAdding =
              addingProductId ===
              product.id;


            /* ===============================================
               CATEGORY
            =============================================== */

            const categoryName =
              group.category?.name ||
              "Grocery";


            /* ===============================================
               CARD
            =============================================== */

            return (
              <article
                key={
                  group.key
                }
                className="product-grid-card"
                role="link"
                tabIndex={0}
                onClick={() =>
                  handleOpenProduct(
                    product
                  )
                }
                onKeyDown={(
                  event
                ) =>
                  handleCardKeyDown(
                    event,
                    product
                  )
                }
                aria-label={`View ${group.name}`}
              >

                {/* ===========================================
                    IMAGE AREA
                =========================================== */}

                <div className="product-grid-image-wrap">

                  <img
                    src={getProductImage(
                      product
                    )}
                    alt={
                      group.name
                    }
                    className="product-grid-image"
                    loading="lazy"
                    onError={(
                      event
                    ) => {
                      event.currentTarget.onerror =
                        null;

                      event.currentTarget.src =
                        FALLBACK_IMAGE;
                    }}
                  />


                  {/* =========================================
                      STOCK
                  ========================================= */}

                  <div className="product-grid-stock">

                    {isOutOfStock ? (
                      <span className="product-grid-stock-out">
                        Out of stock
                      </span>
                    ) : stock <= 5 ? (
                      <span className="product-grid-stock-low">
                        Only {stock} left
                      </span>
                    ) : (
                      <span className="product-grid-stock-in">
                        In stock
                      </span>
                    )}

                  </div>


                  {/* =========================================
                      DISCOUNT
                  ========================================= */}

                  {hasDiscount && (
                    <span className="product-grid-discount">

                      {
                        discountPercent
                      }
                      % off

                    </span>
                  )}


                  {/* =========================================
                      QUICK ADD
                  ========================================= */}

                  <button
                    type="button"
                    onClick={(
                      event
                    ) =>
                      handleAddToCart(
                        event,
                        product
                      )
                    }
                    disabled={
                      isOutOfStock ||
                      isAdding
                    }
                    className="product-grid-quick-add"
                    aria-label={`Add ${group.name}${
                      packSize
                        ? ` ${packSize}`
                        : ""
                    } to cart`}
                  >

                    {isAdding ? (
                      <div className="product-grid-spinner" />
                    ) : (
                      <Plus
                        size={18}
                      />
                    )}

                  </button>

                </div>


                {/* ===========================================
                    CONTENT
                =========================================== */}

                <div className="product-grid-content">


                  {/* =========================================
                      BRAND / CATEGORY + RATING
                  ========================================= */}

                  <div className="product-grid-meta">

                    <span>
                      {group.brand ||
                        categoryName}
                    </span>

                    {rating > 0 && (
                      <span className="product-grid-rating">

                        <Star
                          size={12}
                        />

                        {rating.toFixed(
                          1
                        )}

                      </span>
                    )}

                  </div>


                  {/* =========================================
                      PRODUCT NAME
                  ========================================= */}

                  <h3 className="product-grid-name">

                    {
                      group.name
                    }

                  </h3>


                  {/* =========================================
                      PACK OPTIONS
                  ========================================= */}

                  {group.variants.length >
                  1 ? (
                    <div className="product-grid-variant-options">

                      {group.variants.map(
                        (
                          variant
                        ) => {
                          const variantPack =
                            getProductPackLabel(
                              variant
                            );

                          const active =
                            String(
                              variant.id
                            ) ===
                            String(
                              product.id
                            );

                          const variantOutOfStock =
                            Number(
                              variant.stock ||
                                0
                            ) <= 0 ||
                            variant.is_active ===
                              false;

                          return (
                            <button
                              type="button"
                              key={
                                variant.id
                              }
                              disabled={
                                variantOutOfStock
                              }
                              onClick={(
                                event
                              ) =>
                                handleVariantChange(
                                  event,
                                  group.key,
                                  variant.id
                                )
                              }
                              className={`product-grid-variant-option ${
                                active
                                  ? "product-grid-variant-option-active"
                                  : ""
                              } ${
                                variantOutOfStock
                                  ? "product-grid-variant-option-disabled"
                                  : ""
                              }`}
                              title={
                                variantOutOfStock
                                  ? `${variantPack} - Out of stock`
                                  : `Select ${variantPack}`
                              }
                            >
                              {variantPack ||
                                "Pack"}
                            </button>
                          );
                        }
                      )}

                    </div>
                  ) : (
                    packSize && (
                      <div className="product-grid-pack">

                        <Package
                          size={13}
                        />

                        <span>
                          {
                            packSize
                          }
                        </span>

                      </div>
                    )
                  )}


                  {/* =========================================
                      SELECTED PACK
                  ========================================= */}

                  {group.variants.length >
                    1 &&
                    packSize && (
                      <div className="product-grid-selected-pack">

                        <Package
                          size={13}
                        />

                        <span>
                          Selected:{" "}
                          {
                            packSize
                          }
                        </span>

                      </div>
                    )}


                  {/* =========================================
                      PRICE
                  ========================================= */}

                  <div className="product-grid-price-row">

                    <span className="product-grid-price">

                      {formatPrice(
                        sellingPrice
                      )}

                    </span>

                    {hasDiscount && (
                      <span className="product-grid-old-price">

                        {formatPrice(
                          originalPrice
                        )}

                      </span>
                    )}

                  </div>


                  {/* =========================================
                      ADD TO CART
                  ========================================= */}

                  <button
                    type="button"
                    disabled={
                      isOutOfStock ||
                      isAdding
                    }
                    onClick={(
                      event
                    ) =>
                      handleAddToCart(
                        event,
                        product
                      )
                    }
                    className="product-grid-add-button"
                  >

                    <ShoppingBag
                      size={16}
                    />

                    {isAdding
                      ? "Adding..."
                      : isOutOfStock
                        ? "Out of stock"
                        : "Add to cart"}

                  </button>

                </div>

              </article>
            );
          }
        )}

      </div>

    </div>
  );
};

export default ProductGrid;