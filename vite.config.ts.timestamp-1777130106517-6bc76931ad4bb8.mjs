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
    hmr: {
      overlay: false
    },
    // Add security headers in development
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"]
  },
  build: {
    // Optimize build output
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          "vendor": ["react", "react-dom", "react-router-dom"],
          "ui": ["@radix-ui/react-alert-dialog", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          "utils": ["clsx", "class-variance-authority"]
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxPc21heGluXFxcXERvY3VtZW50c1xcXFxEZWNvZGFtc1dvcmtcXFxcQ2Vkb2thXFxcXENlZG9rYU1hbGxcXFxcTWFsbFBhZ2VcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE9zbWF4aW5cXFxcRG9jdW1lbnRzXFxcXERlY29kYW1zV29ya1xcXFxDZWRva2FcXFxcQ2Vkb2thTWFsbFxcXFxNYWxsUGFnZVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvT3NtYXhpbi9Eb2N1bWVudHMvRGVjb2RhbXNXb3JrL0NlZG9rYS9DZWRva2FNYWxsL01hbGxQYWdlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICAgIGhtcjoge1xyXG4gICAgICBvdmVybGF5OiBmYWxzZSxcclxuICAgIH0sXHJcbiAgICAvLyBBZGQgc2VjdXJpdHkgaGVhZGVycyBpbiBkZXZlbG9wbWVudFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICBcIlgtQ29udGVudC1UeXBlLU9wdGlvbnNcIjogXCJub3NuaWZmXCIsXHJcbiAgICAgIFwiWC1GcmFtZS1PcHRpb25zXCI6IFwiREVOWVwiLFxyXG4gICAgICBcIlgtWFNTLVByb3RlY3Rpb25cIjogXCIxOyBtb2RlPWJsb2NrXCIsXHJcbiAgICAgIFwiUmVmZXJyZXItUG9saWN5XCI6IFwic3RyaWN0LW9yaWdpbi13aGVuLWNyb3NzLW9yaWdpblwiLFxyXG4gICAgICBcIlBlcm1pc3Npb25zLVBvbGljeVwiOiBcImdlb2xvY2F0aW9uPSgpLCBtaWNyb3Bob25lPSgpLCBjYW1lcmE9KClcIixcclxuICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIsXHJcbiAgICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiOiBcIkdFVCwgUE9TVCwgUFVULCBERUxFVEUsIE9QVElPTlNcIixcclxuICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6IFwiQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uXCIsXHJcbiAgICB9XHJcbiAgfSxcclxuICBwbHVnaW5zOiBbcmVhY3QoKSwgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gICAgZGVkdXBlOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiLCBcInJlYWN0L2pzeC1ydW50aW1lXCIsIFwicmVhY3QvanN4LWRldi1ydW50aW1lXCIsIFwiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCIsIFwiQHRhbnN0YWNrL3F1ZXJ5LWNvcmVcIl0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgLy8gT3B0aW1pemUgYnVpbGQgb3V0cHV0XHJcbiAgICBtaW5pZnk6IFwidGVyc2VyXCIsXHJcbiAgICB0ZXJzZXJPcHRpb25zOiB7XHJcbiAgICAgIGNvbXByZXNzOiB7XHJcbiAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLFxyXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAvLyBDb2RlIHNwbGl0dGluZyBmb3IgYmV0dGVyIGNhY2hpbmdcclxuICAgICAgICBtYW51YWxDaHVua3M6IHtcclxuICAgICAgICAgICd2ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXHJcbiAgICAgICAgICAndWknOiBbJ0ByYWRpeC11aS9yZWFjdC1hbGVydC1kaWFsb2cnLCAnQHJhZGl4LXVpL3JlYWN0LWRpYWxvZycsICdAcmFkaXgtdWkvcmVhY3QtZHJvcGRvd24tbWVudSddLFxyXG4gICAgICAgICAgJ3V0aWxzJzogWydjbHN4JywgJ2NsYXNzLXZhcmlhbmNlLWF1dGhvcml0eSddLFxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbn0pKTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3WSxTQUFTLG9CQUFvQjtBQUNyYSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBLE1BQ0gsU0FBUztBQUFBLElBQ1g7QUFBQTtBQUFBLElBRUEsU0FBUztBQUFBLE1BQ1AsMEJBQTBCO0FBQUEsTUFDMUIsbUJBQW1CO0FBQUEsTUFDbkIsb0JBQW9CO0FBQUEsTUFDcEIsbUJBQW1CO0FBQUEsTUFDbkIsc0JBQXNCO0FBQUEsTUFDdEIsK0JBQStCO0FBQUEsTUFDL0IsZ0NBQWdDO0FBQUEsTUFDaEMsZ0NBQWdDO0FBQUEsSUFDbEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsaUJBQWlCLGdCQUFnQixDQUFDLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDOUUsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsSUFDQSxRQUFRLENBQUMsU0FBUyxhQUFhLHFCQUFxQix5QkFBeUIseUJBQXlCLHNCQUFzQjtBQUFBLEVBQzlIO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFBQSxJQUVMLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLGVBQWU7QUFBQSxNQUNqQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQTtBQUFBLFFBRU4sY0FBYztBQUFBLFVBQ1osVUFBVSxDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxVQUNuRCxNQUFNLENBQUMsZ0NBQWdDLDBCQUEwQiwrQkFBK0I7QUFBQSxVQUNoRyxTQUFTLENBQUMsUUFBUSwwQkFBMEI7QUFBQSxRQUM5QztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
