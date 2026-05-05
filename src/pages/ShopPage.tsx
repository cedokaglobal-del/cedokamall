import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { buildCategories, slugifyCategory } from '@/data/products';
import { useProductStore } from '@/store/productStore';

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchTerm = searchParams.get('q') || searchParams.get('search');
  const dealsOnly = searchParams.get('deals') === 'true';

  const { products, isLoading, error, hasLoaded } = useProductStore();
  const categories = useMemo(() => buildCategories(products), [products]);

  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      return;
    }

    setSelectedCategory('all');
  }, [categoryParam]);

  const checkScroll = () => {
    if (!scrollContainerRef.current) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) {
      return;
    }

    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -200 : 200,
      behavior: 'smooth',
    });

    window.setTimeout(checkScroll, 300);
  };

  const filteredProducts = useMemo(() => {
    let next = [...products];

    if (dealsOnly) {
      next = next.filter((product) => product.badge === 'FLASH DEAL');
    }

    if (selectedCategory !== 'all') {
      next = next.filter((product) => slugifyCategory(product.category) === selectedCategory);
    }

    if (searchTerm) {
      const normalizedTerm = searchTerm.toLowerCase();
      next = next.filter(
        (product) =>
          product.name.toLowerCase().includes(normalizedTerm) ||
          product.description.toLowerCase().includes(normalizedTerm) ||
          product.seller.toLowerCase().includes(normalizedTerm)
      );
    }

    next = next.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    switch (sortBy) {
      case 'price-low':
        return next.sort((left, right) => left.price - right.price);
      case 'price-high':
        return next.sort((left, right) => right.price - left.price);
      case 'newest':
        return next.sort(
          (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime()
        );
      case 'rating':
        return next.sort((left, right) => (right.rating || 0) - (left.rating || 0));
      default:
        return next.sort((a, b) => {
          const scoreA = (a.salesCount || 0) + (a.searchCount || 0);
          const scoreB = (b.salesCount || 0) + (b.searchCount || 0);
          if (scoreA === scoreB) {
            return (b.reviews || 0) - (a.reviews || 0);
          }
          return scoreB - scoreA;
        });
    }
  }, [dealsOnly, priceRange, products, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      <div className="container py-12">
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-4xl font-bold text-navy">
              {dealsOnly ? 'Elite Deals' : 'Premium Catalog'}
            </h1>
            <div className="h-1 w-16 bg-gold mt-2" />
          </div>
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-md border border-gold-antique/20 bg-white px-4 py-2.5 text-sm font-medium text-navy focus:outline-none focus:ring-1 focus:ring-gold"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest Collections</option>
              <option value="rating">Top Rated</option>
            </select>
            <Link
              to="/"
              className="flex items-center gap-2 rounded-md bg-navy text-gold px-5 py-2.5 text-sm font-bold shadow-md hover:bg-gold hover:text-navy transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </div>
        </div>

        {/* Mobile categories scroll */}
        <div className="mb-10 lg:hidden">
          <div className="relative">
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex gap-3 overflow-x-auto pb-4 no-scrollbar"
            >
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 whitespace-nowrap rounded-md px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-gold text-navy shadow-lg'
                    : 'bg-white text-navy/60 hover:text-navy'
                }`}
              >
                All Collections
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`flex-shrink-0 whitespace-nowrap rounded-md px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                    selectedCategory === category.slug
                      ? 'bg-gold text-navy shadow-lg'
                      : 'bg-white text-navy/60 hover:text-navy'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-10">
          <aside className="hidden w-64 flex-shrink-0 space-y-10 lg:block">
            <div>
              <h3 className="mb-6 font-serif text-xl font-bold text-navy flex items-center gap-3">
                <SlidersHorizontal className="h-5 w-5 text-gold" />
                Collections
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`block w-full rounded-md px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-navy text-gold shadow-md translate-x-2'
                      : 'text-navy/60 hover:text-navy hover:bg-white'
                  }`}
                >
                  All Masterpieces
                </button>
                {categories.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`block w-full rounded-md px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                      selectedCategory === category.slug
                        ? 'bg-navy text-gold shadow-md translate-x-2'
                        : 'text-navy/60 hover:text-navy hover:bg-white'
                    }`}
                  >
                    <span className="inline-flex items-center gap-3">
                      <category.icon className={`h-4 w-4 ${selectedCategory === category.slug ? 'text-gold' : 'text-navy/40'}`} />
                      {category.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-md border border-gold-antique/10">
              <h3 className="mb-4 font-serif text-lg font-bold text-navy">Price range</h3>
              <input
                type="range"
                min={0}
                max={10000000}
                step={50000}
                value={priceRange[1]}
                onChange={(event) => setPriceRange([0, Number(event.target.value)])}
                className="w-full accent-gold h-1.5 bg-ivory rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-4">
                <span className="text-[10px] font-bold text-navy/40 uppercase tracking-tighter">Budget</span>
                <span className="text-sm font-bold text-navy">₦{priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </aside>

          <div className="w-full flex-1">
            {isLoading && products.length === 0 ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gold/10 border-t-gold" />
              </div>
            ) : error ? (
              <div className="rounded-md border border-gold-antique/20 bg-white p-12 text-center shadow-premium">
                <p className="text-xl font-serif font-bold text-navy">Experience Interrupted</p>
                <p className="mt-2 text-sm text-navy/60 font-sans">
                  We are unable to present our catalog at this moment. Please return shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {filteredProducts.length === 0 && hasLoaded && (
                  <div className="py-32 text-center bg-white rounded-md border border-gold-antique/10">
                    <p className="font-serif text-2xl font-bold text-navy">No Matches Found</p>
                    <p className="text-sm text-navy/40 mt-2">Refine your selection or explore other collections</p>
                    <button 
                      onClick={() => {
                        setSelectedCategory('all');
                        setPriceRange([0, 2000000]);
                      }}
                      className="mt-6 px-8 py-3 bg-navy text-gold rounded-md text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-navy transition-all"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShopPage;
