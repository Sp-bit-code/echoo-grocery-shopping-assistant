/* =========================================================
   GROCERY CATEGORY + PRODUCT GROUPING

   DATABASE:
   200 SKU / pack rows

   WEBSITE:
   48 logical products

   Example:

   Amul Taaza Toned Milk
     - 500 ml
     - 1 L
     - 2 L
     - 6 L

   = ONE PRODUCT
   = FOUR PACK OPTIONS

   Category assignment is based on the LOGICAL PRODUCT,
   not on pack size and not on the broad DB category.
========================================================= */


/* =========================================================
   STOREFRONT CATEGORIES

   Only categories which actually have products in the
   current 48-product seed are included.
========================================================= */

export const GROCERY_CATEGORIES = [
  {
    id: "dairy-eggs",
    slug: "dairy-eggs",
    name: "Dairy & Eggs",

    preferredProducts: [
      "Amul Cheese Slices",
      "Amul Taaza Toned Milk",
      "Mother Dairy Classic Curd",
      "Amul Fresh Paneer",
      "Amul Pasteurised Butter",
    ],
  },

  {
    id: "breakfast",
    slug: "breakfast",
    name: "Breakfast & Cereals",

    preferredProducts: [
      "Kellogg's Corn Flakes Original",
      "Quaker Oats",
    ],
  },

  {
    id: "bakery",
    slug: "bakery",
    name: "Bakery",

    preferredProducts: [
      "Britannia Brown Bread",
    ],
  },

  {
    id: "biscuits-cookies",
    slug: "biscuits-cookies",
    name: "Biscuits & Cookies",

    preferredProducts: [
      "Britannia Good Day Rich Cashew Cookies",
      "Parle-G Original Gluco Biscuits",
      "Cadbury Oreo Vanilla Creme Sandwich Biscuit",
    ],
  },

  {
    id: "atta-rice-dal",
    slug: "atta-rice-dal",
    name: "Atta, Rice & Dal",

    preferredProducts: [
      "Aashirvaad Shudh Chakki Atta",
      "India Gate Basmati Rice Super",
      "Tata Sampann Unpolished Toor Dal",
    ],
  },

  {
    id: "oil-masala",
    slug: "oil-masala",
    name: "Oil & Masala",

    preferredProducts: [
      "Fortune Sunlite Refined Sunflower Oil",
      "MDH Garam Masala",
      "Everest Turmeric Powder",
      "Tata Salt Iodised",
    ],
  },

  {
    id: "snacks",
    slug: "snacks",
    name: "Snacks",

    preferredProducts: [
      "Lay's India's Magic Masala Potato Chips",
      "Kurkure Masala Munch Namkeen",
      "Bingo! Mad Angles Mmmmm Masala",
    ],
  },

  {
    id: "beverages",
    slug: "beverages",
    name: "Beverages",

    preferredProducts: [
      "Coca-Cola Original Taste Soft Drink",
      "Maaza Mango Fruit Drink",
      "Real Fruit Power Mixed Fruit Juice",
      "Sprite Lemon-Lime Soft Drink",
      "Thums Up Soft Drink",
    ],
  },

  {
    id: "tea-coffee",
    slug: "tea-coffee",
    name: "Tea & Coffee",

    preferredProducts: [
      "Tata Tea Premium Desh Ki Chai",
      "Brooke Bond Red Label Tea",
      "Nescafe Classic Instant Coffee",
    ],
  },

  {
    id: "instant-food",
    slug: "instant-food",
    name: "Instant Food",

    preferredProducts: [
      "Maggi 2-Minute Masala Instant Noodles",
      "Sunfeast YiPPee! Magic Masala Instant Noodles",
      "MTR Upma Mix",
    ],
  },

  {
    id: "frozen-food",
    slug: "frozen-food",
    name: "Frozen Food",

    preferredProducts: [
      "McCain French Fries",
    ],
  },

  {
    id: "sauces-spreads",
    slug: "sauces-spreads",
    name: "Sauces & Spreads",

    preferredProducts: [
      "Kissan Fresh Tomato Ketchup",
      "Veeba Eggless Veg Mayonnaise",
      "Nutella Hazelnut & Cocoa Spread",
    ],
  },

  {
    id: "personal-care",
    slug: "personal-care",
    name: "Personal Care",

    preferredProducts: [
      "Colgate Strong Teeth Anticavity Toothpaste",
      "Pepsodent 12Hr Germicheck Toothpaste",
      "Dove Nutrient Serum Soap Bar",
      "Lux Glow Lush Rose Bathing Soap",
      "Head & Shoulders Smooth & Silky Anti-Dandruff Shampoo",
      "Dettol Original Liquid Handwash",
    ],
  },

  {
    id: "household",
    slug: "household",
    name: "Household Care",

    preferredProducts: [
      "Surf Excel Matic Front Load Detergent Powder",
      "Ariel Matic Front Load Detergent Powder",
      "Vim Concentrated Dishwash Gel",
      "Harpic Power Plus Original Toilet Cleaner",
    ],
  },

  {
    id: "baby-care",
    slug: "baby-care",
    name: "Baby Care",

    preferredProducts: [
      "Pampers Baby-Dry Diaper Pants New Baby",
      "Huggies Baby Wipes Cucumber & Aloe",
    ],
  },
];


