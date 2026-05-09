import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, MapPin, Phone, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { buildCategories, slugifyCategory } from '@/data/products';
import { useProductStore } from '@/store/productStore';
import { lazy, Suspense } from 'react';
const MiniCart = lazy(() => import('./MiniCart'));

const Header = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const qParam = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(qParam);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const products = useProductStore((state) => state.products);
  const itemCount = useCartStore((s) => s.getItemCount());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const isCartOpen = useCartStore((s) => s.isOpen);
  const categories = useMemo(() => buildCategories(products), [products]);

  // Sync state with URL q param whenever it changes
  useEffect(() => {
    setSearchQuery(qParam);
  }, [qParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchQuery.trim();
    if (term) {
      const normalizedTerm = term.toLowerCase();
      const product = products.find((item) =>
        item.name.toLowerCase().includes(normalizedTerm) ||
        item.description.toLowerCase().includes(normalizedTerm) ||
        item.seller.toLowerCase().includes(normalizedTerm)
      );
      const categorySlug = product?.category ? slugifyCategory(product.category) : '';
      const search = new URLSearchParams({ q: term });
      if (categorySlug) {
        search.set('category', categorySlug);
      }
      navigate(`/shop?${search.toString()}`);
    } else {
      // If empty and searched, clear the filter
      navigate('/shop');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    // If user clears the input while on the shop page, automatically reset the search filter
    if (val === '' && location.pathname === '/shop') {
      navigate('/shop');
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-navy text-champagne text-xs sm:text-sm py-2 sm:py-2.5 border-b border-gold-antique/20 transition-all duration-300">
        <div className="container flex justify-between items-center font-sans gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap min-w-0">
            <span className="flex items-center gap-1 opacity-90 text-xs sm:text-sm whitespace-nowrap">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gold flex-shrink-0" /> 
              <span className="hidden sm:inline">Delivery Across Nigeria</span>
              <span className="sm:hidden">Delivery NGN</span>
            </span>
            <span className="hidden sm:flex items-center gap-1 opacity-90">
              <Phone className="w-4 h-4 text-gold flex-shrink-0" /> 
              <Link to="tel:09128817136" className="hover:text-gold transition-colors duration-300">09128817136</Link>
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-navy text-champagne border-b border-gold-antique/30 shadow-premium transition-shadow duration-300">
        <div className="container flex items-center gap-1 sm:gap-3 py-2.5 sm:py-3 flex-wrap md:flex-nowrap">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex-shrink-0 flex items-center mr-1 sm:mr-2 transition-transform duration-300 hover:scale-105" 
            aria-label="Cedokamall Home"
          >
            <img
              src="/header_logo.png"
              alt="Cedokamall"
              className="object-contain brightness-125 contrast-200 drop-shadow-lg font-bold will-change-transform transition-all duration-300"
              style={{ height: 'clamp(40px, 8vw, 56px)', width: 'auto', maxWidth: '200px' }}
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
          </Link>

          {/* Categories dropdown - desktop only */}
          {categories.length > 0 && (
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setCatMenuOpen(!catMenuOpen)}
                className="flex items-center gap-2 bg-gold text-navy px-3 sm:px-5 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-semibold hover:bg-gold-antique hover:text-white transition-all duration-300 whitespace-nowrap shadow-premium-sm will-change-transform"
              >
                <Menu className="w-4 h-4" /> Categories <ChevronDown className="w-3 h-3 transition-transform duration-300" />
              </button>
              {catMenuOpen && (
                <div className="absolute top-full left-0 mt-2 bg-navy-deep rounded-lg shadow-premium-lg border border-gold-antique/30 p-2 w-64 z-50 animate-slide-down duration-250 will-change-transform max-h-96 overflow-y-auto">
                  {categories.map((cat, idx) => (
                    <Link
                      key={cat.slug}
                      to={`/shop?category=${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gold-antique/20 hover:text-white transition-all duration-250 text-sm font-medium"
                      style={{ animationDelay: `${idx * 50}ms` }}
                      onClick={() => setCatMenuOpen(false)}
                    >
                      <cat.icon className="w-4 h-4 text-gold flex-shrink-0" />
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 min-w-0 w-full md:max-w-md relative order-3 md:order-none">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search products..."
              className="w-full pl-4 sm:pl-5 pr-10 sm:pr-12 py-2 sm:py-2.5 rounded-lg border border-gold-antique/30 bg-navy-deep/50 text-champagne text-xs sm:text-base focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-300 placeholder:text-champagne/50 will-change-contents"
              aria-label="Search products"
            />
            <button 
              type="submit" 
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 min-h-11 min-w-11 p-2 hover:text-gold transition-colors duration-300 flex-shrink-0 active:scale-95 rounded-md hover:bg-white/5" 
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            <button 
              type="button" 
              onClick={toggleCart} 
              className="relative flex min-h-11 min-w-11 items-center justify-center p-2 sm:p-2.5 hover:text-gold transition-all duration-300 rounded-lg hover:bg-white/5 group active:scale-95" 
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-navy text-[10px] font-bold rounded-full flex items-center justify-center shadow-premium-sm border border-navy animate-scale-in">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
              <span className="hidden md:inline ml-2 font-medium text-sm">Cart</span>
            </button>
            <button 
              type="button" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden min-h-11 min-w-11 p-2 hover:text-gold transition-all duration-300 rounded-lg hover:bg-white/5 active:scale-95" 
              title="Menu"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && categories.length > 0 && (
          <div className="md:hidden border-t border-gold-antique/20 bg-navy-deep p-3 sm:p-4 animate-slide-down duration-300 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
              {categories.map((cat, idx) => (
                <Link
                  key={cat.slug}
                  to={`/shop?category=${cat.slug}`}
                  className="flex items-center gap-2 px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg bg-navy-deep/50 border border-gold-antique/10 hover:border-gold/50 hover:bg-gold-antique/10 transition-all duration-300 overflow-hidden"
                  style={{ animationDelay: `${idx * 30}ms` }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <cat.icon className="w-4 h-4 flex-shrink-0 text-gold" />
                  <span className="truncate font-medium">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Suspense fallback={null}>
          {isCartOpen && <MiniCart />}
        </Suspense>
      </header>
    </>
  );
};

export default Header;
