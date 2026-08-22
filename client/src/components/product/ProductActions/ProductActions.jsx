import {
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";

import {
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

import "./ProductActions.css";

const ProductActions = ({
  product,
  quantity = 1,
  onQuantityChange,
}) => {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    addingToCart,
    setAddingToCart,
  ] = useState(false);

  const stock =
    Number(
      product?.stock || 0
    );

  const isOutOfStock =
    stock <= 0 ||
    product?.is_active ===
      false;

  const currentQuantity =
    Math.max(
      1,
      Number(
        quantity || 1
      )
    );

  /* =======================================================
     CHANGE QUANTITY
  ======================================================= */

  const updateQuantity = (
    value
  ) => {
    if (
      typeof onQuantityChange !==
      "function"
    ) {
      return;
    }

    const nextQuantity =
      Math.max(
        1,
        Math.min(
          Number(value),
          stock || 1
        )
      );

    onQuantityChange(
      nextQuantity
    );
  };

  const decreaseQuantity =
    () => {
      if (
        currentQuantity <= 1
      ) {
        return;
      }

      updateQuantity(
        currentQuantity - 1
      );
    };

  const increaseQuantity =
    () => {
      if (
        currentQuantity >=
        stock
      ) {
        return;
      }

      updateQuantity(
        currentQuantity + 1
      );
    };

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart =
    async () => {
      if (
        addingToCart ||
        isOutOfStock
      ) {
        return;
      }

      if (!product?.id) {
        toast.error(
          "Product information is unavailable."
        );

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
                  location.pathname,
              },
            }
          );

          return;
        }

        setAddingToCart(
          true
        );

        await addToCart({
          productId:
            product.id,

          quantity:
            currentQuantity,
        });

        toast.success(
          `${currentQuantity} ${
            currentQuantity ===
            1
              ? "item"
              : "items"
          } added to your cart.`
        );

        /*
          Useful for any component that chooses
          to listen for cart refresh events.
        */
        window.dispatchEvent(
          new CustomEvent(
            "cart:updated"
          )
        );
      } catch (error) {
        console.error(
          "Add to cart error:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to add this product to your cart."
        );
      } finally {
        setAddingToCart(
          false
        );
      }
    };

  if (!product) {
    return null;
  }

  return (
    <div className="product-actions">
      {/* QUANTITY */}

      <div className="product-actions-quantity-row">
        <div>
          <p className="product-actions-label">
            Quantity
          </p>

          <p className="product-actions-stock-hint">
            {isOutOfStock
              ? "Currently unavailable"
              : stock <= 5
                ? `${stock} available`
                : "Select quantity"}
          </p>
        </div>

        <div className="product-actions-stepper">
          <button
            type="button"
            onClick={
              decreaseQuantity
            }
            disabled={
              isOutOfStock ||
              currentQuantity <=
                1 ||
              addingToCart
            }
            aria-label="Decrease quantity"
          >
            <Minus
              size={16}
            />
          </button>

          <span>
            {
              currentQuantity
            }
          </span>

          <button
            type="button"
            onClick={
              increaseQuantity
            }
            disabled={
              isOutOfStock ||
              currentQuantity >=
                stock ||
              addingToCart
            }
            aria-label="Increase quantity"
          >
            <Plus
              size={16}
            />
          </button>
        </div>
      </div>

      {/* ADD TO CART */}

      <button
        type="button"
        onClick={
          handleAddToCart
        }
        disabled={
          addingToCart ||
          isOutOfStock
        }
        className="product-actions-add"
      >
        <ShoppingBag
          size={19}
        />

        <span>
          {addingToCart
            ? "Adding to cart..."
            : isOutOfStock
              ? "Out of stock"
              : "Add to cart"}
        </span>
      </button>

      {!isOutOfStock && (
        <p className="product-actions-note">
          Cash on Delivery
          available at checkout.
        </p>
      )}
    </div>
  );
};

export default ProductActions;