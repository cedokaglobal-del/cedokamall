import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronRight,
  Package,
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
import SolarPlanCard from '@/components/SolarPlanCard';
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
  const fetchPlans = useSolarPlanStore((s) => s.fetchPlans);
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
          fetchPriority="high"
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

      {/* Solar System Plans */}
      {plans.filter((p) => p.isActive).length > 0 && (
        <section className="bg-white border-y border-gold-antique/10 py-12">
          <div className="container">
            <div className="mb-8 text-center">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy">Solar System Plans</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-navy/60">
                Pre-designed solar plans for every need.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.filter((p) => p.isActive).slice(0, 3).map((plan) => (
                <SolarPlanCard key={plan.id} plan={plan} compact />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                to="/solar"
                className="inline-flex items-center gap-2 rounded-md bg-navy px-8 py-3 text-xs font-bold uppercase tracking-widest text-gold transition-all hover:bg-gold hover:text-navy"
              >
                View All Solar Plans
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

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
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-gray-100" />
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
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {homepageProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 4} />
            ))}
          </div>
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
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {isLoading && products.length === 0 ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-gray-100" />
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
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {isLoading && products.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-gray-100" />
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

      {/* WhatsApp Button - Draggable on Mobile */}
      <DraggableWhatsApp />

      <Footer />
    </div>
  );
};

const WA_BTN_KEY = 'cedoka_wa_position';

const DraggableWhatsApp = () => {
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem(WA_BTN_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return { bottom: 32, right: 32 };
  });

  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startBottom: 32, startRight: 32 });

  const handlePointerStart = (clientX: number, clientY: number) => {
    const d = dragRef.current;
    d.dragging = false;
    d.startX = clientX;
    d.startY = clientY;
    d.startBottom = pos.bottom;
    d.startRight = pos.right;
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    const d = dragRef.current;
    const dx = clientX - d.startX;
    const dy = clientY - d.startY;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) d.dragging = true;
    if (d.dragging) {
      setPos({
        bottom: Math.max(8, Math.min(80, Math.round(d.startBottom - dy))),
        right: Math.max(8, Math.min(80, Math.round(d.startRight - dx))),
      });
    }
  };

  const handlePointerEnd = () => {
    if (dragRef.current.dragging) {
      try { localStorage.setItem(WA_BTN_KEY, JSON.stringify(pos)); } catch {
        /* ignore */
      }
    }
  };

  return (
    <a
      href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2349128817136'}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => { if (dragRef.current.dragging) { e.preventDefault(); dragRef.current.dragging = false; } }}
      onMouseDown={(e) => handlePointerStart(e.clientX, e.clientY)}
      onMouseMove={(e) => { if (e.buttons === 1) handlePointerMove(e.clientX, e.clientY); }}
      onMouseUp={handlePointerEnd}
      onTouchStart={(e) => handlePointerStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => { handlePointerMove(e.touches[0].clientX, e.touches[0].clientY); }}
      onTouchEnd={(e) => { if (dragRef.current.dragging) e.preventDefault(); handlePointerEnd(); }}
      className="fixed z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-shadow hover:shadow-gold/20 touch-none select-none"
      style={{ bottom: `${pos.bottom}px`, right: `${pos.right}px` }}
      title="Chat with Support"
    >
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
};

export default Index;
