import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

const fallbackImage = '/image.png';
const formatPrice = (amount: number) => `₦${amount.toLocaleString()}`;

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, products, isLoading, hasLoaded, rateProduct } = useProductStore();
  const addItem = useCartStore((state) => state.addItem);

  const product = useMemo(() => getProductById(id || ''), [getProductById, id]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRating, setIsRating] = useState(false);

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return products
      .filter((entry) => entry.category === product.category && entry.id !== product.id)
      .slice(0, 5);
  }, [product, products]);

  if (isLoading || (!hasLoaded && !product)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <h1 className="font-display text-2xl font-bold">Loading product</h1>
          <p className="mt-2 text-muted-foreground">Please wait while we load the latest product details.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Product not found</h1>
          <Link to="/shop" className="mt-4 block text-primary underline">
            Back to shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const gallery = product.images && product.images.length > 0 ? product.images : [product.image];
  const currentImage = gallery[activeImage] || product.image || fallbackImage;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      inStock: product.inStock,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleRate = async (rating: number) => {
    if (isRating) return;
    setIsRating(true);
    try {
      await rateProduct(product.id, rating);
      toast.success('Thank you for your rating!');
    } catch (error) {
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setIsRating(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory">
      <Header />

      <div className="container py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy/40">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/shop" className="hover:text-gold transition-colors">Collections</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-navy truncate max-w-[200px]">{product.name}</span>
          </nav>
          <Link
            to="/shop"
            className="flex items-center gap-2 rounded-md bg-white border border-gold-antique/20 px-5 py-2 text-xs font-bold uppercase tracking-widest text-navy hover:bg-navy hover:text-gold transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left: Images */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="aspect-square overflow-hidden rounded-md border border-gold-antique/10 bg-white shadow-premium group">
              <img
                src={currentImage}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(event) => {
                  event.currentTarget.src = fallbackImage;
                }}
              />
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {gallery.map((image, index) => (
                  <button
                    key={`${product.id}-${index}`}
                    onClick={() => setActiveImage(index)}
                    className={`h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all shadow-sm ${
                      activeImage === index
                        ? 'border-gold scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                {product.badge && (
                  <span className="inline-block rounded-sm bg-navy px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold shadow-md">
                    {product.badge}
                  </span>
                )}
                <h1 className="font-serif text-3xl font-bold leading-tight md:text-5xl text-navy">{product.name}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, index) => (
                      <Star 
                        key={index} 
                        className={`h-4 w-4 ${index < Math.round(product.rating || 0) ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-navy">{product.rating}</span>
                  <span className="text-sm text-navy/40 font-sans uppercase tracking-tighter">({product.reviews} Verification Reviews)</span>
                </div>
              </div>

              <div className="flex items-baseline gap-4 py-4 border-y border-gold-antique/10">
                <span className="text-4xl font-bold text-gold tracking-tight">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl text-navy/30 line-through font-light">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="rounded-sm bg-gold/10 px-2 py-1 text-xs font-bold text-gold uppercase tracking-widest">
                      SAVE {discount}%
                    </span>
                  </div>
                )}
              </div>

              <p className="text-lg text-navy/70 leading-relaxed font-sans">{product.description}</p>

              {product.features && product.features.length > 0 && (
                <div className="space-y-4 py-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-navy">Signature Features</h3>
                  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-navy/80 group">
                        <CheckCircle2 className="h-5 w-5 text-gold shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-6 py-4">

                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full shadow-inner ${product.inStock > 10 ? 'bg-gold' : 'bg-red-500 animate-pulse'}`} />
                  <span className="text-xs font-bold uppercase tracking-widest text-navy/60">
                    {product.inStock > 10 ? 'Available for Immediate Delivery' : `Strictly Limited: ${product.inStock} Remaining`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-3 rounded-md bg-navy py-4 text-sm font-bold uppercase tracking-widest text-gold shadow-xl hover:bg-gold hover:text-navy transition-all duration-300 transform hover:-translate-y-1"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to cart
                </button>
                <button 
                  onClick={() => {
                    handleAddToCart();
                    navigate('/cart');
                  }}
                  className="flex items-center justify-center gap-3 rounded-md bg-gold py-4 text-sm font-bold uppercase tracking-widest text-navy shadow-xl hover:bg-gold-antique hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                >
                  Buy now
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <button className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-navy/40 hover:text-gold transition-colors">
                  <Heart className="h-4 w-4 group-hover:fill-gold transition-all" />
                  Add to Wishlist
                </button>
                <button className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-navy/40 hover:text-gold transition-colors">
                  <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Share Collection
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 border-t border-gold-antique/10 pt-8">
                {[
                  { icon: Truck, label: 'Express Delivery' },
                  { icon: Shield, label: 'Authenticity Guaranteed' },
                  { icon: RotateCcw, label: '7-Day Return Service' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="text-center group">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-gold-antique/10 shadow-sm group-hover:border-gold transition-colors">
                      <Icon className="h-5 w-5 text-gold" />
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-navy/50 leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <div className="mb-12 flex items-center justify-between border-b border-gold-antique/10 pb-6">
              <h2 className="font-serif text-3xl font-bold text-navy">You may also like</h2>
              <Link to="/shop" className="text-xs font-bold uppercase tracking-widest text-gold hover:text-gold-antique">Discover More</Link>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
              {relatedProducts.map((entry) => (
                <ProductCard key={entry.id} product={entry} />
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
