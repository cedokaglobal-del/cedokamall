import { useState, type ComponentType } from 'react';
import { SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOption {
  slug: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  count?: number;
}

interface CategoryFilterBase {
  options: FilterOption[];
  activeSlug: string;
  onSelect: (slug: string) => void;
  priceMax: number;
  priceStep: number;
  priceValue: number;
  onPriceChange: (max: number) => void;
  resultCount?: number;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const formatNaira = (n: number) => `\u20A6${n.toLocaleString()}`;

/**
 * Desktop sidebar filter — Collections list + price range + reset.
 * Render inside the page's flex layout row.
 */
export const FilterSidebar = ({
  options,
  activeSlug,
  onSelect,
  priceMax,
  priceStep,
  priceValue,
  onPriceChange,
  resultCount,
  onReset,
  hasActiveFilters,
}: CategoryFilterBase) => (
  <aside className="hidden w-64 flex-shrink-0 lg:block sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto space-y-8">
    <div>
      <h2 className="mb-5 flex items-center gap-3 font-serif text-xl font-bold text-navy">
        <SlidersHorizontal className="h-5 w-5 text-gold" aria-hidden="true" />
        Filter by
      </h2>
      <ul className="space-y-1.5">
        {options.map((option) => {
          const Icon = option.icon;
          const active = activeSlug === option.slug;
          return (
            <li key={option.slug}>
              <button
                type="button"
                onClick={() => onSelect(option.slug)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-md px-4 py-2.5 text-left text-xs font-bold uppercase tracking-[0.1em] transition-all',
                  active
                    ? 'bg-navy text-gold shadow-md translate-x-1.5'
                    : 'text-navy/60 hover:bg-white hover:text-navy'
                )}
              >
                <span className="inline-flex min-w-0 items-center gap-3">
                  {Icon && (
                    <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-gold' : 'text-navy/40')} />
                  )}
                  <span className="truncate">{option.label}</span>
                </span>
                {typeof option.count === 'number' && (
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums',
                      active ? 'bg-gold/20 text-gold' : 'bg-navy/5 text-navy/40'
                    )}
                  >
                    {option.count}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>

    <div className="rounded-md border border-gold-antique/10 bg-white p-5">
      <h3 className="mb-1 font-serif text-base font-bold text-navy">Max price</h3>
      <p className="mb-3 text-xs text-navy/50">Show items up to</p>
      <input
        type="range"
        min={0}
        max={priceMax}
        step={priceStep}
        value={priceValue}
        onChange={(event) => onPriceChange(Number(event.target.value))}
        className="w-full cursor-pointer appearance-none rounded-full bg-ivory accent-gold"
        aria-label="Maximum price"
      />
      <p className="mt-3 text-center text-base font-bold tabular-nums text-navy">
        {formatNaira(priceValue)}
      </p>
    </div>

    {typeof resultCount === 'number' && (
      <p className="text-xs font-semibold text-navy/50" role="status">
        {resultCount} item{resultCount === 1 ? '' : 's'} found
      </p>
    )}
    {hasActiveFilters && (
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-md border border-gold-antique/20 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-navy/60 transition-all hover:border-gold hover:text-navy"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Reset filters
      </button>
    )}
  </aside>
);

/**
 * Mobile filter — one clean collapsible panel (category pills + price + reset).
 * Render above the product grid; replaces horizontal scroll strips.
 */
export const FilterMobileBar = ({
  options,
  activeSlug,
  onSelect,
  priceMax,
  priceStep,
  priceValue,
  onPriceChange,
  resultCount,
  onReset,
  hasActiveFilters,
}: CategoryFilterBase) => {
  const [open, setOpen] = useState(false);
  const activeLabel = options.find((o) => o.slug === activeSlug)?.label ?? 'All';

  return (
    <div className="mb-8 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-gold-antique/20 bg-white px-4 py-3 text-left shadow-sm transition-colors active:bg-ivory"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-navy/45">
              Filter{hasActiveFilters ? ' • active' : ''}
              {typeof resultCount === 'number' ? ` • ${resultCount} found` : ''}
            </span>
            <span className="block truncate text-sm font-bold text-navy">{activeLabel}</span>
          </span>
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-navy/50 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-gold-antique/10 bg-white p-4 shadow-sm">
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-navy/45">
            Category
          </p>
          <div className="grid grid-cols-2 gap-2">
            {options.map((option) => {
              const active = activeSlug === option.slug;
              return (
                <button
                  key={option.slug}
                  type="button"
                  onClick={() => onSelect(option.slug)}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'truncate rounded-lg px-3 py-2.5 text-xs font-bold transition-all touch-manipulation',
                    active
                      ? 'bg-gold text-navy shadow'
                      : 'bg-ivory text-navy/60 hover:text-navy'
                  )}
                >
                  {option.label}
                  {typeof option.count === 'number' && (
                    <span className={cn('ml-1 tabular-nums', active ? 'text-navy/70' : 'text-navy/35')}>
                      ({option.count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 border-t border-gold-antique/10 pt-4">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-navy/45">Max price</p>
              <p className="text-sm font-bold tabular-nums text-navy">{formatNaira(priceValue)}</p>
            </div>
            <input
              type="range"
              min={0}
              max={priceMax}
              step={priceStep}
              value={priceValue}
              onChange={(event) => onPriceChange(Number(event.target.value))}
              className="w-full cursor-pointer appearance-none rounded-full bg-ivory accent-gold"
              aria-label="Maximum price"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                onReset();
                setOpen(false);
              }}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gold-antique/20 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-navy/60 transition-all hover:border-gold hover:text-navy"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
