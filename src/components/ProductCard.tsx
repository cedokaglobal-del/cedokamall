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
    <article className="group overflow-hidden rounded-md bg-white border border-gold-antique/10 transition-colors duration-200 hover:border-gold/20 hover:-translate-y-0.5">
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
              event.currentTarget.src = '/placeholder-product.jpg';
            }}
          />
        </Link>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        {/* Product Name */}
        <Link to={`/product/${product.id}`} state={{ from }}>
          <h3 className="font-serif text-base sm:text-lg font-bold leading-tight text-charcoal transition-colors duration-200 hover:text-gold line-clamp-2 group-hover:text-gold">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={cn(
                'h-3 w-3 transition-colors duration-200',
                index < Math.round(product.rating || 0) ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'
              )}
            />
          ))}
          <span className="ml-1 text-xs font-bold text-charcoal/60">
            ({product.reviews})
          </span>
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between pt-3 border-t border-gold-antique/10">
          <div className="flex min-w-0 flex-col">
            <span className="break-words text-base sm:text-lg font-bold tracking-tight text-gold transition-colors duration-200">
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
                category: product.category,
              });
              toast.success(`${product.name} added to cart`, {
                duration: 2000,
              });
            }}
            className="flex h-10 w-10 items-center justify-center rounded-md bg-navy text-gold shadow-premium-sm transition-all duration-200 hover:scale-110 hover:bg-gold hover:text-navy active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-5 w-5 transition-transform duration-200 pointer-events-none" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default React.memo(ProductCard);