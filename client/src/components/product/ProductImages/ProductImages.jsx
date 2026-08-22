import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./ProductImages.css";

/* =========================================================
   FALLBACK IMAGE
========================================================= */

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' rx='50' fill='%23f1f5f9'/%3E%3Ccircle cx='300' cy='245' r='105' fill='%23dbeafe'/%3E%3Cpath d='M225 255h150l-18 125H243z' fill='%2393c5fd'/%3E%3Cpath d='M255 255c0-42 20-72 45-72s45 30 45 72' fill='none' stroke='%234b5563' stroke-width='16' stroke-linecap='round'/%3E%3Ctext x='300' y='450' text-anchor='middle' fill='%236b7280' font-family='Arial,sans-serif' font-size='28'%3EGrocery Product%3C/text%3E%3C/svg%3E";

/* =========================================================
   NORMALIZE PRODUCT IMAGES
========================================================= */

const getImageUrl = (
  image
) => {
  if (
    typeof image ===
    "string"
  ) {
    return image.trim();
  }

  return String(
    image?.image_url ||
      image?.url ||
      ""
  ).trim();
};

const ProductImages = ({
  product,
}) => {
  const [
    currentImageIndex,
    setCurrentImageIndex,
  ] = useState(0);

  /* =======================================================
     VALID IMAGES
  ======================================================= */

  const validImages =
    useMemo(() => {
      const rawImages =
        Array.isArray(
          product?.product_images
        ) &&
        product.product_images
          .length
          ? [
              ...product.product_images,
            ]
          : Array.isArray(
                product?.images
              )
            ? [
                ...product.images,
              ]
            : product?.image
              ? [
                  product.image,
                ]
              : [];

      /*
        Primary product image first,
        then use sort_order.
      */

      rawImages.sort(
        (a, b) => {
          if (
            typeof a ===
              "object" &&
            a?.is_primary &&
            !b?.is_primary
          ) {
            return -1;
          }

          if (
            typeof b ===
              "object" &&
            b?.is_primary &&
            !a?.is_primary
          ) {
            return 1;
          }

          return (
            Number(
              a?.sort_order ||
                0
            ) -
            Number(
              b?.sort_order ||
                0
            )
          );
        }
      );

      /*
        Remove empty and duplicate URLs.
      */

      return [
        ...new Set(
          rawImages
            .map(
              getImageUrl
            )
            .filter(Boolean)
        ),
      ];
    }, [
      product,
    ]);

  /* =======================================================
     RESET WHEN PRODUCT CHANGES
  ======================================================= */

  useEffect(() => {
    setCurrentImageIndex(
      0
    );
  }, [
    product?.id,
    product?.slug,
  ]);

  /* =======================================================
     SAFE INDEX
  ======================================================= */

  const safeIndex =
    currentImageIndex <
    validImages.length
      ? currentImageIndex
      : 0;

  const currentImage =
    validImages[
      safeIndex
    ] || null;

  /* =======================================================
     CONTROLS
  ======================================================= */

  const nextImage = () => {
    if (
      validImages.length <=
      1
    ) {
      return;
    }

    setCurrentImageIndex(
      (current) =>
        current ===
        validImages.length -
          1
          ? 0
          : current + 1
    );
  };

  const previousImage =
    () => {
      if (
        validImages.length <=
        1
      ) {
        return;
      }

      setCurrentImageIndex(
        (current) =>
          current === 0
            ? validImages.length -
              1
            : current - 1
      );
    };

  const selectImage = (
    index
  ) => {
    setCurrentImageIndex(
      index
    );
  };

  /* =======================================================
     IMAGE ERROR
  ======================================================= */

  const handleImageError =
    (event) => {
      event.currentTarget.onerror =
        null;

      event.currentTarget.src =
        FALLBACK_IMAGE;
    };

  return (
    <div className="product-images">
      {/* MAIN IMAGE */}

      <div className="product-images-main">
        <div className="product-images-main-inner">
          {currentImage ? (
            <img
              src={
                currentImage
              }
              alt={
                product?.name ||
                "Grocery product"
              }
              className="product-images-main-photo"
              onError={
                handleImageError
              }
            />
          ) : (
            <div className="product-images-empty">
              <div className="product-images-empty-icon">
                <PhotoIcon />
              </div>

              <p>
                No product image
                available
              </p>
            </div>
          )}

          {/* NAVIGATION */}

          {validImages.length >
            1 && (
            <>
              <button
                type="button"
                onClick={
                  previousImage
                }
                className="product-images-arrow product-images-arrow-left"
                aria-label="Previous product image"
              >
                <ChevronLeftIcon />
              </button>

              <button
                type="button"
                onClick={
                  nextImage
                }
                className="product-images-arrow product-images-arrow-right"
                aria-label="Next product image"
              >
                <ChevronRightIcon />
              </button>
            </>
          )}

          {/* COUNTER */}

          {validImages.length >
            1 && (
            <div className="product-images-counter">
              {safeIndex +
                1}{" "}
              /{" "}
              {
                validImages.length
              }
            </div>
          )}
        </div>
      </div>

      {/* THUMBNAILS */}

      {validImages.length >
        1 && (
        <div className="product-images-thumbnails">
          {validImages.map(
            (
              image,
              index
            ) => (
              <button
                type="button"
                key={`${image}-${index}`}
                onClick={() =>
                  selectImage(
                    index
                  )
                }
                className={`product-images-thumbnail ${
                  safeIndex ===
                  index
                    ? "product-images-thumbnail-active"
                    : ""
                }`}
                aria-label={`Show ${
                  product?.name ||
                  "product"
                } image ${
                  index + 1
                }`}
              >
                <img
                  src={image}
                  alt={`${product?.name || "Product"} view ${index + 1}`}
                  onError={
                    handleImageError
                  }
                />
              </button>
            )
          )}
        </div>
      )}

      {/* MOBILE DOTS */}

      {validImages.length >
        1 && (
        <div className="product-images-dots">
          {validImages.map(
            (
              _,
              index
            ) => (
              <button
                type="button"
                key={index}
                onClick={() =>
                  selectImage(
                    index
                  )
                }
                className={`product-images-dot ${
                  safeIndex ===
                  index
                    ? "product-images-dot-active"
                    : ""
                }`}
                aria-label={`Show image ${
                  index + 1
                }`}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImages;