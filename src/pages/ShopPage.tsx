import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { buildCategories, slugifyCategory } from '@/data/products';
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
  getItemListSchema,
  SEO_CONFIG,
} from '@/config/seo';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { useProductStore } from '@/store/productStore';
import { trackSearch } from '@/utils/tracking';

const DEFAULT_PRICE_RANGE: [number, number] = [0, 0];

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category')?.toLowerCase();
  const searchTerm = searchParams.get('q') || searchParams.get('search');
  const dealsOnly = searchParams.get('deals') === 'true';

  useEffect(() => { if (searchTerm) trackSearch(searchTerm); }, [searchTerm]);

  const products = useProductStore((state) => state.products);
  const isLoading = useProductStore((state) => state.isLoading);
  const error = useProductStore((state) => state.error);
  const hasLoaded = useProductStore((state) => state.hasLoaded);
  const categories = useMemo(() => buildCategories(products), [products]);

  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const hasInitializedPriceRange = useRef(false);

  const maxProductPrice = useMemo(
    () => products.reduce((highest, product) => Math.max(highest, product.price), 0),
    [products]
  );
  const sliderMax = maxProductPrice > 0 ? maxProductPrice : 100000;
  const sliderStep = Math.max(1000, Math.ceil(sliderMax / 100));
  const activeCategory = useMemo(
    () => categories.find((category) => category.slug === (categoryParam || selectedCategory)),
    [categories, categoryParam, selectedCategory]
  );

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      return;
    }

    setSelectedCategory('all');
  }, [categoryParam]);

  useEffect(() => {
    if (sliderMax <= 0) {
      return;
    }

    setPriceRange((current) => {
      if (!hasInitializedPriceRange.current) {
        hasInitializedPriceRange.current = true;
        return [0, sliderMax];
      }

      if (current[1] > sliderMax) {
        return [0, sliderMax];
      }

      return current;
    });
  }, [sliderMax]);

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

  const pageTitle = activeCategory
    ? `${activeCategory.name} in Nigeria - Cedokamall`
    : dealsOnly
      ? 'Flash Deals on Electricals and Gadgets - Cedokamall'
      : 'Shop Electrical Equipment, Gadgets and Appliances - Cedokamall';

  const pageDescription = activeCategory
    ? `Shop original ${activeCategory.name.toLowerCase()} in Nigeria with warranty support, trusted brands and nationwide delivery from Cedokamall.`
    : dealsOnly
      ? 'Explore flash deals on original electrical equipment, home appliances and gadgets with warranties and nationwide delivery.'
      : 'Browse original electrical equipment, appliances and gadgets by category, brand and price range on Cedokamall.';

  const pageKeywords = [
    'electrical equipment Nigeria',
    'gadgets with warranty',
    'home appliances Nigeria',
    ...(activeCategory ? [activeCategory.name, `${activeCategory.name} Nigeria`] : []),
    ...(searchTerm ? [searchTerm, `${searchTerm} Nigeria`] : []),
  ];

  const pageUrl = activeCategory
    ? `${SEO_CONFIG.siteUrl}/shop?category=${activeCategory.slug}`
    : dealsOnly
      ? `${SEO_CONFIG.siteUrl}/shop?deals=true`
      : `${SEO_CONFIG.siteUrl}/shop`;

  useSEO({
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    url: searchTerm ? `${SEO_CONFIG.siteUrl}/shop` : pageUrl,
    type: 'website',
    robots: searchTerm ? 'noindex, follow' : 'index, follow',
  });

  const structuredDataSchemas = useMemo(
    () => [
      getBreadcrumbSchema([
        { name: 'Home', url: SEO_CONFIG.siteUrl },
        { name: 'Shop', url: `${SEO_CONFIG.siteUrl}/shop` },
        ...(activeCategory
          ? [
              {
                name: activeCategory.name,
                url: `${SEO_CONFIG.siteUrl}/shop?category=${activeCategory.slug}`,
              },
            ]
          : []),
      ]),
      getCollectionPageSchema({
        name: activeCategory
          ? `${activeCategory.name} Collection`
          : dealsOnly
            ? 'Flash Deals'
            : 'Shop All Products',
        description: pageDescription,
        url: searchTerm ? `${SEO_CONFIG.siteUrl}/shop` : pageUrl,
        itemCount: filteredProducts.length,
      }),
      getItemListSchema(
        filteredProducts.slice(0, 24).map((product, index) => ({
          position: index + 1,
          name: product.name,
          url: `${SEO_CONFIG.siteUrl}/product/${product.id}`,
          image: product.image,
        }))
      ),
    ],
    [activeCategory, dealsOnly, filteredProducts, pageDescription, pageUrl, searchTerm]
  );

  useStructuredData(structuredDataSchemas);

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      <div className="container py-6 sm:py-12">
        <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-navy">
              {activeCategory?.name || (dealsOnly ? 'Elite Deals' : 'Premium Catalog')}
            </h1>
            <div className="mt-2 h-1 w-16 bg-gold" />
            <p className="mt-4 max-w-2xl break-words text-sm leading-6 text-navy/60">{pageDescription}</p>
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
              className="flex items-center gap-2 rounded-md bg-navy px-5 py-2.5 text-sm font-bold text-gold shadow-md transition-all hover:bg-gold hover:text-navy"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </div>
        </div>

        <div className="mb-10 lg:hidden">
          <div className="relative">
            <div
              className="flex gap-3 overflow-x-auto pb-4 no-scrollbar"
            >
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 whitespace-nowrap rounded-md px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
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
                  className={`flex-shrink-0 whitespace-nowrap rounded-md px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
                    selectedCategory === category.slug
                      ? 'bg-gold text-navy shadow-lg'
                      : 'bg-white text-navy/60 hover:text-navy'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs font-medium text-navy/45">Swipe left or right to view more categories.</p>
          </div>
        </div>

        <div className="flex gap-10">
          <aside className="hidden w-64 flex-shrink-0 lg:block sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto space-y-10">
            <div>
              <h3 className="mb-6 flex items-center gap-3 font-serif text-xl font-bold text-navy">
                <SlidersHorizontal className="h-5 w-5 text-gold" />
                Collections
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`block w-full rounded-md px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-navy text-gold shadow-md translate-x-2'
                      : 'text-navy/60 hover:bg-white hover:text-navy'
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
                        : 'text-navy/60 hover:bg-white hover:text-navy'
                    }`}
                  >
                    <span className="inline-flex items-center gap-3">
                      <category.icon
                        className={`h-4 w-4 ${
                          selectedCategory === category.slug ? 'text-gold' : 'text-navy/40'
                        }`}
                      />
                      {category.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

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
              />
              <div className="mt-4 flex justify-between">
                <span className="text-[10px] font-bold uppercase tracking-tighter text-navy/40">
                  Budget
                </span>
                <span className="text-sm font-bold text-navy">{`₦${priceRange[1].toLocaleString()}`}</span>
              </div>
            </div>

          </aside>

          <div className="w-full flex-1">
            {isLoading && products.length === 0 ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gold/10 border-t-gold" />
              </div>
            ) : error ? (
              <div className="rounded-md border border-gold-antique/20 bg-white p-6 sm:p-12 text-center shadow-premium">
                <p className="text-xl font-serif font-bold text-navy">Experience Interrupted</p>
                <p className="mt-2 text-sm font-sans text-navy/60">
                  We are unable to present our catalog at this moment. Please return shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {filteredProducts.length === 0 && hasLoaded && (
                  <div className="rounded-md border border-gold-antique/10 bg-white py-16 sm:py-32 text-center">
                    <p className="font-serif text-2xl font-bold text-navy">No Matches Found</p>
                    <p className="mt-2 text-sm text-navy/40">
                      Refine your selection or explore other collections
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setPriceRange([0, sliderMax]);
                      }}
                      className="mt-6 rounded-md bg-navy px-8 py-3 text-xs font-bold uppercase tracking-widest text-gold transition-all hover:bg-gold hover:text-navy"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {categories.length > 0 && (
          <section className="mt-8 sm:mt-16 rounded-md border border-gold-antique/10 bg-white p-4 sm:p-6 md:p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-navy">
              Browse Every Product Category on Cedokamall
            </h2>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-navy/70">
              Explore original electrical equipment and gadgets across our full catalog, including TVs,
              refrigerators, air conditioners, smartphones, laptops, sound systems, generators, fans and
              more. Every category is curated to help shoppers in Nigeria compare reliable products,
              warranties and price ranges quickly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/shop?category=${category.slug}`}
                  className="rounded-full border border-gold-antique/20 bg-ivory px-4 py-2 text-xs font-bold uppercase tracking-widest text-navy transition-colors hover:border-gold hover:text-gold"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ShopPage;
