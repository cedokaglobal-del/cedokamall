import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sun, ChevronRight, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import SolarPlanCard from '@/components/SolarPlanCard';
import EnergyCalculator from '@/components/EnergyCalculator';
import { useProductStore } from '@/store/productStore';
import { useSolarCategoryStore } from '@/store/solarCategoryStore';
import { useSolarPlanStore } from '@/store/solarPlanStore';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { getBreadcrumbSchema, getCollectionPageSchema, SEO_CONFIG } from '@/config/seo';

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const SolarPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const products = useProductStore((s) => s.products);
  const isLoading = useProductStore((s) => s.isLoading);
  const error = useProductStore((s) => s.error);
  const hasLoaded = useProductStore((s) => s.hasLoaded);
  const solarCategories = useSolarCategoryStore((s) => s.categories);
  const plans = useSolarPlanStore((s) => s.plans);
  const fetchPlans = useSolarPlanStore((s) => s.fetchPlans);

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);

  const SOLAR_TABS = useMemo(() => [
    { slug: 'all', label: 'All Solar' },
    ...solarCategories.map((cat) => ({ slug: slugify(cat), label: cat })),
  ], [solarCategories]);

  const SOLAR_CATEGORY_NAMES = useMemo(() =>
    SOLAR_TABS.slice(1).map((t) => t.label),
  [SOLAR_TABS]);

  const urlCategory = searchParams.get('category') || 'all';
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const hasInitializedPriceRange = useRef(false);

  const maxProductPrice = useMemo(
    () => products.reduce((highest, product) => Math.max(highest, product.price), 0),
    [products]
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

  const activeCategory = useMemo(() => {
    if (urlCategory === 'all') return null;
    const tab = SOLAR_TABS.find((t) => t.slug === urlCategory);
    return tab?.label ?? null;
  }, [urlCategory, SOLAR_TABS]);

  const solarProducts = useMemo(() => {
    return products.filter((p) => SOLAR_CATEGORY_NAMES.includes(p.category) || p.category === 'Solar');
  }, [products, SOLAR_CATEGORY_NAMES]);

  const filteredProducts = useMemo(() => {
    let next = [...solarProducts];

    if (activeCategory) {
      next = next.filter((p) => p.category === activeCategory);
    }

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
  }, [solarProducts, activeCategory, priceRange, sortBy]);

  const handleTabChange = useCallback((slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  useSEO({
    title: 'Solar Energy Solutions - Solar Panels, Inverters & Batteries | Cedokamall',
    description: 'Shop premium solar panels, inverters, batteries, charge controllers and accessories in Nigeria. Get the right solar system for your home or office with our Energy Calculator.',
    keywords: ['solar panels Nigeria', 'solar inverters', 'solar batteries', 'solar energy Nigeria', 'off-grid solar', 'solar installation Nigeria'],
    url: `${SEO_CONFIG.siteUrl}/solar`,
    type: 'website',
  });

  useStructuredData([
    getBreadcrumbSchema([
      { name: 'Home', url: SEO_CONFIG.siteUrl },
      { name: 'Solar Energy', url: `${SEO_CONFIG.siteUrl}/solar` },
    ]),
    getCollectionPageSchema({
      name: 'Solar Energy Solutions - Cedokamall',
      description: 'Premium solar panels, inverters, batteries and accessories.',
      url: `${SEO_CONFIG.siteUrl}/solar`,
      itemCount: filteredProducts.length,
    }),
  ]);

  return (
    <div className="min-h-screen bg-ivory">
      <Header />

      {/* Hero */}
      <section className="relative flex items-center border-b border-gold-antique/20 bg-navy text-champagne min-h-[240px] sm:min-h-[320px]">
        <div className="container relative z-10 py-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-champagne/50 mb-4">
            <Link to="/" className="transition-colors hover:text-gold">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gold">Solar Energy</span>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20">
              <Sun className="h-5 w-5 text-gold" />
            </div>
            <span className="rounded-full bg-gold/15 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              Clean Energy
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white max-w-2xl leading-tight">
            Power Your World with Clean Solar Energy
          </h1>
          <p className="mt-3 text-sm text-champagne/70 max-w-xl leading-relaxed">
            Premium solar panels, inverters, batteries, and accessories at the best prices in Nigeria.
            Find the perfect system for your home or business.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#solar-products"
              className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-xs font-bold uppercase tracking-widest text-navy transition-all hover:bg-gold-antique hover:text-white shadow-lg"
            >
              Shop Solar Products
            </a>
            <a
              href="#solar-calculator"
              className="inline-flex items-center gap-2 rounded-md border border-gold/30 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-widest text-champagne transition-all hover:bg-white/10"
            >
              Calculate My Energy Needs
            </a>
          </div>
      </div>
    </section>

      {/* Guided shopping */}
      <section className="border-b border-gold-antique/10 bg-white">
        <div className="container py-10 sm:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Choose with confidence</span>
              <h2 className="mt-3 font-serif text-2xl font-bold text-navy sm:text-3xl">
                Find the right solar solution
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-navy/65">
                Sizing a system starts with your daily power needs. Use our calculator to estimate the panel,
                battery and inverter capacity for your home or office, then shop the matching components.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#solar-calculator"
                  className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-xs font-bold uppercase tracking-widest text-navy transition-all hover:bg-gold-antique hover:text-white"
                >
                  Use the energy calculator
                </a>
                <Link
                  to="/solar"
                  className="inline-flex items-center gap-2 rounded-md border border-gold/30 px-6 py-3 text-xs font-bold uppercase tracking-widest text-navy transition-all hover:bg-navy hover:text-gold"
                >
                  Browse all products
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { step: '1', title: 'List your loads', text: 'Note the appliances you want to run and their wattage.' },
                { step: '2', title: 'Size the system', text: 'The calculator suggests panel, battery and inverter ratings.' },
                { step: '3', title: 'Shop & install', text: 'Buy the components and arrange installation with our team.' },
              ].map((item) => (
                <div key={item.step} className="rounded-md border border-gold-antique/10 bg-ivory p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-gold font-bold">
                    {item.step}
                  </div>
                  <p className="mt-3 text-sm font-bold text-navy">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-navy/60">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Title + Sort Bar */}
        <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-navy">
              Solar Energy Collection
            </h2>
            <div className="mt-2 h-1 w-16 bg-gold" />
            <p className="mt-4 max-w-2xl text-sm leading-6 text-navy/60">
              Premium solar panels, inverters, batteries and accessories at the best prices in Nigeria.
            </p>
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

        {/* Mobile Category Strip */}
        <div className="mb-10 lg:hidden">
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
              {SOLAR_TABS.map((tab) => (
                <button
                  key={tab.slug}
                  type="button"
                  onClick={() => handleTabChange(tab.slug)}
                  className={`flex-shrink-0 whitespace-nowrap rounded-md px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
                    urlCategory === tab.slug
                      ? 'bg-gold text-navy shadow-lg'
                      : 'bg-white text-navy/60 hover:text-navy'
                  }`}
                >
                  {tab.label}
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
                {SOLAR_TABS.map((tab) => (
                  <button
                    key={tab.slug}
                    type="button"
                    onClick={() => handleTabChange(tab.slug)}
                    className={`block w-full rounded-md px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.1em] transition-all ${
                      urlCategory === tab.slug
                        ? 'bg-navy text-gold shadow-md translate-x-2'
                        : 'text-navy/60 hover:bg-white hover:text-navy'
                    }`}
                  >
                    <span className="inline-flex items-center gap-3">
                      <Sun className={`h-4 w-4 ${urlCategory === tab.slug ? 'text-gold' : 'text-navy/40'}`} />
                      {tab.label}
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
          <div className="w-full flex-1">
            <div id="solar-products">
              {isLoading && solarProducts.length === 0 ? (
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-gold/10 border-t-gold" />
                </div>
              ) : error ? (
                <div className="rounded-md border border-gold-antique/20 bg-white p-12 text-center shadow-premium">
                  <p className="text-xl font-serif font-bold text-navy">Experience Interrupted</p>
                  <p className="mt-2 text-sm text-navy/60">
                    We are unable to present our catalog at this moment. Please return shortly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  {filteredProducts.length === 0 && hasLoaded && (
                    <div className="rounded-md border border-gold-antique/10 bg-white py-16 sm:py-32 text-center">
                      <Sun className="mx-auto h-12 w-12 text-gold/30" />
                      <p className="mt-4 font-serif text-2xl font-bold text-navy">No Solar Products Found</p>
                      <p className="mt-2 text-sm text-navy/40">
                        Try adjusting your filters or explore other categories
                      </p>
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.delete('category');
                          setSearchParams(params, { replace: true });
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
        </div>

        {/* System plans */}
        {plans.filter((p) => p.isActive).length > 0 && (
          <section className="mt-16">
            <div className="mb-8 text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Tailored for your needs</span>
              <h2 className="mt-3 font-serif text-2xl font-bold text-navy sm:text-3xl">Solar System Plans</h2>
              <div className="mx-auto mt-3 h-1 w-16 bg-gold" />
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-navy/60">
                Ready-made solar packages designed for homes and offices. Each plan details exactly what you get, what it can power, and how long it lasts.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.filter((p) => p.isActive).map((plan) => (
                <SolarPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </section>
        )}

        {/* Energy Calculator */}
        <div id="solar-calculator" className="mt-16">
          <EnergyCalculator />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SolarPage;
