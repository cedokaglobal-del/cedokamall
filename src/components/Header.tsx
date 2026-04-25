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
      <div className="bg-primary text-primary-foreground text-xs py-1.5">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Delivery Across Nigeria</span>
            <span className="hidden sm:flex items-center gap-1"><Phone className="w-3 h-3" /> <Link to="tel:09128817136" className="hover:text-emerald-light transition-colors">09128817136</Link></span>
          </div>

        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="container flex items-center gap-2 sm:gap-4 py-2 flex-wrap md:flex-nowrap">
          {/* Logo — fixed height with auto width keeps it proportional on all screens */}
          <Link to="/" className="flex-shrink-0 flex items-center" aria-label="Cedokamall Home">
            <img
              src="/logo.png"
              alt="Cedokamall"
              className="object-contain"
              style={{ height: '48px', width: 'auto', maxWidth: '160px' }}
            />
          </Link>

          {/* Categories dropdown - hidden on mobile and tablet */}
          {categories.length > 0 && (
            <div className="relative hidden xl:block">
              <button
                type="button"
                onClick={() => setCatMenuOpen(!catMenuOpen)}
                className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-light transition-colors whitespace-nowrap"
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
                      <cat.icon className="w-4 h-4" />
                      <span>{cat.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{cat.count}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search - full width on mobile, constrained on desktop */}
          <form onSubmit={handleSearch} className="flex-1 min-w-0 w-full md:max-w-xl relative order-3 md:order-none">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search products..."
              className="w-full pl-4 pr-10 py-2.5 rounded-lg border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-primary transition-colors flex-shrink-0" aria-label="Search">
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Link to="/wishlist" className="hidden sm:flex items-center justify-center p-2 hover:text-primary transition-colors rounded-lg hover:bg-muted" title="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>
            <button type="button" onClick={toggleCart} className="relative flex items-center justify-center p-2 hover:text-primary transition-colors rounded-lg hover:bg-muted" title="Cart">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
              <span className="hidden md:inline ml-1">Cart</span>
            </button>
            <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:text-primary transition-colors rounded-lg hover:bg-muted" title="Menu">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && categories.length > 0 && (
          <div className="md:hidden border-t bg-background p-4 animate-in slide-in-from-top duration-300 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/shop?category=${cat.slug}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors overflow-hidden"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <cat.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{cat.name}</span>
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
