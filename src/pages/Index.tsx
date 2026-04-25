import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Timer, Users, ShieldCheck, Star, Truck, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
// Removed: import SpinWheel from '@/components/SpinWheel';
// Removed: import LoyaltyBanner from '@/components/LoyaltyBanner';
import { buildCategories } from '@/data/products';
import { useState, useEffect, useMemo } from 'react';
import { useProductStore } from '@/store/productStore';

const formatPrice = (n: number) => '₦' + n.toLocaleString();

const CountdownTimer = () => {
  const [time, setTime] = useState({ h: 5, m: 42, s: 18 });
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => {
        let { h, m, s } = t;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) return { h: 5, m: 42, s: 18 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center gap-1">
      {[time.h, time.m, time.s].map((v, i) => (
        <span key={i} className="inline-flex items-center justify-center w-8 h-8 rounded bg-foreground text-primary-foreground text-sm font-bold">
          {String(v).padStart(2, '0')}
        </span>
      ))}
    </div>
  );
};

const Index = () => {
  const { products } = useProductStore();
  const categories = useMemo(() => buildCategories(products), [products]);
  
  const trending = useMemo(() => 
    [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5)
  , [products]);

  const recommended = useMemo(() => 
    [...products].slice(0, 10)
  , [products]);

  const visitorCount = 2847 + Math.floor(Math.random() * 200);


  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Removed: SpinWheel */}
      {/* <SpinWheel /> */}

      {/* Hero */}
      <section className="bg-gradient-hero text-primary-foreground relative overflow-hidden min-h-[500px] flex items-center">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="container py-12 md:py-24 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }} 
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <motion.span 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                className="px-4 py-1.5 bg-gold text-secondary-foreground text-xs font-black rounded-full shadow-gold uppercase tracking-wider"
              >
                🔥 MEGA SALE — UP TO 60% OFF
              </motion.span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-6">
              Everything You Need.<br />
              <span className="text-gradient-gold drop-shadow-sm">Delivered Nationwide.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl leading-relaxed">
              Nigeria's premium marketplace with 50,000+ products, trusted brands, and lightning-fast delivery to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop" className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-accent text-accent-foreground rounded-2xl font-bold text-xl hover:bg-cta-orange-light transition-all hover:scale-105 active:scale-95 shadow-xl">
                Shop Now <ArrowRight className="w-6 h-6" />
              </Link>
              <Link to="/shop?deals=true" className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-white/10 text-primary-foreground rounded-2xl font-bold text-xl hover:bg-white/20 transition-all backdrop-blur-md border border-white/20">
                Today's Deals
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Abstract background elements for premium feel */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-12 w-64 h-64 bg-primary-foreground/5 rounded-full blur-2xl" />
      </section>

      {/* Trust bar */}
      <div className="bg-muted border-b overflow-hidden">
        <div className="container py-4 flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-6 md:gap-10 text-sm overflow-x-auto no-scrollbar whitespace-nowrap">
          <span className="flex items-center gap-2 flex-shrink-0 font-medium"><Users className="w-4 h-4 text-primary" /> <strong>1.2M+</strong> Happy Customers</span>
          <span className="flex items-center gap-2 flex-shrink-0 font-medium"><Star className="w-4 h-4 text-gold fill-gold" /> <strong>4.9/5</strong> Average Rating</span>
          <span className="flex items-center gap-2 flex-shrink-0 font-medium"><ShieldCheck className="w-4 h-4 text-primary" /> <strong>100%</strong> Secure</span>
          <span className="flex items-center gap-2 flex-shrink-0 font-medium"><Truck className="w-4 h-4 text-primary" /> <strong>Nationwide</strong> Delivery</span>
          <span className="flex items-center gap-2 flex-shrink-0 text-accent font-bold animate-pulse">👁 {visitorCount.toLocaleString()} shopping now</span>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">Shop by Category</h2>
            <Link to="/shop" className="text-sm text-primary flex items-center gap-1 hover:underline">View all <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link key={cat.slug} to={`/shop?category=${cat.slug}`}>
                <motion.div whileHover={{ y: -4 }} className="text-center p-4 rounded-xl border bg-card hover:shadow-md transition-all">
                  <cat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-medium">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat.count}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Flash Deals */}
      {products.filter(p => p.badge === 'FLASH DEAL').length > 0 && (
        <section className="bg-destructive/5 py-10">
          <div className="container">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Timer className="w-6 h-6 text-destructive" />
                <h2 className="font-display text-2xl font-bold">Flash Deals</h2>
                <CountdownTimer />
              </div>
              <Link to="/shop?deals=true" className="text-sm text-primary flex items-center gap-1 hover:underline">See all <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {products.filter(p => p.badge === 'FLASH DEAL').slice(0, 5).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Loyalty Banner */}
      {/* Removed: LoyaltyBanner */}
      {/* <LoyaltyBanner /> */}

      {/* Trending */}
      <section className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Trending Now 🔥</h2>
          <Link to="/shop" className="text-sm text-primary flex items-center gap-1 hover:underline">View all <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {trending.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* All Products */}
      <section className="bg-warm py-10">
        <div className="container">
          <h2 className="font-display text-2xl font-bold mb-6">Recommended for You</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {recommended.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-8">
            <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-primary-foreground transition-colors">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-10">
        <h2 className="font-display text-2xl font-bold mb-6 text-center">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Chioma A.', loc: 'Lekki, Lagos', text: "Cedokamall is the best thing to happen to online shopping in Nigeria! Fast delivery, amazing prices. I'm never going back to other sites." },
            { name: 'Emeka O.', loc: 'Ikeja, Lagos', text: 'I ordered an iPhone on Monday and got it Tuesday morning! The CedokaPoints system is genius — already Gold tier. 💪' },
            /* Removed: Spin wheel testimonial */
            // { name: 'Funke B.', loc: 'Victoria Island', text: "My go-to for everything. From groceries to electronics, the quality is always top-notch. The spin wheel gave me free shipping last week!" },
            { name: 'Funke B.', loc: 'Victoria Island', text: "My go-to for everything. Latest gadgets, accessories, and tech. The quality is always top-notch. Highly recommended!" },
          ].map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-6 border">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-gold text-gold" />)}
              </div>
              <p className="text-sm text-muted-foreground mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {t.name.split(' ').map(w => w[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.loc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WhatsApp float */}
      <a
        href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2349128817136'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[hsl(142,70%,45%)] text-primary-foreground shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
      >
        💬
      </a>

      <Footer />
    </div>
  );
};

export default Index;

