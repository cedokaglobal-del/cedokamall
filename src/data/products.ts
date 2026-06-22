import type { LucideIcon } from 'lucide-react';
import {
  Package,
  Sun,
} from 'lucide-react';
import { Product } from '@/types/product';

export interface Category {
  name: string;
  count: number;
  slug: string;
  icon: LucideIcon;
  subcategory?: string;
}

const CATEGORY_META: Record<string, { icon: LucideIcon; subcategory?: string }> = {
  Smartphones: { icon: Package, subcategory: 'Electronics' },
  Laptops: { icon: Package, subcategory: 'Electronics' },
  Tablets: { icon: Package, subcategory: 'Electronics' },
  'Audio & Sound': { icon: Package, subcategory: 'Electronics' },
  Cameras: { icon: Package, subcategory: 'Electronics' },
  Gaming: { icon: Package, subcategory: 'Electronics' },
  'Accessories Electronic Accessories': { icon: Package, subcategory: 'Electronics' },
  TV: { icon: Package, subcategory: 'Home Appliances' },
  Refrigerators: { icon: Package, subcategory: 'Home Appliances' },
  'Washing Machines': { icon: Package, subcategory: 'Home Appliances' },
  'Air Conditioners': { icon: Package, subcategory: 'Home Appliances' },
  Fans: { icon: Package, subcategory: 'Home Appliances' },
  Generators: { icon: Package, subcategory: 'Home Appliances' },
  Freezers: { icon: Package, subcategory: 'Home Appliances' },
  'Sound Systems': { icon: Package, subcategory: 'Electronics' },
  'Smart Home': { icon: Package, subcategory: 'Smart Living' },
  Solar: { icon: Package, subcategory: 'Energy' },
  'Kitchen Accessories': { icon: Package, subcategory: 'Kitchen' },
  'Solar Panels': { icon: Sun, subcategory: 'Energy' },
  Inverters: { icon: Sun, subcategory: 'Energy' },
  'Batteries & Storage': { icon: Sun, subcategory: 'Energy' },
  'Charge Controllers': { icon: Sun, subcategory: 'Energy' },
  'Solar Lights': { icon: Sun, subcategory: 'Energy' },
  'Solar Pumps & Fans': { icon: Sun, subcategory: 'Energy' },
  'Cables & Wiring': { icon: Sun, subcategory: 'Energy' },
  'Mounting & Frames': { icon: Sun, subcategory: 'Energy' },
  'Solar Accessories': { icon: Sun, subcategory: 'Energy' },
  'Power Tank': { icon: Sun, subcategory: 'Energy' },
};

export const DEFAULT_CATEGORY_NAMES = [
  'Accessories Electronic Accessories',
  'Air Conditioners',
  'Audio & Sound',
  'Cameras',
  'Fans',
  'Freezers',
  'Gaming',
  'Generators',
  'Kitchen Accessories',
  'Laptops',
  'Refrigerators',
  'Smart Home',
  'Smartphones',
  'Solar',
  'Sound Systems',
  'Tablets',
  'TV',
  'Washing Machines',
];

export const initialProducts: Product[] = [];

export const slugifyCategory = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getCategoryMeta = (name: string) =>
  CATEGORY_META[name] ?? { icon: Package, subcategory: 'Products' };

export const buildCategories = (products: Product[]): Category[] => {
  const counts = products.reduce<Record<string, number>>((acc, product) => {
    const categoryName = product.category?.trim();
    if (!categoryName) return acc;
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort(([nameA], [nameB]) => {
      const indexA = DEFAULT_CATEGORY_NAMES.indexOf(nameA);
      const indexB = DEFAULT_CATEGORY_NAMES.indexOf(nameB);

      if (indexA === -1 && indexB === -1) return nameA.localeCompare(nameB);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    })
    .map(([name, count]) => {
      const meta = getCategoryMeta(name);
      return {
        name,
        count,
        slug: slugifyCategory(name),
        icon: meta.icon,
        subcategory: meta.subcategory,
      };
    });
};

export const DEFAULT_SOLAR_CATEGORIES = [
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
];

export const getCategoryOptions = (products: Product[], extraCategories: string[] = []) => {
  const dynamicCategories = products
    .map((product) => product.category?.trim())
    .filter((category): category is string => Boolean(category));

  return Array.from(new Set([...DEFAULT_CATEGORY_NAMES, ...dynamicCategories, ...extraCategories])).sort();
};
