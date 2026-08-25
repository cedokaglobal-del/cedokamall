import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, MapPin, Phone, ChevronDown, Sun, LayoutGrid, Sprout } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { buildCategories, slugifyCategory } from '@/data/products';
import { useProductStore } from '@/store/productStore';
import { useSolarCategoryStore } from '@/store/solarCategoryStore';
import { cn } from '@/lib/utils';
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

  const isSolarPage = location.pathname === '/solar';
  const solarCategories = useSolarCategoryStore((s) => s.categories);

  // Solar subcategory links for the dropdown when on /solar
  const solarCategoryLinks = useMemo(() => {
    return solarCategories.map((name) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return { name, slug };
    });
  }, [solarCategories]);

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
      navigate('/shop');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val === '' && location.pathname === '/shop') {
      navigate('/shop');
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-navy text-champagne text-xs sm:text-sm py-2 sm:py-2.5 border-b border-gold-antique/20">
        <div className="container flex justify-between items-center font-sans gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap min-w-0">
            <span className="flex items-center gap-1 opacity-90 text-xs sm:text-sm whitespace-nowrap">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gold flex-shrink-0" /> 
              <span className="hidden sm:inline">Delivery</span>
              <span className="sm:hidden">NGN</span>
            </span>
            <span className="hidden sm:flex items-center gap-1 opacity-90">
              <Phone className="w-4 h-4 text-gold flex-shrink-0" /> 
              <Link to="tel:09128817136" className="hover:text-gold">09128817136</Link>
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-navy text-champagne border-b border-gold-antique/30">
        <div className="container flex items-center gap-1 sm:gap-3 py-2.5 sm:py-3 flex-wrap md:flex-nowrap">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex-shrink-0 flex items-center mr-1 sm:mr-2 hover:scale-105"
            aria-label="Cedokamall Home"
          >
            <img
              src="/header_logo.png"
              alt="Cedokamall"
              className="object-contain"
              style={{ height: 'clamp(40px, 8vw, 56px)', width: 'auto', maxWidth: '200px' }}
              loading="eager"
              decoding="async"
            />
          </Link>

          {/* Search - moved to the left */}
          <form onSubmit={handleSearch} className="flex-1 min-w-0 w-full md:max-w-md relative order-3 md:order-none">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search..."
              className="w-full pl-3 sm:pl-5 pr-8 sm:pr-10 py-2 sm:py-2.5 rounded-lg border border-gold-antique/30 bg-navy-deep/50 text-champagne text-xs sm:text-base focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all duration-200 placeholder:text-champagne/50"
              aria-label="Search products"
            />
            <button 
              type="submit" 
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 min-h-10 min-w-10 p-1.5 hover:text-gold transition-colors duration-200 flex-shrink-0 rounded-md hover:bg-white/5"
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>

          {/* Categories - desktop */}
          <div className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => setCatMenuOpen(!catMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md whitespace-nowrap text-champagne/70 hover:text-gold transition-all duration-200"
            >
              <Menu className="w-3 h-3" /> Categories <ChevronDown className="w-2 h-2 transition-transform duration-200" />
            </button>
            {catMenuOpen && (
              <div className="absolute top-full left-0 mt-2 bg-navy-deep rounded-lg border border-gold-antique/20 p-2 w-64 z-50 max-h-[200px] overflow-y-auto">
                {(isSolarPage ? solarCategoryLinks : categories).map((item, idx) => {
                  const slug = 'slug' in item ? item.slug : (item as { name: string; slug: string }).slug;
                  const name = item.name;
                  const href = isSolarPage
                    ? `/solar?category=${slug}`
                    : `/shop?category=${slug}`;
                  return (
                    <Link
                      key={slug}
                      to={href}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gold-antique/20 hover:text-white transition-all duration-200 text-sm font-medium"
                      onClick={() => setCatMenuOpen(false)}
                    >
                      <Sun className="w-3 h-3 text-gold flex-shrink-0" />
                      <span>{name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop category links */}
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              to="/shop"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap text-champagne/70 hover:text-gold"
            >
              <LayoutGrid className="w-3 h-3" /> Electronics
            </Link>

            <Link
              to="/solar"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap text-champagne/70 hover:text-gold"
            >
              <Sun className="w-3 h-3" /> Renewable Energy
            </Link>

            <Link
              to="/farms"
              className="hidden lg-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap text-champagne/70 hover:text-gold"
            >
              <Sprout className="w-3 h-3" /> Farms
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              type="button" 
              onClick={toggleCart} 
              className="relative flex min-h-10 min-w-10 items-center justify-center p-2 sm:p-2.5 hover:text-gold transition-colors rounded-lg hover:bg-white/5 group active:scale-95"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-navy text-[10px] font-bold rounded-full shadow border border-navy">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
              <span className="hidden md:inline ml-1 font-medium text-sm">Cart</span>
            </button>
            <button 
              type="button" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden min-h-10 min-w-10 p-2 sm:p-2.5 hover:text-gold transition-colors rounded-lg hover:bg-white/5 active:scale-95"
              title="Menu"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;