import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  Bars3Icon,
  ShoppingBagIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import AuthButton from "../../ui/AuthButton/AuthButton.jsx";
import SearchDropdown from "../../ui/SearchDropDown/SearchDropDown.jsx";

import { useAuth } from "../../../context/AuthContext.jsx";
import { useCart } from "../../../context/CartContext.jsx";

import {
  GROCERY_CATEGORIES,
} from "../../../utils/groceryCategories.js";

import "./Navbar.css";

/* =========================================================
   NAVBAR CATEGORIES
========================================================= */

const NAVBAR_CATEGORY_SLUGS = [
  "dairy-eggs",
  "snacks",
  "beverages",
];

const NAVBAR_CATEGORIES =
  NAVBAR_CATEGORY_SLUGS
    .map((slug) =>
      GROCERY_CATEGORIES.find(
        (category) =>
          category.slug === slug
      )
    )
    .filter(Boolean);

/* =========================================================
   CATEGORY ITEM
========================================================= */

const CategoryNavItem = ({
  category,
  activeSlug,
  onClick,
}) => {
  if (!category) {
    return null;
  }

  const isActive =
    activeSlug === category.slug;

  return (
    <Link
      to={`/categories?category=${encodeURIComponent(
        category.slug
      )}`}
      onClick={onClick}
      className={`navbar-category-link ${
        isActive ? "active" : ""
      }`}
    >
      {category.name}
    </Link>
  );
};

/* =========================================================
   NAVBAR
========================================================= */

