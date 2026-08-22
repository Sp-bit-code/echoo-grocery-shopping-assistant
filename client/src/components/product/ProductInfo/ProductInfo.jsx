import {
  CheckCircle2,
  Package,
  Star,
} from "lucide-react";

import ProductActions from "../ProductActions/ProductActions.jsx";

import "./ProductInfo.css";

/* =========================================================
   HELPERS
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

const getPackSize = (
  product
) =>
  product?.pack_size ||
  product?.packSize ||
  [
    product?.quantity,
    product?.unit,
  ]
    .filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== ""
    )
    .join(" ") ||
  "";

const ProductInfo = ({
  product,
  quantity = 1,
  onQuantityChange,
}) => {
  if (!product) {
    return null;
  }

  const price =
    Number(
      product.price || 0
    );

  const discountPrice =
    product.discount_price ===
      null ||
    product.discount_price ===
      undefined
      ? null
      : Number(
          product.discount_price
        );

  const sellingPrice =
    discountPrice ?? price;

  const hasDiscount =
    discountPrice !== null &&
    discountPrice < price;

  const discountPercent =
    hasDiscount &&
    price > 0
      ? Math.round(
          ((price -
            discountPrice) /
            price) *
            100
        )
      : 0;

  const stock =
    Number(
      product.stock || 0
    );

  const packSize =
    getPackSize(
      product
    );

  const categoryName =
    product.categoryName ||
    product.categories
      ?.name ||
    product.category ||
    "";

  const features =
    Array.isArray(
      product.features
    )
      ? product.features
      : [];

  const specs =
    product.specs &&
    typeof product.specs ===
      "object" &&
    !Array.isArray(
      product.specs
    )
      ? Object.entries(
          product.specs
        ).filter(
          ([, value]) =>
            value !== null &&
            value !== undefined &&
            value !== ""
        )
      : [];

  return (
    <div className="product-info">
      <div className="product-info-sticky">
        {/* ===============================================
            CATEGORY / BRAND
        =============================================== */}

        <div className="product-info-topline">
          {categoryName && (
            <span className="product-info-category">
              {categoryName}
            </span>
          )}

          {product.brand && (
            <span className="product-info-brand">
              {product.brand}
            </span>
          )}
        </div>

        {/* ===============================================
            PRODUCT NAME
        =============================================== */}

        <h1 className="product-info-title">
          {product.name}
        </h1>

        {/* ===============================================
            RATING
        =============================================== */}

        {Number(
          product.rating || 0
        ) > 0 && (
          <div className="product-info-rating">
            <Star
              size={17}
              className="product-info-star"
            />

            <span>
              {Number(
                product.rating
              ).toFixed(1)}
            </span>
          </div>
        )}

        {/* ===============================================
            PACK SIZE
        =============================================== */}

        {packSize && (
          <div className="product-info-pack">
            <Package
              size={18}
            />

            <span>
              {packSize}
            </span>
          </div>
        )}

        {/* ===============================================
            PRICE
        =============================================== */}

        <div className="product-info-price-row">
          <span className="product-info-current-price">
            {formatPrice(
              sellingPrice
            )}
          </span>

          {hasDiscount && (
            <>
              <span className="product-info-old-price">
                {formatPrice(
                  price
                )}
              </span>

              <span className="product-info-discount">
                {discountPercent}%
                off
              </span>
            </>
          )}
        </div>

        <p className="product-info-tax">
          Inclusive of all
          applicable taxes
        </p>

        {/* ===============================================
            STOCK
        =============================================== */}

        <div
          className={`product-info-stock ${
            stock > 0
              ? "product-info-stock-available"
              : "product-info-stock-empty"
          }`}
        >
          {stock > 0 ? (
            <>
              <CheckCircle2
                size={17}
              />

              <span>
                {stock <= 5
                  ? `Only ${stock} left in stock`
                  : "In stock"}
              </span>
            </>
          ) : (
            <span>
              Out of stock
            </span>
          )}
        </div>

        {/* ===============================================
            ACTIONS
        =============================================== */}

        <ProductActions
          product={
            product
          }
          quantity={
            quantity
          }
          onQuantityChange={
            onQuantityChange
          }
        />

        {/* ===============================================
            DESCRIPTION
        =============================================== */}

        {(product.description ||
          product.short_description) && (
          <div className="product-info-section">
            <h2>
              About this
              product
            </h2>

            <p>
              {product.description ||
                product.short_description}
            </p>
          </div>
        )}

        {/* ===============================================
            FEATURES
        =============================================== */}

        {features.length >
          0 && (
          <div className="product-info-section">
            <h2>
              Product
              highlights
            </h2>

            <ul className="product-info-features">
              {features.map(
                (
                  feature,
                  index
                ) => (
                  <li
                    key={`${feature}-${index}`}
                  >
                    <CheckCircle2
                      size={16}
                    />

                    <span>
                      {typeof feature ===
                      "string"
                        ? feature
                        : feature?.name ||
                          feature?.label ||
                          JSON.stringify(
                            feature
                          )}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        {/* ===============================================
            PRODUCT DETAILS / SPECS
        =============================================== */}

        {specs.length >
          0 && (
          <div className="product-info-section">
            <h2>
              Product
              details
            </h2>

            <div className="product-info-specs">
              {specs.map(
                ([
                  key,
                  value,
                ]) => (
                  <div
                    key={
                      key
                    }
                    className="product-info-spec-row"
                  >
                    <span className="product-info-spec-key">
                      {String(
                        key
                      )
                        .replace(
                          /_/g,
                          " "
                        )
                        .replace(
                          /\b\w/g,
                          (
                            char
                          ) =>
                            char.toUpperCase()
                        )}
                    </span>

                    <span className="product-info-spec-value">
                      {Array.isArray(
                        value
                      )
                        ? value.join(
                            ", "
                          )
                        : String(
                            value
                          )}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;