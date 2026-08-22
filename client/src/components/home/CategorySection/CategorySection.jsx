import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  Grid2X2,
  Package,
} from "lucide-react";

import {
  getProducts,
} from "../../../api/productApi.js";

import {
  buildFrontendCategories,
} from "../../../utils/groceryCategories.js";


/* =========================================================
   CATEGORY SECTION
========================================================= */

const CategorySection = () => {
  const navigate =
    useNavigate();

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  /* =========================================================
     LOAD PRODUCTS

     We no longer call old getCategoriesWithCounts().

     Categories are generated from the same product catalogue
     used by the Categories page.
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadProducts =
      async () => {
        try {
          setLoading(true);
          setError("");

          /*
            Load complete catalogue.

            Important because:

            200 SKU rows
                 ↓
            buildFrontendCategories()
                 ↓
            logical product categories
          */

          const data =
            await getProducts({
              limit: 500,
            });

          if (!mounted) {
            return;
          }

          setProducts(
            Array.isArray(data)
              ? data
              : Array.isArray(
                    data?.data
                  )
                ? data.data
                : []
          );
        } catch (err) {
          console.error(
            "Failed to load Home categories:",
            err
          );

          if (mounted) {
            setError(
              "Unable to load categories."
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);


  /* =========================================================
     BUILD REAL STOREFRONT CATEGORIES

     Uses exact same helper as /categories.
  ========================================================= */

  const categories =
    useMemo(() => {
      return buildFrontendCategories(
        products
      );
    }, [products]);


  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleCategoryClick =
    (category) => {
      if (!category?.slug) {
        return;
      }

      navigate(
        `/categories?category=${encodeURIComponent(
          category.slug
        )}`
      );
    };


  const handleViewAll =
    () => {
      navigate(
        "/categories"
      );
    };


  /* =========================================================
     SKELETONS
  ========================================================= */

  const skeletons =
    Array.from({
      length: 6,
    });


  /* =========================================================
     UI
  ========================================================= */

  return (
    <section
      className="
        relative

        py-20

        px-4
        sm:px-6
        lg:px-8

        bg-gradient-to-b
        from-[#f4f7fa]
        via-[#eaf0f6]
        to-[#f4f7fa]
      "
    >

      <div
        className="
          max-w-7xl
          mx-auto
        "
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="
            flex
            flex-col

            md:flex-row
            md:items-end
            md:justify-between

            gap-6

            mb-10
          "
        >

          <div>

            <div
              className="
                inline-flex
                items-center

                gap-2

                px-3.5
                py-2

                rounded-full

                bg-white/55

                border
                border-white/70

                backdrop-blur-xl

                shadow-sm

                mb-4
              "
            >

              <Grid2X2
                size={16}
                className="text-blue-600"
              />

              <span
                className="
                  text-xs
                  sm:text-sm

                  font-semibold

                  text-gray-700
                "
              >
                Browse by category
              </span>

            </div>


            <h2
              className="
                text-3xl
                sm:text-4xl
                md:text-5xl

                font-semibold

                tracking-[-0.04em]

                text-gray-900
              "
            >
              Find your

              <span className="text-gray-500">
                {" "}
                everyday essentials
              </span>
            </h2>


            <p
              className="
                mt-4

                max-w-xl

                text-sm
                sm:text-base

                leading-7

                text-gray-600
              "
            >
              Explore groceries by
              category and quickly find
              what you need for your next
              shopping list.
            </p>

          </div>


          <button
            type="button"
            onClick={
              handleViewAll
            }
            className="
              inline-flex
              items-center
              justify-center

              gap-2

              self-start
              md:self-auto

              px-5
              py-3

              rounded-full

              bg-white/55

              backdrop-blur-xl

              border
              border-white/70

              text-sm
              font-semibold
              text-gray-800

              shadow-sm

              hover:bg-white/80
              hover:-translate-y-0.5

              transition-all
            "
          >
            View all

            <ArrowRight
              size={17}
            />
          </button>

        </div>


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div
            className="
              mb-6

              rounded-2xl

              bg-red-50/80

              border
              border-red-100

              px-5
              py-4

              text-sm
              text-red-700
            "
          >
            {error}
          </div>
        )}


        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <div
            className="
              grid

              grid-cols-2
              md:grid-cols-3
              lg:grid-cols-6

              gap-4
            "
          >

            {skeletons.map(
              (_, index) => (
                <div
                  key={index}
                  className="
                    min-h-[190px]

                    rounded-[1.8rem]

                    bg-white/40

                    border
                    border-white/60

                    animate-pulse
                  "
                />
              )
            )}

          </div>
        )}


        {/* ===================================================
            CATEGORY GRID

            Show first 6 on Home.
            "View all" opens complete category catalogue.
        =================================================== */}

        {!loading &&
          categories.length >
            0 && (
            <div
              className="
                grid

                grid-cols-2
                md:grid-cols-3
                lg:grid-cols-6

                gap-4
              "
            >

              {categories
                .slice(
                  0,
                  6
                )
                .map(
                  (
                    category,
                    index
                  ) => {
                    const firstLetter =
                      String(
                        category.name ||
                          "G"
                      )
                        .trim()
                        .charAt(0)
                        .toUpperCase();


                    const image =
                      category.image_url ||
                      "";


                    return (
                      <button
                        key={
                          category.id ||
                          category.slug ||
                          index
                        }
                        type="button"
                        onClick={() =>
                          handleCategoryClick(
                            category
                          )
                        }
                        className="
                          group

                          relative

                          min-h-[190px]

                          overflow-hidden

                          rounded-[1.8rem]

                          bg-white/45

                          backdrop-blur-xl

                          border
                          border-white/70

                          shadow-sm

                          p-5

                          text-left

                          hover:-translate-y-1.5
                          hover:bg-white/70
                          hover:shadow-xl

                          transition-all
                          duration-300
                        "
                      >

                        {/* Decorative glow */}

                        <div
                          className="
                            absolute

                            -right-8
                            -top-8

                            w-24
                            h-24

                            rounded-full

                            bg-blue-100/55

                            group-hover:scale-125

                            transition-transform
                            duration-500
                          "
                        />


                        <div
                          className="
                            relative
                            z-10

                            h-full

                            flex
                            flex-col
                            justify-between
                          "
                        >

                          {/* =================================
                              IMAGE / INITIAL
                          ================================= */}

                          <div
                            className="
                              w-14
                              h-14

                              overflow-hidden

                              rounded-2xl

                              bg-gradient-to-br
                              from-white
                              to-blue-100

                              border
                              border-white

                              shadow-sm

                              flex
                              items-center
                              justify-center

                              text-lg
                              font-bold
                              text-gray-800
                            "
                          >

                            {image ? (
                              <img
                                src={image}
                                alt={
                                  category.name
                                }
                                className="
                                  w-full
                                  h-full

                                  object-contain

                                  bg-white

                                  p-1.5
                                "
                                onError={(
                                  event
                                ) => {
                                  event.currentTarget.style.display =
                                    "none";

                                  event.currentTarget.parentElement.dataset.failed =
                                    "true";
                                }}
                              />
                            ) : (
                              firstLetter
                            )}

                          </div>


                          {/* =================================
                              INFO
                          ================================= */}

                          <div className="mt-8">

                            <h3
                              className="
                                text-base

                                font-semibold

                                text-gray-900

                                leading-tight

                                line-clamp-2
                              "
                            >
                              {
                                category.name
                              }
                            </h3>


                            <div
                              className="
                                flex
                                items-center
                                justify-between

                                gap-2

                                mt-3
                              "
                            >

                              <div
                                className="
                                  flex
                                  items-center

                                  gap-1.5

                                  text-xs
                                  text-gray-500
                                "
                              >

                                <Package
                                  size={13}
                                />

                                <span>
                                  {Number(
                                    category.product_count ||
                                      0
                                  )}{" "}
                                  {Number(
                                    category.product_count ||
                                      0
                                  ) === 1
                                    ? "item"
                                    : "items"}
                                </span>

                              </div>


                              <span
                                className="
                                  w-8
                                  h-8

                                  rounded-full

                                  bg-gray-900
                                  text-white

                                  flex
                                  items-center
                                  justify-center

                                  opacity-0

                                  translate-x-2

                                  group-hover:opacity-100
                                  group-hover:translate-x-0

                                  transition-all
                                "
                              >

                                <ArrowRight
                                  size={15}
                                />

                              </span>

                            </div>

                          </div>

                        </div>

                      </button>
                    );
                  }
                )}

            </div>
          )}


        {/* ===================================================
            EMPTY

            This should now only appear if there are genuinely
            no products in Supabase.
        =================================================== */}

        {!loading &&
          !error &&
          categories.length ===
            0 && (
            <div
              className="
                py-16

                rounded-[2rem]

                bg-white/40

                backdrop-blur-xl

                border
                border-white/70

                text-center
              "
            >

              <Grid2X2
                size={32}
                className="
                  mx-auto

                  text-gray-400

                  mb-4
                "
              />

              <h3
                className="
                  font-semibold
                  text-gray-900
                "
              >
                No categories available
              </h3>

              <p
                className="
                  text-sm
                  text-gray-500

                  mt-2
                "
              >
                No grocery products are
                currently available.
              </p>

            </div>
          )}

      </div>

    </section>
  );
};

export default CategorySection;