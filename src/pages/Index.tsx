import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Star,
  Timer,
  Truck,
  Users,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { buildCategories } from '@/data/products';
import { useProductStore } from '@/store/productStore';

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
          className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-navy text-gold text-lg font-bold shadow-md border border-gold/20 will-change-contents"
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
      className="fixed bottom-24 right-8 z-[100] max-w-sm rounded-md bg-white p-6 shadow-2xl border-l-4 border-gold will-change-transform"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 flex-shrink-0 animate-pulse">
          <Star className="h-6 w-6 text-gold fill-gold" />
        </div>
        <div>
          <h4 className="font-serif text-lg font-bold text-navy">
            {isReturning ? 'Welcome Back!' : 'Welcome to Cedokamall!'}
          </h4>
          <p className="mt-1 text-sm text-navy/60 font-sans">
            {isReturning 
              ? 'Great to see you again. Explore our latest premium picks curated just for you.' 
              : 'Experience the standard of luxury retail. We appreciate you choosing us today.'}
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
  const { products, isLoading, error, hasLoaded } = useProductStore();
  const categories = useMemo(() => buildCategories(products), [products]);

  const flashDeals = useMemo(
    () => products.filter((product) => product.badge === 'FLASH DEAL').slice(0, 5),
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
  const [visitorCount, setVisitorCount] = useState(3000);

  useEffect(() => {
    const calculateVisitors = () => {
      const now = new Date();
      const day = now.getDay();
      const month = now.getMonth();
      const hour = now.getHours();
      
      let base = 2840;
      const hourFactor = Math.sin((hour - 8) * Math.PI / 12) * 500;
      base += Math.max(0, hourFactor);
      
      if (day === 0 || day === 6) base += 1200;
      
      const isFestive = 
        (month === 11) || 
        (month === 0 && now.getDate() <= 5) || 
        (month === 1 && now.getDate() >= 10 && now.getDate() <= 16) || 
        (month === 10 && now.getDate() >= 20);
        
      if (isFestive) base += 1800;
      
      const jitter = Math.floor(Math.random() * 200) - 100;
      return Math.floor(base + jitter);
    };

    setVisitorCount(calculateVisitors());

    const interval = setInterval(() => {
      setVisitorCount(calculateVisitors());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-ivory">
      <Header />

      {/* Hero Section */}
      <section className="relative flex min-h-[600px] items-center overflow-hidden bg-navy text-champagne">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="container relative z-10 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-4xl"
          >
            <div className="mb-8 flex items-center gap-3">
              <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="rounded-md bg-gold px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-navy shadow-lg will-change-transform"
              >
                The Elite Marketplace
              </motion.span>
            </div>
            <h1 className="mb-8 font-serif text-5xl font-bold leading-[1.1] sm:text-6xl md:text-8xl text-white">
              Everything You Need.
              <br />
              <span className="text-gradient-gold drop-shadow-xl italic">Delivered Nationwide.</span>
            </h1>
            <p className="mb-12 max-w-2xl text-lg leading-relaxed text-champagne/80 md:text-2xl font-sans font-light">
              Nigeria&apos;s cheapest electrical and gadget destination; experience original Hisense, Mewe, LG, Maxi product shopping.
            </p>
            <div className="flex flex-col gap-6 sm:flex-row">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-3 rounded-md bg-gold px-12 py-5 text-xl font-bold text-navy shadow-2xl transition-all duration-300 hover:bg-gold-antique hover:text-white transform hover:-translate-y-1 active:scale-95 will-change-transform"
              >
                Explore Shop
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/shop?deals=true"
                className="inline-flex items-center justify-center gap-3 rounded-md border border-gold/30 bg-white/5 px-12 py-5 text-xl font-bold text-champagne backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-gold will-change-transform"
              >
                Flash Deals
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute top-20 right-20 h-96 w-96 rounded-full bg-navy-deep/40 blur-3xl" />
      </section>

      {/* Trust Bar */}
      <div className="overflow-hidden border-y border-gold-antique/10 bg-white py-6 shadow-sm">
        <div className="container flex flex-nowrap justify-start gap-8 overflow-x-auto whitespace-nowrap text-sm no-scrollbar md:flex-wrap md:justify-center md:gap-16">
          <span className="flex flex-shrink-0 items-center gap-3 font-semibold text-navy/80 uppercase tracking-widest text-[10px]">
            <Users className="h-4 w-4 text-gold" />
            <strong>1.2M+</strong> Elite Members
          </span>
          <span className="flex flex-shrink-0 items-center gap-3 font-semibold text-navy/80 uppercase tracking-widest text-[10px]">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <strong>4.9/5</strong> Excellence Rating
          </span>
          <span className="flex flex-shrink-0 items-center gap-3 font-semibold text-navy/80 uppercase tracking-widest text-[10px]">
            <ShieldCheck className="h-4 w-4 text-gold" />
            <strong>100%</strong> Secured Trust
          </span>
          <span className="flex flex-shrink-0 items-center gap-3 font-semibold text-navy/80 uppercase tracking-widest text-[10px]">
            <Truck className="h-4 w-4 text-gold" />
            <strong>Premium</strong> Logistics
          </span>
          <span className="flex flex-shrink-0 items-center gap-3 font-bold text-gold uppercase tracking-widest text-[10px]">
            {visitorCount.toLocaleString()} Browsing Now
          </span>
        </div>
      </div>

      {/* Welcome Back / Appreciation System */}
      <WelcomeGreeting />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container py-12">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-4xl font-bold text-navy">Categories</h2>
              <div className="h-1 w-20 bg-gold mt-4" />
            </div>
            <Link to="/shop" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gold hover:text-gold-antique transition-colors">
              View All Categories
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {categories
              .sort((a, b) => b.count - a.count)
              .slice(0, 8)
              .map((category, index) => (
                <Link 
                  key={category.slug} 
                  to={`/shop?category=${category.slug}`}
                  className={index > 3 ? 'hidden md:block' : ''}
                >
                  <motion.div
                    whileHover={{ y: -6, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-md border border-gold-antique/10 bg-white p-6 text-center transition-all group hover:border-gold/30 h-full will-change-transform"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ivory mx-auto group-hover:bg-gold/10 transition-colors">
                      <category.icon className="h-6 w-6 text-navy group-hover:text-gold transition-colors" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-navy line-clamp-1">{category.name}</p>
                    <p className="text-[9px] text-navy/40 mt-1">Explore Collection</p>
                  </motion.div>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* Main Product List */}
      <section className="container py-16 content-visibility-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-4xl font-bold text-navy">Product List</h2>
            <p className="text-navy/60 font-sans tracking-wide text-sm mt-2">Explore our latest premium arrivals</p>
          </div>
          <Link to="/shop" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gold hover:text-gold-antique transition-colors">
            See All Products
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
          {products.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Recommended Section - Premium Highlight */}
      <section className="bg-navy py-24 text-champagne relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 -skew-x-12 transform translate-x-1/2" />
        <div className="container relative z-10">
          <div className="mb-16 text-center">
            <h2 className="font-serif text-4xl font-bold mb-4">Recommended for You</h2>
            <p className="text-champagne/60 font-sans tracking-widest uppercase text-xs">Exclusively selected for your discerning taste</p>
            <div className="h-1 w-24 bg-gold mx-auto mt-6" />
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {recommended.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 rounded-md bg-gold px-12 py-4 text-lg font-bold text-navy transition-all duration-300 hover:bg-gold-antique hover:text-white shadow-xl transform hover:-translate-y-1 active:scale-95 will-change-transform"
            >
              Browse Full Catalog
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Search Section */}
      <section className="container py-12 content-visibility-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h2 className="font-serif text-4xl font-bold text-navy">Popular Search</h2>
          <Link to="/shop" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gold hover:text-gold-antique transition-colors">
            View All Trending
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
          {trending.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Flash Deals */}
      {flashDeals.length > 0 && (
        <section className="bg-white border-y border-gold-antique/10 py-24">
          <div className="container">
            <div className="mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
                  <Timer className="h-8 w-8 text-gold animate-pulse" />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="font-serif text-4xl font-bold text-navy mb-2">Flash Deals</h2>
                  <p className="text-navy/40 font-sans text-xs uppercase tracking-widest">Premium opportunities expiring soon</p>
                </div>
              </div>
              <CountdownTimer />
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
              {flashDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="bg-ivory py-16 relative overflow-hidden">
        <div className="container relative z-10">
          <div className="mb-16 text-center">
            <h2 className="font-serif text-4xl font-bold text-navy mb-4">what our customer says</h2>
            <div className="h-1 w-20 bg-gold mx-auto" />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
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
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="rounded-md bg-white p-10 shadow-premium border border-gold-antique/5 relative group will-change-transform"
              >
                <div className="absolute top-6 left-6 text-gold/10 text-6xl font-serif leading-none group-hover:text-gold/20 transition-colors">"</div>
                <div className="mb-6 flex items-center gap-1">
                  {[...Array(5)].map((_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="mb-8 text-base text-navy/70 font-sans italic leading-relaxed">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-4 border-t border-gold-antique/10 pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-navy text-gold font-serif font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy uppercase tracking-widest">{testimonial.name}</p>
                    <p className="text-xs text-navy/40 uppercase tracking-tighter">{testimonial.loc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2349128817136'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all hover:scale-110 hover:rotate-12 hover:shadow-gold/20 active:scale-95"
        title="Chat with Support"
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      <Footer />
    </div>
  );
};

export default Index;