/* =========================================================
   NORMALIZE TEXT
========================================================= */

const normalizeText = (
  value = ""
) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ");


/* =========================================================
   CATEGORY LOOKUP
========================================================= */

const CATEGORY_MAP =
  new Map(
    GROCERY_CATEGORIES.map(
      (category) => [
        category.slug,
        category,
      ]
    )
  );


/* =========================================================
   EXACT PRODUCT -> CATEGORY MAP

   These are the 48 logical products in your seed.

   Pack sizes do NOT appear here because pack size does
   not change product category.
========================================================= */

const PRODUCT_CATEGORY_MAP =
  new Map();


const registerProducts = (
  categorySlug,
  productNames
) => {
  productNames.forEach(
    (productName) => {
      PRODUCT_CATEGORY_MAP.set(
        normalizeText(
          productName
        ),
        categorySlug
      );
    }
  );
};


/* =========================================================
   DAIRY
========================================================= */

registerProducts(
  "dairy-eggs",
  [
    "Amul Taaza Toned Milk",
    "Amul Pasteurised Butter",
    "Amul Cheese Slices",
    "Mother Dairy Classic Curd",
    "Amul Fresh Paneer",
  ]
);


/* =========================================================
   BREAKFAST
========================================================= */

registerProducts(
  "breakfast",
  [
    "Kellogg's Corn Flakes Original",
    "Quaker Oats",
  ]
);


/* =========================================================
   BAKERY
========================================================= */

registerProducts(
  "bakery",
  [
    "Britannia Brown Bread",
  ]
);


/* =========================================================
   BISCUITS
========================================================= */

registerProducts(
  "biscuits-cookies",
  [
    "Parle-G Original Gluco Biscuits",
    "Britannia Good Day Rich Cashew Cookies",
    "Cadbury Oreo Vanilla Creme Sandwich Biscuit",
  ]
);


/* =========================================================
   ATTA / RICE / DAL
========================================================= */

registerProducts(
  "atta-rice-dal",
  [
    "Aashirvaad Shudh Chakki Atta",
    "India Gate Basmati Rice Super",
    "Tata Sampann Unpolished Toor Dal",
  ]
);


/* =========================================================
   OIL & MASALA
========================================================= */

registerProducts(
  "oil-masala",
  [
    "Fortune Sunlite Refined Sunflower Oil",
    "Tata Salt Iodised",
    "MDH Garam Masala",
    "Everest Turmeric Powder",
  ]
);


/* =========================================================
   SNACKS
========================================================= */

registerProducts(
  "snacks",
  [
    "Lay's India's Magic Masala Potato Chips",
    "Kurkure Masala Munch Namkeen",
    "Bingo! Mad Angles Mmmmm Masala",
  ]
);


/* =========================================================
   BEVERAGES
========================================================= */

registerProducts(
  "beverages",
  [
    "Coca-Cola Original Taste Soft Drink",
    "Thums Up Soft Drink",
    "Sprite Lemon-Lime Soft Drink",
    "Maaza Mango Fruit Drink",
    "Real Fruit Power Mixed Fruit Juice",
  ]
);


/* =========================================================
   TEA & COFFEE
========================================================= */

registerProducts(
  "tea-coffee",
  [
    "Tata Tea Premium Desh Ki Chai",
    "Brooke Bond Red Label Tea",
    "Nescafe Classic Instant Coffee",
  ]
);


/* =========================================================
   INSTANT FOOD
========================================================= */

registerProducts(
  "instant-food",
  [
    "Maggi 2-Minute Masala Instant Noodles",
    "Sunfeast YiPPee! Magic Masala Instant Noodles",
    "MTR Upma Mix",
  ]
);


