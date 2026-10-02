import { useEffect, useState } from 'react';
import { Star, MessageSquare, X, Zap, Clock, AlertTriangle } from 'lucide-react';
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

  const [isOpen, setIsOpen] = useState(false);

  // Escape closes the detail sheet, matching the calculator drawer.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
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

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label={`View details of ${plan.name}`}
            title={`View ${plan.name}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy text-gold shadow-premium-sm transition-all duration-200 hover:scale-110 hover:bg-gold hover:text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 sm:h-10 sm:w-10"
          >
            <Star className="pointer-events-none h-4 w-4 transition-transform duration-200 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </article>

    {isOpen && (
      <div
        className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        onClick={() => setIsOpen(false)}
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${plan.name} details`}
          onClick={(event) => event.stopPropagation()}
          className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-[1.5rem] bg-ivory shadow-2xl sm:rounded-[1.5rem]"
        >
          <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gold-antique/10 bg-white px-5 py-4">
            <div className="min-w-0">
              {plan.capacity && (
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{plan.capacity}</p>
              )}
              <h2 className="mt-1 break-words font-serif text-lg font-bold text-navy sm:text-xl">{plan.name}</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close plan details"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ivory text-navy/60 transition-colors hover:bg-navy/10 hover:text-navy"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 px-5 py-5">
            {plan.image && (
              <img
                src={plan.image}
                alt={plan.name}
                className="aspect-[16/9] w-full rounded-xl border border-gold-antique/10 object-cover"
              />
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gold-antique/10 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy/50">Price</p>
                <p className="mt-1 text-lg font-bold text-gold">
                  {plan.price > 0 ? `\u20A6${plan.price.toLocaleString()}` : 'Request a quote'}
                </p>
              </div>
              {plan.backupTime && (
                <div className="rounded-xl border border-gold-antique/10 bg-white p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-navy/50">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    Backup time
                  </p>
                  <p className="mt-1 text-sm font-semibold text-navy">{plan.backupTime}</p>
                </div>
              )}
            </div>

            {plan.description && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy/50">About this plan</p>
                <p className="mt-1.5 whitespace-pre-line break-words text-[13px] leading-6 text-navy/75">
                  {plan.description}
                </p>
              </div>
            )}

            {plan.bestFor && (
              <div className="rounded-xl border border-gold-antique/10 bg-gold/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy/50">Best for</p>
                <p className="mt-1 text-sm font-semibold text-navy">{plan.bestFor}</p>
              </div>
            )}

            {plan.canPower.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-navy/50">
                  <Zap className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                  Can power
                </p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {plan.canPower.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-navy/70">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      <span className="break-words">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {plan.items.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy/50">What is included</p>
                <ul className="mt-2 divide-y divide-gold-antique/10 overflow-hidden rounded-xl border border-gold-antique/10 bg-white">
                  {plan.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                      <span className="min-w-0 break-words text-[13px] text-navy/80">
                        <span className="font-semibold text-navy">{item.quantity}&times;</span> {item.name}
                      </span>
                      <span className="shrink-0 text-[11px] tabular-nums text-navy/45">
                        {item.watts}W / {item.volts}V
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {plan.notes && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                <p className="text-[12px] leading-5 text-amber-800">{plan.notes}</p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <a
                href={quoteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-xs font-bold uppercase tracking-widest text-navy transition-colors hover:bg-gold-antique hover:text-white"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Request a quote
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold-antique/30 bg-white px-5 py-3 text-xs font-bold uppercase tracking-widest text-navy/70 transition-colors hover:border-gold hover:text-navy"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default SolarPlanProductCard;
