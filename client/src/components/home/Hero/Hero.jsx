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
  Mic,
  PackageCheck,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";

import {
  getProducts,
} from "../../../api/productApi.js";

import Overlay from "../../ui/Overlay/Overlay.jsx";

import "./Hero.css";

/* =========================================================
   FALLBACK IMAGE
========================================================= */

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' rx='40' fill='%23f1f5f9'/%3E%3Ccircle cx='250' cy='205' r='85' fill='%23dbeafe'/%3E%3Cpath d='M185 210h130l-15 105H200z' fill='%2393c5fd'/%3E%3Cpath d='M210 210c0-35 18-60 40-60s40 25 40 60' fill='none' stroke='%234b5563' stroke-width='14' stroke-linecap='round'/%3E%3Ctext x='250' y='375' text-anchor='middle' fill='%236b7280' font-family='Arial,sans-serif' font-size='24'%3EGrocery%3C/text%3E%3C/svg%3E";

/* =========================================================
   HELPERS
========================================================= */

const getProductImage = (
  product
) => {
  if (!product) {
    return FALLBACK_IMAGE;
  }

  return (
    product.image ||
    product.product_images?.find(
      (image) =>
        image?.is_primary
    )?.image_url ||
    product.product_images?.[0]
      ?.image_url ||
    product.images?.[0]
      ?.image_url ||
    FALLBACK_IMAGE
  );
};

const getSellingPrice = (
  product
) =>
  Number(
    product?.discount_price ??
      product?.discountPrice ??
      product?.price ??
      0
  );

const formatPrice = (
  amount
) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(
    Number(amount || 0)
  );

/* =========================================================
   HERO
========================================================= */

