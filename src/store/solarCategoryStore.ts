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
  'Accessories & Kits',
];

interface SolarCategoryState {
  categories: string[];
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  resetCategories: () => void;
}

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
      removeCategory: (category) =>
        set((state) => {
          if (state.categories.length <= 1) return state;
          if (DEFAULT_SOLAR_CATEGORIES.includes(category)) return state;
          return { categories: state.categories.filter((c) => c !== category) };
        }),
      resetCategories: () => set({ categories: [...DEFAULT_SOLAR_CATEGORIES] }),
    }),
    {
      name: 'cedokamall-solar-categories',
      merge: (persisted, current) => {
        const raw = (persisted as any)?.categories;
        const saved = Array.isArray(raw) ? raw.filter((c: any) => typeof c === 'string') : [];
        return {
          ...current,
          categories: [...new Set([...DEFAULT_SOLAR_CATEGORIES, ...saved])].sort(),
        };
      },
    }
  )
);
