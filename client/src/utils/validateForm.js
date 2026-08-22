/* =========================================================
   BASIC VALIDATORS
========================================================= */

export const isRequired = (
  value = ""
) => {
  return (
    String(value ?? "")
      .trim()
      .length > 0
  );
};

export const isValidEmail = (
  email = ""
) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email ?? "")
      .trim()
      .toLowerCase()
  );
};

/* =========================================================
   PASSWORD

   Keep this consistent with Register + Reset Password.
========================================================= */

export const isValidPassword = (
  password = ""
) => {
  return (
    String(password ?? "")
      .length >= 8
  );
};

/* =========================================================
   PHONE

   Accepts:
   9876543210
   +91 9876543210
   91-9876543210
========================================================= */

export const normalizePhone = (
  phone = ""
) => {
  let digits =
    String(phone ?? "")
      .replace(/\D/g, "");

  if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    digits =
      digits.slice(2);
  }

  return digits;
};

export const isValidPhone = (
  phone = ""
) => {
  const normalized =
    normalizePhone(phone);

  return /^[6-9]\d{9}$/.test(
    normalized
  );
};

/* =========================================================
   PINCODE
========================================================= */

export const isValidPincode = (
  pincode = ""
) => {
  return /^[1-9][0-9]{5}$/.test(
    String(pincode ?? "")
      .trim()
  );
};

/* =========================================================
   LOGIN
========================================================= */

export const validateLoginForm = ({
  email,
  password,
} = {}) => {
  if (!isRequired(email)) {
    return "Email is required.";
  }

  if (!isValidEmail(email)) {
    return "Please enter a valid email address.";
  }

  if (!isRequired(password)) {
    return "Password is required.";
  }

  return "";
};

/* =========================================================
   REGISTER
========================================================= */

export const validateRegisterForm = ({
  name,
  fullName,
  email,
  phone,
  password,
  confirmPassword,
  terms,
} = {}) => {
  const resolvedName =
    fullName || name;

  if (
    !isRequired(
      resolvedName
    )
  ) {
    return "Full name is required.";
  }

  if (!isRequired(email)) {
    return "Email is required.";
  }

  if (!isValidEmail(email)) {
    return "Please enter a valid email address.";
  }

  /*
    Phone is optional during registration,
    but validate it when entered.
  */

  if (
    isRequired(phone) &&
    !isValidPhone(phone)
  ) {
    return "Please enter a valid 10-digit phone number.";
  }

  if (!isRequired(password)) {
    return "Password is required.";
  }

  if (
    !isValidPassword(
      password
    )
  ) {
    return "Password must be at least 8 characters.";
  }

  if (
    confirmPassword !==
      undefined &&
    password !==
      confirmPassword
  ) {
    return "Passwords do not match.";
  }

  if (
    terms !== undefined &&
    !terms
  ) {
    return "Please accept the Terms & Conditions.";
  }

  return "";
};

/* =========================================================
   CHECKOUT
========================================================= */

export const validateCheckoutForm = ({
  fullName,
  email,
  phone,
  address,
  city,
  state,
  pincode,
} = {}) => {
  if (
    !isRequired(
      fullName
    )
  ) {
    return "Full name is required.";
  }

  if (!isRequired(email)) {
    return "Email is required.";
  }

  if (!isValidEmail(email)) {
    return "Please enter a valid email address.";
  }

  if (!isRequired(phone)) {
    return "Phone number is required.";
  }

  if (!isValidPhone(phone)) {
    return "Please enter a valid 10-digit phone number.";
  }

  if (
    !isRequired(
      address
    )
  ) {
    return "Delivery address is required.";
  }

  if (!isRequired(city)) {
    return "City is required.";
  }

  if (!isRequired(state)) {
    return "State is required.";
  }

  if (
    !isRequired(
      pincode
    )
  ) {
    return "Pincode is required.";
  }

  if (
    !isValidPincode(
      pincode
    )
  ) {
    return "Please enter a valid 6-digit pincode.";
  }

  return "";
};

/* =========================================================
   PRODUCT FORM
========================================================= */

export const validateProductForm = ({
  name,
  brand,
  category,
  category_id,
  price,
  discount_price,
  stock,
  pack_size,
} = {}) => {
  if (!isRequired(name)) {
    return "Product name is required.";
  }

  if (!isRequired(brand)) {
    return "Product brand is required.";
  }

  const resolvedCategory =
    category_id ||
    category;

  if (
    !isRequired(
      resolvedCategory
    )
  ) {
    return "Product category is required.";
  }

  if (!isRequired(price)) {
    return "Product price is required.";
  }

  const numericPrice =
    Number(price);

  if (
    !Number.isFinite(
      numericPrice
    ) ||
    numericPrice < 0
  ) {
    return "Please enter a valid product price.";
  }

  if (
    discount_price !==
      undefined &&
    discount_price !==
      null &&
    discount_price !== ""
  ) {
    const numericDiscount =
      Number(
        discount_price
      );

    if (
      !Number.isFinite(
        numericDiscount
      ) ||
      numericDiscount < 0
    ) {
      return "Please enter a valid discount price.";
    }

    if (
      numericDiscount >
      numericPrice
    ) {
      return "Discount price cannot be greater than the regular price.";
    }
  }

  if (!isRequired(stock)) {
    return "Product stock is required.";
  }

  const numericStock =
    Number(stock);

  if (
    !Number.isInteger(
      numericStock
    ) ||
    numericStock < 0
  ) {
    return "Stock must be a non-negative whole number.";
  }

  if (
    pack_size !==
      undefined &&
    !isRequired(
      pack_size
    )
  ) {
    return "Pack size cannot be empty.";
  }

  return "";
};