import {
  Package,
  Plus,
  ShoppingBag,
  Star,
} from "lucide-react";

import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { toast } from "react-toastify";

import {
  getCurrentUser,
} from "../../../api/authApi.js";

import {
  addToCart,
} from "../../../api/cartApi.js";

import "./ProductCard.css";

/* =========================================================
   FALLBACK IMAGE
========================================================= */

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' rx='40' fill='%23f1f5f9'/%3E%3Ccircle cx='250' cy='205' r='90' fill='%23dbeafe'/%3E%3Cpath d='M185 215h130l-16 110H201z' fill='%2393c5fd'/%3E%3Cpath d='M210 215c0-37 18-62 40-62s40 25 40 62' fill='none' stroke='%234b5563' stroke-width='13' stroke-linecap='round'/%3E%3Ctext x='250' y='385' text-anchor='middle' fill='%236b7280' font-family='Arial,sans-serif' font-size='22'%3EGrocery Product%3C/text%3E%3C/svg%3E";

/* =========================================================
   HELPERS
========================================================= */

const formatPrice = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const getProductImage = (product) => {
  return (
    product?.product_images?.find(
      (image) => image?.is_primary
    )?.image_url ||
    product?.product_images?.[0]?.image_url ||
    product?.images?.[0]?.image_url ||
    product?.image ||
    FALLBACK_IMAGE
  );
};

const getSellingPrice = (product) => {
  return Number(
    product?.discount_price ??
      product?.discountPrice ??
      product?.price ??
      0
  );
};

const getPackSize = (product) => {
  if (product?.pack_size) {
    return product.pack_size;
  }

  if (product?.packSize) {
    return product.packSize;
  }

  return [product?.quantity, product?.unit]
    .filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== ""
    )
    .join(" ");
};

const getCategoryName = (product) => {
  return (
    product?.categories?.name ||
    product?.category?.name ||
    product?.categoryName ||
    ""
  );
};

/* =========================================================
   PRODUCT CARD
========================================================= */

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [addingToCart, setAddingToCart] =
    useState(false);

  if (!product) {
    return null;
  }

  const sellingPrice =
    getSellingPrice(product);

  const originalPrice =
    Number(product?.price || 0);

  const hasDiscount =
    product?.discount_price !== null &&
    product?.discount_price !== undefined &&
    Number(product.discount_price) <
      originalPrice;

  const discountPercent =
    hasDiscount && originalPrice > 0
      ? Math.round(
          ((originalPrice - sellingPrice) /
            originalPrice) *
            100
        )
      : 0;

  const stock =
    Number(product?.stock || 0);

  const isOutOfStock =
    stock <= 0 ||
    product?.is_active === false;

  const rating =
    Number(product?.rating || 0);

  const packSize =
    getPackSize(product);

  const categoryName =
    getCategoryName(product);

  const productUrl =
    product?.slug
      ? `/product/${product.slug}`
      : "#";

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart = async () => {
    if (
      addingToCart ||
      isOutOfStock ||
      !product?.id
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

        navigate("/sign_in", {
          state: {
            from:
              location.pathname +
              location.search,
          },
        });

        return;
      }

      setAddingToCart(true);

      await addToCart({
        productId: product.id,
        quantity: 1,
      });

      toast.success(
        `${product.name} added to cart.`
      );

      window.dispatchEvent(
        new CustomEvent("cart:updated")
      );
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      toast.error(
        error?.message ||
          "Unable to add this product to cart."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  /* =======================================================
     IMAGE ERROR
  ======================================================= */

  const handleImageError = (event) => {
    event.currentTarget.onerror =
      null;

    event.currentTarget.src =
      FALLBACK_IMAGE;
  };

  return (
    <article className="product-card">
      {/* =================================================
          IMAGE
      ================================================= */}

      <div className="product-card-image-wrap">
        <Link
          to={productUrl}
          className="product-card-image-link"
        >
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
            onError={handleImageError}
          />
        </Link>

        {/* STOCK BADGE */}

        <div className="product-card-stock">
          {isOutOfStock ? (
            <span className="product-card-stock-out">
              Out of stock
            </span>
          ) : stock <= 5 ? (
            <span className="product-card-stock-low">
              Only {stock} left
            </span>
          ) : (
            <span className="product-card-stock-in">
              In stock
            </span>
          )}
        </div>

        {/* DISCOUNT */}

        {hasDiscount && (
          <span className="product-card-discount">
            {discountPercent}% off
          </span>
        )}

        {/* QUICK ADD */}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={
            addingToCart ||
            isOutOfStock
          }
          className="product-card-quick-add"
          aria-label={`Add ${product.name} to cart`}
        >
          {addingToCart ? (
            <span className="product-card-spinner" />
          ) : (
            <Plus size={18} />
          )}
        </button>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="product-card-content">
        <div className="product-card-meta">
          <span className="product-card-brand">
            {product?.brand ||
              categoryName ||
              "Grocery"}
          </span>

          {rating > 0 && (
            <span className="product-card-rating">
              <Star size={12} />

              {rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* NAME */}

        <Link
          to={productUrl}
          className="product-card-name-link"
        >
          <h3 className="product-card-name">
            {product.name}
          </h3>
        </Link>

        {/* PACK SIZE */}

        {packSize && (
          <div className="product-card-pack">
            <Package size={13} />

            <span>{packSize}</span>
          </div>
        )}

        {/* PRICE */}

        <div className="product-card-price-row">
          <span className="product-card-price">
            {formatPrice(sellingPrice)}
          </span>

          {hasDiscount && (
            <span className="product-card-old-price">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* ADD BUTTON */}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={
            addingToCart ||
            isOutOfStock
          }
          className="product-card-add"
        >
          {addingToCart ? (
            <span className="product-card-spinner" />
          ) : (
            <ShoppingBag size={16} />
          )}

          <span>
            {addingToCart
              ? "Adding..."
              : isOutOfStock
                ? "Out of stock"
                : "Add to cart"}
          </span>
        </button>
      </div>
    </article>
  );
};

export default ProductCard;