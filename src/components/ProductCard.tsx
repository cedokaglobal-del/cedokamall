import * as React from 'react';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getOptimizedImageUrl, generateSrcSet, generateSizes } from '@/utils/performance';

const formatPrice = (amount: number) => `\u20A6${amount.toLocaleString()}`;

const ProductCard = ({ product, priority = false }: { product: Product, priority?: boolean }) => {
  const addItem = useCartStore((state) => state.addItem);
  const location = useLocation();
  const from = { pathname: location.pathname, search: location.search };
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <article className="group press overflow-hidden rounded-md bg-white border border-gold-antique/10 transition-colors duration-200 hover:border-gold/20">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
        <Link to={`/product/${product.id}`} state={{ from }} className="absolute inset-0 z-0">
          <img
            src={getOptimizedImageUrl(product.image, 600)}
            srcSet={generateSrcSet(product.image)}
            sizes={generateSizes('product')}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onError={(event) => {
              // One-shot guard: never reassign the same fallback repeatedly.
              if (event.currentTarget.dataset.fallbackApplied) return;
              event.currentTarget.dataset.fallbackApplied = 'true';
              event.currentTarget.src = '/placeholder-product.jpg';
            }}
          />
        </Link>
        {product.outOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-navy/60">
            <span className="rounded-full bg-red-600 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 sm:p-5 flex flex-col gap-2 sm:gap-3">
        {/* Product Name — fixed 2-line height so cards in a row stay aligned */}
        <Link to={`/product/${product.id}`} state={{ from }}>
          <h3 className="font-serif text-xs sm:text-[15px] font-bold leading-snug text-charcoal transition-colors duration-200 hover:text-gold line-clamp-2 group-hover:text-gold min-h-[1.6rem] sm:min-h-[2.35rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating — the shared aggregate every shopper contributes to */}
        <div
          className="mb-1 flex items-center gap-0.5 sm:mb-2 sm:gap-1"
          aria-label={`Rated ${(product.rating || 0).toFixed(1)} out of 5 by ${product.reviews || 0} customers`}
        >
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={cn(
                'h-[9px] w-[9px] transition-colors duration-200 sm:h-2.5 sm:w-2.5',
                index < Math.round(product.rating || 0) ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'
              )}
            />
          ))}
          <span className="ml-1 text-[11px] font-bold text-charcoal/80 tabular-nums sm:text-xs">
            {(product.rating || 0).toFixed(1)}
          </span>
          <span className="text-[10px] text-charcoal/45 tabular-nums sm:text-[11px]">
            ({product.reviews || 0})
          </span>
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gold-antique/10">
          <div className="flex min-w-0 flex-col">
            <span className="break-words text-[11px] sm:text-[15px] font-bold tracking-tight text-gold transition-colors duration-200">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] sm:text-xs text-charcoal/40 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <button
            type="button"
            disabled={product.outOfStock}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                inStock: product.inStock,
                category: product.category,
              });
              toast.success(`${product.name} added to cart`, {
                duration: 2000,
              });
            }}
            className="flex h-11 w-11 sm:h-11 sm:w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md bg-navy text-gold shadow-premium-sm transition-all duration-200 hover:scale-110 hover:bg-gold hover:text-navy active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-navy disabled:hover:text-gold"
            aria-label={product.outOfStock ? 'Out of stock' : 'Add to cart'}
          >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 pointer-events-none" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default React.memo(ProductCard);