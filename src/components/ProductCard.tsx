import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '@/data/products';
import { useCartStore } from '@/store/cartStore';

const formatPrice = (n: number) => '₦' + n.toLocaleString();

const ProductCard = ({ product }: { product: Product }) => {
  const addItem = useCartStore((s) => s.addItem);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
        {product.badge && (
          <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-md">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">
            -{discount}%
          </span>
        )}
        <div className="absolute bottom-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-8 h-8 bg-background rounded-full flex items-center justify-center shadow hover:bg-muted">
            <Heart className="w-4 h-4" />
          </button>
          <Link to={`/product/${product.id}`} className="w-8 h-8 bg-background rounded-full flex items-center justify-center shadow hover:bg-muted">
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="p-3">
        <p className="text-xs text-muted-foreground mb-1">{product.seller}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium leading-snug line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mt-1.5">
          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
          <span className="text-xs font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through ml-1.5">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <button
            onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image })}
            className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-emerald-light transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
