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
    <div className="flex items-center gap-1">
      {[time.h, time.m, time.s].map((value, index) => (
        <span
          key={index}
          className="inline-flex h-8 w-8 items-center justify-center rounded bg-foreground text-sm font-bold text-primary-foreground"
        >
          {String(value).padStart(2, '0')}
        </span>
      ))}
    </div>
  );
};

const HomeSectionSkeleton = ({ title }: { title: string }) => (
  <section className="container py-10">
    <div className="mb-6 flex items-center justify-between">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
    </div>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border bg-card">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-3 p-4">
            <div className="h-4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

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
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative flex min-h-[500px] items-center overflow-hidden bg-gradient-hero text-primary-foreground">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="container relative z-10 py-12 md:py-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <div className="mb-6 flex items-center gap-2">
              <motion.span
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                className="rounded-full bg-gold px-4 py-1.5 text-xs font-black uppercase tracking-wider text-secondary-foreground shadow-gold"
              >
                Mega Sale - Up To 60% Off
              </motion.span>
            </div>
            <h1 className="mb-6 font-display text-4xl font-black leading-tight sm:text-5xl md:text-7xl">
              Everything You Need.
              <br />
              <span className="text-gradient-gold drop-shadow-sm">Delivered Nationwide.</span>
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-primary-foreground/90 md:text-xl">
              Nigeria&apos;s premium marketplace with trusted brands, fast product updates, and
              delivery to your doorstep.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-accent px-10 py-4 text-xl font-bold text-accent-foreground shadow-xl transition-all hover:scale-105 hover:bg-cta-orange-light active:scale-95"
              >
                Shop Now
                <ArrowRight className="h-6 w-6" />
              </Link>
              <Link
                to="/shop?deals=true"
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-10 py-4 text-xl font-bold text-primary-foreground backdrop-blur-md transition-all hover:bg-white/20"
              >
                Today&apos;s Deals
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -right-12 top-1/4 h-64 w-64 rounded-full bg-primary-foreground/5 blur-2xl" />
      </section>

      <div className="overflow-hidden border-b bg-muted">
        <div className="container flex flex-nowrap justify-start gap-6 overflow-x-auto whitespace-nowrap py-4 text-sm no-scrollbar md:flex-wrap md:justify-center md:gap-10">
          <span className="flex flex-shrink-0 items-center gap-2 font-medium">
            <Users className="h-4 w-4 text-primary" />
            <strong>1.2M+</strong> Happy Customers
          </span>
          <span className="flex flex-shrink-0 items-center gap-2 font-medium">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <strong>4.9/5</strong> Average Rating
          </span>
          <span className="flex flex-shrink-0 items-center gap-2 font-medium">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <strong>100%</strong> Secure
          </span>
          <span className="flex flex-shrink-0 items-center gap-2 font-medium">
            <Truck className="h-4 w-4 text-primary" />
            <strong>Nationwide</strong> Delivery
          </span>
          <span className="flex flex-shrink-0 items-center gap-2 font-bold text-accent">
            {visitorCount.toLocaleString()} shopping now
          </span>
        </div>
      </div>

      {categories.length > 0 && (
        <section className="container py-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Shop by Category</h2>
            <Link to="/shop" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-9">
            {categories
              .sort((a, b) => b.count - a.count)
              .slice(0, 9)
              .map((category) => (
                <Link key={category.slug} to={`/shop?category=${category.slug}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="rounded-xl border bg-card p-4 text-center transition-all hover:shadow-md"
                  >
                    <category.icon className="mx-auto mb-2 h-8 w-8 text-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-tight line-clamp-1">{category.name}</p>
                  </motion.div>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* Product List Section */}
      <section className="container py-10 content-visibility-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Product List</h2>
            <p className="text-sm text-muted-foreground mt-1">Our latest and most popular items</p>
          </div>
          <Link to="/shop" className="flex items-center gap-1 text-sm text-primary hover:underline">
            See all products
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {products.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {flashDeals.length > 0 && (
        <section className="bg-destructive/5 py-10">
          <div className="container">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Timer className="h-6 w-6 text-destructive" />
                <h2 className="font-display text-2xl font-bold">Flash Deals</h2>
                <CountdownTimer />
              </div>
              <Link
                to="/shop?deals=true"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                See all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {flashDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {isLoading && products.length === 0 ? (
        <>
          <HomeSectionSkeleton title="Trending Now" />
          <HomeSectionSkeleton title="Recommended for You" />
        </>
      ) : error && products.length === 0 ? (
        <section className="container py-10">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-lg font-semibold text-destructive">Products are temporarily unavailable</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We could not load the latest catalog. Please refresh again shortly.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="container py-10 content-visibility-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Trending Now</h2>
              <Link to="/shop" className="flex items-center gap-1 text-sm text-primary hover:underline">
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {trending.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          <section className="bg-warm py-10 content-visibility-auto">
            <div className="container">
              <h2 className="mb-6 font-display text-2xl font-bold">Recommended for You</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {recommended.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-8 py-3 font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  View All Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="container py-10">
        <h2 className="mb-6 text-center font-display text-2xl font-bold">What Our Customers Say</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: 'Chioma A.',
              loc: 'Lekki, Lagos',
              text: "Cedokamall is the best thing to happen to online shopping in Nigeria. Fast delivery, amazing prices.",
            },
            {
              name: 'Emeka O.',
              loc: 'Ikeja, Lagos',
              text: 'I ordered an iPhone on Monday and got it Tuesday morning. The loyalty system is a nice touch.',
            },
            {
              name: 'Funke B.',
              loc: 'Victoria Island',
              text: 'My go-to for gadgets, accessories, and home tech. The product quality has been consistently strong.',
            },
          ].map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border bg-card p-6"
            >
              <div className="mb-3 flex items-center gap-1">
                {[...Array(5)].map((_, starIndex) => (
                  <Star key={starIndex} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="mb-4 text-sm text-muted-foreground">&quot;{testimonial.text}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {testimonial.name
                    .split(' ')
                    .map((entry) => entry[0])
                    .join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.loc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <a
        href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2349128817136'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(142,70%,45%)] text-2xl text-primary-foreground shadow-lg transition-transform hover:scale-110"
      >
        💬
      </a>

      <Footer />
    </div>
  );
};

export default Index;
