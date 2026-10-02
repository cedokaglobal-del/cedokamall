import { Star, MessageSquare } from 'lucide-react';
import type { SolarPlan } from '@/types/solarPlan';
import { cn } from '@/lib/utils';

interface SolarPlanProductCardProps {
  plan: SolarPlan;
  priority?: boolean;
  className?: string;
}

/**
 * A solar plan rendered in the product-card visual language, so plans sit in the
 * same grid as merchandise and line up row-for-row with ProductCard.
 *
 * The outer shell, image ratio, title clamp, rating row and price row mirror
 * `ProductCard` deliberately: if you change spacing or type scale there, change
 * it here too, otherwise the two grids drift apart.
 */
const SolarPlanProductCard = ({ plan, priority = false, className }: SolarPlanProductCardProps) => {
  const quoteHref = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2349128817136'}?text=${encodeURIComponent(
    `Hi Cedokamall! I'm interested in the ${plan.name} solar plan${plan.capacity ? ` (${plan.capacity})` : ''}. Please share availability and a quote.`
  )}`;

  // Plans have no review history, so show what the plan is built around instead
  // of an empty star row.
  const highlight = plan.capacity || plan.backupTime || 'Complete system';

  return (
    <article
      id={`plan-${plan.id}`}
      className={cn(
        'group press flex scroll-mt-28 flex-col overflow-hidden rounded-md border border-gold-antique/10 bg-white transition-colors duration-200 hover:border-gold/20',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-ivory">
        {plan.image ? (
          <img
            src={plan.image}
            alt={plan.name}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-navy/5">
            <span className="px-3 text-center font-serif text-sm font-bold uppercase tracking-wider text-navy/30">
              {plan.capacity || 'Solar Plan'}
            </span>
          </div>
        )}
        {plan.capacity && plan.image && (
          <span className="absolute left-3 top-3 rounded-full bg-navy px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gold shadow-sm">
            {plan.capacity}
          </span>
        )}
      </div>

      {/* Content — mirrors ProductCard's rhythm */}
      <div className="flex flex-1 flex-col gap-2 p-2 sm:gap-3 sm:p-5">
        <h3 className="min-h-[1.75rem] break-words font-serif text-[12px] font-bold leading-snug text-charcoal line-clamp-2 sm:min-h-[2.5rem] sm:text-base">
          {plan.name}
        </h3>

        <div className="mb-1 flex items-center gap-1 sm:mb-2">
          <Star className="h-2.5 w-2.5 shrink-0 fill-gold text-gold sm:h-3 sm:w-3" aria-hidden="true" />
          <span className="truncate text-[10px] font-bold uppercase tracking-wider text-charcoal/55 sm:text-[11px]">
            {highlight}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-gold-antique/10 pt-2 sm:pt-3">
          <div className="flex min-w-0 flex-col">
            {plan.price > 0 ? (
              <span className="break-words text-[12px] font-bold tracking-tight text-gold sm:text-base">
                {`\u20A6${plan.price.toLocaleString()}`}
              </span>
            ) : (
              <span className="text-[12px] font-bold tracking-tight text-gold sm:text-base">Request a quote</span>
            )}
            {plan.backupTime && (
              <span className="truncate text-[10px] text-charcoal/40 sm:text-[11px]">{plan.backupTime}</span>
            )}
          </div>

          <a
            href={quoteHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Request a quote for ${plan.name}`}
            title={`Request a quote for ${plan.name}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy text-gold shadow-premium-sm transition-all duration-200 hover:scale-110 hover:bg-gold hover:text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 sm:h-10 sm:w-10"
          >
            <MessageSquare className="pointer-events-none h-4 w-4 transition-transform duration-200 sm:h-5 sm:w-5" />
          </a>
        </div>
      </div>
    </article>
  );
};

export default SolarPlanProductCard;
