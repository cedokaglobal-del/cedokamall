import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sun, ChevronRight, Filter, X, SlidersHorizontal } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import EnergyCalculator from '@/components/EnergyCalculator';
import { useProductStore } from '@/store/productStore';
import { useSolarCategoryStore } from '@/store/solarCategoryStore';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { getBreadcrumbSchema, getCollectionPageSchema, SEO_CONFIG } from '@/config/seo';
import { cn } from '@/lib/utils';

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const BRAND_COLORS: Record<string, string> = {
  'MeWe': 'from-yellow-400 via-yellow-300 to-white',
  'Samsung': 'from-blue-600 via-blue-500 to-white',
  'Apple': 'from-gray-600 via-gray-400 to-white',
  'LG': 'from-red-600 via-red-400 to-white',
  'Sony': 'from-black via-gray-700 to-white',
  'Hisense': 'from-green-700 via-green-500 to-white',
  'Nexus': 'from-purple-700 via-purple-500 to-white',
  'Maxme': 'from-orange-500 via-orange-400 to-white',
  'Sunpower': 'from-yellow-500 via-amber-400 to-white',
  'Fermax': 'from-rose-600 via-rose-400 to-white',
  'Goldstar': 'from-amber-600 via-yellow-500 to-white',
  'Apower': 'from-cyan-600 via-cyan-400 to-white',
  'Hisea': 'from-blue-500 via-sky-400 to-white',
  'Midea': 'from-sky-700 via-sky-500 to-white',
  'Thermocool': 'from-teal-600 via-teal-400 to-white',
  'Scanfrost': 'from-indigo-600 via-indigo-400 to-white',
  'Haier Thermocool': 'from-blue-700 via-blue-500 to-white',
  'Qasa': 'from-emerald-600 via-emerald-400 to-white',
  'Binatone': 'from-red-500 via-red-300 to-white',
  'Tesla': 'from-red-700 via-red-500 to-white',
};

const SolarPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const products = useProductStore((s) => s.products);
  const isLoading = useProductStore((s) => s.isLoading);
  const hasLoaded = useProductStore((s) => s.hasLoaded);
  const solarCategories = useSolarCategoryStore((s) => s.categories);

  const SOLAR_TABS = useMemo(() => [
    { slug: 'all', label: 'All Solar' },
    ...solarCategories.map((cat) => ({ slug: slugify(cat), label: cat })),
  ], [solarCategories]);

  const SOLAR_CATEGORY_NAMES = useMemo(() =>
    SOLAR_TABS.slice(1).map((t) => t.label),
  [SOLAR_TABS]);

  const urlCategory = searchParams.get('category') || 'all';
  const urlBrand = searchParams.get('brand') || '';
  const [selectedBrand, setSelectedBrand] = useState<string>(urlBrand);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setSelectedBrand(urlBrand);
  }, [urlBrand]);

  const handleBrandToggle = useCallback((brand: string) => {
    setSelectedBrand((prev) => {
      const next = prev === brand ? '' : brand;
      const params = new URLSearchParams(searchParams);
      if (next) {
        params.set('brand', next);
      } else {
        params.delete('brand');
      }
      setSearchParams(params, { replace: true });
      return next;
    });
  }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    setSelectedBrand('');
    const params = new URLSearchParams(searchParams);
    params.delete('brand');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const activeCategory = useMemo(() => {
    if (urlCategory === 'all') return null;
    const tab = SOLAR_TABS.find((t) => t.slug === urlCategory);
    return tab?.label ?? null;
  }, [urlCategory, SOLAR_TABS]);

  const solarProducts = useMemo(() => {
    return products.filter((p) => SOLAR_CATEGORY_NAMES.includes(p.category));
  }, [products]);

  const availableBrands = useMemo(() => {
    const seen = new Set<string>();
    return solarProducts
      .map((p) => p.seller?.trim())
      .filter(Boolean)
      .filter((s) => {
        const key = s!.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort() as string[];
  }, [solarProducts]);

  const filteredProducts = useMemo(() => {
    return solarProducts.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (selectedBrand && p.seller !== selectedBrand) return false;
      return true;
    });
  }, [solarProducts, activeCategory, selectedBrand]);

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
      <section className="relative flex items-center overflow-hidden bg-navy text-champagne min-h-[240px] sm:min-h-[320px]">
        <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/70 z-10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNDOUE4NEMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="container relative z-20 py-10 sm:py-14">
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

      <div className="container py-8">
        {/* Category Navigation */}
        <div className="overflow-x-auto no-scrollbar mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 sm:gap-3 min-w-max sm:min-w-0">
            {SOLAR_TABS.map((tab) => (
              <button
                key={tab.slug}
                type="button"
                onClick={() => handleTabChange(tab.slug)}
                className={cn(
                  'whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all',
                  urlCategory === tab.slug
                    ? 'bg-gold border-gold text-navy shadow-md'
                    : 'border-gold-antique/20 bg-white text-navy/60 hover:border-gold hover:text-gold'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Brand Filter Sidebar (Desktop) */}
          <aside className="hidden lg:block w-60 shrink-0 space-y-6">
            <div className="rounded-[1.25rem] border border-gold-antique/10 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-navy mb-4">Filter by Brand</h3>
              {availableBrands.length === 0 ? (
                <p className="text-xs text-navy/40">No brands available</p>
              ) : (
                <div className="space-y-2">
                  {availableBrands.map((brand) => {
                    const isSelected = selectedBrand === brand;
                    const brandColors = BRAND_COLORS[brand];
                    const bgClass = isSelected
                      ? brandColors
                        ? 'bg-gradient-to-r ' + brandColors + ' text-navy shadow-md scale-[1.02]'
                        : 'bg-navy text-gold shadow-md'
                      : 'bg-white text-navy/60 hover:bg-ivory hover:text-navy border border-gold-antique/10';
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => handleBrandToggle(brand)}
                        className={'relative w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold uppercase tracking-wider transition-all duration-300 overflow-hidden ' + bgClass}
                      >
                        <span className="relative z-10">{brand}</span>
                        {isSelected && brandColors && (
                          <span className="absolute inset-0 bg-white/20 rounded-xl animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedBrand && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 w-full rounded-lg border border-gold-antique/20 py-2 text-[11px] font-bold uppercase tracking-wider text-navy/50 transition-colors hover:border-red-300 hover:text-red-500"
                >
                  Clear Filter
                </button>
              )}
            </div>
            <div className="rounded-[1.25rem] border border-gold-antique/10 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-navy mb-2">Need Help?</h3>
              <p className="text-xs text-navy/50 leading-relaxed mb-3">
                Not sure what you need? Use our Energy Calculator to find the right system size.
              </p>
              <a
                href="#solar-calculator"
                className="block rounded-lg bg-navy px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-gold transition-all hover:bg-gold hover:text-navy"
              >
                Open Calculator
              </a>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter + Results Count */}
            <div className="flex items-center justify-between mb-5 lg:hidden">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-navy/50">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-gold-antique/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-navy transition-colors hover:border-gold"
                aria-label="Open filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
                {selectedBrand && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-navy">
                    <X className="h-3 w-3" />
                  </span>
                )}
              </button>
            </div>

            {/* Product Grid */}
            <div id="solar-products">
              {isLoading && products.length === 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-lg border border-gold-antique/10 bg-white overflow-hidden">
                      <div className="aspect-[4/5] bg-gradient-to-br from-ivory to-muted animate-pulse" />
                      <div className="p-4 space-y-3">
                        <div className="h-3 w-16 bg-ivory rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-ivory rounded animate-pulse" />
                        <div className="h-5 w-1/2 bg-ivory rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 && hasLoaded ? (
                <div className="rounded-[1.5rem] border border-gold-antique/10 bg-white p-12 text-center">
                  <Sun className="mx-auto h-12 w-12 text-gold/30" />
                  <p className="mt-4 font-serif text-xl font-bold text-navy">No Solar Products Found</p>
                  <p className="mt-2 text-sm text-navy/50">Try adjusting your filters or check back later.</p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-md bg-navy px-8 py-3 text-xs font-bold uppercase tracking-widest text-gold transition-all hover:bg-gold hover:text-navy"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-navy/50 mb-4 hidden lg:block">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Energy Calculator */}
        <div id="solar-calculator" className="mt-16">
          <EnergyCalculator />
        </div>
      </div>

      {/* Mobile Brand Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-navy">Filter by Brand</h3>
              <button type="button" onClick={() => setMobileFilterOpen(false)} className="text-navy/40 hover:text-navy" aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-navy/40 mb-4">Tap a brand to show only its products. Tap again to clear.</p>
            {availableBrands.length === 0 ? (
              <p className="text-sm text-navy/40">No brands available</p>
            ) : (
              <div className="space-y-3">
                {availableBrands.map((brand) => {
                  const isSelected = selectedBrand === brand;
                  const brandColors = BRAND_COLORS[brand];
                  const bgClass = isSelected
                    ? brandColors
                      ? 'bg-gradient-to-r ' + brandColors + ' text-navy shadow-md scale-[1.02]'
                      : 'bg-navy text-gold shadow-md'
                    : 'bg-ivory/50 text-navy/60 hover:bg-ivory hover:text-navy border border-gold-antique/10';
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => { handleBrandToggle(brand); setMobileFilterOpen(false); }}
                      className={'relative w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-bold uppercase tracking-wider transition-all duration-300 overflow-hidden ' + bgClass}
                    >
                      <span className="relative z-10">{brand}</span>
                      {isSelected && brandColors && (
                        <span className="absolute inset-0 bg-white/20 rounded-xl animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          {selectedBrand && (
              <button type="button" onClick={() => { clearFilters(); setMobileFilterOpen(false); }}
                className="w-full rounded-xl border border-gold-antique/20 py-3 text-xs font-bold uppercase tracking-wider text-navy/60 transition-colors hover:border-red-300 hover:text-red-500">
                Clear Filter
              </button>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SolarPage;
