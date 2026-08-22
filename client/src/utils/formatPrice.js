/* =========================================================
   FORMAT PRICE
========================================================= */

export const formatPrice = (
  price = 0,
  currency = "INR"
) => {
  const safePrice =
    Number(price ?? 0);

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  ).format(
    Number.isFinite(
      safePrice
    )
      ? safePrice
      : 0
  );
};

/* =========================================================
   COMPACT PRICE

   Useful for admin/dashboard values.
   Examples:
   ₹1.2K
   ₹2.5L
========================================================= */

export const formatCompactPrice = (
  price = 0,
  currency = "INR"
) => {
  const safePrice =
    Number(price ?? 0);

  if (
    !Number.isFinite(
      safePrice
    )
  ) {
    return formatPrice(
      0,
      currency
    );
  }

  const symbol =
    currency === "INR"
      ? "₹"
      : "";

  if (
    safePrice >= 100000
  ) {
    return `${symbol}${(
      safePrice / 100000
    ).toFixed(1)}L`;
  }

  if (
    safePrice >= 1000
  ) {
    return `${symbol}${(
      safePrice / 1000
    ).toFixed(1)}K`;
  }

  return formatPrice(
    safePrice,
    currency
  );
};

/* =========================================================
   PARSE PRICE

   Converts:
   "₹1,299.50" -> 1299.5
   "599"       -> 599
========================================================= */

export const parsePrice = (
  value = 0
) => {
  if (
    typeof value ===
    "number"
  ) {
    return Number.isFinite(
      value
    )
      ? value
      : 0;
  }

  const parsed =
    Number(
      String(
        value ?? ""
      )
        .replace(
          /,/g,
          ""
        )
        .replace(
          /[^0-9.-]/g,
          ""
        )
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
};

export default formatPrice;