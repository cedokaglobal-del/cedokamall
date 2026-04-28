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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
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
        return next.sort((left, right) => (right.reviews || 0) - (left.reviews || 0));
    }
  }, [dealsOnly, priceRange, products, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">
              {dealsOnly ? 'Flash Deals' : 'Shop All Products'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} products found
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
            </select>
            <Link
              to="/"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </div>
        </div>

        <div className="mb-6 lg:hidden">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="h-4 w-4" />
            Categories
          </h3>
          <div className="relative">
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background p-1.5 transition-colors hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex gap-2 overflow-x-auto px-8 pb-2 scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
                    selectedCategory === category.slug
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <category.icon className="mr-2 inline h-4 w-4" />
                  {category.name}
                </button>
              ))}
            </div>
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background p-1.5 transition-colors hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="hidden w-56 flex-shrink-0 space-y-6 lg:block">
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="h-4 w-4" />
                Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                      selectedCategory === category.slug
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold">Price Range</h3>
              <input
                type="range"
                min={0}
                max={2000000}
                step={10000}
                value={priceRange[1]}
                onChange={(event) => setPriceRange([0, Number(event.target.value)])}
                className="w-full accent-primary"
              />
              <p className="text-xs text-muted-foreground">
                Up to ₦{priceRange[1].toLocaleString()}
              </p>
            </div>
          </aside>

          <div className="w-full flex-1 lg:w-auto">
            {isLoading && products.length === 0 ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                <p className="text-lg font-semibold text-destructive">Unable to load products</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  We could not reach the catalog right now. Please refresh the page shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {filteredProducts.length === 0 && hasLoaded && (
                  <div className="py-20 text-center text-muted-foreground">
                    <p className="text-lg">No products found</p>
                    <p className="text-sm">Try adjusting your filters</p>
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
