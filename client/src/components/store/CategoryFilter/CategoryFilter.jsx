import {
  Grid2X2,
  ImageIcon,
} from "lucide-react";

import "./CategoryFilter.css";

const CategoryFilter = ({
  categories = [],
  selectedCategory = "all",
  onCategoryChange,
}) => {
  /* =======================================================
     HELPERS
  ======================================================= */

  const handleSelect = (value) => {
    if (typeof onCategoryChange !== "function") {
      return;
    }

    onCategoryChange(value);
  };

  const getCategoryImage = (category) => {
    return (
      category?.image_url ||
      category?.image ||
      category?.icon_url ||
      category?.thumbnail_url ||
      ""
    );
  };

  const isActive = (category) => {
    return (
      String(selectedCategory) ===
      String(category?.slug)
    );
  };

  /* =======================================================
     SIDEBAR
  ======================================================= */

  return (
    <aside className="category-sidebar">
      <div className="category-sidebar-header">
        <span>SHOP BY</span>

        <h3>Categories</h3>
      </div>

      <div className="category-sidebar-list">
        {/* =================================================
            ALL PRODUCTS
        ================================================= */}

        <button
          type="button"
          onClick={() => handleSelect("all")}
          className={`category-sidebar-item ${
            selectedCategory === "all"
              ? "category-sidebar-item-active"
              : ""
          }`}
        >
          <div className="category-sidebar-image category-sidebar-all-icon">
            <Grid2X2 size={22} />
          </div>

          <div className="category-sidebar-content">
            <span className="category-sidebar-name">
              All Products
            </span>
          </div>
        </button>

        {/* =================================================
            DATABASE CATEGORIES
        ================================================= */}

        {categories.map((category) => {
          const active = isActive(category);

          const imageUrl =
            getCategoryImage(category);

          const firstLetter = String(
            category?.name || "G"
          )
            .trim()
            .charAt(0)
            .toUpperCase();

          const productCount = Number(
            category?.product_count ??
              category?.count ??
              0
          );

          return (
            <button
              type="button"
              key={
                category?.id ||
                category?.slug ||
                category?.name
              }
              onClick={() =>
                handleSelect(category.slug)
              }
              className={`category-sidebar-item ${
                active
                  ? "category-sidebar-item-active"
                  : ""
              }`}
            >
              {/* Category Image */}

              <div className="category-sidebar-image">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={category?.name || "Category"}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";

                      const fallback =
                        event.currentTarget
                          .nextElementSibling;

                      if (fallback) {
                        fallback.style.display =
                          "flex";
                      }
                    }}
                  />
                ) : null}

                <div
                  className="category-sidebar-image-fallback"
                  style={{
                    display: imageUrl
                      ? "none"
                      : "flex",
                  }}
                >
                  {firstLetter ? (
                    <span>{firstLetter}</span>
                  ) : (
                    <ImageIcon size={18} />
                  )}
                </div>
              </div>

              {/* Category Name */}

              <div className="category-sidebar-content">
                <span className="category-sidebar-name">
                  {category?.name ||
                    "Category"}
                </span>

                {productCount > 0 && (
                  <small>
                    {productCount}{" "}
                    {productCount === 1
                      ? "item"
                      : "items"}
                  </small>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default CategoryFilter;