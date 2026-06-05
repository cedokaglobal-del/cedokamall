import { create } from 'zustand';
import { Product, ProductFormData, ProductFilter } from '@/types/product';
import { supabase } from '@/lib/supabase';
import { retryWithBackoff, supabaseCircuitBreaker } from '@/utils/resilience';
import { deduplicatedFetch } from '@/utils/performance';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ProductState {
  products: Product[];
  filter: ProductFilter;
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
  lastSyncedAt: string | null;

  fetchProducts: (force?: boolean) => Promise<void>;
  addProduct: (product: ProductFormData) => Promise<void>;
  updateProduct: (id: string, updates: Partial<ProductFormData>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clearAllProducts: () => Promise<void>;
  rateProduct: (id: string, rating: number) => Promise<void>;
  decrementStock: (id: string, quantity: number) => Promise<void>;
  setFilter: (filter: ProductFilter) => void;

  getFilteredProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
}

type CachedProduct = Omit<Product, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

const fallbackImage = '/image.png';
const PRODUCT_CACHE_KEY = 'cedokamall.products.cache.v2';

let pendingFetch: Promise<void> | null = null;
let productRealtimeChannel: RealtimeChannel | null = null;
let backgroundSyncTimeout: ReturnType<typeof setTimeout> | null = null;
let realtimeRefreshTimeout: ReturnType<typeof setTimeout> | null = null;

const parseImages = (value: unknown, fallback: string) => {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
  }

  if (typeof value === 'string' && value.length > 0) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
      }
    } catch {
      return [value];
    }
  }

  return fallback ? [fallback] : [];
};

const parseStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
      }
    } catch {
      return [value];
    }
  }

  return [];
};

const parseSpecs = (value: unknown) => {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return undefined;
  }

  return value as Record<string, string>;
};

const mapSupabaseToProduct = (row: Record<string, unknown>): Product => {
  const mainImage = typeof row.image === 'string' && row.image.length > 0 ? row.image : fallbackImage;
  const images = parseImages(row.images, mainImage);

  const specs = parseSpecs(row.specs);
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    description: String(row.description ?? ''),
    price: Number(row.price ?? 0),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    image: mainImage,
    images,
    category: String(row.category ?? ''),
    inStock: Number(row.stock ?? 0),
    seller: String(row.seller ?? ''),
    rating: Number(row.rating ?? 0),
    reviews: Number(row.reviews ?? 0),
    badge: typeof row.badge === 'string' ? row.badge : undefined,
    specs: specs,
    features: Array.isArray(row.features) 
      ? row.features.filter((f): f is string => typeof f === 'string') 
      : Array.isArray(specs?.features)
        ? (specs.features as any[]).filter((f): f is string => typeof f === 'string')
        : [],
    warranty: typeof row.warranty === 'string' ? row.warranty : undefined,
    sku: typeof row.sku === 'string' ? row.sku : undefined,
    color: typeof row.color === 'string' ? row.color : undefined,
    searchCount: typeof row.search_count === 'number' 
      ? row.search_count 
      : typeof specs?.search_count === 'number'
        ? specs.search_count
        : 0,
    salesCount: typeof row.sales_count === 'number' 
      ? row.sales_count 
      : typeof specs?.sales_count === 'number'
        ? specs.sales_count
        : 0,
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at ?? row.created_at)),
  };
};

const serializeProducts = (products: Product[]): CachedProduct[] =>
  products.map((product) => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));

const deserializeProducts = (products: CachedProduct[]): Product[] =>
  products.map((product) => ({
    ...product,
    image: typeof product.image === 'string' && product.image.length > 0 ? product.image : fallbackImage,
    images: parseImages(product.images, typeof product.image === 'string' ? product.image : fallbackImage),
    features: parseStringArray(product.features),
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  }));

const persistProducts = (products: Product[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(serializeProducts(products)));
  } catch (error) {
    console.error('Unable to cache products:', error);
  }
};

const loadCachedProducts = (): Product[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(PRODUCT_CACHE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CachedProduct[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return deserializeProducts(parsed);
  } catch (error) {
    console.error('Unable to hydrate cached products:', error);
    return [];
  }
};

const buildProductPayload = (productData: ProductFormData) => {
  const images = productData.images?.filter(Boolean) || [];

  return {
    name: productData.name,
    description: productData.description,
    price: productData.price,
    original_price: productData.originalPrice ?? null,
    image: images[0] || productData.image || fallbackImage,
    images,
    category: productData.category,
    stock: productData.inStock,
    seller: productData.seller,
    sku: productData.sku || null,
    warranty: productData.warranty || null,
    color: productData.color || null,
    specs: {
      ...(productData.specs || {}),
      features: productData.features || [],
    },
    badge: productData.badge || null,
  };
};

const cachedProducts = loadCachedProducts();

const scheduleBackgroundSync = () => {
  if (backgroundSyncTimeout) {
    clearTimeout(backgroundSyncTimeout);
  }

  backgroundSyncTimeout = setTimeout(async () => {
    try {
      await supabaseCircuitBreaker.execute(async () => {
        await retryWithBackoff(
          async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const { data, error } = await supabase
              .from('products')
              .select('*')
              .order('created_at', { ascending: false });

            clearTimeout(timeoutId);

            if (error) throw error;

            const current = useProductStore.getState().products;
            const products = (data || []).map(mapSupabaseToProduct);
            if (JSON.stringify(products) !== JSON.stringify(current)) {
              persistProducts(products);
              useProductStore.setState({
                products,
                lastSyncedAt: new Date().toISOString(),
                error: null,
              });
            }
          },
          { maxRetries: 2, initialDelayMs: 1000 }
        );
      });
    } catch (err) {
      console.debug('Background sync failed (non-blocking):', err);
    } finally {
      backgroundSyncTimeout = null;
    }
  }, 2000);
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: cachedProducts,
  filter: {},
  isLoading: false,
  error: null,
  hasLoaded: cachedProducts.length > 0,
  lastSyncedAt: cachedProducts.length > 0 ? new Date().toISOString() : null,

  fetchProducts: async (force = false) => {
    const state = get();
    
    // If we have cached products and not forcing, return immediately
    if (!force && state.products.length > 0) {
      scheduleBackgroundSync();
      return;
    }

    if (!force && state.hasLoaded && state.products.length > 0) {
      return;
    }

    set((current) => ({ isLoading: current.products.length === 0, error: null }));

    pendingFetch = (async () => {
      try {
        const fetchKey = `products_${force}`;
        
        // Use deduplicatedFetch to prevent overlapping requests
        await deduplicatedFetch(fetchKey, async () => {
          await supabaseCircuitBreaker.execute(async () => {
            await retryWithBackoff(
              async () => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 20000);

                const { data, error } = await supabase
                  .from('products')
                  .select('*')
                  .order('created_at', { ascending: false });

                clearTimeout(timeoutId);

                if (error) {
                  throw error;
                }

                const products = (data || []).map(mapSupabaseToProduct);
                persistProducts(products);
                set({
                  products,
                  hasLoaded: true,
                  lastSyncedAt: new Date().toISOString(),
                  error: null,
                });
              },
              { maxRetries: 2, initialDelayMs: 800 }
            );
          });
        });
      } catch (error) {
        console.error('Error fetching products:', error);
        set((current) => ({
          error: current.products.length > 0 ? null : 'Database temporarily unavailable. Showing cached products.',
          hasLoaded: true,
        }));
      } finally {
        set({ isLoading: false });
        pendingFetch = null;
      }
    })();

    await pendingFetch;

    return pendingFetch;
  },

  addProduct: async (productData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            ...buildProductPayload(productData),
            rating: 0,
            reviews: 0,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        set((state) => {
          const products = [mapSupabaseToProduct(data), ...state.products];
          persistProducts(products);
          return {
            products,
            error: null,
            hasLoaded: true,
            lastSyncedAt: new Date().toISOString(),
          };
        });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const current = get().products.find((product) => product.id === id);
      const nextPayload = buildProductPayload({
        name: updates.name ?? current?.name ?? '',
        description: updates.description ?? current?.description ?? '',
        price: updates.price ?? current?.price ?? 0,
        originalPrice: updates.originalPrice ?? current?.originalPrice,
        image: updates.image ?? current?.image,
        images: updates.images ?? current?.images,
        category: updates.category ?? current?.category ?? '',
        inStock: updates.inStock ?? current?.inStock ?? 0,
        seller: updates.seller ?? current?.seller ?? '',
        sku: updates.sku ?? current?.sku,
        warranty: updates.warranty ?? current?.warranty,
        specs: updates.specs ?? current?.specs,
        color: updates.color ?? current?.color,
        features: updates.features ?? current?.features,
        badge: updates.badge ?? current?.badge,
      });

      const { data, error } = await supabase
        .from('products')
        .update(nextPayload)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      const row = data?.[0];
      if (row) {
        set((state) => {
          const products = state.products.map((product) =>
            product.id === id ? mapSupabaseToProduct(row) : product
          );
          persistProducts(products);
          return {
            products,
            lastSyncedAt: new Date().toISOString(),
          };
        });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) {
        throw error;
      }

      set((state) => {
        const products = state.products.filter((product) => product.id !== id);
        persistProducts(products);
        return {
          products,
          lastSyncedAt: new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

   decrementStock: async (id: string, quantity: number) => {
     try {
       const current = get().products.find((p) => p.id === id);
       if (!current) return;
       if (current.inStock < quantity) {
         console.warn('Stock decrement failed: insufficient stock');
         return;
       }

       const newStock = current.inStock - quantity;

       const { data, error } = await supabase
         .from('products')
         .update({ stock: newStock })
         .eq('id', id)
         .gte('stock', quantity)
         .select();

       if (error) throw error;

       if (!data?.length) {
         console.warn('Stock decrement failed: concurrent update detected');
         return;
       }

       const row = data[0];
       set((state) => {
         const products = state.products.map((product) =>
           product.id === id ? mapSupabaseToProduct(row) : product
         );
         persistProducts(products);
         return {
           products,
           lastSyncedAt: new Date().toISOString(),
         };
       });
     } catch (error) {
       console.error('Error decrementing stock:', error);
       throw error;
     }
   },

  clearAllProducts: async () => {
    try {
      const { error } = await supabase.from('products').delete().not('id', 'is', null);

      if (error) {
        throw error;
      }

      persistProducts([]);
      set({
        products: [],
        hasLoaded: true,
        lastSyncedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error clearing products:', error);
      throw error;
    }
  },

  rateProduct: async (id, newRating) => {
    try {
      const current = get().products.find((p) => p.id === id);
      if (!current) return;

      const oldRating = current.rating || 0;
      const oldReviews = current.reviews || 0;
      
      // Calculate new average rating
      // Formula: ((oldRating * oldReviews) + newRating) / (oldReviews + 1)
      const nextReviews = oldReviews + 1;
      const nextRating = Number(((oldRating * oldReviews + newRating) / nextReviews).toFixed(1));

      const { data, error } = await supabase
        .from('products')
        .update({
          rating: nextRating,
          reviews: nextReviews,
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      const row = data?.[0];
      if (row) {
        set((state) => {
          const products = state.products.map((product) =>
            product.id === id ? mapSupabaseToProduct(row) : product
          );
          persistProducts(products);
          return {
            products,
            lastSyncedAt: new Date().toISOString(),
          };
        });
      }
    } catch (error) {
      console.error('Error rating product:', error);
      throw error;
    }
  },

  setFilter: (filter) => set({ filter }),

  getFilteredProducts: () => {
    const { products, filter } = get();
    return products.filter((product) => {
      if (filter.category && product.category !== filter.category) {
        return false;
      }
      if (filter.brands && filter.brands.length > 0 && !filter.brands.some((b) => b.toLowerCase() === product.seller.toLowerCase())) {
        return false;
      }
      if (filter.solarType && product.specs?.solarType !== filter.solarType && product.specs?.solar_type !== filter.solarType) {
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

  getProductById: (id) => get().products.find((product) => product.id === id),
}));

export const subscribeToProductChanges = () => {
  if (productRealtimeChannel) {
    return () => {
      if (!productRealtimeChannel) {
        return;
      }

      supabase.removeChannel(productRealtimeChannel);
      productRealtimeChannel = null;
    };
  }

  productRealtimeChannel = supabase
    .channel('products-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      () => {
        if (realtimeRefreshTimeout) {
          clearTimeout(realtimeRefreshTimeout);
        }

        realtimeRefreshTimeout = setTimeout(() => {
          realtimeRefreshTimeout = null;
          void useProductStore.getState().fetchProducts(true);
        }, 250);
      }
    )
    .subscribe();

  return () => {
    if (!productRealtimeChannel) {
      return;
    }

    supabase.removeChannel(productRealtimeChannel);
    productRealtimeChannel = null;
  };
};
