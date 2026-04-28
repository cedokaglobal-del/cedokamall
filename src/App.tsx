import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect } from "react";
// Context
import { AuthProvider } from "@/contexts/AuthContext";
// Components
import ProtectedRoute from "@/components/ProtectedRoute.tsx";
// Utilities
import { addConnectionHints } from "@/utils/performance";
import { useSEO } from "@/hooks/useSEO";
import { useProductStore } from "@/store/productStore";

// --- Route-level code splitting (each page loads on demand) ---
const Index        = lazy(() => import("./pages/Index"));
const ShopPage     = lazy(() => import("./pages/ShopPage"));
const ProductPage  = lazy(() => import("./pages/ProductPage"));
const CartPage     = lazy(() => import("./pages/CartPage"));
const NotFound     = lazy(() => import("./pages/NotFound"));
// Admin pages (heavy, only loaded when admin visits)
const AdminLogin      = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard  = lazy(() => import("./pages/AdminDashboard"));
const AdminProducts   = lazy(() => import("./pages/AdminProducts"));

// Lightweight page spinner shown while a chunk is loading
const PageLoader = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0f1117" }}>
    <div style={{ width: 40, height: 40, border: "3px solid #ff6b35", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const queryClient = new QueryClient();

const SEOUpdater = () => {
  useSEO();
  return null;
};

const App = () => {
  const fetchProducts = useProductStore((state) => state.fetchProducts);

  useEffect(() => {
    void fetchProducts();
    addConnectionHints();

    const handleReconnect = () => {
      void fetchProducts(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchProducts(true);
      }
    };

    window.addEventListener('online', handleReconnect);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleReconnect);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchProducts]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SEOUpdater />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />

                {/* Admin Routes - Login (no protection needed) */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Admin Routes - Protected */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute>
                      <AdminProducts />
                    </ProtectedRoute>
                  }
                />
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
