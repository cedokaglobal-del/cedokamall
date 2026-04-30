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
import { ErrorBoundary } from "@/components/ErrorBoundary";
// Utilities
import { addConnectionHints } from "@/utils/performance";
import { startHealthCheck } from "@/utils/supabaseHealth";
import { initWebVitals, logMetricsSummary } from "@/utils/webVitals";
import { validateSupabaseConfig } from "@/utils/resilience";
import { useSEO } from "@/hooks/useSEO";
import { useProductStore } from "@/store/productStore";
import { useVisitorStore } from "@/store/visitorStore";
import { safeLazy } from "@/utils/lazy";

// --- Route-level code splitting (each page loads on demand) ---
const Index        = safeLazy(() => import("./pages/Index"));
const ShopPage     = safeLazy(() => import("./pages/ShopPage"));
const ProductPage  = safeLazy(() => import("./pages/ProductPage"));
const CartPage     = safeLazy(() => import("./pages/CartPage"));
const NotFound     = safeLazy(() => import("./pages/NotFound"));
// Admin pages (heavy, only loaded when admin visits)
const AdminLogin      = safeLazy(() => import("./pages/AdminLogin"));
const AdminDashboard  = safeLazy(() => import("./pages/AdminDashboard"));
const AdminProducts   = safeLazy(() => import("./pages/AdminProducts"));
const AdminAnalytics  = safeLazy(() => import("./pages/AdminAnalytics"));

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
    // Initialize performance monitoring
    initWebVitals();

    // Validate Supabase configuration
    const config = validateSupabaseConfig();
    if (!config.isValid) {
      console.warn('⚠️ Supabase Configuration Issues:', config.errors);
    } else {
      console.log('✅ Supabase configuration is valid');
    }

    // Start database health check (logs every 60 seconds)
    const healthCheckInterval = startHealthCheck(60000);

    // Non-blocking: fetch products in background without waiting
    // App renders immediately with cached data
    const fetchInBackground = async () => {
      try {
        await fetchProducts();
      } catch (err) {
        console.warn('Product sync failed (app still loads):', err);
      }
    };

    fetchInBackground();
    addConnectionHints();

    // Initialize visitor session
    const visitorStore = useVisitorStore.getState();
    visitorStore.startSession();

    // Periodically update session duration (every 30 seconds)
    const sessionInterval = setInterval(() => {
      useVisitorStore.getState().updateSession();
    }, 30000);

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

    // Log performance metrics before page unload
    const handleBeforeUnload = () => {
      logMetricsSummary();
      useVisitorStore.getState().updateSession();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(healthCheckInterval);
      clearInterval(sessionInterval);
      window.removeEventListener('online', handleReconnect);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [fetchProducts]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
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
                  <Route
                    path="/admin/analytics"
                    element={
                      <ProtectedRoute>
                        <AdminAnalytics />
                      </ProtectedRoute>
                    }
                  />
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
