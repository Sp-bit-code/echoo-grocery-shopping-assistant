/* =========================================================
   APPLICATION
========================================================= */

export const APP_NAME = "Echoo";

export const DEFAULT_CURRENCY = "INR";

export const CURRENCY_SYMBOL = "₹";

/* =========================================================
   USER ROLES

   Keep lowercase because database roles are:
   "user" / "admin"
========================================================= */

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
};

/* =========================================================
   ORDER STATUS
========================================================= */

export const ORDER_STATUS = {
  PLACED: "placed",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  PACKED: "packed",
  SHIPPED: "shipped",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

/* =========================================================
   PAYMENT

   Grocery checkout currently supports COD only.
========================================================= */

export const PAYMENT_METHODS = {
  COD: "cod",
};

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
};

/* =========================================================
   PRODUCT STATUS

   Actual availability is primarily controlled through:
   - is_active
   - stock
========================================================= */

export const PRODUCT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  OUT_OF_STOCK: "out_of_stock",
};

/* =========================================================
   CATEGORIES

   Do not hard-code grocery categories here.
   Categories are loaded dynamically from Supabase.
========================================================= */

export const PRODUCT_CATEGORIES = [];

/* =========================================================
   CART / DELIVERY

   No separate delivery charge in current checkout.
========================================================= */

export const DEFAULT_DELIVERY_CHARGE = 0;

/* =========================================================
   ROUTES
========================================================= */

export const ROUTES = {
  HOME: "/",

  CATEGORIES: "/categories",

  CART: "/cart",

  CHECKOUT: "/checkout",

  PROFILE: "/profile",

  AI_ASSISTANT: "/ai-assistant",

  SIGN_IN: "/sign_in",

  SIGN_UP: "/sign_up",

  FORGOT_PASSWORD:
    "/forgot-password",

  RESET_PASSWORD:
    "/reset-password",

  ADMIN_LOGIN:
    "/admin_login",

  ADMIN_DASHBOARD:
    "/admin/dashboard",

  ADMIN_PRODUCTS:
    "/admin/products",

  ADMIN_ORDERS:
    "/admin/orders",

  ADMIN_USERS:
    "/admin/users",
};

/* =========================================================
   LOCAL STORAGE
========================================================= */

export const STORAGE_KEYS = {
  REMEMBERED_EMAIL:
    "rememberedEmail",

  SESSION:
    "echoo_session",
};