const Navbar = () => {
  const location = useLocation();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    scrolled,
    setScrolled,
  ] = useState(false);

  const {
    isAuthenticated,
  } = useAuth();

  const {
    cartCount = 0,
  } = useCart();

  /* =========================================================
     ACTIVE CATEGORY
  ========================================================= */

  const activeCategorySlug =
    useMemo(() => {
      const params =
        new URLSearchParams(
          location.search
        );

      return (
        params.get("category") ||
        ""
      );
    }, [location.search]);

  /* =========================================================
     SCROLL
  ========================================================= */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 10
      );
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /* =========================================================
     CLOSE MOBILE MENU
  ========================================================= */

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [
    location.pathname,
    location.search,
  ]);

  /* =========================================================
     NAVBAR WRAPPER
  ========================================================= */

  const navContainerClasses = `
    fixed
    top-0
    left-0
    right-0
    z-[999999]

    transition-all
    duration-500
    ease-out

    ${
      scrolled &&
      !mobileMenuOpen
        ? `
          bg-white/75
          backdrop-blur-xl
          shadow-xl
          rounded-2xl
          mx-4
          mt-2
          xl:rounded-full
          xl:mx-28
        `
        : `
          bg-transparent
          mx-0
          mt-0
        `
    }
  `;

  return (
    <div
      className={
        navContainerClasses
      }
    >
      <nav
        className="
          max-w-[1450px]
          mx-auto
          px-5
          md:px-8
          h-16
        "
      >
        <div
          className="
            flex
            h-16
            items-center
            justify-between
          "
        >
          {/* LEFT */}

          <div
            className="
              flex
              items-center
              min-w-0
            "
          >
            <Link
              to="/"
              className="navbar-logo"
              aria-label="EchOo Grocery Home"
            >
              EchOo
            </Link>

            {/* DESKTOP LINKS */}

            <div
              className="
                hidden
                lg:flex
                items-center
                ml-10
                gap-1
              "
            >
              <Link
                to="/categories"
                className={`navbar-category-link ${
                  location.pathname ===
                    "/categories" &&
                  !activeCategorySlug
                    ? "active"
                    : ""
                }`}
              >
                Groceries
              </Link>

              {NAVBAR_CATEGORIES.map(
                (category) => (
                  <CategoryNavItem
                    key={
                      category.slug
                    }
                    category={
                      category
                    }
                    activeSlug={
                      activeCategorySlug
                    }
                  />
                )
              )}

              <NavLink
                to="/ai-assistant"
                className={({
                  isActive,
                }) =>
                  `navbar-ai-link ${
                    isActive
                      ? "font-semibold"
                      : ""
                  }`
                }
              >
                AI Assistant
              </NavLink>
            </div>
          </div>

          {/* RIGHT */}

          <div
            className="
              flex
              items-center
              gap-3
              sm:gap-4
            "
          >
            <SearchDropdown />

            <Link
              to="/cart"
              className="navbar-icon-link relative"
              aria-label="Shopping cart"
            >
              <ShoppingBagIcon
                className="
                  h-5
                  w-5
                  stroke-gray-900
                "
              />

              {cartCount > 0 && (
                <span
                  className="
                    absolute
                    -top-1
                    -right-1

                    bg-gray-900
                    text-white

                    text-[9px]
                    font-bold

                    h-4
                    min-w-4
                    px-1

                    rounded-full

                    flex
                    items-center
                    justify-center
                  "
                >
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link
                to="/profile"
                className="navbar-icon-link"
                aria-label="Profile"
              >
                <UserCircleIcon
                  className="
                    h-5
                    w-5
                    stroke-gray-900
                  "
                />
              </Link>
            ) : (
              <AuthButton />
            )}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  true
                )
              }
              className="
                navbar-icon-button
                lg:hidden
              "
              aria-label="Open menu"
            >
              <Bars3Icon
                className="
                  h-6
                  w-6
                  stroke-gray-900
                "
              />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}

      {mobileMenuOpen && (
        <div
          className="
            lg:hidden
            fixed
            inset-0
            z-[60]
            bg-black/20
            backdrop-blur-sm
          "
          onClick={() =>
            setMobileMenuOpen(
              false
            )
          }
        >
          <div
            className="
              fixed
              right-4
              top-20
              z-[70]

              w-[calc(100%-2rem)]
              max-w-80

              rounded-3xl
              bg-white

              shadow-2xl
              ring-1
              ring-black/5

              p-5
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className="
                flex
                justify-between
                items-center
                pb-4
              "
            >
              <span
                className="
                  text-sm
                  font-semibold
                  text-gray-500
                "
              >
                Browse groceries
              </span>

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(
                    false
                  )
                }
                className="navbar-icon-button"
                aria-label="Close menu"
              >
                <XMarkIcon
                  className="
                    h-5
                    w-5
                  "
                />
              </button>
            </div>

            <div
              className="
                flex
                flex-col
                gap-1
              "
            >
              <Link
                to="/categories"
                className="
                  px-4
                  py-3
                  rounded-xl
                  text-sm
                  font-medium
                  text-gray-900
                  hover:bg-gray-50
                "
              >
                All Groceries
              </Link>

              {NAVBAR_CATEGORIES.map(
                (category) => (
                  <Link
                    key={
                      category.slug
                    }
                    to={`/categories?category=${encodeURIComponent(
                      category.slug
                    )}`}
                    className="
                      px-4
                      py-3
                      rounded-xl
                      text-sm
                      font-medium
                      text-gray-900
                      hover:bg-gray-50
                    "
                  >
                    {category.name}
                  </Link>
                )
              )}

              <NavLink
                to="/ai-assistant"
                className="
                  px-4
                  py-3
                  rounded-xl
                  text-sm
                  font-medium
                  text-gray-900
                  hover:bg-gray-50
                "
              >
                AI Assistant
              </NavLink>
            </div>

            {!isAuthenticated && (
              <div
                className="
                  mt-4
                  pt-4
                  border-t
                  border-gray-100
                  flex
                  gap-2
                "
              >
                <Link
                  to="/sign_in"
                  className="
                    flex-1
                    text-center
                    px-4
                    py-2.5
                    rounded-xl
                    text-sm
                    font-medium
                    border
                    border-gray-200
                  "
                >
                  Sign in
                </Link>

                <Link
                  to="/sign_up"
                  className="
                    flex-1
                    text-center
                    px-4
                    py-2.5
                    rounded-xl
                    text-sm
                    font-medium
                    bg-gray-900
                    text-white
                  "
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;