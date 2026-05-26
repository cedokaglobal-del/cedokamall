import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getOptimizedImageUrl, generateSrcSet, generateSizes } from '@/utils/performance';

const formatPrice = (amount: number) => `\u20A6${amount.toLocaleString()}`;

const ProductCard = ({ product, priority = false }: { product: Product, priority?: boolean }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <article className="group overflow-hidden rounded-lg border border-gold-antique/10 bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-premium-lg card-hover">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-ivory to-muted">
        <Link to={`/product/${product.id}`} className="absolute inset-0 z-0">
          <img
            src={getOptimizedImageUrl(product.image, 600)}
            srcSet={generateSrcSet(product.image)}
            sizes={generateSizes('product')}
            alt={product.name}
            className={cn(
              'h-full w-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110',
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            loading={priority ? "eager" : "lazy"}
            fetchpriority={priority ? "high" : "auto"}
            decoding="async"
            onLoad={() => setIsImageLoaded(true)}
            onError={(event) => {
              event.currentTarget.src = '/image.png';
              setIsImageLoaded(true);
            }}
          />
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
        </Link>

        {/* Badge */}
        {product.badge && (
          <span className="absolute left-2 sm:left-3 top-2 sm:top-3 z-10 rounded-sm bg-navy px-2 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-champagne shadow-premium-sm animation-fade-in">
            {product.badge}
          </span>
        )}
        
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute right-2 sm:right-3 top-2 sm:top-3 z-10 rounded-sm bg-gold px-2 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-navy shadow-premium-sm animation-fade-in">
            -{discount}%
          </span>
        )}

        {/* Hover Overlay */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 bg-navy/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            type="button"
            className="pointer-events-auto flex h-10 w-10 translate-y-4 items-center justify-center rounded-full bg-white shadow-premium-lg transition-all duration-300 group-hover:translate-y-0 hover:bg-gold hover:text-navy hover:scale-110"
            aria-label="Add to wishlist"
          >
            <Heart className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
          </button>
          <Link
            to={`/product/${product.id}`}
            className="pointer-events-auto flex h-10 w-10 translate-y-4 items-center justify-center rounded-full bg-white shadow-premium-lg transition-all duration-300 delay-75 group-hover:translate-y-0 hover:bg-gold hover:text-navy hover:scale-110"
            aria-label="View product"
          >
            <Eye className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col gap-2">
        {/* Seller */}
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-charcoal/50 line-clamp-1">
          {product.seller}
        </p>
        
        {/* Product Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="min-h-[2.5rem] font-serif text-sm sm:text-base font-bold leading-tight text-charcoal transition-colors duration-300 hover:text-gold line-clamp-2 group-hover:text-gold">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-1">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={cn(
                'h-3 w-3 transition-all duration-300',
                index < Math.floor(product.rating || 0)
                  ? 'fill-gold text-gold'
                  : 'fill-gray-200 text-gray-200'
              )}
            />
          ))}
          <span className="ml-1 text-xs font-bold text-charcoal/60">
            ({product.reviews})
          </span>
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between gap-3 border-t border-gold-antique/10 pt-3 mt-2">
          <div className="flex min-w-0 flex-col">
            <span className="break-words text-base sm:text-lg font-bold tracking-tight text-gold transition-colors duration-300">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-charcoal/40 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                inStock: product.inStock,
              });
              toast.success(`${product.name} added to cart`, {
                duration: 2000,
              });
            }}
            className="flex h-11 w-11 items-center justify-center rounded-md bg-navy text-gold shadow-premium-sm transition-all duration-300 hover:scale-110 hover:bg-gold hover:text-navy active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-5 w-5 transition-transform duration-300 pointer-events-none" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default React.memo(ProductCard);
