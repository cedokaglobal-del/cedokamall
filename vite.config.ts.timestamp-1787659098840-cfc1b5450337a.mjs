// vite.config.ts
import { defineConfig } from "file:///C:/Users/Osmaxin/Documents/DecodamsWork/Cedoka/CedokaMall/MallPage/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Osmaxin/Documents/DecodamsWork/Cedoka/CedokaMall/MallPage/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/Osmaxin/Documents/DecodamsWork/Cedoka/CedokaMall/MallPage/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Osmaxin\\Documents\\DecodamsWork\\Cedoka\\CedokaMall\\MallPage";
var vite_config_default = defineConfig(({ mode }) => ({
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
      "Cache-Control": "public, max-age=3600"
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__vite_injected_original_dirname, "./src") },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "@tanstack/react-query"],
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"]
  },
  build: {
    target: "es2020",
    minify: "terser",
    cssCodeSplit: true,
    cssMinify: "lightningcss",
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/react-router-dom/") || id.includes("node_modules/scheduler/")) return "vendor-react";
          if (id.includes("node_modules/framer-motion/")) return "vendor-motion";
          if (id.includes("node_modules/lucide-react/")) return "vendor-icons";
          if (id.includes("node_modules/@radix-ui/")) return "vendor-radix";
          if (id.includes("node_modules/@tanstack/")) return "vendor-query";
          if (id.includes("node_modules/clsx/") || id.includes("node_modules/class-variance-authority/") || id.includes("node_modules/tailwind-merge/")) return "vendor-utils";
          if (id.includes("node_modules/sonner/")) return "vendor-toast";
          if (id.includes("node_modules/@supabase/")) return "vendor-supabase";
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
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.warn"],
        passes: 3,
        ecma: 2020
      },
      format: {
        comments: false
      },
      mangle: true
    }
  },
  define: {
    __DEV__: mode === "development"
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxPc21heGluXFxcXERvY3VtZW50c1xcXFxEZWNvZGFtc1dvcmtcXFxcQ2Vkb2thXFxcXENlZG9rYU1hbGxcXFxcTWFsbFBhZ2VcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE9zbWF4aW5cXFxcRG9jdW1lbnRzXFxcXERlY29kYW1zV29ya1xcXFxDZWRva2FcXFxcQ2Vkb2thTWFsbFxcXFxNYWxsUGFnZVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvT3NtYXhpbi9Eb2N1bWVudHMvRGVjb2RhbXNXb3JrL0NlZG9rYS9DZWRva2FNYWxsL01hbGxQYWdlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgICBobXI6IHsgb3ZlcmxheTogZmFsc2UgfSxcbiAgICBoZWFkZXJzOiB7XG4gICAgICBcIlgtQ29udGVudC1UeXBlLU9wdGlvbnNcIjogXCJub3NuaWZmXCIsXG4gICAgICBcIlgtRnJhbWUtT3B0aW9uc1wiOiBcIkRFTllcIixcbiAgICAgIFwiWC1YU1MtUHJvdGVjdGlvblwiOiBcIjE7IG1vZGU9YmxvY2tcIixcbiAgICAgIFwiUmVmZXJyZXItUG9saWN5XCI6IFwic3RyaWN0LW9yaWdpbi13aGVuLWNyb3NzLW9yaWdpblwiLFxuICAgICAgXCJQZXJtaXNzaW9ucy1Qb2xpY3lcIjogXCJnZW9sb2NhdGlvbj0oKSwgbWljcm9waG9uZT0oKSwgY2FtZXJhPSgpXCIsXG4gICAgICBcIkNhY2hlLUNvbnRyb2xcIjogXCJwdWJsaWMsIG1heC1hZ2U9MzYwMFwiLFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCldLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7IFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpIH0sXG4gICAgZGVkdXBlOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiLCBcInJlYWN0L2pzeC1ydW50aW1lXCIsIFwiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCJdLFxuICAgIGV4dGVuc2lvbnM6IFtcIi5tanNcIiwgXCIuanNcIiwgXCIudHNcIiwgXCIuanN4XCIsIFwiLnRzeFwiLCBcIi5qc29uXCJdLFxuICB9LFxuICBidWlsZDoge1xuICAgIHRhcmdldDogXCJlczIwMjBcIixcbiAgICBtaW5pZnk6IFwidGVyc2VyXCIsXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgIGNzc01pbmlmeTogXCJsaWdodG5pbmdjc3NcIixcbiAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogdHJ1ZSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDYwMCxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XG4gICAgICAgICAgLy8gQ29yZSBkZXBlbmRlbmNpZXNcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9yZWFjdC9cIikgfHxcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzL3JlYWN0LWRvbS9cIikgfHxcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzL3JlYWN0LXJvdXRlci1kb20vXCIpIHx8XG4gICAgICAgICAgICBpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9zY2hlZHVsZXIvXCIpXG4gICAgICAgICAgKSByZXR1cm4gXCJ2ZW5kb3ItcmVhY3RcIjtcblxuICAgICAgICAgIC8vIEFuaW1hdGlvbiBsaWJyYXJpZXNcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXMvZnJhbWVyLW1vdGlvbi9cIikpIHJldHVybiBcInZlbmRvci1tb3Rpb25cIjtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBVSSBsaWJyYXJpZXNcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXMvbHVjaWRlLXJlYWN0L1wiKSkgcmV0dXJuIFwidmVuZG9yLWljb25zXCI7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzL0ByYWRpeC11aS9cIikpIHJldHVybiBcInZlbmRvci1yYWRpeFwiO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIERhdGEgZmV0Y2hpbmdcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXMvQHRhbnN0YWNrL1wiKSkgcmV0dXJuIFwidmVuZG9yLXF1ZXJ5XCI7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gVXRpbGl0aWVzXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgaWQuaW5jbHVkZXMoXCJub2RlX21vZHVsZXMvY2xzeC9cIikgfHxcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzL2NsYXNzLXZhcmlhbmNlLWF1dGhvcml0eS9cIikgfHxcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzL3RhaWx3aW5kLW1lcmdlL1wiKVxuICAgICAgICAgICkgcmV0dXJuIFwidmVuZG9yLXV0aWxzXCI7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gVG9hc3Qgbm90aWZpY2F0aW9uc1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9zb25uZXIvXCIpKSByZXR1cm4gXCJ2ZW5kb3ItdG9hc3RcIjtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBTdXBhYmFzZVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9Ac3VwYWJhc2UvXCIpKSByZXR1cm4gXCJ2ZW5kb3Itc3VwYWJhc2VcIjtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBEYXRlIHV0aWxpdGllc1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9cIikpIHJldHVybiBcInZlbmRvci1kYXRlXCI7XG4gICAgICAgIH0sXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiBcImFzc2V0cy9qcy9bbmFtZV0tW2hhc2g6OF0uanNcIixcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6IFwiYXNzZXRzL2pzL1tuYW1lXS1baGFzaDo4XS5qc1wiLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogKHsgbmFtZSB9KSA9PiB7XG4gICAgICAgICAgaWYgKC9cXC4ocG5nfGpwZT9nfGdpZnxzdmd8d2VicHxpY28pJC9pLnRlc3QobmFtZSA/PyBcIlwiKSkgXG4gICAgICAgICAgICByZXR1cm4gXCJhc3NldHMvaW1nL1tuYW1lXS1baGFzaDo4XVtleHRuYW1lXVwiO1xuICAgICAgICAgIGlmICgvXFwuY3NzJC9pLnRlc3QobmFtZSA/PyBcIlwiKSkgXG4gICAgICAgICAgICByZXR1cm4gXCJhc3NldHMvY3NzL1tuYW1lXS1baGFzaDo4XVtleHRuYW1lXVwiO1xuICAgICAgICAgIGlmICgvXFwud29mZjI/JC9pLnRlc3QobmFtZSA/PyBcIlwiKSkgXG4gICAgICAgICAgICByZXR1cm4gXCJhc3NldHMvZm9udHMvW25hbWVdLVtoYXNoOjhdW2V4dG5hbWVdXCI7XG4gICAgICAgICAgcmV0dXJuIFwiYXNzZXRzL1tuYW1lXS1baGFzaDo4XVtleHRuYW1lXVwiO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHRlcnNlck9wdGlvbnM6IHtcbiAgICAgIGNvbXByZXNzOiB7XG4gICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSxcbiAgICAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZSxcbiAgICAgICAgcHVyZV9mdW5jczogW1wiY29uc29sZS5sb2dcIiwgXCJjb25zb2xlLmluZm9cIiwgXCJjb25zb2xlLndhcm5cIl0sXG4gICAgICAgIHBhc3NlczogMyxcbiAgICAgICAgZWNtYTogMjAyMCxcbiAgICAgIH0sXG4gICAgICBmb3JtYXQ6IHtcbiAgICAgICAgY29tbWVudHM6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIG1hbmdsZTogdHJ1ZSxcbiAgICB9LFxuICB9LFxuICBkZWZpbmU6IHtcbiAgICBfX0RFVl9fOiBtb2RlID09PSBcImRldmVsb3BtZW50XCIsXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdZLFNBQVMsb0JBQW9CO0FBQ3JhLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixLQUFLLEVBQUUsU0FBUyxNQUFNO0FBQUEsSUFDdEIsU0FBUztBQUFBLE1BQ1AsMEJBQTBCO0FBQUEsTUFDMUIsbUJBQW1CO0FBQUEsTUFDbkIsb0JBQW9CO0FBQUEsTUFDcEIsbUJBQW1CO0FBQUEsTUFDbkIsc0JBQXNCO0FBQUEsTUFDdEIsaUJBQWlCO0FBQUEsSUFDbkI7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsaUJBQWlCLGdCQUFnQixDQUFDLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDOUUsU0FBUztBQUFBLElBQ1AsT0FBTyxFQUFFLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU8sRUFBRTtBQUFBLElBQy9DLFFBQVEsQ0FBQyxTQUFTLGFBQWEscUJBQXFCLHVCQUF1QjtBQUFBLElBQzNFLFlBQVksQ0FBQyxRQUFRLE9BQU8sT0FBTyxRQUFRLFFBQVEsT0FBTztBQUFBLEVBQzVEO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsSUFDUixjQUFjO0FBQUEsSUFDZCxXQUFXO0FBQUEsSUFDWCxzQkFBc0I7QUFBQSxJQUN0Qix1QkFBdUI7QUFBQSxJQUN2QixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixhQUFhLElBQUk7QUFFZixjQUNFLEdBQUcsU0FBUyxxQkFBcUIsS0FDakMsR0FBRyxTQUFTLHlCQUF5QixLQUNyQyxHQUFHLFNBQVMsZ0NBQWdDLEtBQzVDLEdBQUcsU0FBUyx5QkFBeUIsRUFDckMsUUFBTztBQUdULGNBQUksR0FBRyxTQUFTLDZCQUE2QixFQUFHLFFBQU87QUFHdkQsY0FBSSxHQUFHLFNBQVMsNEJBQTRCLEVBQUcsUUFBTztBQUN0RCxjQUFJLEdBQUcsU0FBUyx5QkFBeUIsRUFBRyxRQUFPO0FBR25ELGNBQUksR0FBRyxTQUFTLHlCQUF5QixFQUFHLFFBQU87QUFHbkQsY0FDRSxHQUFHLFNBQVMsb0JBQW9CLEtBQ2hDLEdBQUcsU0FBUyx3Q0FBd0MsS0FDcEQsR0FBRyxTQUFTLDhCQUE4QixFQUMxQyxRQUFPO0FBR1QsY0FBSSxHQUFHLFNBQVMsc0JBQXNCLEVBQUcsUUFBTztBQUdoRCxjQUFJLEdBQUcsU0FBUyx5QkFBeUIsRUFBRyxRQUFPO0FBR25ELGNBQUksR0FBRyxTQUFTLHdCQUF3QixFQUFHLFFBQU87QUFBQSxRQUNwRDtBQUFBLFFBQ0EsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDNUIsY0FBSSxtQ0FBbUMsS0FBSyxRQUFRLEVBQUU7QUFDcEQsbUJBQU87QUFDVCxjQUFJLFVBQVUsS0FBSyxRQUFRLEVBQUU7QUFDM0IsbUJBQU87QUFDVCxjQUFJLGFBQWEsS0FBSyxRQUFRLEVBQUU7QUFDOUIsbUJBQU87QUFDVCxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsVUFBVTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsZUFBZTtBQUFBLFFBQ2YsWUFBWSxDQUFDLGVBQWUsZ0JBQWdCLGNBQWM7QUFBQSxRQUMxRCxRQUFRO0FBQUEsUUFDUixNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0EsUUFBUTtBQUFBLFFBQ04sVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sU0FBUyxTQUFTO0FBQUEsRUFDcEI7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
