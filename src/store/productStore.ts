import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductFormData, ProductFilter } from '@/types/product';
import { initialProducts } from '@/data/products';

const PRODUCT_CATALOG_VERSION = 3;

interface ProductState {
  products: Product[];
  filter: ProductFilter;
  catalogVersion: number;
  
  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: ProductFormData) => void;
  updateProduct: (id: string, updates: Partial<ProductFormData>) => void;
  deleteProduct: (id: string) => void;
  clearAllProducts: () => void;
  setFilter: (filter: ProductFilter) => void;
  
  // Helpers
  getFilteredProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      filter: {},
      catalogVersion: PRODUCT_CATALOG_VERSION,

      setProducts: (products) => set({ products }),

      addProduct: (productData) => {
        const newProduct: Product = {
          id: Date.now().toString(),
          ...productData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ 
          products: [...state.products, newProduct] 
        }));
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) => 
            p.id === id 
              ? { ...p, ...updates, updatedAt: new Date() } 
              : p
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      clearAllProducts: () => {
        set({ products: [] });
      },

      setFilter: (filter) => set({ filter }),

      getFilteredProducts: () => {
        const { products, filter } = get();
        return products.filter((product) => {
          if (filter.category && product.category !== filter.category) {
            return false;
          }
          if (filter.minPrice !== undefined && product.price < filter.minPrice) {
            return false;
          }
          if (filter.maxPrice !== undefined && product.price > filter.maxPrice) {
            return false;
          }
          if (filter.inStock !== undefined && filter.inStock && product.inStock === 0) {
            return false;
          }
          if (filter.searchTerm) {
            const term = filter.searchTerm.toLowerCase();
            return (
              product.name.toLowerCase().includes(term) ||
              product.description.toLowerCase().includes(term) ||
              product.seller.toLowerCase().includes(term)
            );
          }
          return true;
        });
      },

      getProductById: (id) => {
        return get().products.find((p) => p.id === id);
      },
    }),
    {
      name: 'cedokamall-products', // Key for localStorage
      version: PRODUCT_CATALOG_VERSION,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<ProductState>;

        if (version !== PRODUCT_CATALOG_VERSION) {
          return {
            ...state,
            products: state.products ?? initialProducts,
            filter: state.filter ?? {},
            catalogVersion: PRODUCT_CATALOG_VERSION,
          };
        }

        return {
          ...state,
          catalogVersion: PRODUCT_CATALOG_VERSION,
        } as ProductState;
      },
    }
  )
);

