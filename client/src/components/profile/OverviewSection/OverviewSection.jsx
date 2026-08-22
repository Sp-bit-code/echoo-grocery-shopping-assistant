import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Mail,
  Package,
  Phone,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import {
  getCart,
} from "../../../api/cartApi.js";

import {
  getMyOrders,
} from "../../../api/orderApi.js";

import "./OverviewSection.css";

const OverviewSection = ({
  user,
  setActiveSection,
}) => {
  const [
    cartCount,
    setCartCount,
  ] = useState(0);

  const [
    orderCount,
    setOrderCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =======================================================
     USER VALUES
  ======================================================= */

  const fullName =
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    "User";

  const firstName =
    fullName
      .trim()
      .split(" ")[0] ||
    "User";

  const email =
    user?.email ||
    "—";

  const phone =
    user?.phone ||
    "—";

  /* =======================================================
     LOAD CART + ORDERS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadOverview =
      async () => {
        try {
          const [
            cartItems,
            orders,
          ] =
            await Promise.all([
              getCart(),
              getMyOrders(),
            ]);

          if (!mounted) {
            return;
          }

          const totalCartItems =
            (
              Array.isArray(
                cartItems
              )
                ? cartItems
                : []
            ).reduce(
              (
                total,
                item
              ) =>
                total +
                Number(
                  item.quantity ||
                    0
                ),
              0
            );

          setCartCount(
            totalCartItems
          );

          setOrderCount(
            Array.isArray(
              orders
            )
              ? orders.length
              : 0
          );
        } catch (error) {
          console.error(
            "Failed to load profile overview:",
            error
          );
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadOverview();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     OPEN ORDERS
  ======================================================= */

  const handleOrdersClick =
    () => {
      if (
        typeof setActiveSection ===
        "function"
      ) {
        setActiveSection(
          "orders"
        );
      }
    };

  return (
    <div className="profile-overview">
      {/* =================================================
          WELCOME
      ================================================= */}

      <section className="profile-overview-welcome">
        <div className="profile-overview-glow" />

        <div className="profile-overview-welcome-content">
          <div>
            <p className="profile-overview-eyebrow">
              Welcome back
            </p>

            <h2>
              Hi, {firstName}
            </h2>

            <p className="profile-overview-welcome-text">
              {cartCount > 0
                ? `You have ${cartCount} ${
                    cartCount ===
                    1
                      ? "item"
                      : "items"
                  } waiting in your cart.`
                : "Ready to pick up your everyday groceries?"}
            </p>
          </div>

          <Link
            to="/categories"
            className="profile-overview-shop-button"
          >
            <ShoppingBag
              size={17}
            />

            Continue shopping
          </Link>
        </div>
      </section>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="profile-overview-stats">
        {/* CART */}

        <Link
          to="/cart"
          className="profile-overview-stat-card"
        >
          <div className="profile-overview-stat-icon">
            <ShoppingBag
              size={21}
            />
          </div>

          <div>
            <p className="profile-overview-stat-label">
              Shopping Cart
            </p>

            <strong>
              {loading
                ? "—"
                : cartCount}
            </strong>

            <span>
              {cartCount === 1
                ? "Item in cart"
                : "Items in cart"}
            </span>
          </div>

          <p className="profile-overview-stat-link">
            View cart →
          </p>
        </Link>

        {/* ORDERS */}

        <button
          type="button"
          onClick={
            handleOrdersClick
          }
          className="profile-overview-stat-card"
        >
          <div className="profile-overview-stat-icon">
            <Package
              size={21}
            />
          </div>

          <div>
            <p className="profile-overview-stat-label">
              My Orders
            </p>

            <strong>
              {loading
                ? "—"
                : orderCount}
            </strong>

            <span>
              {orderCount === 1
                ? "Order placed"
                : "Orders placed"}
            </span>
          </div>

          <p className="profile-overview-stat-link">
            View orders →
          </p>
        </button>
      </div>

      {/* =================================================
          PERSONAL INFO
      ================================================= */}

      <section className="profile-overview-info">
        <div className="profile-overview-section-header">
          <div>
            <p className="profile-overview-section-eyebrow">
              Account
            </p>

            <h3>
              Personal information
            </h3>
          </div>
        </div>

        <div className="profile-overview-info-grid">
          {/* NAME */}

          <div className="profile-overview-info-card">
            <div className="profile-overview-info-icon">
              <UserRound
                size={18}
              />
            </div>

            <div>
              <span>
                Full name
              </span>

              <strong>
                {fullName}
              </strong>
            </div>
          </div>

          {/* EMAIL */}

          <div className="profile-overview-info-card">
            <div className="profile-overview-info-icon">
              <Mail
                size={18}
              />
            </div>

            <div>
              <span>
                Email address
              </span>

              <strong>
                {email}
              </strong>
            </div>
          </div>

          {/* PHONE */}

          <div className="profile-overview-info-card">
            <div className="profile-overview-info-icon">
              <Phone
                size={18}
              />
            </div>

            <div>
              <span>
                Phone number
              </span>

              <strong>
                {phone}
              </strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewSection;