import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronRight,
  Package,
  RotateCcw,
  ShieldCheck,
  Star,
  Sun,
  Timer,
  Truck,
  Users,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import SolarPlanProductCard from '@/components/SolarPlanProductCard';
import { cn } from '@/lib/utils';
import { buildCategories } from '@/data/products';
import { MAJOR_CATEGORIES } from '@/data/catalog';
import {
  getBreadcrumbSchema,
  getItemListSchema,
  getOrganizationSchema,
  getStoreSchema,
  getWebsiteSchema,
  SEO_CONFIG,
} from '@/config/seo';
import { useSEO, useStructuredData } from '@/hooks/useSEO';
import { useProductStore } from '@/store/productStore';
import { useSolarPlanStore } from '@/store/solarPlanStore';
import heroImage from '../../Image/Hero Page Image.jfif';

const CountdownTimer = () => {
  const [time, setTime] = useState({ h: 5, m: 42, s: 18 });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTime((current) => {
        let { h, m, s } = current;
        s -= 1;
        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          return { h: 5, m: 42, s: 18 };
        }
        return { h, m, s };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {[time.h, time.m, time.s].map((value, index) => (
        <span
          key={index}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-navy text-gold text-lg font-bold shadow-md border border-gold/20"
        >
          {String(value).padStart(2, '0')}
        </span>
      ))}
    </div>
  );
};

