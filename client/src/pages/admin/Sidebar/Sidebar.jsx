import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  ChevronRight,
  LayoutDashboard,
  Menu,
  Package,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";

import "./Sidebar.css";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: ShoppingBag,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: Package,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
}) => {
  const location = useLocation();

  const isRouteActive = (href) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }

    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${
          sidebarOpen
            ? "admin-sidebar-open"
            : "admin-sidebar-closed"
        }`}
      >
        {/* Header */}
        <div className="admin-sidebar-header">
          <Link
            to="/admin"
            className="admin-sidebar-brand"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <div className="admin-sidebar-logo-text">
              eO
            </div>

            <div>
              <h1 className="admin-sidebar-title">
                EchOo
              </h1>

              <p className="admin-sidebar-subtitle">
                Grocery Admin
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="admin-sidebar-close"
            aria-label="Close admin menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-nav-list">
            {navigation.map(
              (item) => {
                const isActive =
                  isRouteActive(
                    item.href
                  );

                const IconComponent =
                  item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`admin-sidebar-link group ${
                      isActive
                        ? "admin-sidebar-link-active"
                        : "admin-sidebar-link-normal"
                    }`}
                    onClick={() =>
                      setSidebarOpen(
                        false
                      )
                    }
                  >
                    <div className="admin-sidebar-link-left">
                      <IconComponent
                        className={`w-5 h-5 transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      />

                      <span className="admin-sidebar-link-text">
                        {item.name}
                      </span>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 transition-all ${
                        isActive
                          ? "text-white translate-x-0"
                          : "text-gray-300 -translate-x-1 opacity-0 group-hover:text-gray-400 group-hover:translate-x-0 group-hover:opacity-100"
                      }`}
                    />
                  </Link>
                );
              }
            )}
          </div>
        </nav>

        {/* Bottom label */}
        <div className="admin-sidebar-footer">
          <p>
            EchOo Grocery
          </p>

          <span>
            Store Management
          </span>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() =>
          setSidebarOpen(true)
        }
        className="admin-sidebar-mobile-button"
        aria-label="Open admin menu"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>
    </>
  );
};

export default Sidebar;