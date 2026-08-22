import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Search,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getProducts,
} from "../../../api/productApi.js";

import {
  getCategoryProductImage,
  getProductPackLabel,
  groupLogicalProducts,
} from "../../../utils/groceryCategories.js";

/* =========================================================
   FALLBACK IMAGE
========================================================= */

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='12' fill='%23eef2f6'/%3E%3Cpath d='M34 43h32l-3 28H37z' fill='%2388b8ec'/%3E%3Cpath d='M40 44c0-10 4-17 10-17s10 7 10 17' fill='none' stroke='%235d6b7c' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E";

/* =========================================================
   TEXT
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

   Search checks:
   - product name
   - brand
   - category
   - description
   - short description
   - all pack sizes
========================================================= */

const getLogicalProductSearchText = (
  logicalProduct
) => {
  if (!logicalProduct) {
    return "";
  }

  const variantText =
    logicalProduct.variants
      .flatMap(
        (variant) => [
          variant.name,
          variant.brand,
          variant.description,
          variant.short_description,
          variant.pack_size,
          variant.packSize,
          variant.unit,
        ]
      )
      .filter(Boolean)
      .join(" ");

  return normalizeText(
    [
      logicalProduct.name,
      logicalProduct.brand,
      logicalProduct.category?.name,
      variantText,
    ]
      .filter(Boolean)
      .join(" ")
  );
};

/* =========================================================
   DISPLAY VARIANT

   Use the smallest available pack in search results.
========================================================= */

const getDisplayVariant = (
  logicalProduct
) => {
  if (
    !logicalProduct?.variants
      ?.length
  ) {
    return null;
  }

  return (
    logicalProduct.variants.find(
      (variant) =>
        Number(
          variant.stock || 0
        ) > 0 &&
        variant.is_active !== false
    ) ||
    logicalProduct.variants[0]
  );
};

/* =========================================================
   PRICE
========================================================= */

const getPrice = (
  product
) => {
  if (!product) {
    return 0;
  }

  return Number(
    product.discount_price ??
      product.discountPrice ??
      product.price ??
      0
  );
};

/* =========================================================
   SEARCH DROPDOWN
========================================================= */

