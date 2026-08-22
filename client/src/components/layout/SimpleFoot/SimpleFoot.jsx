import React from "react";
import { Link } from "react-router-dom";

import "./SimpleFoot.css";

const SimpleFooter = () => {
  return (
    <footer className="border-t border-gray-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/" className="flex items-center">
              <span className="text-lg font-semibold text-gray-700">
                EchOo.
              </span>
            </Link>
          </div>

          <div className="flex space-x-6 text-sm text-gray-600">
            <Link
              to="/categories"
              className="hover:text-gray-900 transition-colors"
            >
              Categories
            </Link>

            <Link
              to="/ai-assistant"
              className="hover:text-gray-900 transition-colors"
            >
              AI Assistant
            </Link>

            <Link
              to="/cart"
              className="hover:text-gray-900 transition-colors"
            >
              Cart
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center md:text-left">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} EchOo Grocery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;