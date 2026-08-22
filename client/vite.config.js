import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("react-toastify")) {
            return "toast";
          }

          if (id.includes("recharts")) {
            return "charts";
          }

          if (id.includes("framer-motion")) {
            return "motion";
          }

          if (id.includes("@supabase")) {
            return "supabase";
          }

          if (
            id.includes("lucide-react") ||
            id.includes("@heroicons")
          ) {
            return "icons";
          }

          return "vendor";
        },
      },
    },
  },
});