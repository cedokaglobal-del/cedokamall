import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Menu, X, MapPin, Phone, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { categories } from '@/data/products';
import MiniCart from './MiniCart';

const Header = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const qParam = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(qParam);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const itemCount = useCartStore((s) => s.getItemCount());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const isCartOpen = useCartStore((s) => s.isOpen);

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
      <div className="bg-primary text-primary-foreground text-xs py-1.5">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Delivery Across Nigeria</span>
            <span className="hidden sm:flex items-center gap-1"><Phone className="w-3 h-3" /> +234 704 585 1131</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Removed: Free shipping banner */}
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="container flex items-center gap-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src="/logo.png" alt="Cedokamall" className="h-10 w-auto object-contain" />
          </Link>

          {/* Categories dropdown */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setCatMenuOpen(!catMenuOpen)}
              className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-light transition-colors"
            >
              <Menu className="w-4 h-4" /> Categories <ChevronDown className="w-3 h-3" />
            </button>
            {catMenuOpen && (
              <div className="absolute top-full left-0 mt-1 bg-background rounded-lg shadow-xl border p-2 w-56 z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/shop?category=${cat.slug}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted transition-colors text-sm"
                    onClick={() => setCatMenuOpen(false)}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>{cat.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{cat.count}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search products, brands, categories..."
              className="w-full pl-4 pr-10 py-2.5 rounded-lg border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-primary transition-colors">
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/wishlist" className="hidden sm:flex items-center gap-1.5 text-sm hover:text-primary transition-colors" title="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>
            <button onClick={toggleCart} className="relative flex items-center gap-1.5 text-sm hover:text-primary transition-colors" title="Cart">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                  {itemCount}
                </span>
              )}
              <span className="hidden md:inline">Cart</span>
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden ml-2" title="Menu">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background p-4 animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/shop?category=${cat.slug}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{cat.icon}</span> {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {isCartOpen && <MiniCart />}
    </>
  );
};

export default Header;
