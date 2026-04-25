import type { LucideIcon } from 'lucide-react';
import {
  Blend,
  ChefHat,
  Fan,
  Headphones,
  Laptop,
  Microwave,
  MonitorPlay,
  Package,
  Refrigerator,
  Smartphone,
  Speaker,
  Tablet,
  Tv,
  WashingMachine,
  Wind,
  Zap,
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
  Smartphones: { icon: Smartphone, subcategory: 'Electronics' },
  Laptops: { icon: Laptop, subcategory: 'Electronics' },
  Tablets: { icon: Tablet, subcategory: 'Electronics' },
  'Audio & Sound': { icon: Headphones, subcategory: 'Electronics' },
  Cameras: { icon: MonitorPlay, subcategory: 'Electronics' },
  Gaming: { icon: Blend, subcategory: 'Electronics' },
  Accessories: { icon: Package, subcategory: 'Electronics' },
  TV: { icon: Tv, subcategory: 'Home Appliances' },
  Refrigerators: { icon: Refrigerator, subcategory: 'Home Appliances' },
  'Washing Machines': { icon: WashingMachine, subcategory: 'Home Appliances' },
  'Air Conditioners': { icon: Wind, subcategory: 'Home Appliances' },
  Fans: { icon: Fan, subcategory: 'Home Appliances' },
  Generators: { icon: Zap, subcategory: 'Home Appliances' },
  Freezers: { icon: Refrigerator, subcategory: 'Home Appliances' },
  'Sound Systems': { icon: Speaker, subcategory: 'Electronics' },
  'Smart Home': { icon: Microwave, subcategory: 'Smart Living' },
  Solar: { icon: Zap, subcategory: 'Energy' },
  'Kitchen Accessories': { icon: ChefHat, subcategory: 'Kitchen' },
};

export const DEFAULT_CATEGORY_NAMES = [
  'Smartphones',
  'Laptops',
  'Tablets',
  'Audio & Sound',
  'Cameras',
  'Gaming',
  'Accessories',
  'TV',
  'Refrigerators',
  'Washing Machines',
  'Air Conditioners',
  'Fans',
  'Generators',
  'Freezers',
  'Sound Systems',
  'Smart Home',
  'Solar',
  'Kitchen Accessories',
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

export const getCategoryOptions = (products: Product[], extraCategories: string[] = []) => {
  const dynamicCategories = products
    .map((product) => product.category?.trim())
    .filter((category): category is string => Boolean(category));

  return Array.from(new Set([...DEFAULT_CATEGORY_NAMES, ...dynamicCategories, ...extraCategories])).sort();
};