/* =========================================================
   FROZEN
========================================================= */

registerProducts(
  "frozen-food",
  [
    "McCain French Fries",
  ]
);


/* =========================================================
   SAUCES
========================================================= */

registerProducts(
  "sauces-spreads",
  [
    "Kissan Fresh Tomato Ketchup",
    "Veeba Eggless Veg Mayonnaise",
    "Nutella Hazelnut & Cocoa Spread",
  ]
);


/* =========================================================
   PERSONAL CARE
========================================================= */

registerProducts(
  "personal-care",
  [
    "Colgate Strong Teeth Anticavity Toothpaste",
    "Pepsodent 12Hr Germicheck Toothpaste",
    "Dove Nutrient Serum Soap Bar",
    "Lux Glow Lush Rose Bathing Soap",
    "Head & Shoulders Smooth & Silky Anti-Dandruff Shampoo",
    "Dettol Original Liquid Handwash",
  ]
);


/* =========================================================
   HOUSEHOLD
========================================================= */

registerProducts(
  "household",
  [
    "Surf Excel Matic Front Load Detergent Powder",
    "Ariel Matic Front Load Detergent Powder",
    "Vim Concentrated Dishwash Gel",
    "Harpic Power Plus Original Toilet Cleaner",
  ]
);


/* =========================================================
   BABY CARE
========================================================= */

registerProducts(
  "baby-care",
  [
    "Pampers Baby-Dry Diaper Pants New Baby",
    "Huggies Baby Wipes Cucumber & Aloe",
  ]
);


/* =========================================================
   PACK LABEL
========================================================= */

export const getProductPackLabel = (
  product = {}
) => {
  if (!product) {
    return "";
  }

  if (
    product.pack_size
  ) {
    return String(
      product.pack_size
    ).trim();
  }

  if (
    product.packSize
  ) {
    return String(
      product.packSize
    ).trim();
  }

  if (
    product.quantity !== null &&
    product.quantity !== undefined &&
    product.quantity !== "" &&
    product.unit
  ) {
    return `${product.quantity} ${product.unit}`;
  }

  return "";
};


/* =========================================================
   BASE PRODUCT NAME

   Normally product.name is already identical across packs.

   Example:

   name:
   "Amul Cheese Slices"

   pack_size:
   "100 g"

   But this also protects against future data where
   pack size may accidentally be included in name.
========================================================= */

export const getBaseProductName = (
  product = {}
) => {
  if (!product) {
    return "";
  }

  let name =
    String(
      product.name || ""
    ).trim();

  const pack =
    getProductPackLabel(
      product
    );

  if (pack) {
    const escapedPack =
      String(pack).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    name =
      name.replace(
        new RegExp(
          `\\s*[-–—]?\\s*${escapedPack}\\.?\\s*$`,
          "i"
        ),
        ""
      );
  }

  return name.trim();
};


/* =========================================================
   FALLBACK CLASSIFICATION

   Exact map above handles your current 48 products.

   This only helps if a new product is later added through
   Admin and has not yet been added to the exact map.
========================================================= */

const getFallbackCategorySlug = (
  product = {}
) => {
  const text =
    normalizeText(
      [
        product.name,
        product.brand,
        product.description,
        product.short_description,
      ]
        .filter(Boolean)
        .join(" ")
    );

  if (
    /corn flakes|cornflakes|oats|muesli|granola|cereal/.test(
      text
    )
  ) {
    return "breakfast";
  }

  if (
    /milk|curd|dahi|yogurt|yoghurt|cheese|paneer|butter/.test(
      text
    )
  ) {
    return "dairy-eggs";
  }

  if (
    /bread|bun|pav|croissant/.test(
      text
    )
  ) {
    return "bakery";
  }

  if (
    /biscuit|cookie|oreo|parle-g|good day/.test(
      text
    )
  ) {
    return "biscuits-cookies";
  }

  if (
    /atta|basmati|rice|toor dal|moong dal|masoor|urad|lentil/.test(
      text
    )
  ) {
    return "atta-rice-dal";
  }

  if (
    /sunflower oil|mustard oil|cooking oil|masala|turmeric|haldi|salt/.test(
      text
    )
  ) {
    return "oil-masala";
  }

  if (
    /chips|namkeen|kurkure|bingo|snack/.test(
      text
    )
  ) {
    return "snacks";
  }

  if (
    /tea|coffee|nescafe/.test(
      text
    )
  ) {
    return "tea-coffee";
  }

  if (
    /cola|soft drink|juice|fruit drink|sprite|maaza|thums up/.test(
      text
    )
  ) {
    return "beverages";
  }

  if (
    /frozen|french fries|mccain/.test(
      text
    )
  ) {
    return "frozen-food";
  }

  if (
    /noodles|maggi|yippee|upma mix|instant/.test(
      text
    )
  ) {
    return "instant-food";
  }

  if (
    /ketchup|mayonnaise|spread|nutella|sauce/.test(
      text
    )
  ) {
    return "sauces-spreads";
  }

  if (
    /toothpaste|soap|shampoo|handwash|body wash/.test(
      text
    )
  ) {
    return "personal-care";
  }

  if (
    /detergent|dishwash|toilet cleaner|floor cleaner|harpic|vim|surf excel|ariel/.test(
      text
    )
  ) {
    return "household";
  }

  if (
    /baby|diaper|pampers|huggies|baby wipes/.test(
      text
    )
  ) {
    return "baby-care";
  }

  return "other";
};


