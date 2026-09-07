import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sprout, MessageSquare, Leaf, SlidersHorizontal } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProductStore } from '@/store/productStore';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { getBreadcrumbSchema, getCollectionPageSchema, SEO_CONFIG } from '@/config/seo';
import { MAJOR_CATEGORY_MAP, FARM_CATEGORIES } from '@/data/catalog';

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const FarmsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const products = useProductStore((s) => s.products);
  const isLoading = useProductStore((s) => s.isLoading);
  const hasLoaded = useProductStore((s) => s.hasLoaded);

  const farms = MAJOR_CATEGORY_MAP['farms'];
  const urlCategory = searchParams.get('category') || 'all';
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const hasInitializedPriceRange = useRef(false);

  const activeCategory = useMemo(() => {
    if (urlCategory === 'all') return null;
    return farms.subcategories.find((sub) => sub.slug === urlCategory)?.name ?? null;
  }, [urlCategory, farms.subcategories]);

  const farmProducts = useMemo(() => {
    return products.filter((p) => FARM_CATEGORIES.includes(p.category));
  }, [products]);

  const maxProductPrice = useMemo(
    () => farmProducts.reduce((highest, product) => Math.max(highest, product.price), 0),
    [farmProducts]
  );
  const sliderMax = maxProductPrice > 0 ? maxProductPrice : 100000;
  const sliderStep = Math.max(1000, Math.ceil(sliderMax / 100));

  useEffect(() => {
    if (sliderMax <= 0) return;
    setPriceRange((current) => {
      if (!hasInitializedPriceRange.current) {
        hasInitializedPriceRange.current = true;
        return [0, sliderMax];
      }
      if (current[1] > sliderMax) return [0, sliderMax];
      return current;
    });
  }, [sliderMax]);

  const filteredProducts = useMemo(() => {
    let next = !activeCategory
      ? [...farmProducts]
      : farmProducts.filter((p) => slugify(p.category) === slugify(activeCategory));

    next = next.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-low':
        return next.sort((a, b) => a.price - b.price);
      case 'price-high':
        return next.sort((a, b) => b.price - a.price);
      case 'newest':
        return next.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      case 'rating':
        return next.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return next.sort((a, b) => {
          const scoreA = (a.salesCount || 0) + (a.searchCount || 0);
          const scoreB = (b.salesCount || 0) + (b.searchCount || 0);
          if (scoreA === scoreB) return (b.reviews || 0) - (a.reviews || 0);
          return scoreB - scoreA;
        });
    }
  }, [farmProducts, activeCategory, priceRange, sortBy]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') params.delete('category');
    else params.set('category', value);
    setSearchParams(params, { replace: true });
  };

  useSEO({
    title: 'Farms - Fresh Produce, Agricultural Products & Equipment | Cedokamall',
    description:
      'Shop farm produce, agricultural products, equipment and supplies on Cedokamall. Browse by category and contact us for seasonal and bulk availability across Nigeria.',
    keywords: [
      'farm produce Nigeria',
      'agricultural products Nigeria',
      'farm equipment Nigeria',
      'farm supplies Nigeria',
      'buy farm products online Nigeria',
    ],
    url: `${SEO_CONFIG.siteUrl}/farms`,
    type: 'website',
  });

  useStructuredData([
    getBreadcrumbSchema([
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Farms', url: `${SEO_CONFIG.siteUrl}/farms` },
    ]),
    getCollectionPageSchema({
      name: 'Farms - Cedokamall',
      description: 'Farm produce, agricultural products, equipment and supplies.',
      url: `${SEO_CONFIG.siteUrl}/farms`,
      itemCount: filteredProducts.length,
    }),
  ]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-ivory">
      <Header />

      <div className="container min-w-0 py-6 pb-28 sm:py-12">
        {/* Title + Sort Bar */}
        <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-navy">Farms</h1>
            <div className="mt-2 h-1 w-16 bg-gold" />
            <p className="mt-4 max-w-2xl text-sm leading-6 text-navy/60">
              Fresh farm produce, agricultural products, equipment and supplies across Nigeria.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-md border border-gold-antique/20 bg-white px-4 py-2.5 text-sm font-medium text-navy focus:outline-none focus:ring-1 focus:ring-gold"
              aria-label="Sort farm products"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest Collections</option>
              <option value="rating">Top Rated</option>
            </select>
            <Link
              to="/"
              className="flex items-center gap-2 rounded-md bg-navy px-5 py-2.5 text-sm font-bold text-gold shadow-md transition-all hover:bg-gold hover:text-navy"
            >
              Home
            </Link>
          </div>
        </div>

        {/* Mobile Category Strip */}
        <div className="mb-10 lg:hidden">
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
              <button
                type="button"
                onClick={() => handleTabChange('all')}
                className={`flex-shrink-0 whitespace-nowrap rounded-md px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all touch-manipulation ${
                  urlCategory === 'all'
                    ? 'bg-gold text-navy shadow-lg'
                    : 'bg-white text-navy/60 hover:text-navy'
                }`}
              >
                All Farm
              </button>
              {farms.subcategories.map((sub) => (
                <button
                  key={sub.slug}
                  type="button"
                  onClick={() => handleTabChange(sub.slug)}
                  className={`flex-shrink-0 whitespace-nowrap rounded-md px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all touch-manipulation ${
                    urlCategory === sub.slug
                      ? 'bg-gold text-navy shadow-lg'
                      : 'bg-white text-navy/60 hover:text-navy'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-10">
          {/* Sidebar (Desktop) */}
          <aside className="hidden w-64 flex-shrink-0 lg:block sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto space-y-10">
            {/* Category Filter */}
            <div>
              <h3 className="mb-6 flex items-center gap-3 font-serif text-xl font-bold text-navy">
                <SlidersHorizontal className="h-5 w-5 text-gold" />
                Collections
              </h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleTabChange('all')}
                  className={`block w-full rounded-md px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                    urlCategory === 'all'
                      ? 'bg-navy text-gold shadow-md translate-x-2'
                      : 'text-navy/60 hover:bg-white hover:text-navy'
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <Leaf className={`h-4 w-4 ${urlCategory === 'all' ? 'text-gold' : 'text-navy/40'}`} />
                    All Farm
                  </span>
                </button>
                {farms.subcategories.map((sub) => (
                  <button
                    key={sub.slug}
                    type="button"
                    onClick={() => handleTabChange(sub.slug)}
                    className={`block w-full rounded-md px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                      urlCategory === sub.slug
                        ? 'bg-navy text-gold shadow-md translate-x-2'
                        : 'text-navy/60 hover:bg-white hover:text-navy'
                    }`}
                  >
                    <span className="inline-flex items-center gap-3">
                      <Leaf className={`h-4 w-4 ${urlCategory === sub.slug ? 'text-gold' : 'text-navy/40'}`} />
                      {sub.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="rounded-md border border-gold-antique/10 bg-white p-6">
              <h3 className="mb-4 font-serif text-lg font-bold text-navy">Price range</h3>
              <input
                type="range"
                min={0}
                max={sliderMax}
                step={sliderStep}
                value={priceRange[1]}
                onChange={(event) => setPriceRange([0, Number(event.target.value)])}
                className="w-full cursor-pointer appearance-none rounded-full bg-ivory accent-gold"
                aria-label="Maximum price"
              />
              <div className="mt-4 flex justify-between">
                <span className="text-[10px] font-bold uppercase tracking-tighter text-navy/40">
                  Budget
                </span>
                <span className="text-sm font-bold text-navy">{`₦${priceRange[1].toLocaleString()}`}</span>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="w-full min-w-0 flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy">
                {activeCategory ? activeCategory : 'Farm Products'}
              </h2>
            </div>

        {isLoading && products.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gold/10 border-t-gold" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gold-antique/10 bg-white py-12 sm:py-16 text-center px-4">
            <Sprout className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gold/30" />
            <p className="mt-3 font-serif text-xl sm:text-2xl font-bold text-navy">Farm listings are being prepared</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-navy/55">
              We are adding farm produce, equipment and supplies to this section. In the meantime, tell us
              what you need and our team will help with seasonal and bulk availability.
            </p>
            <a
              href="https://wa.me/2349128817136"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-navy transition-all hover:bg-gold-antique hover:text-white touch-manipulation"
            >
              <MessageSquare className="h-4 w-4" />
              Ask about farm products
            </a>
          </div>
        )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FarmsPage;
