import { Link } from 'react-router-dom';
import { ArrowRight, Sun } from 'lucide-react';
import type { SolarPlan } from '@/types/solarPlan';
import SolarPlanProductCard from '@/components/SolarPlanProductCard';
import { groupPlansByCategory } from '@/utils/solarPlans';

interface SolarPlansByCategoryProps {
  plans: SolarPlan[];
  /** When set, only the first N plans of each category are shown. */
  limitPerCategory?: number;
  /** Used to keep DOM ids unique if the component appears twice on a page. */
  idPrefix?: string;
  showViewAll?: boolean;
}

/**
 * Renders each published plan under its own category heading. Empty categories
 * are skipped, so an administrator never sees a blank section on the site.
 */
const SolarPlansByCategory = ({
  plans,
  limitPerCategory,
  idPrefix = 'plans',
  showViewAll = true,
}: SolarPlansByCategoryProps) => {
  const groups = groupPlansByCategory(plans);

  if (groups.length === 0) {
    return (
      <div className="rounded-md border border-gold-antique/10 bg-white py-14 text-center">
        <Sun className="mx-auto h-10 w-10 text-gold/35" aria-hidden="true" />
        <p className="mt-3 font-serif text-xl font-bold text-navy">No solar plans published yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-navy/55">
          Our ready-made solar packages are being prepared. Check back shortly, or ask us to build a system around your
          home or business.
        </p>
        <a
          href="https://wa.me/2349128817136"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-navy px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-navy"
        >
          Talk to Cedoka
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {groups.map(({ category, plans: categoryPlans }) => {
        const visible = limitPerCategory ? categoryPlans.slice(0, limitPerCategory) : categoryPlans;
        const headingId = `${idPrefix}-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

        return (
          <section key={category} id={headingId} className="scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-gold-antique/15 pb-3">
              <div className="flex items-baseline gap-3">
                <h3 className="font-serif text-xl font-bold text-navy sm:text-2xl">{category}</h3>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-navy/40">
                  {categoryPlans.length} {categoryPlans.length === 1 ? 'plan' : 'plans'}
                </span>
              </div>
              {showViewAll && categoryPlans.length > visible.length && (
                <Link
                  to={`/solar?planCategory=${encodeURIComponent(category)}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gold hover:text-gold-antique"
                >
                  View category <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((plan, index) => (
                <SolarPlanProductCard key={plan.id} plan={plan} priority={index < 4} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default SolarPlansByCategory;
