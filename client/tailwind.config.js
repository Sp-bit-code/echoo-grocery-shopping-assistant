/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      fontFamily: {
        sans: ["SF Pro Display", "SF Pro Text", "system-ui", "sans-serif"],
        "sf-pro-light": ["SF Pro Text", "system-ui", "sans-serif"],
        "dm-sans": ["DM Sans", "sans-serif"],
        "vent-sans": ["Vend Sans", "sans-serif"],
        "sf-pro-regular": ["SF Pro Display", "system-ui", "sans-serif"],
        "sf-pro-medium": ["SF Pro Display", "system-ui", "sans-serif"],
        "sf-pro-semibold": ["SF Pro Display", "system-ui", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        gayathri: ["Gayathri", "sans-serif"],
      },

      colors: {
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },

      keyframes: {
        ripple: {
          "0%": {
            transform: "scale(1)",
            opacity: "0.9",
          },
          "50%": {
            transform: "scale(1.2)",
            opacity: "0.5",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "0.9",
          },
        },
      },

      animation: {
        ripple: "ripple 4s ease infinite",
      },
    },
  },

  plugins: [],
};