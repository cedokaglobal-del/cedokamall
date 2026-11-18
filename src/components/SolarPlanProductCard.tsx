import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MessageSquare, Sun } from 'lucide-react';
import type { SolarPlan } from '@/types/solarPlan';
import { cn } from '@/lib/utils';
import { formatPlanPrice, getPlanHighlights } from '@/utils/solarPlans';

interface SolarPlanProductCardProps {
  plan: SolarPlan;
  priority?: boolean;
  className?: string;
}

/**
 * Product-card styled tile for a published solar plan. The shell and image
 * ratio mirror `ProductCard` intentionally so plans line up row-for-row with
 * merchandise when mixed into the same grid.
 */
const SolarPlanProductCard = ({ plan, priority = false, className }: SolarPlanProductCardProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const detailsHref = `/solar-plans/${plan.id}`;
  const highlights = getPlanHighlights(plan);

  const quoteHref = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '2349128817136'}?text=${encodeURIComponent(
    `Hi Cedokamall! I'm interested in the ${plan.name} solar plan${plan.capacity ? ` (${plan.capacity})` : ''}. Please share availability and a quote.`
  )}`;

  return (
    <article
      id={`plan-${plan.id}`}
      className={cn(
        'group press flex scroll-mt-28 flex-col overflow-hidden rounded-md border border-gold-antique/10 bg-white transition-colors duration-200 hover:border-gold/30',
        className
      )}
    >
      {/* Image — fixed ratio keeps every card aligned */}
      <Link to={detailsHref} className="relative block aspect-[4/5] w-full overflow-hidden bg-ivory" aria-label={`View ${plan.name}`}>
        {plan.image && !imageFailed ? (
          <img
            src={plan.image}
            alt={plan.name}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-navy/[0.04]">
            <Sun className="h-8 w-8 text-gold/50" aria-hidden="true" />
            <span className="px-3 text-center font-serif text-xs font-bold uppercase tracking-wider text-navy/40">
              {plan.capacity || 'Solar Plan'}
            </span>
          </div>
        )}
        {plan.category && (
          <span className="absolute left-2.5 top-2.5 max-w-[85%] truncate rounded-full bg-navy px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gold shadow-sm">
            {plan.category}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-2 sm:gap-2.5 sm:p-5">
        <h3 className="min-h-[1.75rem] break-words font-serif text-[12px] font-bold leading-snug text-charcoal line-clamp-2 sm:min-h-[2.5rem] sm:text-base">
          <Link to={detailsHref} className="transition-colors hover:text-gold">
            {plan.name}
          </Link>
        </h3>

        {plan.description && (
          <p className="line-clamp-2 text-[11px] leading-4 text-navy/50 sm:text-[11px] sm:leading-5">
            {plan.description}
          </p>
        )}

        {highlights.length > 0 && (
          <dl className="mt-0.5 space-y-1 border-t border-gold-antique/10 pt-2 sm:pt-2.5">
            {highlights.map((item) => (
              <div key={item.label} className="flex items-baseline gap-1.5">
                <dt className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-navy/40 sm:text-[11px]">
                  {item.label}
                </dt>
                <dd className="min-w-0 flex-1 truncate text-[11px] font-medium text-navy/75 sm:text-[11px]" title={item.value}>
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-gold-antique/10 pt-2 sm:pt-3">
          <div className="flex min-w-0 flex-col">
            <span className="break-words text-[12px] font-bold tracking-tight text-gold sm:text-base">
              {formatPlanPrice(plan.price)}
            </span>
            {plan.backupTime && (
              <span className="truncate text-[11px] text-charcoal/45 sm:text-[11px]">{plan.backupTime}</span>
            )}
          </div>

          <Link
            to={detailsHref}
            aria-label={`View details of ${plan.name}`}
            title={`View ${plan.name}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy text-gold shadow-premium-sm transition-colors hover:bg-gold hover:text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 sm:h-10 sm:w-10"
          >
            <ArrowUpRight className="pointer-events-none h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </div>

        <a
          href={quoteHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-gold/30 bg-gold/5 px-2 py-2 text-[11px] font-bold uppercase tracking-wider text-navy transition-colors hover:bg-gold hover:text-navy sm:text-[11px]"
        >
          <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
          Request a Quote
        </a>
      </div>
    </article>
  );
};

export default SolarPlanProductCard;
