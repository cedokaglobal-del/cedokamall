import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, Home, ArrowRight, LayoutGrid, Sun, Sprout, Store, Calculator } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useSEO({
    title: 'Page Not Found (404) - Cedokamall',
    description: 'The requested page could not be found on Cedokamall. Explore our original electronics, solar energy systems, and farm produce.',
    keywords: [],
    robots: 'noindex, follow',
  });

  useEffect(() => {
    console.warn("404 Error: Non-existent route accessed:", location.pathname);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12 sm:py-20 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-gold px-3 py-1 rounded-full bg-gold/10 mb-4">
          Error 404
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-navy">Page Not Found</h1>
        <p className="mt-3 text-sm sm:text-base text-navy/70 max-w-md mx-auto leading-relaxed">
          The link you followed may be broken or the page may have been moved. Let us help you find what you need.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="mt-8 flex w-full max-w-md gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy/40" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, brands, inverters..."
              aria-label="Search products"
              className="pl-10 h-11 text-base bg-white border-gold-antique/30 rounded-xl"
            />
          </div>
          <Button type="submit" className="h-11 px-5 bg-navy text-gold hover:bg-gold hover:text-navy font-bold text-xs uppercase tracking-wider">
            Search
          </Button>
        </form>

        {/* Navigation Shortcuts */}
        <div className="mt-10">
          <p className="text-xs font-bold uppercase tracking-widest text-navy/50 mb-4">Popular Sections</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-lg">
            <Link to="/" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gold-antique/20 text-xs font-bold text-navy hover:text-gold hover:border-gold transition-colors">
              <Home className="h-3.5 w-3.5 text-gold" /> Home
            </Link>
            <Link to="/shop" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gold-antique/20 text-xs font-bold text-navy hover:text-gold hover:border-gold transition-colors">
              <LayoutGrid className="h-3.5 w-3.5 text-gold" /> Electronics
            </Link>
            <Link to="/solar" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gold-antique/20 text-xs font-bold text-navy hover:text-gold hover:border-gold transition-colors">
              <Sun className="h-3.5 w-3.5 text-gold" /> Solar Energy
            </Link>
            <Link to="/farms" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gold-antique/20 text-xs font-bold text-navy hover:text-gold hover:border-gold transition-colors">
              <Sprout className="h-3.5 w-3.5 text-gold" /> Farms
            </Link>
            <Link to="/brands" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gold-antique/20 text-xs font-bold text-navy hover:text-gold hover:border-gold transition-colors">
              <Store className="h-3.5 w-3.5 text-gold" /> Brands
            </Link>
            <Link to="/calculator" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gold-antique/20 text-xs font-bold text-navy hover:text-gold hover:border-gold transition-colors">
              <Calculator className="h-3.5 w-3.5 text-gold" /> Calculator
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
