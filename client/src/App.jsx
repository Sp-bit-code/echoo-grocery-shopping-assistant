import {
  BrowserRouter,
  useLocation,
} from "react-router-dom";

import {
  ToastContainer,
} from "react-toastify";

import AppRouter from "./routes/router.jsx";
import Navbar from "./components/layout/Navbar/Navbar.jsx";

import "./index.css";
import "./styles/toast.css";

/* =========================================================
   APP CONTENT
========================================================= */

const AppContent = () => {
  const location =
    useLocation();

  /* =========================================================
     CUSTOMER NAVBAR HIDDEN ROUTES
  ========================================================= */

  const hideNavbarRoutes = [
    "/sign_in",
    "/sign_up",
    "/admin_login",
    "/forgot-password",
    "/reset-password",
  ];

  /* =========================================================
     ADMIN ROUTES

     Hides navbar for:

     /admin
     /admin/
     /admin/products
     /admin/orders
     /admin/users
     etc.
  ========================================================= */

  const isAdminPage =
    location.pathname ===
      "/admin" ||
    location.pathname.startsWith(
      "/admin/"
    );

  /* =========================================================
     SHOULD HIDE NAVBAR
  ========================================================= */

  const shouldHideNavbar =
    isAdminPage ||
    hideNavbarRoutes.includes(
      location.pathname
    );

  return (
    <div className="app-container">

      {/* CUSTOMER NAVBAR */}

      {!shouldHideNavbar && (
        <Navbar />
      )}

      {/* PAGE CONTENT */}

      <main className="app-content">
        <AppRouter />
      </main>

      {/* TOAST */}

      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          zIndex: 9999999,
        }}
      />
    </div>
  );
};

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;