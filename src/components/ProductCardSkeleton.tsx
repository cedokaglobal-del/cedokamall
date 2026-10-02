import { cn } from '@/lib/utils';

/**
 * Loading placeholder that matches ProductCard's exact geometry, so the grid
 * does not reflow when real data arrives.
 */
const ProductCardSkeleton = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn(
      'overflow-hidden rounded-md border border-gold-antique/10 bg-white',
      className
    )}
  >
    <div className="aspect-[4/5] w-full animate-pulse bg-ivory" />
    <div className="space-y-2 p-2 sm:p-5">
      <div className="h-3 w-4/5 animate-pulse rounded bg-ivory" />
      <div className="h-3 w-3/5 animate-pulse rounded bg-ivory" />
      <div className="flex items-center gap-1 pt-1">
        <div className="h-2 w-2 animate-pulse rounded-full bg-ivory" />
        <div className="h-2 w-2 animate-pulse rounded-full bg-ivory" />
        <div className="h-2 w-2 animate-pulse rounded-full bg-ivory" />
        <div className="ml-1 h-2 w-6 animate-pulse rounded bg-ivory" />
      </div>
      <div className="flex items-center justify-between border-t border-gold-antique/10 pt-2 sm:pt-3">
        <div className="h-4 w-20 animate-pulse rounded bg-ivory" />
        <div className="h-8 w-8 animate-pulse rounded-md bg-ivory sm:h-10 sm:w-10" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({
  count = 9,
  className,
}: {
  count?: number;
  className?: string;
}) => (
  <div
    role="status"
    aria-label="Loading products"
    className={cn('grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5', className)}
  >
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
    <span className="sr-only">Loading products</span>
  </div>
);

export default ProductCardSkeleton;
