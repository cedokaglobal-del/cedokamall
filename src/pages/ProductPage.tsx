import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, Share2, Minus, Plus, ChevronRight, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';

const formatPrice = (n: number) => '₦' + n.toLocaleString();

const ProductPage = () => {
  const { id } = useParams();
  const { getProductById, products } = useProductStore();
  
  const product = useMemo(() => getProductById(id || ''), [id, getProductById]);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const addItem = useCartStore((s) => s.addItem);

  const related = useMemo(() => {
    if (!product) return [];
    return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5);
  }, [product, products]);

  if (!product) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Product not found</h1>
        <Link to="/shop" className="text-primary underline mt-4 block">Back to shop</Link>
      </div>
      <Footer />
    </div>
  );

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb and Return Button */}
      <div className="container py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight className="w-3 h-3" />
            <Link to="/shop" className="hover:text-primary">Shop</Link> <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate max-w-xs">{product.name}</span>
          </div>
          <Link to="/shop" className="flex items-center gap-1.5 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm whitespace-nowrap">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="rounded-xl overflow-hidden border bg-muted aspect-square">
              <img src={product.images && product.images.length > 0 ? product.images[activeImg] : product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImg(idx)} className={`w-20 h-20 rounded-lg border flex-shrink-0 overflow-hidden ${activeImg === idx ? 'border-primary border-2 shadow-sm scale-105' : 'opacity-70'} transition-all`}>
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {product.badge && (
              <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">{product.badge}</span>
            )}
            <h1 className="font-display text-2xl md:text-3xl font-bold">{product.name}</h1>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-gold text-gold' : 'text-border'}`} />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-destructive/10 text-destructive text-sm font-bold px-2 py-0.5 rounded">-{discount}%</span>
                </>
              )}
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${product.inStock > 10 ? 'bg-primary' : 'bg-accent'}`} />
              <span>{product.inStock > 10 ? `In Stock (${product.inStock} left)` : `Only ${product.inStock} left — hurry!`}</span>
            </div>

            <p className="text-sm text-muted-foreground">Brand: <strong>{product.seller || 'Generic'}</strong></p>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted"><Minus className="w-4 h-4" /></button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-muted"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-emerald-light transition-colors">
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-accent-foreground font-bold hover:bg-cta-orange-light transition-colors">
                Buy Now
              </button>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><Heart className="w-4 h-4" /> Wishlist</button>
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><Share2 className="w-4 h-4" /> Share & Earn 500pts</button>
            </div>

            {/* Trust */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t">
              {[
                { icon: Truck, label: 'Free Nationwide delivery' },
                { icon: Shield, label: 'Genuine products' },
                { icon: RotateCcw, label: '7-day returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center">
                  <Icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold mb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
