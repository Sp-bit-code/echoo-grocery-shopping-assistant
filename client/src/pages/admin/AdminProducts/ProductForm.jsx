import React from "react";

import {
  ImageIcon,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

import "./ProductForm.css";

/* =========================================================
   PRODUCT FORM
========================================================= */

const ProductForm = ({
  form = {},
  setForm,

  categories = [],

  tempImageUrl = "",
  setTempImageUrl,

  tempFeature = "",
  setTempFeature,

  tempSpecKey = "",
  setTempSpecKey,

  tempSpecValue = "",
  setTempSpecValue,

  onAddImage,
  onRemoveImage,

  onAddFeature,
  onRemoveFeature,

  onAddSpec,
  onRemoveSpec,
}) => {
  /* =======================================================
     SAFE VALUES
  ======================================================= */

  const safeImages =
    Array.isArray(form.images)
      ? form.images
      : [];

  const safeFeatures =
    Array.isArray(form.features)
      ? form.features
      : [];

  const safeSpecs =
    form.specs &&
    typeof form.specs === "object"
      ? form.specs
      : {};

  /* =======================================================
     UPDATE FIELD
  ======================================================= */

  const updateForm = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     ENTER HANDLERS
  ======================================================= */

  const handleImageKeyDown = (
    event
  ) => {
    if (
      event.key !== "Enter"
    ) {
      return;
    }

    event.preventDefault();

    onAddImage?.();
  };

  const handleFeatureKeyDown = (
    event
  ) => {
    if (
      event.key !== "Enter"
    ) {
      return;
    }

    event.preventDefault();

    onAddFeature?.();
  };

  const handleSpecKeyDown = (
    event
  ) => {
    if (
      event.key !== "Enter"
    ) {
      return;
    }

    event.preventDefault();

    onAddSpec?.();
  };

  /* =======================================================
     IMAGE FALLBACK
  ======================================================= */

  const handleImageError = (
    event
  ) => {
    event.currentTarget.style.display =
      "none";
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="product-form space-y-7">

      {/* ===================================================
          BASIC INFORMATION
      =================================================== */}

      <section>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            Basic Information
          </p>

          <h4 className="mt-1 text-base font-bold text-gray-900">
            Grocery Details
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* PRODUCT NAME */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Product Name *
            </label>

            <input
              type="text"
              value={
                form.name || ""
              }
              onChange={(
                event
              ) =>
                updateForm(
                  "name",
                  event.target.value
                )
              }
              placeholder="e.g. Aashirvaad Whole Wheat Atta"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
            />
          </div>

          {/* BRAND */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Brand
            </label>

            <input
              type="text"
              value={
                form.brand || ""
              }
              onChange={(
                event
              ) =>
                updateForm(
                  "brand",
                  event.target.value
                )
              }
              placeholder="e.g. Aashirvaad"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Category *
            </label>

            <select
              value={
                form.category_id ||
                ""
              }
              onChange={(
                event
              ) =>
                updateForm(
                  "category_id",
                  event.target.value
                )
              }
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
            >
              <option value="">
                Select category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                )
              )}
            </select>

            {!categories.length && (
              <p className="mt-1 text-xs text-amber-600">
                No category options
                are currently available.
              </p>
            )}
          </div>

          {/* RATING */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Rating
            </label>

            <div className="relative">
              <Star className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400" />

              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={
                  form.rating ?? ""
                }
                onChange={(
                  event
                ) =>
                  updateForm(
                    "rating",
                    event.target.value
                  )
                }
                placeholder="4.5"
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          PRICING & STOCK
      =================================================== */}

      <section className="border-t border-gray-200/70 pt-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            Pricing & Inventory
          </p>

          <h4 className="mt-1 text-base font-bold text-gray-900">
            Price and Stock
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* MRP */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              MRP (₹) *
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                form.price ?? ""
              }
              onChange={(
                event
              ) =>
                updateForm(
                  "price",
                  event.target.value
                )
              }
              placeholder="350"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
            />
          </div>

          {/* DISCOUNT PRICE */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Selling Price (₹)
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                form.discount_price ??
                ""
              }
              onChange={(
                event
              ) =>
                updateForm(
                  "discount_price",
                  event.target.value
                )
              }
              placeholder="320"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
            />

            <p className="mt-1 text-[11px] text-gray-400">
              Leave blank if there is
              no discount.
            </p>
          </div>

          {/* STOCK */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Stock *
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={
                form.stock ?? ""
              }
              onChange={(
                event
              ) =>
                updateForm(
                  "stock",
                  event.target.value
                )
              }
              placeholder="50"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
            />
          </div>
        </div>
      </section>

      {/* ===================================================
          PACK INFORMATION
      =================================================== */}

      <section className="border-t border-gray-200/70 pt-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            Pack Information
          </p>

          <h4 className="mt-1 text-base font-bold text-gray-900">
            Quantity and Unit
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* QUANTITY */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Quantity
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                form.quantity ?? ""
              }
              onChange={(
                event
              ) =>
                updateForm(
                  "quantity",
                  event.target.value
                )
              }
              placeholder="1"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
            />
          </div>

          {/* UNIT */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Unit
            </label>

            <select
              value={
                form.unit || ""
              }
              onChange={(
                event
              ) =>
                updateForm(
                  "unit",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
            >
              <option value="">
                Select unit
              </option>

              <option value="g">
                g
              </option>

              <option value="kg">
                kg
              </option>

              <option value="ml">
                ml
              </option>

              <option value="L">
                L
              </option>

              <option value="pcs">
                pcs
              </option>

              <option value="pack">
                pack
              </option>

              <option value="box">
                box
              </option>

              <option value="bottle">
                bottle
              </option>
            </select>
          </div>

          {/* PACK SIZE */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Pack Size
            </label>

            <input
              type="text"
              value={
                form.pack_size || ""
              }
              onChange={(
                event
              ) =>
                updateForm(
                  "pack_size",
                  event.target.value
                )
              }
              placeholder="e.g. 1 kg"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
            />

            <p className="mt-1 text-[11px] text-gray-400">
              Text shown directly to
              customers.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          DESCRIPTION
      =================================================== */}

      <section className="border-t border-gray-200/70 pt-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            Description
          </p>

          <h4 className="mt-1 text-base font-bold text-gray-900">
            Product Information
          </h4>
        </div>

        <textarea
          value={
            form.description || ""
          }
          onChange={(
            event
          ) =>
            updateForm(
              "description",
              event.target.value
            )
          }
          rows={4}
          placeholder="Briefly describe the grocery product, quality, usage, ingredients or other useful information..."
          className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
        />
      </section>

      {/* ===================================================
          PRODUCT IMAGES
      =================================================== */}

      <section className="border-t border-gray-200/70 pt-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            Images
          </p>

          <h4 className="mt-1 text-base font-bold text-gray-900">
            Product Image URLs
          </h4>

          <p className="mt-1 text-xs text-gray-500">
            Paste publicly accessible
            image URLs. The first
            image will be used as the
            primary image.
          </p>
        </div>

        {/* IMAGES */}
        {safeImages.length > 0 ? (
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {safeImages.map(
              (image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-2"
                >
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white">
                    <img
                      src={image}
                      alt={`${form.name || "Product"} ${index + 1}`}
                      className="h-full w-full object-contain p-1"
                      onError={
                        handleImageError
                      }
                    />
                  </div>

                  {index === 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-gray-900 px-2 py-1 text-[9px] font-semibold text-white">
                      Primary
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      onRemoveImage?.(
                        index
                      )
                    }
                    className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition hover:bg-red-50"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 p-8">
            <div className="text-center">
              <ImageIcon className="mx-auto h-7 w-7 text-gray-300" />

              <p className="mt-2 text-xs text-gray-500">
                No product images
                added yet.
              </p>
            </div>
          </div>
        )}

        {/* IMAGE URL */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={tempImageUrl}
            onChange={(
              event
            ) =>
              setTempImageUrl?.(
                event.target.value
              )
            }
            onKeyDown={
              handleImageKeyDown
            }
            placeholder="https://example.com/product.jpg"
            className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
          />

          <button
            type="button"
            onClick={() =>
              onAddImage?.()
            }
            disabled={
              !tempImageUrl.trim()
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />

            Add Image
          </button>
        </div>
      </section>

      {/* ===================================================
          FEATURES
      =================================================== */}

      <section className="border-t border-gray-200/70 pt-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            Features
          </p>

          <h4 className="mt-1 text-base font-bold text-gray-900">
            Product Highlights
          </h4>
        </div>

        {safeFeatures.length >
          0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {safeFeatures.map(
              (feature, index) => (
                <div
                  key={`${feature}-${index}`}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <span className="text-xs text-gray-700">
                    {feature}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      onRemoveFeature?.(
                        index
                      )
                    }
                    className="text-gray-400 transition hover:text-red-500"
                    aria-label="Remove feature"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={tempFeature}
            onChange={(
              event
            ) =>
              setTempFeature?.(
                event.target.value
              )
            }
            onKeyDown={
              handleFeatureKeyDown
            }
            placeholder="e.g. High in fibre"
            className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
          />

          <button
            type="button"
            onClick={() =>
              onAddFeature?.()
            }
            disabled={
              !tempFeature.trim()
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />

            Add Feature
          </button>
        </div>
      </section>

      {/* ===================================================
          SPECIFICATIONS
      =================================================== */}

      <section className="border-t border-gray-200/70 pt-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            Specifications
          </p>

          <h4 className="mt-1 text-base font-bold text-gray-900">
            Additional Details
          </h4>

          <p className="mt-1 text-xs text-gray-500">
            Examples: Country of
            Origin, Diet Type,
            Ingredients or Shelf
            Life.
          </p>
        </div>

        {Object.keys(safeSpecs)
          .length > 0 && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200">
            {Object.entries(
              safeSpecs
            ).map(
              ([
                key,
                value,
              ]) => (
                <div
                  key={key}
                  className="flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-4 py-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-700">
                      {key}
                    </p>

                    <p className="mt-0.5 break-words text-xs text-gray-500">
                      {String(
                        value
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onRemoveSpec?.(
                        key
                      )
                    }
                    className="shrink-0 text-gray-400 transition hover:text-red-500"
                    aria-label={`Remove ${key}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto]">
          <input
            type="text"
            value={tempSpecKey}
            onChange={(
              event
            ) =>
              setTempSpecKey?.(
                event.target.value
              )
            }
            placeholder="Key"
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
          />

          <input
            type="text"
            value={
              tempSpecValue
            }
            onChange={(
              event
            ) =>
              setTempSpecValue?.(
                event.target.value
              )
            }
            onKeyDown={
              handleSpecKeyDown
            }
            placeholder="Value"
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-900/5"
          />

          <button
            type="button"
            onClick={() =>
              onAddSpec?.()
            }
            disabled={
              !tempSpecKey.trim() ||
              !tempSpecValue.trim()
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />

            Add
          </button>
        </div>
      </section>

      {/* ===================================================
          VISIBILITY
      =================================================== */}

      <section className="border-t border-gray-200/70 pt-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            Visibility
          </p>

          <h4 className="mt-1 text-base font-bold text-gray-900">
            Store Settings
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          {/* ACTIVE */}
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Active Product
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Product can appear
                in the customer
                catalog.
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                Boolean(
                  form.is_active
                )
              }
              onChange={(
                event
              ) =>
                updateForm(
                  "is_active",
                  event.target.checked
                )
              }
              className="h-5 w-5 shrink-0 accent-gray-900"
            />
          </label>

          {/* FEATURED */}
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
            <div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400" />

                <p className="text-sm font-semibold text-gray-900">
                  Featured Product
                </p>
              </div>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Highlight this
                product in featured
                grocery sections.
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                Boolean(
                  form.is_featured
                )
              }
              onChange={(
                event
              ) =>
                updateForm(
                  "is_featured",
                  event.target.checked
                )
              }
              className="h-5 w-5 shrink-0 accent-gray-900"
            />
          </label>
        </div>
      </section>
    </div>
  );
};

export default ProductForm;