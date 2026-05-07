import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    hmr: { overlay: false },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "@tanstack/react-query"],
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  build: {
    target: "es2020",
    minify: "terser",
    cssCodeSplit: true,
    cssMinify: "esbuild",
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core dependencies
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router-dom/") ||
            id.includes("node_modules/scheduler/")
          ) return "vendor-react";

          // Animation libraries
          if (id.includes("node_modules/framer-motion/")) return "vendor-motion";
          
          // UI libraries
          if (id.includes("node_modules/lucide-react/")) return "vendor-icons";
          if (id.includes("node_modules/@radix-ui/")) return "vendor-radix";
          
          // Data fetching
          if (id.includes("node_modules/@tanstack/")) return "vendor-query";
          
          // Utilities
          if (
            id.includes("node_modules/clsx/") ||
            id.includes("node_modules/class-variance-authority/") ||
            id.includes("node_modules/tailwind-merge/")
          ) return "vendor-utils";
          
          // Toast notifications
          if (id.includes("node_modules/sonner/")) return "vendor-toast";
          
          // Supabase
          if (id.includes("node_modules/@supabase/")) return "vendor-supabase";
          
          // Date utilities
          if (id.includes("node_modules/date-fns/")) return "vendor-date";
        },
        chunkFileNames: "assets/js/[name]-[hash:8].js",
        entryFileNames: "assets/js/[name]-[hash:8].js",
        assetFileNames: ({ name }) => {
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name ?? "")) 
            return "assets/img/[name]-[hash:8][extname]";
          if (/\.css$/i.test(name ?? "")) 
            return "assets/css/[name]-[hash:8][extname]";
          if (/\.woff2?$/i.test(name ?? "")) 
            return "assets/fonts/[name]-[hash:8][extname]";
          return "assets/[name]-[hash:8][extname]";
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.warn"],
        passes: 3,
        ecma: 2020,
      },
      format: {
        comments: false,
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
      },
    },
  },
  define: {
    __DEV__: mode === "development",
  },
}));