const Hero = () => {
  const navigate =
    useNavigate();

  const [
    featuredProducts,
    setFeaturedProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =======================================================
     LOAD FEATURED PRODUCTS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadProducts =
      async () => {
        try {
          let products =
            await getProducts({
              featured: true,
              limit: 4,
            });

          if (
            !products?.length
          ) {
            products =
              await getProducts({
                limit: 4,
              });
          }

          if (mounted) {
            setFeaturedProducts(
              Array.isArray(
                products
              )
                ? products.slice(
                    0,
                    4
                  )
                : []
            );
          }
        } catch (error) {
          console.error(
            "Failed to load hero products:",
            error
          );

          if (mounted) {
            setFeaturedProducts(
              []
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

  /* =======================================================
     PRIMARY FEATURED PRODUCT
  ======================================================= */

  const heroProduct =
    useMemo(
      () =>
        featuredProducts[0] ||
        null,
      [featuredProducts]
    );

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const goToCategories =
    () => {
      navigate(
        "/categories"
      );
    };

  const goToAssistant =
    () => {
      navigate(
        "/ai-assistant"
      );
    };

  const goToProduct =
    (product) => {
      if (!product?.slug) {
        return;
      }

      navigate(
        `/product/${product.slug}`
      );
    };

  return (
    <section
      className="
        relative
        min-h-[88vh]
        overflow-hidden
        bg-gradient-to-b
        from-[#d9e8f5]
        via-[#e2ebf4]
        to-[#f4f7fa]
        text-gray-900
      "
    >
      <Overlay className="pointer-events-none opacity-30" />

      {/* ===================================================
          LARGE BACKGROUND TYPOGRAPHY
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-0
          right-0
          top-20
          z-0
          overflow-hidden
          text-center
          select-none
        "
      >
        <h1
          className="
            whitespace-nowrap
            text-[19vw]
            md:text-[12vw]
            font-black
            uppercase
            tracking-[-0.06em]
            leading-[0.82]
            text-[#111827]/[0.06]
          "
        >
          GROCERIES
        </h1>

        <h1
          className="
            whitespace-nowrap
            text-[19vw]
            md:text-[12vw]
            font-black
            uppercase
            tracking-[-0.06em]
            leading-[0.82]
            text-[#111827]/[0.06]
          "
        >
          SIMPLIFIED
        </h1>
      </div>

      {/* ===================================================
          HERO CONTENT
      =================================================== */}

      <div
        className="
          relative
          z-10
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          pt-32
          md:pt-40
          pb-20
        "
      >
        <div
          className="
            grid
            lg:grid-cols-[1fr_1.08fr]
            gap-12
            xl:gap-20
            items-center
            min-h-[650px]
          "
        >
          {/* =================================================
              LEFT COPY
          ================================================= */}

          <div className="max-w-xl">
            <div
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                rounded-full
                bg-white/55
                backdrop-blur-xl
                border
                border-white/70
                shadow-sm
                mb-6
              "
            >
              <Sparkles
                size={16}
                className="text-blue-600"
              />

              <span
                className="
                  text-sm
                  font-semibold
                  text-gray-700
                "
              >
                Grocery shopping,
                made smarter
              </span>
            </div>

            <h2
              className="
                text-5xl
                sm:text-6xl
                xl:text-7xl
                font-semibold
                tracking-[-0.055em]
                leading-[0.95]
                text-gray-900
              "
            >
              Everything you need,
              <span className="block text-gray-500">
                without the hassle.
              </span>
            </h2>

            <p
              className="
                mt-7
                text-base
                md:text-lg
                leading-7
                text-gray-600
                max-w-lg
              "
            >
              Discover everyday
              groceries, compare
              products and build your
              shopping list with a
              simple, intelligent
              shopping experience.
            </p>

            {/* CTA */}

            <div
              className="
                flex
                flex-col
                sm:flex-row
                gap-3
                mt-9
              "
            >
              <button
                type="button"
                onClick={
                  goToCategories
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-3
                  px-6
                  py-4
                  rounded-full
                  bg-gradient-to-b
                  from-gray-600
                  to-gray-900
                  text-white
                  font-semibold
                  shadow-lg
                  hover:-translate-y-0.5
                  hover:shadow-xl
                  transition-all
                "
              >
                <ShoppingBag
                  size={19}
                />

                Shop Groceries

                <ArrowRight
                  size={18}
                />
              </button>

              <button
                type="button"
                onClick={
                  goToAssistant
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-3
                  px-6
                  py-4
                  rounded-full
                  bg-white/55
                  backdrop-blur-xl
                  border
                  border-white/75
                  text-gray-800
                  font-semibold
                  shadow-sm
                  hover:bg-white/75
                  hover:-translate-y-0.5
                  transition-all
                "
              >
                <Mic
                  size={19}
                />

                Try AI Assistant
              </button>
            </div>

            {/* FEATURES */}

            <div
              className="
                grid
                grid-cols-3
                gap-3
                mt-10
              "
            >
              <div
                className="
                  bg-white/40
                  backdrop-blur-xl
                  border
                  border-white/60
                  rounded-2xl
                  p-4
                "
              >
                <PackageCheck
                  size={21}
                  className="mb-3 text-gray-700"
                />

                <p className="text-sm font-semibold text-gray-900">
                  Daily
                  essentials
                </p>
              </div>

              <div
                className="
                  bg-white/40
                  backdrop-blur-xl
                  border
                  border-white/60
                  rounded-2xl
                  p-4
                "
              >
                <Search
                  size={21}
                  className="mb-3 text-gray-700"
                />

                <p className="text-sm font-semibold text-gray-900">
                  Smart
                  discovery
                </p>
              </div>

              <div
                className="
                  bg-white/40
                  backdrop-blur-xl
                  border
                  border-white/60
                  rounded-2xl
                  p-4
                "
              >
                <Truck
                  size={21}
                  className="mb-3 text-gray-700"
                />

                <p className="text-sm font-semibold text-gray-900">
                  Cash on
                  delivery
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT PRODUCT DISPLAY
          ================================================= */}

          <div
            className="
              relative
              flex
              items-center
              justify-center
              min-h-[520px]
            "
          >
            {/* decorative circles */}

            <div
              className="
                absolute
                w-[420px]
                h-[420px]
                md:w-[500px]
                md:h-[500px]
                rounded-full
                bg-white/35
                backdrop-blur-2xl
                border
                border-white/60
                shadow-[0_30px_100px_rgba(31,41,55,0.12)]
              "
            />

            <div
              className="
                absolute
                w-[320px]
                h-[320px]
                md:w-[390px]
                md:h-[390px]
                rounded-full
                bg-blue-100/35
                border
                border-white/50
              "
            />

            {/* MAIN PRODUCT */}

            <div
              className="
                relative
                z-10
                w-[310px]
                h-[390px]
                sm:w-[360px]
                sm:h-[440px]
                flex
                items-center
                justify-center
              "
            >
              {loading ? (
                <div
                  className="
                    w-full
                    h-full
                    rounded-[2.5rem]
                    bg-white/30
                    animate-pulse
                  "
                />
              ) : (
                <img
                  src={getProductImage(
                    heroProduct
                  )}
                  alt={
                    heroProduct?.name ||
                    "Featured grocery product"
                  }
                  className="
                    w-full
                    h-full
                    object-contain
                    drop-shadow-[0_30px_35px_rgba(15,23,42,0.22)]
                    hover:scale-[1.04]
                    transition-transform
                    duration-500
                  "
                  onError={(
                    event
                  ) => {
                    event.currentTarget.onerror =
                      null;

                    event.currentTarget.src =
                      FALLBACK_IMAGE;
                  }}
                />
              )}
            </div>

            {/* MAIN PRODUCT INFO */}

            {heroProduct && (
              <button
                type="button"
                onClick={() =>
                  goToProduct(
                    heroProduct
                  )
                }
                className="
                  absolute
                  z-20
                  bottom-4
                  left-1/2
                  -translate-x-1/2
                  w-[92%]
                  max-w-[380px]
                  bg-white/75
                  backdrop-blur-2xl
                  border
                  border-white/80
                  rounded-[1.7rem]
                  px-5
                  py-4
                  shadow-xl
                  text-left
                  hover:-translate-y-1
                  hover:-translate-x-1/2
                  transition-transform
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >
                  <div className="min-w-0">
                    <p
                      className="
                        text-xs
                        uppercase
                        tracking-[0.12em]
                        text-gray-500
                        mb-1
                      "
                    >
                      Featured
                    </p>

                    <h3
                      className="
                        font-semibold
                        text-gray-900
                        truncate
                      "
                    >
                      {
                        heroProduct.name
                      }
                    </h3>

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        mt-1.5
                      "
                    >
                      <span className="font-bold text-gray-900">
                        {formatPrice(
                          getSellingPrice(
                            heroProduct
                          )
                        )}
                      </span>

                      {heroProduct.packSize && (
                        <span className="text-xs text-gray-500">
                          {
                            heroProduct.packSize
                          }
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className="
                      shrink-0
                      w-11
                      h-11
                      rounded-full
                      bg-gray-900
                      text-white
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <ArrowRight
                      size={18}
                    />
                  </span>
                </div>
              </button>
            )}

            {/* TOP LEFT SMALL PRODUCT */}

            {featuredProducts[1] && (
              <button
                type="button"
                onClick={() =>
                  goToProduct(
                    featuredProducts[1]
                  )
                }
                className="
                  hidden
                  md:flex
                  absolute
                  z-20
                  top-8
                  left-0
                  w-32
                  h-36
                  rounded-[1.7rem]
                  bg-white/55
                  backdrop-blur-xl
                  border
                  border-white/75
                  shadow-lg
                  p-3
                  items-center
                  justify-center
                  hover:-translate-y-2
                  transition-transform
                "
                aria-label={`Open ${featuredProducts[1].name}`}
              >
                <img
                  src={getProductImage(
                    featuredProducts[1]
                  )}
                  alt={
                    featuredProducts[1]
                      .name
                  }
                  className="
                    w-full
                    h-full
                    object-contain
                  "
                  onError={(
                    event
                  ) => {
                    event.currentTarget.onerror =
                      null;

                    event.currentTarget.src =
                      FALLBACK_IMAGE;
                  }}
                />
              </button>
            )}

            {/* RIGHT SMALL PRODUCT */}

            {featuredProducts[2] && (
              <button
                type="button"
                onClick={() =>
                  goToProduct(
                    featuredProducts[2]
                  )
                }
                className="
                  hidden
                  md:flex
                  absolute
                  z-20
                  top-28
                  right-0
                  w-28
                  h-32
                  rounded-[1.6rem]
                  bg-white/55
                  backdrop-blur-xl
                  border
                  border-white/75
                  shadow-lg
                  p-3
                  items-center
                  justify-center
                  hover:-translate-y-2
                  transition-transform
                "
                aria-label={`Open ${featuredProducts[2].name}`}
              >
                <img
                  src={getProductImage(
                    featuredProducts[2]
                  )}
                  alt={
                    featuredProducts[2]
                      .name
                  }
                  className="
                    w-full
                    h-full
                    object-contain
                  "
                  onError={(
                    event
                  ) => {
                    event.currentTarget.onerror =
                      null;

                    event.currentTarget.src =
                      FALLBACK_IMAGE;
                  }}
                />
              </button>
            )}

            {/* RATING GLASS CHIP */}

            <div
              className="
                hidden
                md:flex
                absolute
                z-20
                right-3
                bottom-24
                items-center
                gap-2
                px-4
                py-3
                rounded-full
                bg-white/65
                backdrop-blur-xl
                border
                border-white/70
                shadow-lg
              "
            >
              <Star
                size={16}
                className="fill-current text-amber-500"
              />

              <span
                className="
                  text-sm
                  font-semibold
                  text-gray-800
                "
              >
                Everyday favourites
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            MOBILE MINI PRODUCTS
        ================================================= */}

        {featuredProducts.length >
          1 && (
          <div
            className="
              md:hidden
              grid
              grid-cols-3
              gap-3
              mt-4
            "
          >
            {featuredProducts
              .slice(1, 4)
              .map(
                (product) => (
                  <button
                    type="button"
                    key={product.id}
                    onClick={() =>
                      goToProduct(
                        product
                      )
                    }
                    className="
                      bg-white/50
                      backdrop-blur-xl
                      border
                      border-white/70
                      rounded-2xl
                      p-3
                      min-h-28
                      shadow-sm
                    "
                  >
                    <img
                      src={getProductImage(
                        product
                      )}
                      alt={
                        product.name
                      }
                      className="
                        w-full
                        h-20
                        object-contain
                      "
                      onError={(
                        event
                      ) => {
                        event.currentTarget.onerror =
                          null;

                        event.currentTarget.src =
                          FALLBACK_IMAGE;
                      }}
                    />
                  </button>
                )
              )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;