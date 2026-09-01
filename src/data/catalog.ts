import {
  Cpu,
  Sun,
  Sprout,
  type LucideIcon,
} from 'lucide-react';

export interface SubCategory {
  name: string;
  slug: string;
  href: string;
}

export interface MajorCategory {
  slug: string;
  name: string;
  /** Short, human line used on the homepage band. */
  tagline: string;
  /** Longer description used on the dedicated landing page. */
  description: string;
  href: string;
  icon: LucideIcon;
  /** Product category names that belong to this major category. */
  productCategories: string[];
  subcategories: SubCategory[];
}

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toSub = (parentHref: string, names: string[]): SubCategory[] =>
  names.map((name) => ({
    name,
    slug: slug(name),
    href: `${parentHref}?category=${slug(name)}`,
  }));

export const MAJOR_CATEGORIES: MajorCategory[] = [
  {
    slug: 'electronics-gadgets',
    name: 'Electronics & Gadgets',
    tagline: 'Phones, laptops, audio, TVs and the everyday tech Nigerians rely on.',
    description:
      'Original phones, tablets, laptops, audio, televisions and accessories from trusted brands, backed by warranty and nationwide delivery.',
    href: '/shop',
    icon: Cpu,
    productCategories: [
      'Smartphones',
      'Laptops',
      'Tablets',
      'Audio & Sound',
      'Cameras',
      'Gaming',
      'Accessories Electronic Accessories',
      'TV',
      'Sound Systems',
      'Smart Home',
    ],
    subcategories: toSub('/shop', [
      'Smartphones',
      'Laptops',
      'Tablets',
      'Audio & Sound',
      'TV',
      'Smart Home',
      'Gaming',
      'Accessories',
    ]),
  },
  {
    slug: 'renewable-energy',
    name: 'Solar',
    tagline: 'Panels, inverters, batteries and complete power systems.',
    description:
      'Build a reliable solar power system with panels, inverters, lithium batteries, charge controllers and accessories. Use our calculator to size the right solution.',
    href: '/solar',
    icon: Sun,
    productCategories: [
      'Solar',
      'Solar Panels',
      'Inverters',
      'Batteries & Storage',
      'Charge Controllers',
      'Solar Lights',
      'Solar Pumps & Fans',
      'Cables & Wiring',
      'Mounting & Frames',
      'Solar Accessories',
      'Power Tank',
    ],
    subcategories: toSub('/solar', [
      'Solar Panels',
      'Inverters',
      'Batteries & Storage',
      'Charge Controllers',
      'Power Tank',
      'Solar Lights',
      'Cables & Wiring',
      'Mounting & Frames',
      'Solar Accessories',
    ]),
  },
  {
    slug: 'farms',
    name: 'Farms',
    tagline: 'Fresh farm produce, agricultural products and equipment.',
    description:
      'Farm produce, agricultural products, equipment and supplies sourced for Nigerian farmers and households. Browse by category or get in touch for bulk and seasonal availability.',
    href: '/farms',
    icon: Sprout,
    productCategories: [
      'Farm Produce',
      'Agricultural Products',
      'Farm Equipment',
      'Farm Supplies',
    ],
    subcategories: toSub('/farms', [
      'Farm Produce',
      'Agricultural Products',
      'Farm Equipment',
      'Farm Supplies',
    ]),
  },
];

export const MAJOR_CATEGORY_MAP: Record<string, MajorCategory> = Object.fromEntries(
  MAJOR_CATEGORIES.map((category) => [category.slug, category])
);

/** Resolve a product's major category from its category name. */
export const resolveMajorCategory = (productCategory: string): MajorCategory | undefined => {
  const normalized = productCategory.trim();
  return MAJOR_CATEGORIES.find((major) =>
    major.productCategories.some(
      (name) => name.toLowerCase() === normalized.toLowerCase()
    )
  );
};

/** Categories (major + subcategories) that are part of the Solar group. */
export const RENEWABLE_ENERGY_CATEGORIES = MAJOR_CATEGORY_MAP[
  'renewable-energy'
].productCategories;

/** Return true when a product belongs to the Solar super category. */
export const isRenewableEnergyCategory = (productCategory: string): boolean =>
  RENEWABLE_ENERGY_CATEGORIES.some(
    (category) => category.toLowerCase() === productCategory.trim().toLowerCase()
  );

/** Categories that belong to the Farms group. */
export const FARM_CATEGORIES = MAJOR_CATEGORY_MAP['farms'].productCategories;
