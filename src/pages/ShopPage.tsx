import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { buildCategories, slugifyCategory } from '@/data/products';
import { useProductStore } from '@/store/productStore';
import { SlidersHorizontal, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const qParam = searchParams.get('q');
  
  const { products } = useProductStore();
  const categories = useMemo(() => buildCategories(products), [products]);
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update category if param changes
  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  const filtered = useMemo(() => {
    let result = [...products];
    
    // Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => slugifyCategory(p.category) === selectedCategory);
    }
    
    // Search Query Filter
    if (qParam) {
      const term = qParam.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term) ||
        p.seller.toLowerCase().includes(term)
      );
    }
    
    // Price Filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    // Sorting
    switch (sortBy) {
      case 'price-low': return result.sort((a, b) => a.price - b.price);
      case 'price-high': return result.sort((a, b) => b.price - a.price);
      case 'newest': {
        return result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      }
      case 'rating': return result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default: return result.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    }
  }, [products, selectedCategory, qParam, sortBy, priceRange]);


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">Shop All Products</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} products found</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-background">
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
            </select>
            <Link to="/" className="flex items-center gap-1.5 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm whitespace-nowrap">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
          </div>
        </div>

        {/* Mobile Categories (visible on small/medium screens) */}
        <div className="lg:hidden mb-6">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Categories
          </h3>
          <div className="relative">
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background border rounded-full p-1.5 hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex gap-2 overflow-x-auto pb-2 px-8 scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === c.slug
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <c.icon className="w-4 h-4" /> {c.name}
                </button>
              ))}
            </div>
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background border rounded-full p-1.5 hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar filters */}
          <aside className="hidden lg:block w-56 flex-shrink-0 space-y-6">
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" /> Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`block w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                    selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`block w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                      selectedCategory === c.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <c.icon className="w-4 h-4" />
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">Price Range</h3>
              <input
                type="range"
                min={0}
                max={2000000}
                step={10000}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="w-full accent-primary"
              />
              <p className="text-xs text-muted-foreground">Up to ₦{priceRange[1].toLocaleString()}</p>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">No products found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShopPage;
