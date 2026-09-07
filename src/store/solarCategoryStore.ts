import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_SOLAR_CATEGORIES = [
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

interface SolarCategoryState {
  categories: string[];
  addCategory: (category: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  removeCategory: (category: string) => void;
  resetCategories: () => void;
}

const PROTECTED_SOLAR_CATEGORIES = ['Solar Accessories'];

export const useSolarCategoryStore = create<SolarCategoryState>()(
  persist(
    (set) => ({
      categories: [...DEFAULT_SOLAR_CATEGORIES],
      addCategory: (category) =>
        set((state) => {
          const trimmed = category.trim();
          if (!trimmed || state.categories.includes(trimmed)) return state;
          return { categories: [...state.categories, trimmed].sort() };
        }),
      renameCategory: (oldName, newName) =>
        set((state) => {
          const trimmed = newName.trim();
          if (!trimmed || state.categories.includes(trimmed)) return state;
          if (PROTECTED_SOLAR_CATEGORIES.includes(oldName)) return state;
          return {
            categories: state.categories.map((c) => (c === oldName ? trimmed : c)).sort(),
          };
        }),
      removeCategory: (category) =>
        set((state) => {
          if (state.categories.length <= 1) return state;
          if (category === 'Solar Accessories') return state;
          return { categories: state.categories.filter((c) => c !== category) };
        }),
      resetCategories: () => set({ categories: [...DEFAULT_SOLAR_CATEGORIES] }),
    }),
    {
      name: 'cedokamall-solar-categories',
      merge: (persisted, current) => {
        const raw = persisted && typeof persisted === 'object' && 'categories' in persisted
          ? persisted.categories
          : undefined;
        const saved = Array.isArray(raw) ? raw.filter((c): c is string => typeof c === 'string') : [];
        return {
          ...current,
          categories: [...new Set([...DEFAULT_SOLAR_CATEGORIES, ...saved])].sort(),
        };
      },
    }
  )
);
