import React from 'react';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';

import { toast } from 'sonner';
const formatPrice = (n: number) => '₦' + n.toLocaleString();

const ProductCard = ({ product }: { product: Product }) => {
  const addItem = useCartStore((s) => s.addItem);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="group bg-white rounded-md border border-gold-antique/10 overflow-hidden hover:shadow-premium transition-shadow duration-300 will-change-transform"
    >
      <div className="relative overflow-hidden aspect-[4/5]">
        <Link to={`/product/${product.id}`} className="absolute inset-0 z-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out will-change-transform"
            loading="lazy"
            onError={(event) => {
              (event.target as HTMLImageElement).src = '/image.png';
            }}
          />
        </Link>
        {product.badge && (
          <span className="absolute top-3 left-3 bg-navy text-champagne text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider z-10">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-gold text-navy text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider shadow-sm z-10">
            -{discount}%
          </span>
        )}
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-navy/20 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-center justify-center gap-2 z-10 pointer-events-none">
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gold hover:text-navy transition-all duration-250 transform translate-y-4 group-hover:translate-y-0 pointer-events-auto will-change-transform">
            <Heart className="w-5 h-5" />
          </button>
          <Link to={`/product/${product.id}`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gold hover:text-navy transition-all duration-250 transform translate-y-4 group-hover:translate-y-0 delay-75 pointer-events-auto will-change-transform">
            <Eye className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="p-4">
        <p className="text-[10px] text-charcoal/50 uppercase tracking-widest mb-1 font-sans font-semibold">{product.seller}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif text-base font-bold leading-tight line-clamp-2 text-charcoal hover:text-gold transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 mt-2 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'}`} />
          ))}
          <span className="text-[10px] font-bold text-charcoal/60 ml-1">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gold-antique/5">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gold tracking-tight">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-charcoal/30 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem({ 
                id: product.id, 
                name: product.name, 
                price: product.price, 
                image: product.image,
                inStock: product.inStock 
              });
              toast.success(`${product.name} added to cart`);
            }}
            className="w-10 h-10 rounded-md bg-navy text-gold flex items-center justify-center hover:bg-gold hover:text-navy transition-all duration-250 shadow-md transform hover:scale-105 active:scale-95 will-change-transform"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-5 h-5 pointer-events-none" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(ProductCard);
