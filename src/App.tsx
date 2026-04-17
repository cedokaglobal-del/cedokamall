import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
// Public pages
import Index from "./pages/Index.tsx";
import ShopPage from "./pages/ShopPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import CartPage from "./pages/CartPage.tsx";
import NotFound from "./pages/NotFound.tsx";
// Admin pages
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminFlashDeals from "./pages/AdminFlashDeals.tsx";
import AdminProducts from "./pages/AdminProducts.tsx";
import AdminAnalytics from "./pages/AdminAnalytics.tsx";
// Components
import ProtectedRoute from "@/components/ProtectedRoute.tsx";
// Context
import { AuthProvider } from "@/contexts/AuthContext";
// Utilities
import { addConnectionHints } from "@/utils/performance";
import { useSEO } from "@/hooks/useSEO";

const queryClient = new QueryClient();

const SEOUpdater = () => {
  useSEO();
  return null;
};

const App = () => {

  // Initialize performance optimizations
  useEffect(() => {
    // Add DNS prefetch and preconnect hints
    addConnectionHints();

    // Disable console in production
    if (import.meta.env.MODE === "production") {
      console.log = () => {};
      console.error = () => {};
      console.warn = () => {};
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SEOUpdater />
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
                path="/admin/flash-deals" 
                element={
                  <ProtectedRoute>
                    <AdminFlashDeals />
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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
