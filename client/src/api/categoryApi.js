/*
  categoryApi.js

  Grocery Voice Shopping Assistant

  Customer-facing category API.

  Categories are stored in the Supabase
  `categories` table and linked to products
  through:

    products.category_id -> categories.id
*/

import {
  getProducts,
} from "./productApi.js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL;

const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    "Missing VITE_SUPABASE_URL"
  );
}

if (!SUPABASE_KEY) {
  throw new Error(
    "Missing VITE_SUPABASE_ANON_KEY"
  );
}

/* =========================================================
   REST HELPER
========================================================= */

const parseError = (
  text,
  fallback
) => {
  if (!text) {
    return fallback;
  }

  try {
    const parsed =
      JSON.parse(text);

    return (
      parsed?.message ||
      parsed?.details ||
      parsed?.hint ||
      fallback
    );
  } catch {
    return text;
  }
};

const restFetch = async (
  path
) => {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/${path}`,
      {
        method: "GET",

        headers: {
          apikey:
            SUPABASE_KEY,

          Authorization:
            `Bearer ${SUPABASE_KEY}`,

          "Content-Type":
            "application/json",
        },
      }
    );

  const text =
    await response.text();

  if (!response.ok) {
    const message =
      parseError(
        text,
        "Category request failed"
      );

    console.error(
      "Category API error:",
      response.status,
      message
    );

    throw new Error(
      message
    );
  }

  if (!text) {
    return [];
  }

  try {
    return JSON.parse(
      text
    );
  } catch {
    return [];
  }
};

/* =========================================================
   NORMALIZE CATEGORY
========================================================= */

export const normalizeCategory = (
  category = {}
) => ({
  id:
    category.id || null,

  name:
    category.name || "",

  slug:
    category.slug || "",

  ...category,
});

/* =========================================================
   GET ALL CATEGORIES
========================================================= */

export const getCategories =
  async () => {
    const data =
      await restFetch(
        "categories?select=id,name,slug&order=name.asc"
      );

    return (
      Array.isArray(data)
        ? data
        : []
    ).map(
      normalizeCategory
    );
  };

/* =========================================================
   GET CATEGORY BY ID
========================================================= */

export const getCategoryById =
  async (categoryId) => {
    if (!categoryId) {
      throw new Error(
        "Category ID is required"
      );
    }

    const data =
      await restFetch(
        `categories?select=id,name,slug&id=eq.${encodeURIComponent(
          categoryId
        )}&limit=1`
      );

    if (!data?.[0]) {
      return null;
    }

    return normalizeCategory(
      data[0]
    );
  };

/* =========================================================
   GET CATEGORY BY SLUG
========================================================= */

export const getCategoryBySlug =
  async (slug) => {
    if (!slug) {
      throw new Error(
        "Category slug is required"
      );
    }

    const data =
      await restFetch(
        `categories?select=id,name,slug&slug=eq.${encodeURIComponent(
          slug
        )}&limit=1`
      );

    if (!data?.[0]) {
      return null;
    }

    return normalizeCategory(
      data[0]
    );
  };

/* =========================================================
   SEARCH CATEGORIES
========================================================= */

export const searchCategories =
  async (searchText) => {
    const search =
      String(
        searchText || ""
      )
        .trim()
        .toLowerCase();

    if (!search) {
      return getCategories();
    }

    const categories =
      await getCategories();

    return categories.filter(
      (category) =>
        category.name
          ?.toLowerCase()
          .includes(search) ||
        category.slug
          ?.toLowerCase()
          .includes(search)
    );
  };

/* =========================================================
   GET PRODUCTS FOR CATEGORY
========================================================= */

export const getCategoryProducts =
  async (
    categoryId,
    limit = 100
  ) => {
    if (!categoryId) {
      return [];
    }

    return getProducts({
      categoryId,
      limit,
    });
  };

/* =========================================================
   GET CATEGORY WITH PRODUCTS
========================================================= */

export const getCategoryWithProducts =
  async (
    categoryId,
    limit = 100
  ) => {
    if (!categoryId) {
      throw new Error(
        "Category ID is required"
      );
    }

    const [
      category,
      products,
    ] = await Promise.all([
      getCategoryById(
        categoryId
      ),

      getCategoryProducts(
        categoryId,
        limit
      ),
    ]);

    if (!category) {
      return null;
    }

    return {
      ...category,
      products,
      productCount:
        products.length,
    };
  };

/* =========================================================
   CATEGORY COUNTS

   Used when the Categories page wants to show:
   "Rice & Grains (18)"
========================================================= */

export const getCategoriesWithCounts =
  async () => {
    const [
      categories,
      products,
    ] = await Promise.all([
      getCategories(),

      getProducts(),
    ]);

    const countMap =
      new Map();

    products.forEach(
      (product) => {
        const categoryId =
          product.category_id ||
          product.categoryId;

        if (!categoryId) {
          return;
        }

        const key =
          String(
            categoryId
          );

        countMap.set(
          key,
          (
            countMap.get(
              key
            ) || 0
          ) + 1
        );
      }
    );

    return categories.map(
      (category) => ({
        ...category,

        productCount:
          countMap.get(
            String(
              category.id
            )
          ) || 0,
      })
    );
  };

/* =========================================================
   SLUG -> PRODUCTS

   Useful if the URL/filter later uses category slugs.
========================================================= */

export const getProductsByCategorySlug =
  async (
    slug,
    limit = 100
  ) => {
    if (!slug) {
      return [];
    }

    const category =
      await getCategoryBySlug(
        slug
      );

    if (!category) {
      return [];
    }

    return getCategoryProducts(
      category.id,
      limit
    );
  };

/* =========================================================
   COMPATIBILITY EXPORTS
========================================================= */

export const getAllCategories =
  getCategories;

export const getProductCategories =
  getCategories;