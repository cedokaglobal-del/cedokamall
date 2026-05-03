import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
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
    // Determine how many items of this product are already in the cart
    const cartItems = useCartStore.getState().items;
    const existingItem = cartItems.find(i => i.id === product.id);
    const quantityInCart = existingItem?.quantity || 0;
    
    // Check if we would exceed stock
    const availableToAdd = product.inStock - quantityInCart;
    const actualQuantityToAdd = Math.min(quantity, availableToAdd);
    
    if (actualQuantityToAdd <= 0) {
      toast.error(`Cannot add more. Already have ${quantityInCart} in cart (Stock: ${product.inStock})`);
      return;
    }

    if (actualQuantityToAdd < quantity) {
      toast.warning(`Only added ${actualQuantityToAdd} items due to stock limits.`);
    }

    for (let index = 0; index < actualQuantityToAdd; index += 1) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        inStock: product.inStock,
      });
    }
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
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/shop" className="hover:text-primary">
              Shop
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="max-w-xs truncate text-foreground">{product.name}</span>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid gap-8 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
              <img
                src={currentImage}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = fallbackImage;
                }}
              />
            </div>
            {gallery.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {gallery.map((image, index) => (
                  <button
                    key={`${product.id}-${index}`}
                    onClick={() => setActiveImage(index)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border transition-all ${
                      activeImage === index
                        ? 'scale-105 border-2 border-primary shadow-sm'
                        : 'opacity-70'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} preview ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = fallbackImage;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {product.badge && (
              <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                {product.badge}
              </span>
            )}
            <h1 className="font-display text-2xl font-bold md:text-3xl">{product.name}</h1>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  const isActive = hoverRating ? ratingValue <= hoverRating : ratingValue <= Math.round(product.rating || 0);
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={isRating}
                      onClick={() => handleRate(ratingValue)}
                      onMouseEnter={() => setHoverRating(ratingValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`transition-transform hover:scale-110 disabled:opacity-50 ${isRating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          isActive
                            ? 'fill-gold text-gold'
                            : 'text-border'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="rounded bg-destructive/10 px-2 py-0.5 text-sm font-bold text-destructive">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            {product.features && product.features.length > 0 && (
              <div className="space-y-2 py-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Key Features</h3>
                <ul className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <span
                className={`h-2 w-2 rounded-full ${
                  product.inStock > 10 ? 'bg-primary' : 'bg-accent'
                }`}
              />
              <span>
                {product.inStock > 10
                  ? `In Stock (${product.inStock} left)`
                  : `Only ${product.inStock} left - hurry!`}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Brand: <strong>{product.seller || 'Generic'}</strong>
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-lg border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(quantity + 1, product.inStock))}
                  className="flex h-10 w-10 items-center justify-center hover:bg-muted disabled:opacity-50"
                  disabled={quantity >= product.inStock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-primary-foreground transition-colors hover:bg-emerald-light"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 font-bold text-accent-foreground transition-colors hover:bg-cta-orange-light">
                Buy Now
              </button>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                <Heart className="h-4 w-4" />
                Wishlist
              </button>
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                <Share2 className="h-4 w-4" />
                Share & Earn 500pts
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t pt-4">
              {[
                { icon: Truck, label: 'Free Nationwide delivery' },
                { icon: Shield, label: 'Genuine products' },
                { icon: RotateCcw, label: '7-day returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center">
                  <Icon className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 font-display text-xl font-bold">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
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
