import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect, useRef } from "react";
// Context
import { AuthProvider } from "@/contexts/AuthContext";
// Components
import ProtectedRoute from "@/components/ProtectedRoute.tsx";
import { ErrorBoundary } from "@/components/ErrorBoundary";
// Utilities
import { startHealthCheck } from "@/utils/supabaseHealth";
import { initWebVitals, logMetricsSummary } from "@/utils/webVitals";
import { validateSupabaseConfig } from "@/utils/resilience";
import { useSEO } from "@/hooks/useSEO";
import { subscribeToProductChanges, useProductStore } from "@/store/productStore";
import { useVisitorStore } from "@/store/visitorStore";
import { safeLazy } from "@/utils/lazy";
import { addConnectionHints } from "@/utils/performance";
import { trackPageView, trackReferrer } from "@/utils/tracking";
import MobileBottomNav from "@/components/MobileBottomNav";

const Index        = safeLazy(() => import("./pages/Index"));
const ShopPage     = safeLazy(() => import("./pages/ShopPage"));
const ProductPage  = safeLazy(() => import("./pages/ProductPage"));
const CartPage     = safeLazy(() => import("./pages/CartPage"));
const SolarPage    = safeLazy(() => import("./pages/SolarPage"));
const FarmsPage    = safeLazy(() => import("./pages/FarmsPage"));
const BrandsPage   = safeLazy(() => import("./pages/BrandsPage"));
const NotFound     = safeLazy(() => import("./pages/NotFound"));

// Admin pages (heavy, only loaded when admin visits)
const AdminLogin      = safeLazy(() => import("./pages/AdminLogin"));
const AdminDashboard  = safeLazy(() => import("./pages/AdminDashboard"));
const AdminProducts   = safeLazy(() => import("./pages/AdminProducts"));
const AdminAnalytics  = safeLazy(() => import("./pages/AdminAnalytics"));
const AdminFlashDeals = safeLazy(() => import("./pages/AdminFlashDeals"));
const AdminSales      = safeLazy(() => import("./pages/AdminSales"));

// Lightweight page spinner shown while a chunk is loading
const PageLoader = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0f1117" }}>
    <div style={{ width: 48, height: 48, border: "4px solid #C9A84C", borderBottomColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
  </div>
);

const queryClient = new QueryClient();

const SEOUpdater = () => {
  useSEO();
  return null;
};

const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(location.pathname);
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('config', 'G-6KG0L3JXPM', { page_path: location.pathname + location.search });
    }
  }, [location.pathname]);

  useEffect(() => { trackReferrer(); }, []);

  return null;
};

const App = () => {
  const lastFetchRef = useRef<number>(0);

  useEffect(() => {
    const fetchProducts = useProductStore.getState().fetchProducts;

    // Initialize performance monitoring
    const stopWebVitals = initWebVitals();

    // Validate Supabase configuration
    const config = validateSupabaseConfig();
    if (import.meta.env.DEV && !config.isValid) {
      console.warn('⚠️ Supabase Configuration Issues:', config.errors);
    } else if (import.meta.env.DEV) {
      console.log('✅ Supabase configuration is valid');
    }

    addConnectionHints();

    // Start database health checks only during development
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

    // Initial fetch: call directly to ensure data starts loading immediately
    const initialFetchTimeout = setTimeout(() => {
      void fetchInBackground();
    }, 100);

    const backgroundFetchHandle =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? window.requestIdleCallback(() => {
            void fetchInBackground();
          }, { timeout: 5000 })
        : null;
    const unsubscribeProductRealtime = subscribeToProductChanges();

    // Initialize visitor session
    const visitorStore = useVisitorStore.getState();
    void visitorStore.startSession();

    // Periodically update session duration (every 30 seconds)
    const sessionInterval = setInterval(() => {
      useVisitorStore.getState().updateSession();
    }, 30000);

    const handleReconnect = () => {
      const now = Date.now();
      if (now - lastFetchRef.current > 30000) {
        lastFetchRef.current = now;
        useProductStore.getState().fetchProducts(true);
      }
    };
 
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void useVisitorStore.getState().updateSession({ flush: true });
        return;
      }

      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastFetchRef.current > 30000) {
          lastFetchRef.current = now;
          useProductStore.getState().fetchProducts(true);
        }
      }
    };

    window.addEventListener('online', handleReconnect);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Log performance metrics before page unload
    const handleBeforeUnload = () => {
      logMetricsSummary();
      void useVisitorStore.getState().updateSession({ flush: true });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribeProductRealtime();
      stopWebVitals();
      clearTimeout(initialFetchTimeout);
      if (typeof window !== "undefined" && "cancelIdleCallback" in window && backgroundFetchHandle !== null) {
        window.cancelIdleCallback(backgroundFetchHandle as number);
      }
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
      clearInterval(sessionInterval);
      window.removeEventListener('online', handleReconnect);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <SEOUpdater />
              <ScrollToTop />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/solar" element={<SolarPage />} />
                  <Route path="/farms" element={<FarmsPage />} />
                  <Route path="/brands" element={<BrandsPage />} />

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
                  <Route
                    path="/admin/flash-deals"
                    element={
                      <ProtectedRoute>
                        <AdminFlashDeals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/sales"
                    element={
                      <ProtectedRoute>
                        <AdminSales />
                      </ProtectedRoute>
                    }
                  />
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <MobileBottomNav />
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
