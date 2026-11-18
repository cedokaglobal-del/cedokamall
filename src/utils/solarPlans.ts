import type { SolarPlan, SolarPlanCategory } from '@/types/solarPlan';

/** Canonical order used across public catalogue sections. */
export const SOLAR_PLAN_SECTION_ORDER: SolarPlanCategory[] = [
  'Basic Plans',
  'Standard Plans',
  'Premium Plans',
  'Residential Plans',
  'Commercial Plans',
  'Custom Plans',
];

export interface SolarPlanGroup {
  category: SolarPlanCategory;
  plans: SolarPlan[];
}

/**
 * Groups only published plans. Unknown/custom categories are kept and listed
 * after the standard ones so an administrator never loses a plan on the public
 * site because of an unusual category name.
 */
export const groupPlansByCategory = (plans: SolarPlan[]): SolarPlanGroup[] => {
  const active = plans.filter((plan) => plan.isActive);
  const buckets = new Map<string, SolarPlan[]>();

  for (const plan of active) {
    const key = (plan.category || 'Basic Plans').trim();
    const bucket = buckets.get(key);
    if (bucket) bucket.push(plan);
    else buckets.set(key, [plan]);
  }

  const groups: SolarPlanGroup[] = [];
  const seen = new Set<string>();

  for (const category of SOLAR_PLAN_SECTION_ORDER) {
    const bucket = buckets.get(category);
    if (bucket?.length) {
      groups.push({ category, plans: bucket });
      seen.add(category);
    }
  }

  const extras = Array.from(buckets.entries())
    .filter(([category]) => !seen.has(category))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, bucket]) => ({ category, plans: bucket }));

  return [...groups, ...extras];
};

export const getPlanCategories = (plans: SolarPlan[]): SolarPlanCategory[] => {
  const present = new Set(plans.filter((p) => p.isActive).map((p) => p.category));
  return SOLAR_PLAN_SECTION_ORDER.filter((category) => present.has(category));
};

export const formatPlanPrice = (price: number): string =>
  price > 0 ? `₦${price.toLocaleString()}` : 'Request a quote';

export interface PlanHighlight {
  label: string;
  value: string;
}

/** Two to three concise specs for a product card; full specs live on the detail page. */
export const getPlanHighlights = (plan: SolarPlan): PlanHighlight[] => {
  const highlights: PlanHighlight[] = [];

  if (plan.inverterType) highlights.push({ label: 'Inverter', value: plan.inverterType });
  else if (plan.capacity) highlights.push({ label: 'System', value: plan.capacity });

  if (plan.batteryType) highlights.push({ label: 'Battery', value: plan.batteryType });

  if (plan.panelType) highlights.push({ label: 'Panels', value: plan.panelType });
  else if (plan.totalSolarCapacity) highlights.push({ label: 'Solar', value: plan.totalSolarCapacity });

  return highlights.slice(0, 3);
};
