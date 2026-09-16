import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  appType: "spa",
  resolve: {
    dedupe: ["react", "react-dom", "react-router-dom"],
    alias: {
      "react-router-dom": path.resolve(__dirname, "node_modules/react-router-dom"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-router")) return "router";
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) return "react";
          if (id.includes("vendor/mlai-site") || id.includes("node_modules/mlai-site")) return "mlai-site";
        },
      },
    },
  },
  preview: {
    // Ensure deep links work when serving `dist/`
    port: 4173,
  },
});