/* =========================================================
   CATEGORY FOR PRODUCT
========================================================= */

export const getFrontendProductCategory = (
  product = {}
) => {
  const productName =
    normalizeText(
      getBaseProductName(
        product
      )
    );

  /* Exact current seed mapping */

  const exactCategorySlug =
    PRODUCT_CATEGORY_MAP.get(
      productName
    );

  if (
    exactCategorySlug
  ) {
    return (
      CATEGORY_MAP.get(
        exactCategorySlug
      ) || {
        id:
          exactCategorySlug,

        slug:
          exactCategorySlug,

        name:
          exactCategorySlug,
      }
    );
  }

  /* Future product fallback */

  const fallbackSlug =
    getFallbackCategorySlug(
      product
    );

  if (
    CATEGORY_MAP.has(
      fallbackSlug
    )
  ) {
    return CATEGORY_MAP.get(
      fallbackSlug
    );
  }

  return {
    id: "other",
    slug: "other",
    name: "Other",
    preferredProducts: [],
  };
};


/* =========================================================
   PRODUCT IMAGE
========================================================= */

export const getCategoryProductImage = (
  product = {}
) => {
  if (!product) {
    return "";
  }

  if (
    product.primary_image
  ) {
    return product.primary_image;
  }

  if (
    product.primaryImage
  ) {
    return product.primaryImage;
  }

  if (
    product.image
  ) {
    return product.image;
  }

  const images = [
    ...(Array.isArray(
      product.images
    )
      ? product.images
      : []),

    ...(Array.isArray(
      product.product_images
    )
      ? product.product_images
      : []),
  ];

  if (!images.length) {
    return "";
  }

  const primary =
    images.find(
      (image) =>
        typeof image ===
          "object" &&
        image?.is_primary &&
        (
          image.image_url ||
          image.url
        )
    );

  const selected =
    primary ||
    images.find(
      (image) => {
        if (
          typeof image ===
          "string"
        ) {
          return Boolean(
            image
          );
        }

        return Boolean(
          image?.image_url ||
          image?.url
        );
      }
    );

  if (!selected) {
    return "";
  }

  if (
    typeof selected ===
    "string"
  ) {
    return selected;
  }

  return (
    selected.image_url ||
    selected.url ||
    ""
  );
};


/* =========================================================
   LOGICAL PRODUCT KEY

   Category + Product Name.

   PACK SIZE IS NOT INCLUDED.

   Therefore all pack-size rows combine together.
========================================================= */

export const getLogicalProductKey = (
  product = {}
) => {
  const category =
    getFrontendProductCategory(
      product
    );

  const name =
    normalizeText(
      getBaseProductName(
        product
      )
    );

  const brand =
    normalizeText(
      product.brand
    );

  return [
    category.slug,
    brand,
    name,
  ].join("::");
};


/* =========================================================
   PACK SORT
========================================================= */

const convertToBaseQuantity = (
  value,
  unit
) => {
  const amount =
    Number(value);

  if (
    !Number.isFinite(
      amount
    )
  ) {
    return Number.MAX_SAFE_INTEGER;
  }

  const normalizedUnit =
    normalizeText(unit);

  if (
    normalizedUnit === "kg" ||
    normalizedUnit === "l" ||
    normalizedUnit ===
      "litre" ||
    normalizedUnit ===
      "liter"
  ) {
    return amount * 1000;
  }

  return amount;
};


