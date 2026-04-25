import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "@tanstack/react-query"],
  },
  build: {
    minify: "terser",
    cssCodeSplit: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.warn"],
        passes: 2,
      },
      format: { comments: false },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router-dom/") ||
            id.includes("node_modules/scheduler/")
          ) return "vendor-react";

          if (id.includes("node_modules/framer-motion/")) return "vendor-motion";
          if (id.includes("node_modules/lucide-react/")) return "vendor-icons";
          if (id.includes("node_modules/@radix-ui/")) return "vendor-radix";
          if (id.includes("node_modules/@tanstack/")) return "vendor-query";
          if (
            id.includes("node_modules/clsx/") ||
            id.includes("node_modules/class-variance-authority/") ||
            id.includes("node_modules/tailwind-merge/")
          ) return "vendor-utils";
          if (id.includes("node_modules/sonner/")) return "vendor-toast";
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: ({ name }) => {
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name ?? "")) return "assets/img/[name]-[hash][extname]";
          if (/\.css$/i.test(name ?? "")) return "assets/css/[name]-[hash][extname]";
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
}));
