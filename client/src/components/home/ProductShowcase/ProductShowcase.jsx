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
  Package,
  ShoppingBag,
  Star,
} from "lucide-react";

import {
  getProducts,
} from "../../../api/productApi.js";

import {
  getFrontendProductCategory,
  getProductPackLabel,
  groupLogicalProducts,
} from "../../../utils/groceryCategories.js";

import "./ProductShowcase.css";

/* =========================================================
   PRICE
========================================================= */

const formatPrice = (
  value
) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(
    Number(value || 0)
  );

const getSellingPrice = (
  product
) =>
  Number(
    product?.discount_price ??
      product?.discountPrice ??
      product?.price ??
      0
  );

/* =========================================================
   PRODUCT SHOWCASE
========================================================= */

const ProductShowcase = () => {
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
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadProducts =
      async () => {
        try {
          setLoading(true);
          setError("");

          let data =
            await getProducts({
              featured: true,
              limit: 24,
            });

          if (!data?.length) {
            data =
              await getProducts({
                limit: 24,
              });
          }

          if (mounted) {
            setProducts(
              Array.isArray(data)
                ? data
                : []
            );
          }
        } catch (err) {
          console.error(
            "Failed to load showcase products:",
            err
          );

          if (mounted) {
            setError(
              "Unable to load featured groceries."
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
     LOGICAL PRODUCTS
  ========================================================= */

  const showcaseGroups =
    useMemo(() => {
      return groupLogicalProducts(
        products
      ).slice(
        0,
        4
      );
    }, [products]);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const openProduct = (
    product
  ) => {
    if (!product?.slug) {
      return;
    }

    navigate(
      `/product/${product.slug}`
    );
  };

  const viewAll = () => {
    navigate(
      "/categories"
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section
        className="
          py-20
          px-4
          sm:px-8

          bg-gradient-to-b
          from-[#edf3f8]
          to-[#f4f7fa]
        "
      >
        <div
          className="
            max-w-[1450px]
            mx-auto

            grid
            md:grid-cols-2

            gap-7
          "
        >
          {[0, 1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="
                  h-[420px]

                  rounded-[3rem]

                  bg-white/55

                  border
                  border-white/80

                  animate-pulse
                "
              />
            )
          )}
        </div>
      </section>
    );
  }

  /* =========================================================
     EMPTY
  ========================================================= */

  if (
    !showcaseGroups.length
  ) {
    return (
      <section
        className="
          py-20
          px-4
          sm:px-8

          bg-[#f4f7fa]
        "
      >
        <div
          className="
            max-w-[1450px]
            mx-auto

            rounded-[3rem]

            bg-white/60

            border
            border-white/80

            py-20

            text-center
          "
        >
          <ShoppingBag
            size={32}
            className="
              mx-auto
              text-gray-400
              mb-4
            "
          />

          <h2
            className="
              product-showcase-title
              !text-4xl
            "
          >
            Featured groceries
            coming soon.
          </h2>

          <p
            className="
              mt-3
              text-gray-500
            "
          >
            {error ||
              "Products will appear here once available."}
          </p>
        </div>
      </section>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <section
      className="
        product-showcase

        relative
        overflow-hidden

        py-20
        md:py-24

        bg-gradient-to-b
        from-[#edf3f8]
        via-[#f3f6f9]
        to-[#edf2f6]
      "
    >

      {/* =====================================================
          SHOWCASE HERO
      ===================================================== */}

      <div
        className="
          relative

          max-w-[1450px]
          mx-auto

          px-4
          sm:px-8

          mb-12
        "
      >
        <div
          className="
            relative
            overflow-hidden

            min-h-[430px]

            rounded-[3rem]

            border
            border-white/95

            bg-gradient-to-br
            from-white/95
            via-[#f8fafc]/95
            to-[#e9f2f8]/95

            shadow-[0_22px_65px_rgba(15,23,42,0.07)]

            px-8
            sm:px-12
            md:px-16

            py-12
            md:py-16
          "
        >

          {/* =================================================
              LARGE VISIBLE SEMICIRCLE RINGS
          ================================================= */}

          <div
            className="
              pointer-events-none

              absolute

              left-[72%]
              bottom-[-430px]

              -translate-x-1/2

              w-[820px]
              h-[820px]

              rounded-full

              border-2
              border-[#b5ccde]

              bg-[#dceaf5]/20

              shadow-[0_0_85px_rgba(120,170,208,0.18)]
            "
          />

          <div
            className="
              pointer-events-none

              absolute

              left-[72%]
              bottom-[-355px]

              -translate-x-1/2

              w-[670px]
              h-[670px]

              rounded-full

              border-2
              border-[#c1d6e6]

              bg-[#e2eef7]/18
            "
          />

          <div
            className="
              pointer-events-none

              absolute

              left-[72%]
              bottom-[-285px]

              -translate-x-1/2

              w-[530px]
              h-[530px]

              rounded-full

              border-2
              border-[#cedfeb]

              bg-white/10
            "
          />

          {/* EXTRA OUTER GLOW */}

          <div
            className="
              pointer-events-none

              absolute

              left-[72%]
              bottom-[-500px]

              -translate-x-1/2

              w-[960px]
              h-[960px]

              rounded-full

              border
              border-[#d8e5ef]

              opacity-70
            "
          />

          {/* =================================================
              TOP RIGHT SOFT GLOW
          ================================================= */}

          <div
            className="
              pointer-events-none

              absolute

              right-[-100px]
              top-[-160px]

              w-[480px]
              h-[480px]

              rounded-full

              bg-[#d6e9f7]/60

              blur-[105px]
            "
          />

          {/* =================================================
              HEADER CONTENT
          ================================================= */}

          <div
            className="
              relative
              z-10

              max-w-3xl
            "
          >

            {/* EYEBROW */}

            <div
              className="
                flex
                items-center

                gap-3

                mb-7
              "
            >
              <span
                className="
                  w-7
                  h-px

                  bg-[#78a9ce]
                "
              />

              <p
                className="
                  product-showcase-eyebrow
                "
              >
                Curated essentials
              </p>
            </div>

            {/* TITLE */}

            <h2
              className="
                product-showcase-title
              "
            >
              Everyday favourites,

              <span
                className="
                  product-showcase-title-muted
                "
              >
                made easy to find.
              </span>
            </h2>

            {/* DESCRIPTION */}

            <p
              className="
                product-showcase-subtitle

                mt-7
              "
            >
              Explore everyday groceries
              thoughtfully selected for
              simple, effortless shopping.
            </p>

            {/* BUTTON */}

            <button
              type="button"
              onClick={
                viewAll
              }
              className="
                product-showcase-button

                mt-8
              "
            >
              Explore groceries

              <ArrowRight
                size={16}
              />
            </button>
          </div>

          {/* =================================================
              FLOATING CARD
          ================================================= */}

          <div
            className="
              hidden
              lg:flex

              absolute

              right-16
              top-1/2

              -translate-y-1/2

              z-10

              w-[220px]
              h-[185px]

              rounded-[2.1rem]

              border
              border-white

              bg-white/58
              backdrop-blur-xl

              shadow-[0_22px_55px_rgba(15,23,42,0.10)]

              p-7

              flex-col
              justify-center

              overflow-hidden
            "
          >

            {/* VISIBLE CORNER CIRCLE */}

            <div
              className="
                absolute

                -right-12
                -top-12

                w-[125px]
                h-[125px]

                rounded-full

                bg-[#d9eaf6]

                border-2
                border-[#c5dceb]
              "
            />

            <div
              className="
                absolute

                right-[25px]
                top-[25px]

                w-2.5
                h-2.5

                rounded-full

                bg-[#6fa6cf]

                ring-[6px]
                ring-[#d8eaf6]
              "
            />

            <strong
              className="
                relative
                z-10

                font-sf-pro-light

                text-5xl

                tracking-[-0.055em]

                text-gray-900
              "
            >
              {showcaseGroups.length}
            </strong>

            <span
              className="
                relative
                z-10

                mt-3

                text-sm
                font-medium

                text-gray-500
              "
            >
              featured picks
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          PRODUCT CARDS
      ===================================================== */}

      <div
        className="
          relative

          max-w-[1450px]
          mx-auto

          px-4
          sm:px-8

          grid
          md:grid-cols-2

          gap-7
          md:gap-8
        "
      >
        {showcaseGroups.map(
          (
            group,
            index
          ) => {
            const product =
              group.representative ||
              group.variants?.[0];

            if (!product) {
              return null;
            }

            const category =
              getFrontendProductCategory(
                product
              );

            const rating =
              Number(
                product.rating ||
                  0
              );

            const packs =
              group.variants
                .map(
                  (variant) =>
                    getProductPackLabel(
                      variant
                    )
                )
                .filter(Boolean);

            const prices =
              group.variants
                .map(
                  (variant) =>
                    getSellingPrice(
                      variant
                    )
                )
                .filter(
                  (price) =>
                    price > 0
                );

            const lowestPrice =
              prices.length
                ? Math.min(
                    ...prices
                  )
                : getSellingPrice(
                    product
                  );

            return (
              <article
                key={
                  group.key ||
                  product.id ||
                  index
                }
                className="
                  product-showcase-card

                  group

                  min-h-[430px]

                  p-8
                  md:p-10

                  flex
                  flex-col
                "
              >

                {/* ===========================================
                    STRONG CARD CIRCLE
                =========================================== */}

                <div
                  className="
                    pointer-events-none

                    absolute

                    right-[-110px]
                    top-[-125px]

                    w-[320px]
                    h-[320px]

                    rounded-full

                    border-2
                    border-[#b8d1e3]

                    bg-[#dcecf7]/58

                    shadow-[0_0_55px_rgba(126,174,210,0.2)]

                    transition-transform
                    duration-700

                    group-hover:scale-110
                  "
                />

                <div
                  className="
                    pointer-events-none

                    absolute

                    right-[-48px]
                    top-[-63px]

                    w-[195px]
                    h-[195px]

                    rounded-full

                    border-2
                    border-[#cadfeb]

                    bg-white/18
                  "
                />

                {/* THIRD INNER RING */}

                <div
                  className="
                    pointer-events-none

                    absolute

                    right-[7px]
                    top-[-8px]

                    w-[90px]
                    h-[90px]

                    rounded-full

                    border
                    border-[#d3e4ef]

                    bg-white/12
                  "
                />

                {/* DOT */}

                <div
                  className="
                    pointer-events-none

                    absolute

                    right-[37px]
                    top-[35px]

                    w-2.5
                    h-2.5

                    rounded-full

                    bg-[#70a8d1]

                    ring-[6px]
                    ring-[#d6e9f6]

                    z-[2]
                  "
                />

                {/* CARD NUMBER */}

                <span
                  className="
                    product-showcase-number
                  "
                >
                  {String(
                    index + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>

                {/* ===========================================
                    META
                =========================================== */}

                <div
                  className="
                    relative
                    z-10

                    flex
                    items-center
                    flex-wrap

                    gap-2
                  "
                >
                  <span
                    className="
                      product-showcase-pill
                    "
                  >
                    <Package
                      size={13}
                    />

                    {category?.name ||
                      "Grocery"}
                  </span>

                  {rating > 0 && (
                    <span
                      className="
                        product-showcase-pill
                      "
                    >
                      <Star
                        size={12}
                        className="
                          text-amber-500
                          fill-amber-500
                        "
                      />

                      {rating.toFixed(
                        1
                      )}
                    </span>
                  )}
                </div>

                {/* ===========================================
                    PRODUCT CONTENT
                =========================================== */}

                <div
                  className="
                    relative
                    z-10

                    mt-10
                  "
                >
                  <p
                    className="
                      product-showcase-brand

                      mb-4
                    "
                  >
                    {group.brand ||
                      "Grocery"}
                  </p>

                  <h3
                    className="
                      product-showcase-name
                    "
                  >
                    {group.name}
                  </h3>

                  <p
                    className="
                      product-showcase-description

                      mt-5
                    "
                  >
                    {product.description ||
                      "An everyday grocery essential for your home."}
                  </p>
                </div>

                {/* ===========================================
                    PACK SIZES
                =========================================== */}

                {packs.length >
                  0 && (
                  <div
                    className="
                      relative
                      z-10

                      mt-7

                      flex
                      flex-wrap

                      gap-2
                    "
                  >
                    {packs
                      .slice(
                        0,
                        5
                      )
                      .map(
                        (
                          pack
                        ) => (
                          <span
                            key={
                              pack
                            }
                            className="
                              product-showcase-pack
                            "
                          >
                            {
                              pack
                            }
                          </span>
                        )
                      )}
                  </div>
                )}

                {/* ===========================================
                    BOTTOM
                =========================================== */}

                <div
                  className="
                    relative
                    z-10

                    mt-auto
                    pt-9

                    flex
                    items-end
                    justify-between

                    flex-wrap

                    gap-5
                  "
                >
                  {/* PRICE */}

                  <div>
                    <p
                      className="
                        product-showcase-price-label
                      "
                    >
                      {group.variants
                        .length >
                      1
                        ? "Starting from"
                        : "Price"}
                    </p>

                    <p
                      className="
                        product-showcase-price
                      "
                    >
                      {formatPrice(
                        lowestPrice
                      )}
                    </p>
                  </div>

                  {/* VIEW PRODUCT */}

                  <button
                    type="button"
                    onClick={() =>
                      openProduct(
                        product
                      )
                    }
                    className="
                      product-showcase-button
                    "
                  >
                    View product

                    <ArrowRight
                      size={16}
                    />
                  </button>
                </div>
              </article>
            );
          }
        )}
      </div>
    </section>
  );
};

export default ProductShowcase;