export const getPackSortValue = (
  product = {}
) => {
  const pack =
    normalizeText(
      getProductPackLabel(
        product
      )
    );

  if (!pack) {
    return Number.MAX_SAFE_INTEGER;
  }

  /* Example: 12 x 180 ml */

  const multi =
    pack.match(
      /(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*(kg|g|gm|l|ml|litre|liter|pcs?|pieces?|wipes?)/
    );

  if (multi) {
    return (
      Number(multi[1]) *
      convertToBaseQuantity(
        multi[2],
        multi[3]
      )
    );
  }

  /* Example: 500 ml */

  const simple =
    pack.match(
      /(\d+(?:\.\d+)?)\s*(kg|g|gm|l|ml|litre|liter|pcs?|pieces?|wipes?)/
    );

  if (simple) {
    return convertToBaseQuantity(
      simple[1],
      simple[2]
    );
  }

  return Number.MAX_SAFE_INTEGER;
};


/* =========================================================
   GROUP SKU ROWS

   200 SKU rows
        ↓
   48 logical products
========================================================= */

export const groupLogicalProducts = (
  products = []
) => {
  if (
    !Array.isArray(products)
  ) {
    return [];
  }

  const groups =
    new Map();

  products.forEach(
    (product) => {
      if (
        !product?.id
      ) {
        return;
      }

      const key =
        getLogicalProductKey(
          product
        );

      if (
        !groups.has(key)
      ) {
        groups.set(
          key,
          {
            key,

            name:
              getBaseProductName(
                product
              ),

            brand:
              product.brand ||
              "",

            category:
              getFrontendProductCategory(
                product
              ),

            variants: [],
          }
        );
      }

      groups
        .get(key)
        .variants.push(
          product
        );
    }
  );

  return Array.from(
    groups.values()
  ).map(
    (group) => {
      const variants =
        [...group.variants].sort(
          (a, b) =>
            getPackSortValue(
              a
            ) -
            getPackSortValue(
              b
            )
        );

      const representative =
        variants.find(
          (variant) =>
            variant.is_featured &&
            variant.is_active !==
              false
        ) ||
        variants.find(
          (variant) =>
            variant.is_active !==
            false
        ) ||
        variants[0] ||
        null;

      return {
        ...group,

        variants,

        representative,

        variant_count:
          variants.length,
      };
    }
  );
};


/* =========================================================
   UNIQUE PRODUCT COUNT
========================================================= */

export const getUniqueProductCount = (
  products = []
) =>
  groupLogicalProducts(
    products
  ).length;


/* =========================================================
   CATEGORY IMAGE
========================================================= */

const findCategoryImage = (
  logicalProducts,
  category
) => {
  const preferences =
    category
      .preferredProducts ||
    [];

  /* Preferred representative */

  for (
    const preferredName
    of preferences
  ) {
    const matched =
      logicalProducts.find(
        (product) =>
          normalizeText(
            product.name
          ) ===
          normalizeText(
            preferredName
          )
      );

    if (!matched) {
      continue;
    }

    for (
      const variant
      of matched.variants
    ) {
      const image =
        getCategoryProductImage(
          variant
        );

      if (image) {
        return image;
      }
    }
  }

  /* Any valid image */

  for (
    const product
    of logicalProducts
  ) {
    for (
      const variant
      of product.variants
    ) {
      const image =
        getCategoryProductImage(
          variant
        );

      if (image) {
        return image;
      }
    }
  }

  return "";
};


/* =========================================================
   BUILD SIDEBAR

   Counts LOGICAL PRODUCTS.

   Not SKU/pack rows.
========================================================= */

export const buildFrontendCategories = (
  products = []
) => {
  const logicalProducts =
    groupLogicalProducts(
      products
    );

  return GROCERY_CATEGORIES
    .map(
      (category) => {
        const categoryProducts =
          logicalProducts.filter(
            (product) =>
              product.category
                ?.slug ===
              category.slug
          );

        if (
          !categoryProducts.length
        ) {
          return null;
        }

        return {
          id:
            category.id,

          slug:
            category.slug,

          name:
            category.name,

          /*
            IMPORTANT:
            logical count
          */

          product_count:
            categoryProducts.length,

          /*
            Database SKU count.
            Kept internally if needed.
          */

          variant_count:
            categoryProducts.reduce(
              (
                total,
                product
              ) =>
                total +
                product
                  .variants
                  .length,
              0
            ),

          image_url:
            findCategoryImage(
              categoryProducts,
              category
            ),
        };
      }
    )
    .filter(Boolean);
};