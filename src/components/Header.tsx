import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Menu, X, MapPin, Phone, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { buildCategories } from '@/data/products';
import { useProductStore } from '@/store/productStore';
import MiniCart from './MiniCart';

const Header = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const qParam = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(qParam);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const { products } = useProductStore();
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
      navigate(`/shop?q=${encodeURIComponent(term)}`);
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
      <div className="bg-navy text-champagne text-xs py-1.5 border-b border-gold-antique/20">
        <div className="container flex justify-between items-center font-sans">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 opacity-90"><MapPin className="w-3 h-3 text-gold" /> Delivery Across Nigeria</span>
            <span className="hidden sm:flex items-center gap-1 opacity-90"><Phone className="w-3 h-3 text-gold" /> <Link to="tel:09128817136" className="hover:text-gold transition-colors">09128817136</Link></span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-navy text-champagne border-b border-gold-antique/30 shadow-premium">
        <div className="container flex items-center gap-2 sm:gap-4 py-3 flex-wrap md:flex-nowrap">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center" aria-label="Cedokamall Home">
            <img
              src="/header_logo.png"
              alt="Cedokamall"
              className="object-contain brightness-110 contrast-125"
              style={{ height: '42px', width: 'auto', maxWidth: '160px' }}
            />
          </Link>

          {/* Categories dropdown */}
          {categories.length > 0 && (
            <div className="relative hidden xl:block">
              <button
                type="button"
                onClick={() => setCatMenuOpen(!catMenuOpen)}
                className="flex items-center gap-2 bg-gold text-navy px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-gold-antique hover:text-white transition-all duration-300 whitespace-nowrap shadow-md"
              >
                <Menu className="w-4 h-4" /> Categories <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" />
              </button>
              {catMenuOpen && (
                <div className="absolute top-full left-0 mt-2 bg-navy-deep rounded-md shadow-2xl border border-gold-antique/30 p-2 w-64 z-50 animate-in fade-in zoom-in duration-200">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/shop?category=${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gold-antique hover:text-white transition-colors text-sm font-medium"
                      onClick={() => setCatMenuOpen(false)}
                    >
                      <cat.icon className="w-4 h-4 text-gold" />
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 min-w-0 w-full md:max-w-xl relative order-3 md:order-none">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search premium products..."
              className="w-full pl-5 pr-12 py-2.5 rounded-md border border-gold-antique/30 bg-navy-deep/50 text-champagne text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all placeholder:text-champagne/40"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:text-gold transition-colors flex-shrink-0" aria-label="Search">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Link to="/wishlist" className="hidden sm:flex items-center justify-center p-2 hover:text-gold transition-all duration-300 rounded-md hover:bg-white/5" title="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>
            <button type="button" onClick={toggleCart} className="relative flex items-center justify-center p-2 hover:text-gold transition-all duration-300 rounded-md hover:bg-white/5 group" title="Cart">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-navy text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg border border-navy animate-in zoom-in duration-300">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
              <span className="hidden md:inline ml-2 font-medium">Cart</span>
            </button>
            <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:text-gold transition-all duration-300 rounded-md hover:bg-white/5" title="Menu">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && categories.length > 0 && (
          <div className="md:hidden border-t border-gold-antique/20 bg-navy p-4 animate-in slide-in-from-top duration-300 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/shop?category=${cat.slug}`}
                  className="flex items-center gap-2 px-3 py-3 rounded-md bg-navy-deep/50 border border-gold-antique/10 hover:border-gold/30 hover:bg-navy-deep transition-all duration-300 overflow-hidden"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <cat.icon className="w-4 h-4 flex-shrink-0 text-gold" />
                  <span className="truncate">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <MiniCart />
      </header>
    </>
  );
};

export default Header;
