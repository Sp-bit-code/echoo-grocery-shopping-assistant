import React, {
  useMemo,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import CategoryFilter from "../../../components/store/CategoryFilter/CategoryFilter.jsx";
import ProductGrid from "../../../components/store/ProductGrid/ProductGrid.jsx";

import useProducts from "../../../hooks/useProducts.js";

import {
  buildFrontendCategories,
  getFrontendProductCategory,
  getProductPackLabel,
  getUniqueProductCount,
} from "../../../utils/groceryCategories.js";

import "./Categories.css";

/* =========================================================
   NORMALIZE SEARCH TEXT
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
   PRODUCT SEARCH TEXT

   Search supports:
   - name
   - brand
   - category
   - description
   - pack size
========================================================= */

const getProductSearchText = (
  product = {}
) => {
  const category =
    getFrontendProductCategory(
      product
    );

  return normalizeText(
    [
      product.name,
      product.brand,
      category?.name,
      product.description,
      product.short_description,
      getProductPackLabel(
        product
      ),
      product.unit,
    ]
      .filter(Boolean)
      .join(" ")
  );
};

/* =========================================================
   PAGE
========================================================= */

const Categories = () => {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  /* =========================================================
     URL STATE
  ========================================================= */

  const selectedCategory =
    searchParams.get(
      "category"
    ) || "all";

  const searchQuery =
    searchParams.get(
      "search"
    ) || "";

  const normalizedSearch =
    normalizeText(
      searchQuery
    );

  /* =========================================================
     PRODUCTS

     These are raw SKU rows.

     Example:
     Amul Milk 500 ml
     Amul Milk 1 L
     Amul Milk 2 L
     Amul Milk 6 L

     ProductGrid later turns these into ONE card.
  ========================================================= */

  const {
    products = [],
    productsLoading,
    productsError,
  } = useProducts({
    autoFetch: true,
  });

  /* =========================================================
     TOTAL LOGICAL PRODUCTS
  ========================================================= */

  const totalProductCount =
    useMemo(() => {
      return getUniqueProductCount(
        products
      );
    }, [products]);

  /* =========================================================
     CATEGORY SIDEBAR
  ========================================================= */

  const categories =
    useMemo(() => {
      return buildFrontendCategories(
        products
      );
    }, [products]);

  /* =========================================================
     CATEGORY CHANGE

     Preserve search text if one exists.
  ========================================================= */

  const handleCategoryChange = (
    categorySlug
  ) => {
    const nextParams = {};

    if (
      searchQuery.trim()
    ) {
      nextParams.search =
        searchQuery.trim();
    }

    if (
      categorySlug &&
      categorySlug !== "all"
    ) {
      nextParams.category =
        categorySlug;
    }

    setSearchParams(
      nextParams
    );
  };

  /* =========================================================
     CLEAR SEARCH
  ========================================================= */

  const handleClearSearch =
    () => {
      const nextParams = {};

      if (
        selectedCategory !==
        "all"
      ) {
        nextParams.category =
          selectedCategory;
      }

      setSearchParams(
        nextParams
      );
    };

  /* =========================================================
     FILTER PRODUCTS

     Step 1:
     category

     Step 2:
     search

     IMPORTANT:
     raw pack variants remain together so ProductGrid
     can create one product card with multiple packs.
  ========================================================= */

  const visibleProducts =
    useMemo(() => {
      let filtered =
        [...products];

      /* CATEGORY */

      if (
        selectedCategory !==
        "all"
      ) {
        filtered =
          filtered.filter(
            (product) => {
              const category =
                getFrontendProductCategory(
                  product
                );

              return (
                category.slug ===
                selectedCategory
              );
            }
          );
      }

      /* SEARCH */

      if (
        normalizedSearch
      ) {
        const searchWords =
          normalizedSearch
            .split(" ")
            .filter(Boolean);

        filtered =
          filtered.filter(
            (product) => {
              const text =
                getProductSearchText(
                  product
                );

              return searchWords.every(
                (word) =>
                  text.includes(
                    word
                  )
              );
            }
          );
      }

      return filtered;
    }, [
      products,
      selectedCategory,
      normalizedSearch,
    ]);

  /* =========================================================
     LOGICAL RESULT COUNT

     4 variants still count as 1 product.
  ========================================================= */

  const visibleProductCount =
    useMemo(() => {
      return getUniqueProductCount(
        visibleProducts
      );
    }, [visibleProducts]);

  /* =========================================================
     SELECTED CATEGORY
  ========================================================= */

  const selectedCategoryData =
    useMemo(() => {
      if (
        selectedCategory ===
        "all"
      ) {
        return null;
      }

      return (
        categories.find(
          (category) =>
            category.slug ===
            selectedCategory
        ) || null
      );
    }, [
      categories,
      selectedCategory,
    ]);

  /* =========================================================
     HEADING
  ========================================================= */

  const catalogueHeading =
    useMemo(() => {
      if (
        searchQuery.trim()
      ) {
        return `Search results for "${searchQuery.trim()}"`;
      }

      if (
        selectedCategory !==
        "all"
      ) {
        return (
          selectedCategoryData
            ?.name ||
          "Products"
        );
      }

      return "All Products";
    }, [
      searchQuery,
      selectedCategory,
      selectedCategoryData,
    ]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (productsLoading) {
    return (
      <div className="categories-page">

        <div className="categories-loading">

          <div className="categories-loading-spinner" />

          <span>
            Loading groceries...
          </span>

        </div>

      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (productsError) {
    return (
      <div className="categories-page">

        <div className="categories-error">

          <h2>
            Unable to load groceries
          </h2>

          <p>
            {String(
              productsError
            )}
          </p>

        </div>

      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="categories-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="categories-hero">

        <div className="categories-hero-content">

          <span className="categories-eyebrow">
            Everyday essentials
          </span>

          <h1>
            Shop groceries,
            <br />
            your way.
          </h1>

          <p>
            Choose a category and select
            the pack size that works for
            you.
          </p>

        </div>

        <div className="categories-hero-stat">

          <strong>
            {totalProductCount}
          </strong>

          <span>
            {totalProductCount === 1
              ? "product available"
              : "products available"}
          </span>

        </div>

      </section>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <section className="categories-filter-section">

        <CategoryFilter
          categories={
            categories
          }
          selectedCategory={
            selectedCategory
          }
          onCategoryChange={
            handleCategoryChange
          }
        />

      </section>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <section className="categories-products">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="category-product-heading">

          <div>

            <h2>
              {catalogueHeading}
            </h2>

            <p>
              {
                visibleProductCount
              }{" "}
              {visibleProductCount ===
              1
                ? "product"
                : "products"}
            </p>

          </div>

          {/* SEARCH CLEAR */}

          {searchQuery.trim() && (
            <button
              type="button"
              onClick={
                handleClearSearch
              }
              style={{
                border:
                  "1px solid rgba(148, 163, 184, 0.35)",

                background:
                  "rgba(255,255,255,0.7)",

                borderRadius:
                  "999px",

                padding:
                  "9px 16px",

                fontSize:
                  "13px",

                fontWeight:
                  600,

                color:
                  "#475569",
              }}
            >
              Clear search
            </button>
          )}

        </div>

        {/* ===================================================
            RESULTS
        =================================================== */}

        {visibleProducts.length >
        0 ? (
          <div className="category-product-section">

            <ProductGrid
              products={
                visibleProducts
              }
            />

          </div>
        ) : (
          <div className="categories-empty">

            <h3>
              No products found
            </h3>

            {searchQuery.trim() ? (
              <p>
                No grocery products match
                "
                {searchQuery.trim()}
                ".
              </p>
            ) : (
              <p>
                There are currently no
                products available in this
                category.
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setSearchParams(
                  {}
                );
              }}
            >
              View all products
            </button>

          </div>
        )}

      </section>

    </div>
  );
};

export default Categories;