const SearchDropdown = () => {
  const navigate =
    useNavigate();

  const containerRef =
    useRef(null);

  const inputRef =
    useRef(null);

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================================
     LOAD CATALOGUE ONCE

     We load raw SKU rows.

     Example:
     bread 400 g
     bread 450 g
     bread 800 g

     Then groupLogicalProducts() converts them
     into ONE searchable logical product.
  ========================================================= */

  useEffect(() => {
    let active = true;

    const loadProducts =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await getProducts();

          if (!active) {
            return;
          }

          const data =
            Array.isArray(response)
              ? response
              : Array.isArray(
                    response?.data
                  )
                ? response.data
                : [];

          setProducts(data);
        } catch (loadError) {
          console.error(
            "Search products load error:",
            loadError
          );

          if (active) {
            setError(
              "Unable to load search."
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  /* =========================================================
     LOGICAL PRODUCTS

     200 SKU rows
         ↓
     48 actual products
  ========================================================= */

  const logicalProducts =
    useMemo(() => {
      return groupLogicalProducts(
        products
      );
    }, [products]);

  /* =========================================================
     REAL SEARCH FILTER

     This is the important fix.

     Results are recalculated from query.
  ========================================================= */

  const searchResults =
    useMemo(() => {
      const cleanQuery =
        normalizeText(query);

      if (!cleanQuery) {
        return [];
      }

      const words =
        cleanQuery
          .split(" ")
          .filter(Boolean);

      return logicalProducts
        .filter(
          (logicalProduct) => {
            const searchableText =
              getLogicalProductSearchText(
                logicalProduct
              );

            /*
              Every typed word must exist.

              Example:
              "brown bread"

              must match both:
              brown + bread
            */

            return words.every(
              (word) =>
                searchableText.includes(
                  word
                )
            );
          }
        )
        .sort((a, b) => {
          const aName =
            normalizeText(
              a.name
            );

          const bName =
            normalizeText(
              b.name
            );

          /*
            Products whose name starts with
            the search term come first.
          */

          const aStarts =
            aName.startsWith(
              cleanQuery
            );

          const bStarts =
            bName.startsWith(
              cleanQuery
            );

          if (
            aStarts &&
            !bStarts
          ) {
            return -1;
          }

          if (
            !aStarts &&
            bStarts
          ) {
            return 1;
          }

          /*
            Then products containing query
            directly in their name.
          */

          const aNameMatch =
            aName.includes(
              cleanQuery
            );

          const bNameMatch =
            bName.includes(
              cleanQuery
            );

          if (
            aNameMatch &&
            !bNameMatch
          ) {
            return -1;
          }

          if (
            !aNameMatch &&
            bNameMatch
          ) {
            return 1;
          }

          return aName.localeCompare(
            bName
          );
        })
        .slice(0, 6);
    }, [
      query,
      logicalProducts,
    ]);

  /* =========================================================
     CLICK OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =========================================================
     ESCAPE KEY
  ========================================================= */

  useEffect(() => {
    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /* =========================================================
     OPEN SEARCH
  ========================================================= */

  const openSearch = () => {
    setIsOpen(true);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  /* =========================================================
     CLOSE SEARCH
  ========================================================= */

  const closeSearch = () => {
    setIsOpen(false);
    setQuery("");
  };

  /* =========================================================
     PRODUCT CLICK
  ========================================================= */

  const handleProductClick = (
    logicalProduct
  ) => {
    const product =
      getDisplayVariant(
        logicalProduct
      );

    if (!product?.slug) {
      return;
    }

    closeSearch();

    navigate(
      `/product/${product.slug}`
    );
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* =====================================================
          SEARCH ICON
      ===================================================== */}

      <button
        type="button"
        onClick={openSearch}
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-gray-800
          transition
          hover:bg-white/60
        "
        aria-label="Search groceries"
      >
        <Search
          size={21}
          strokeWidth={1.7}
        />
      </button>

      {/* =====================================================
          SEARCH PANEL
      ===================================================== */}

      {isOpen && (
        <div
          className="
            fixed
            right-5
            top-[86px]
            z-[1000000]
            w-[min(450px,calc(100vw-32px))]
            overflow-hidden
            rounded-2xl
            border
            border-gray-200/80
            bg-white/95
            shadow-[0_22px_60px_rgba(15,23,42,0.22)]
            backdrop-blur-xl
          "
        >
          {/* =================================================
              SEARCH INPUT
          ================================================= */}

          <div
            className="
              flex
              h-[70px]
              items-center
              gap-3
              border-b
              border-gray-100
              px-5
            "
          >
            <Search
              size={21}
              className="shrink-0 text-gray-400"
              strokeWidth={1.7}
            />

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(
                event
              ) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search groceries..."
              className="
                min-w-0
                flex-1
                border-0
                bg-transparent
                text-[18px]
                font-semibold
                text-gray-900
                outline-none
                placeholder:font-normal
                placeholder:text-gray-400
              "
            />

            <button
              type="button"
              onClick={closeSearch}
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                text-gray-400
                transition
                hover:bg-gray-100
                hover:text-gray-700
              "
              aria-label="Close search"
            >
              <X
                size={18}
              />
            </button>
          </div>

          {/* =================================================
              RESULTS
          ================================================= */}

          <div
            className="
              max-h-[440px]
              overflow-y-auto
            "
          >
            {/* LOADING */}

            {loading && (
              <div className="px-6 py-10 text-center">

                <div
                  className="
                    mx-auto
                    h-6
                    w-6
                    animate-spin
                    rounded-full
                    border-2
                    border-gray-200
                    border-t-gray-700
                  "
                />

                <p className="mt-3 text-sm text-gray-500">
                  Loading groceries...
                </p>
              </div>
            )}

            {/* ERROR */}

            {!loading &&
              error && (
                <div className="px-6 py-10 text-center text-sm text-gray-500">
                  {error}
                </div>
              )}

            {/* EMPTY QUERY */}

            {!loading &&
              !error &&
              !query.trim() && (
                <div className="px-6 py-10 text-center">

                  <Search
                    size={30}
                    className="mx-auto mb-3 text-gray-300"
                  />

                  <p className="text-sm text-gray-500">
                    Start typing to search
                    groceries.
                  </p>
                </div>
              )}

            {/* NO RESULTS */}

            {!loading &&
              !error &&
              query.trim() &&
              searchResults.length ===
                0 && (
                <div className="px-6 py-10 text-center">

                  <p className="font-semibold text-gray-800">
                    No products found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    No results for "
                    {query.trim()}"
                  </p>
                </div>
              )}

            {/* RESULTS */}

            {!loading &&
              !error &&
              query.trim() &&
              searchResults.map(
                (
                  logicalProduct
                ) => {
                  const product =
                    getDisplayVariant(
                      logicalProduct
                    );

                  if (!product) {
                    return null;
                  }

                  const image =
                    getCategoryProductImage(
                      product
                    ) ||
                    FALLBACK_IMAGE;

                  const price =
                    getPrice(
                      product
                    );

                  const pack =
                    getProductPackLabel(
                      product
                    );

                  const allPacks =
                    logicalProduct
                      .variants
                      .map(
                        (variant) =>
                          getProductPackLabel(
                            variant
                          )
                      )
                      .filter(Boolean);

                  return (
                    <button
                      type="button"
                      key={
                        logicalProduct.key
                      }
                      onClick={() =>
                        handleProductClick(
                          logicalProduct
                        )
                      }
                      className="
                        flex
                        w-full
                        items-center
                        gap-4
                        border-b
                        border-gray-100
                        px-5
                        py-4
                        text-left
                        transition
                        last:border-b-0
                        hover:bg-gray-50
                      "
                    >
                      {/* IMAGE */}

                      <div
                        className="
                          flex
                          h-[58px]
                          w-[58px]
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-xl
                          border
                          border-gray-100
                          bg-gray-50
                          p-1.5
                        "
                      >
                        <img
                          src={image}
                          alt={
                            logicalProduct.name
                          }
                          className="h-full w-full object-contain"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.onerror =
                              null;

                            event.currentTarget.src =
                              FALLBACK_IMAGE;
                          }}
                        />
                      </div>

                      {/* INFO */}

                      <div className="min-w-0 flex-1">

                        <p
                          className="
                            truncate
                            text-[15px]
                            font-semibold
                            text-gray-900
                          "
                        >
                          {
                            logicalProduct.name
                          }
                        </p>

                        <p
                          className="
                            mt-1
                            truncate
                            text-xs
                            text-gray-500
                          "
                        >
                          {logicalProduct.brand ||
                            "Grocery"}

                          {allPacks.length >
                            0 &&
                            ` • ${allPacks.join(
                              " / "
                            )}`}
                        </p>

                        {logicalProduct
                          .variants
                          .length > 1 && (
                          <p className="mt-1 text-[11px] text-gray-400">
                            {
                              logicalProduct
                                .variants
                                .length
                            }{" "}
                            pack options
                          </p>
                        )}
                      </div>

                      {/* PRICE */}

                      <div className="shrink-0 text-right">

                        <p className="text-[15px] font-bold text-gray-900">
                          ₹
                          {price.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        {pack && (
                          <p className="mt-1 text-[11px] text-gray-400">
                            from {pack}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                }
              )}
          </div>

          {/* =================================================
              VIEW ALL SEARCH RESULTS
          ================================================= */}

          {!loading &&
            !error &&
            query.trim() &&
            searchResults.length >
              0 && (
              <button
                type="button"
                onClick={() => {
                  const cleanQuery =
                    query.trim();

                  setIsOpen(
                    false
                  );

                  setQuery("");

                  navigate(
                    `/categories?search=${encodeURIComponent(
                      cleanQuery
                    )}`
                  );
                }}
                className="
                  w-full
                  border-t
                  border-gray-100
                  bg-gray-50/80
                  px-5
                  py-3.5
                  text-center
                  text-sm
                  font-semibold
                  text-gray-700
                  transition
                  hover:bg-gray-100
                "
              >
                View all results
              </button>
            )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;