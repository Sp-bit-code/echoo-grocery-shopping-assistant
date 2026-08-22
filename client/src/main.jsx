import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { OrderProvider } from "./context/OrderContext.jsx";

import "./index.css";
import "./styles/global.css";
import "./styles/variables.css";
import "./styles/responsive.css";
import "./styles/toast.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <App />
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);