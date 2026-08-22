import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../pages/ProtectedRoute.jsx";


// =========================================================
// USER PAGES
// =========================================================

const Home = lazy(() =>
  import("../pages/user/Home/Home.jsx")
);

const Categories = lazy(() =>
  import("../pages/user/Categories/Categories.jsx")
);

const ProductPage = lazy(() =>
  import("../pages/user/Product/Product.jsx")
);

const CartPage = lazy(() =>
  import("../pages/user/Cart/Cart.jsx")
);

const Profile = lazy(() =>
  import("../pages/user/Profile/Profile.jsx")
);

const AIAssistant = lazy(() =>
  import("../pages/user/AIAssistant/AIAssistant.jsx")
);


// =========================================================
// AUTH
// =========================================================

const Register = lazy(() =>
  import("../pages/user/Register/RegisterForm.jsx")
);

const Login = lazy(() =>
  import("../pages/user/Login/LoginForm.jsx")
);

const ForgotPassword = lazy(() =>
  import("../components/auth/ForgotPassword/ForgotPassword.jsx")
);

const ResetPassword = lazy(() =>
  import("../components/auth/ResetPassword/ResetPassword.jsx")
);


// =========================================================
// USER LAYOUT
// =========================================================

const UserLayout = lazy(() =>
  import("../pages/user/UserLayout/UserLayout.jsx")
);


// =========================================================
// ORDER
// =========================================================

const CheckoutPage = lazy(() =>
  import("../components/order/Checkout/Checkout.jsx")
);

const OrderConfirmation = lazy(() =>
  import(
    "../components/order/OrderConfirmation/OrderConfirmation.jsx"
  )
);


// =========================================================
// ADMIN
// =========================================================

const AdminLogin = lazy(() =>
  import("../pages/admin/AdminLogin/AdminLogin.jsx")
);

const AdminLayout = lazy(() =>
  import("../pages/admin/AdminLayout/AdminLayout.jsx")
);

const AdminDashboard = lazy(() =>
  import("../pages/admin/Dashboard/AdminDashboard.jsx")
);

const AdminProducts = lazy(() =>
  import("../pages/admin/AdminProducts/AdminProducts.jsx")
);

const AdminOrders = lazy(() =>
  import("../pages/admin/AdminOrders/AdminOrders.jsx")
);

const AdminUsers = lazy(() =>
  import("../pages/admin/AdminUsers/AdminUsers.jsx")
);


// =========================================================
// PAGE LOADER
// =========================================================

const RouteLoader = () => {
  return (
    <div className="route-loader">
      <div className="route-loader-box">
        <div className="route-loader-spinner" />
        <span>Loading...</span>
      </div>
    </div>
  );
};


// =========================================================
// ROUTER
// =========================================================

const AppRouter = () => {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>

        {/* =================================================
            AUTH ROUTES
        ================================================= */}

        <Route
          path="/sign_up"
          element={<Register />}
        />

        <Route
          path="/sign_in"
          element={<Login />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


        {/* =================================================
            ADMIN LOGIN
        ================================================= */}

        <Route
          path="/admin_login"
          element={<AdminLogin />}
        />


        {/* =================================================
            CUSTOMER WEBSITE
        ================================================= */}

        <Route
          path="/"
          element={<UserLayout />}
        >

          {/* Home */}
          <Route
            index
            element={<Home />}
          />

          <Route
            path="home"
            element={<Home />}
          />


          {/* All grocery categories + 200 products */}
          <Route
            path="categories"
            element={<Categories />}
          />


          {/* Product details */}
          <Route
            path="product/:slug"
            element={<ProductPage />}
          />


          {/* Cart */}
          <Route
            path="cart"
            element={<CartPage />}
          />


          {/* AI Assistant
              RAG/STT/TTS will be connected later */}
          <Route
            path="ai-assistant"
            element={<AIAssistant />}
          />


          {/* Profile */}
          <Route
            path="profile"
            element={
              <ProtectedRoute requiredRole="user">
                <Profile />
              </ProtectedRoute>
            }
          />


          {/* Checkout - COD only */}
          <Route
            path="checkout"
            element={
              <ProtectedRoute requiredRole="user">
                <CheckoutPage />
              </ProtectedRoute>
            }
          />


          {/* Order confirmation */}
          <Route
            path="order-confirmation/:orderId"
            element={
              <ProtectedRoute requiredRole="user">
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />

        </Route>


        {/* =================================================
            ADMIN
        ================================================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >

          <Route
            index
            element={<AdminDashboard />}
          />

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="products"
            element={<AdminProducts />}
          />

          <Route
            path="orders"
            element={<AdminOrders />}
          />

          <Route
            path="users"
            element={<AdminUsers />}
          />

        </Route>


        {/* =================================================
            UNKNOWN ROUTE
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </Suspense>
  );
};

export default AppRouter;