import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_CATEGORY_NAMES } from '@/data/products';

interface CategoryState {
  categories: string[];
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  resetCategories: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set) => ({
      categories: [...DEFAULT_CATEGORY_NAMES],
      addCategory: (category) =>
        set((state) => {
          const trimmed = category.trim();
          if (!trimmed || state.categories.includes(trimmed)) return state;
          return { categories: [...state.categories, trimmed].sort() };
        }),
      removeCategory: (category) =>
        set((state) => {
          if (state.categories.length <= 1) return state;
          if (DEFAULT_CATEGORY_NAMES.includes(category)) return state;
          return { categories: state.categories.filter((c) => c !== category) };
        }),
      resetCategories: () => set({ categories: [...DEFAULT_CATEGORY_NAMES] }),
    }),
    {
      name: 'cedokamall-categories',
      merge: (persisted, current) => ({
        ...current,
        categories: [...new Set([...DEFAULT_CATEGORY_NAMES, ...(persisted as any)?.categories ?? []])].sort(),
      }),
    }
  )
);
