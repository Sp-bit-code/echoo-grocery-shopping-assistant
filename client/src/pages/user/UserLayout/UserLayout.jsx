import React from "react";
import { Outlet } from "react-router-dom";

import "./UserLayout.css";

/*
  UserLayout.jsx

  Purpose:
  - Common wrapper for all user-facing pages
  - Navbar is already rendered globally in App.jsx
  - Footer can still be handled by individual pages
*/

const UserLayout = () => {
  return (
    <div className="user-layout">
      <main className="user-layout-main">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;