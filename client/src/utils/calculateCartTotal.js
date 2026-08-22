/* =========================================================
   CART ITEM PRICE
========================================================= */

export const getCartItemPrice = (item = {}) => {
  const product =
    item?.products ||
    item?.product ||
    {};

  /*
    Priority:
    1. Price already stored on cart item
    2. Current discounted product price
    3. Normal product price
  */

  return Number(
    item?.product_price ??
      item?.price ??
      product?.discount_price ??
      product?.price ??
      0
  );
};

/* =========================================================
   CART ITEM QUANTITY
========================================================= */

export const getCartItemQuantity = (item = {}) => {
  const quantity = Number(
    item?.quantity ?? 1
  );

  if (
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    return 1;
  }

  return quantity;
};

/* =========================================================
   ITEM TOTAL
========================================================= */

export const calculateCartItemTotal = (item = {}) => {
  const price =
    getCartItemPrice(item);

  const quantity =
    getCartItemQuantity(item);

  return price * quantity;
};

/* =========================================================
   SUBTOTAL
========================================================= */

export const calculateCartSubtotal = (items = []) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce(
    (total, item) =>
      total +
      calculateCartItemTotal(item),
    0
  );
};

/* =========================================================
   SHIPPING

   Grocery checkout currently has no separate
   shipping/delivery charge.
========================================================= */

export const calculateShipping = () => {
  return 0;
};

/* =========================================================
   CART TOTAL
========================================================= */

export const calculateCartTotal = (items = []) => {
  const subtotal =
    calculateCartSubtotal(items);

  const shipping =
    calculateShipping(subtotal);

  const total =
    subtotal + shipping;

  return {
    subtotal,
    shipping,
    total,
  };
};

export default calculateCartTotal;