const HomeSectionSkeleton = ({ title }: { title: string }) => (
  <section className="container py-16">
    <div className="mb-10 flex items-center justify-between">
      <h2 className="font-serif text-3xl font-bold">{title}</h2>
    </div>
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-md border border-gold-antique/10 bg-white shadow-sm">
          <div className="aspect-square animate-pulse bg-ivory" />
          <div className="space-y-3 p-4">
            <div className="h-4 animate-pulse rounded bg-ivory" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-ivory" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

const WelcomeGreeting = () => {
  const [show, setShow] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    const lastGreeting = localStorage.getItem('cedoka_last_greeting');
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000;

    // Only show greeting if no last greeting or if 6+ hours have passed
    if (lastGreeting) {
      const timeSinceLastGreeting = now - parseInt(lastGreeting);
      if (timeSinceLastGreeting < sixHours) {
        return; // Less than 6 hours, don't show
      }
      setIsReturning(true); // More than 6 hours, returning user
    } else {
      // First time visiting
      localStorage.setItem('cedoka_visited', 'true');
    }

    localStorage.setItem('cedoka_last_greeting', now.toString());

    const timer = setTimeout(() => setShow(true), 2000);
    const hideTimer = setTimeout(() => setShow(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-24 right-8 z-[100] max-w-sm overflow-hidden rounded-md bg-white p-6 shadow-2xl border-l-4 border-gold"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 flex-shrink-0 animate-pulse">
          <Star className="h-6 w-6 text-gold fill-gold" />
        </div>
        <div>
          <h4 className="font-serif text-lg font-bold text-navy">
            {isReturning ? 'Welcome back!' : 'Welcome to Cedokamall!'}
          </h4>
          <p className="mt-1 text-sm text-navy/60 font-sans">
            {isReturning 
              ? 'Good to see you again. Here are the latest arrivals worth a look.' 
              : 'Thanks for visiting. Browse electronics, solar and farm products with warranty support.'}
          </p>
          <button 
            onClick={() => setShow(false)}
            className="mt-4 text-xs font-bold uppercase tracking-widest text-gold hover:text-gold-antique transition-colors active:scale-95"
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Index = () => {
  const products = useProductStore((state) => state.products);
  const isLoading = useProductStore((state) => state.isLoading);
  const error = useProductStore((state) => state.error);
  const hasLoaded = useProductStore((state) => state.hasLoaded);
  const plans = useSolarPlanStore((s) => s.plans);
  const [listingTab, setListingTab] = useState<'all' | 'products' | 'plans'>('all');
  const activePlans = useMemo(() => plans.filter((plan) => plan.isActive), [plans]);
  const fetchPlans = useSolarPlanStore((s) => s.fetchPlans);
  const plansError = useSolarPlanStore((s) => s.error);
  const categories = useMemo(() => buildCategories(products), [products]);
  const topCategories = useMemo(
    () => [...categories].sort((a, b) => b.count - a.count).slice(0, 8),
    [categories]
  );

  const flashDeals = useMemo(
    () => products.filter((product) => product.badge === 'FLASH DEAL').slice(0, 5),
    [products]
  );
  const homepageProducts = useMemo(
    () => [...products].sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)),
    [products]
  );
  const trending = useMemo(
    () => [...products].sort((left, right) => (right.rating || 0) - (left.rating || 0)).slice(0, 5),
    [products]
  );
  const recommended = useMemo(
    () =>
      [...products]
        .sort((a, b) => {
          const scoreA = (a.salesCount || 0) + (a.searchCount || 0);
          const scoreB = (b.salesCount || 0) + (b.searchCount || 0);
          if (scoreA === scoreB) {
            return (b.reviews || 0) - (a.reviews || 0); // Tie-break with reviews
          }
          return scoreB - scoreA;
        })
        .slice(0, 6),
    [products]
  );

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);
  useSEO({
    title: SEO_CONFIG.siteTitle,
    description: SEO_CONFIG.siteDescription,
    keywords: [
      'electrical equipment Nigeria',
      'original gadgets with warranty',
      'LG products Nigeria',
      'Hisense appliances Nigeria',
      'MeWe electronics',
      'Maxi appliances',
      ...categories.slice(0, 8).map((category) => `${category.name} Nigeria`),
    ],
    url: SEO_CONFIG.siteUrl,
    type: 'website',
  });

  const structuredDataSchemas = useMemo(
    () => [
      getOrganizationSchema(),
      getStoreSchema(),
      getWebsiteSchema(),
      getBreadcrumbSchema([{ name: 'Home', url: SEO_CONFIG.siteUrl }]),
      getItemListSchema(
        topCategories.map((category, index) => ({
          position: index + 1,
          name: category.name,
          url: `${SEO_CONFIG.siteUrl}/shop?category=${category.slug}`,
        }))
      ),
      getItemListSchema(
        products.slice(0, 10).map((product, index) => ({
          position: index + 1,
          name: product.name,
          url: `${SEO_CONFIG.siteUrl}/product/${product.id}`,
          image: product.image,
        }))
      ),
    ],
    [products, topCategories]
  );

  useStructuredData(structuredDataSchemas);

  return (
    <div className="min-h-screen bg-ivory">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[320px] sm:min-h-[480px] items-center overflow-hidden bg-navy">
        <img
          src={heroImage}
          alt="Featured Cedokamall electronics and technology"
          className="absolute inset-0 h-full w-full object-cover object-center"
          {...({ fetchpriority: 'high' } as Record<string, string>)}
          decoding="async"
        />
        <div className="absolute inset-0 bg-navy/70" aria-hidden="true" />
        <div className="container relative py-10 sm:py-16 md:py-20">
          <div className="max-w-2xl text-center">
            <h1 className="mt-4 font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-[1.2]">
              Quality Tools & Tech
            </h1>
            <p className="mt-4 text-champagne/80 text-sm sm:text-base font-sans leading-relaxed">
              Electronics, solar power and farm products.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-2.5 text-sm font-bold text-navy transition-colors duration-200 hover:bg-gold-antique hover:text-white"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/solar"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gold/30 bg-white/5 px-6 py-2.5 text-sm font-bold text-champagne transition-colors duration-200 hover:bg-white/10 hover:border-gold"
              >
                Explore Solar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="overflow-hidden border-y border-gold-antique/10 bg-white py-5 shadow-sm" aria-label="Cedokamall promises">
        <div className="marquee-track flex w-max whitespace-nowrap" aria-hidden="true">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center gap-8 pr-8 md:gap-16 md:pr-16">
              <span className="flex items-center gap-3 font-semibold uppercase tracking-widest text-xs text-navy/80">
                <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
                Warranty-backed products
              </span>
              <span className="flex items-center gap-3 font-semibold uppercase tracking-widest text-xs text-navy/80">
                <Truck className="h-4 w-4 shrink-0 text-gold" />
                Delivery across Nigeria
              </span>
              <span className="flex items-center gap-3 font-semibold uppercase tracking-widest text-xs text-navy/80">
                <Star className="h-4 w-4 shrink-0 fill-gold text-gold" />
                Original &amp; trusted brands
              </span>
              <span className="flex items-center gap-3 font-semibold uppercase tracking-widest text-xs text-navy/80">
                <Users className="h-4 w-4 shrink-0 text-gold" />
                Friendly support
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Major Categories */}
      <section className="container py-6 sm:py-10">
        <div className="grid grid-cols-3 gap-3">
          {MAJOR_CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              to={category.href}
              className="group flex flex-col rounded-md bg-white border border-gold-antique/10 p-3 sm:p-4 transition-all hover:border-gold/30"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-ivory">
                <category.icon className="h-4 w-4 text-navy" />
              </div>
              <h3 className="text-[11px] sm:text-xs font-bold text-navy leading-snug">{category.name}</h3>
              <p className="mt-1 text-[10px] text-navy/50 leading-relaxed line-clamp-2">{category.tagline}</p>
              <span className="mt-auto pt-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-gold">
                Shop now
                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Welcome Back / Appreciation System */}
      <WelcomeGreeting />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container py-6 sm:py-12">
          <div className="mb-6 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-navy">Categories</h2>
              <div className="h-0.5 sm:h-1 w-12 sm:w-20 bg-gold mt-2 sm:mt-4" />
            </div>
            <Link to="/shop" className="group flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-gold hover:text-gold-antique transition-colors">
              View All Categories
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4">
            {topCategories.map((category, index) => (
                <Link 
                  key={category.slug} 
                  to={`/shop?category=${category.slug}`}
                  className={index > 3 ? 'hidden md:block' : ''}
                >
                  <motion.div
                    whileHover={{ y: -6, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-md border border-gold-antique/10 bg-white p-3 sm:p-6 text-center transition-all group hover:border-gold/30 h-full will-change-transform"
                  >
                    <div className="mb-2 sm:mb-4 flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-ivory mx-auto group-hover:bg-gold/10 transition-colors">
                      <category.icon className="h-4 w-4 sm:h-6 sm:w-6 text-navy group-hover:text-gold transition-colors" />
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-navy line-clamp-1">{category.name}</p>
                    <p className="hidden sm:block text-[9px] text-navy/40 mt-1">Explore Collection</p>
                  </motion.div>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* Solar System Plans — rendered with the same product card as merchandise */}
      <section id="solar-plans" className="scroll-mt-24 border-y border-gold-antique/10 bg-white py-12">
        <div className="container">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold sm:text-xs">
                Solar Plans
              </span>
              <h2 className="mt-2 font-serif text-2xl font-bold text-navy sm:text-3xl">Solar System Plans</h2>
              <p className="mt-2 max-w-lg text-sm text-navy/60">
                Complete, ready-to-install solar packages. Pick one, or size your own with the energy calculator.
              </p>
            </div>
            <Link
              to="/solar#solar-plans"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold transition-colors hover:text-gold-antique"
            >
              View All Plans
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {plansError && (
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
              <p className="min-w-0 flex-1 text-[12px] leading-5 text-amber-900">
                Solar plans could not be synced from the database, so this list may be out of date.
              </p>
              <button
                type="button"
                onClick={() => fetchPlans()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-800 transition-colors hover:bg-amber-100"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Retry sync
              </button>
            </div>
          )}

          {activePlans.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {activePlans.slice(0, 5).map((plan, index) => (
                <SolarPlanProductCard key={plan.id} plan={plan} priority={index < 5} />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-[1.5rem] border border-gold-antique/10 bg-ivory/60 px-6 py-10 text-center">
              <Sun className="mx-auto h-9 w-9 text-gold/40" aria-hidden="true" />
              <p className="mt-3 font-serif text-lg font-bold text-navy">Solar plans are being prepared</p>
              <p className="mt-1.5 text-sm text-navy/60">
                Our packaged systems are being finalised. In the meantime, browse the individual solar products, or
                ask us on WhatsApp and we will build one around your home.
              </p>
              <Link
                to="/solar#solar-products"
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-navy px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                Browse Solar Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Product List */}
      <section className="container py-8 sm:py-16">
        <div className="mb-6 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-navy">Latest products</h2>
            <p className="text-navy/60 font-sans tracking-wide text-xs sm:text-sm mt-1 sm:mt-2">Explore current arrivals across the store</p>
          </div>
          <Link to="/shop" className="group flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-gold hover:text-gold-antique transition-colors">
            See All Products
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {isLoading && products.length === 0 ? (
          <div className="fade-rise grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-ivory" />
            ))}
          </div>
        ) : error && products.length === 0 ? (
          <div className="rounded-lg bg-red-50 p-12 text-center text-red-800">
            <p className="font-bold">Unable to load products</p>
            <p className="break-words text-sm mt-2">{error}</p>
            <button 
              onClick={() => useProductStore.getState().fetchProducts(true)}
              className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm font-bold hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : hasLoaded && products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gold-antique/20 p-20 text-center">
            <div className="mx-auto w-16 h-16 bg-ivory rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-gold/40" />
            </div>
            <p className="text-navy/60 font-medium">Our catalog is currently being updated.</p>
            <p className="text-sm text-navy/40 mt-1">Please check back in a few moments.</p>
            <button 
              onClick={() => useProductStore.getState().fetchProducts(true)}
              className="mt-6 rounded-md bg-navy text-gold px-6 py-2 text-sm font-bold hover:bg-gold hover:text-navy transition-all duration-300"
            >
              Refresh Catalog
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {(
                [
                  { key: 'all', label: 'All' },
                  { key: 'products', label: 'Products' },
                  { key: 'plans', label: 'Solar Plans' },
                ] as const
              ).map((tab) => {
                const isActive = listingTab === tab.key;
                const count =
                  tab.key === 'all'
                    ? homepageProducts.length + activePlans.length
                    : tab.key === 'products'
                      ? homepageProducts.length
                      : activePlans.length;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setListingTab(tab.key)}
                    aria-pressed={isActive}
                    className={cn(
                      'press inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors',
                      isActive
                        ? 'border-navy bg-navy text-gold'
                        : 'border-gold-antique/20 bg-white text-navy/60 hover:border-gold hover:text-navy'
                    )}
                  >
                    {tab.label}
                    <span className={cn('tabular-nums', isActive ? 'text-gold/70' : 'text-navy/35')}>{count}</span>
                  </button>
                );
              })}
            </div>

            {listingTab === 'plans' ? (
              activePlans.length > 0 ? (
                <div className="fade-rise grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {activePlans.map((plan, idx) => (
                    <SolarPlanProductCard key={plan.id} plan={plan} priority={idx < 5} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gold-antique/20 p-16 text-center">
                  <Sun className="mx-auto h-9 w-9 text-gold/40" aria-hidden="true" />
                  <p className="mt-3 text-navy/60">No solar plans published yet.</p>
                </div>
              )
            ) : listingTab === 'products' ? (
              <div className="fade-rise grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {homepageProducts.map((product, idx) => (
                  <ProductCard key={product.id} product={product} priority={idx < 4} />
                ))}
              </div>
            ) : (
              <div className="fade-rise grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {homepageProducts.map((product, idx) => (
                  <ProductCard key={product.id} product={product} priority={idx < 4} />
                ))}
                {activePlans.map((plan, idx) => (
                  <SolarPlanProductCard key={plan.id} plan={plan} priority={idx < 4} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* SEO Category Links */}
      <section className="container pb-24 sm:pb-6">
        <div className="rounded-md border border-gold-antique/10 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="font-serif text-xl sm:text-3xl font-bold text-navy">Shop by category</h2>
          <p className="mt-4 max-w-4xl text-xs sm:text-sm leading-7 text-navy/70">
            Browse original electronics and gadgets, solar power systems and farm products. Filter by category to
            compare products, warranties and prices.
          </p>
          {categories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {categories.slice(0, 12).map((category) => (
                <Link
                  key={category.slug}
                  to={`/shop?category=${category.slug}`}
                  className="rounded-full border border-gold-antique/20 bg-ivory px-4 py-2 text-xs font-bold uppercase tracking-widest text-navy transition-colors hover:border-gold hover:text-gold"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recommended Section */}
      <section className="bg-navy py-16 text-champagne">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2">Recommended for you</h2>
            <p className="text-champagne/60 text-xs uppercase tracking-widest">Popular picks across the store</p>
            <div className="h-0.5 w-16 bg-gold mx-auto mt-4" />
          </div>
          {isLoading && products.length === 0 ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
              {recommended.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <div className="mt-10 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-md bg-gold px-8 py-3 text-xs font-bold uppercase tracking-widest text-navy transition-all hover:bg-gold-antique hover:text-white"
            >
              Browse Full Catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Search Section */}
      <section className="container py-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h2 className="font-serif text-4xl font-bold text-navy">Popular Search</h2>
          <Link to="/shop" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gold hover:text-gold-antique transition-colors">
            View All Trending
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="fade-rise grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {isLoading && products.length === 0 ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-ivory" />
            ))
          ) : (
            trending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Flash Deals */}
      {(flashDeals.length > 0 || (isLoading && products.length === 0)) && (
        <section className="bg-white border-y border-gold-antique/10 py-12">
          <div className="container">
            <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-gold" />
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy">Flash Deals</h2>
                  <p className="text-navy/40 text-xs uppercase tracking-widest">Limited-time price drops</p>
                </div>
              </div>
              <CountdownTimer />
            </div>
            <div className="fade-rise grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {isLoading && products.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-ivory" />
                ))
              ) : (
                flashDeals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="bg-ivory py-12">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy mb-2">What our customers say</h2>
            <div className="h-0.5 w-16 bg-gold mx-auto" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: 'Chioma A.',
                loc: 'Lekki, Lagos',
                text: "Cedokamall is the best thing to happen to online shopping in Nigeria. Authority and class in every delivery.",
              },
              {
                name: 'Emeka O.',
                loc: 'Ikeja, Lagos',
                text: 'Fast delivery, amazing prices. The new design truly reflects the premium service they provide.',
              },
              {
                name: 'Funke B.',
                loc: 'Victoria Island',
                text: 'The consistency and quality of products have been consistently strong. A truly high-end experience.',
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-md bg-white p-6 border border-gold-antique/5"
              >
                <div className="mb-4 flex items-center gap-1">
                  {[...Array(5)].map((_, starIndex) => (
                    <Star key={starIndex} className="h-3.5 w-3.5 fill-gold text-gold" />
                  ))}
                </div>
                <p className="mb-6 text-sm text-navy/70 leading-relaxed">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-3 border-t border-gold-antique/10 pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-gold text-sm font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy">{testimonial.name}</p>
                    <p className="text-[10px] text-navy/40">{testimonial.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
