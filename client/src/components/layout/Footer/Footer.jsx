import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

import "./Footer.css";

const Footer = () => {
  return (
    <motion.footer
      initial={{
        opacity: 0,
        y: 50,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
      }}
      viewport={{
        once: true,
        margin: "-100px",
      }}
      className="bg-[#0f0f11] text-neutral-300 py-16 px-6 sm:px-10 lg:px-16 rounded-t-[3rem] relative overflow-hidden font-sans border-t border-white/5 shadow-[0_[-20px]_50px_rgba(0,0,0,0.5)]"
    >
      {/* Soft original Echoo glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/10">

          {/* LEFT SECTION */}
          <div className="lg:col-span-5 flex flex-col justify-between pr-0 lg:pr-12">
            <div>
              <Link
                to="/"
                className="inline-flex items-center mb-8"
              >
                <span className="text-2xl font-semibold tracking-tight text-white">
                  echOo
                </span>
              </Link>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-neutral-200 leading-[1.15] mb-12 max-w-md">
                Everyday groceries,
                <br />
                made effortless.
              </h2>
            </div>

            {/* AI ASSISTANT CTA */}
            <div>
              <p className="text-sm font-medium text-neutral-400 mb-4 tracking-wide">
                Need help with your shopping?
              </p>

              <Link
                to="/ai-assistant"
                className="group flex items-center justify-between max-w-sm bg-white/5 border border-white/10 rounded-full py-2 pl-6 pr-2 text-sm text-neutral-300 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={16} />
                  Ask our AI Assistant
                </span>

                <span className="w-10 h-10 rounded-full bg-gradient-to-b from-gray-600 to-gray-800 shadow-md border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                  <ArrowUpRight
                    strokeWidth={2.5}
                    size={18}
                  />
                </span>
              </Link>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row justify-between pt-4 lg:pt-0 gap-12 lg:gap-0 lg:pl-12 lg:border-l lg:border-white/10">

            {/* FOOTER LINKS */}
            <div className="grid grid-cols-2 gap-x-12 sm:gap-x-24 gap-y-6 text-base font-medium text-neutral-400">

              <div className="flex flex-col gap-5">
                <p className="text-xs uppercase tracking-[0.15em] text-neutral-600">
                  Explore
                </p>

                <Link
                  to="/"
                  className="hover:text-white transition-colors"
                >
                  Home
                </Link>

                <Link
                  to="/categories"
                  className="hover:text-white transition-colors"
                >
                  Categories
                </Link>

                <Link
                  to="/ai-assistant"
                  className="hover:text-white transition-colors"
                >
                  AI Assistant
                </Link>
              </div>

              <div className="flex flex-col gap-5">
                <p className="text-xs uppercase tracking-[0.15em] text-neutral-600">
                  Account
                </p>

                <Link
                  to="/cart"
                  className="hover:text-white transition-colors"
                >
                  Cart
                </Link>

                <Link
                  to="/profile"
                  className="hover:text-white transition-colors"
                >
                  My Profile
                </Link>

                <Link
                  to="/profile"
                  className="hover:text-white transition-colors"
                >
                  My Orders
                </Link>
              </div>
            </div>

            {/* SMALL BRAND ICON */}
            <div className="flex sm:flex-col gap-4 sm:border-l sm:border-white/10 sm:pl-12">
              <Link
                to="/categories"
                className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Shop groceries"
              >
                <ShoppingBag
                  size={18}
                  strokeWidth={2}
                />
              </Link>

              <Link
                to="/ai-assistant"
                className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="AI Assistant"
              >
                <Sparkles
                  size={18}
                  strokeWidth={2}
                />
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-neutral-500 tracking-wide">
          <p>
            © {new Date().getFullYear()} EchOo Grocery.
            All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <span>Secure shopping</span>
            <span>•</span>
            <span>Cash on Delivery</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;