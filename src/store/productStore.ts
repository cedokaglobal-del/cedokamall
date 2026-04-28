import { create } from 'zustand';
import { Product, ProductFormData, ProductFilter } from '@/types/product';
import { supabase } from '@/lib/supabase';

interface ProductState {
  products: Product[];
  filter: ProductFilter;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  addProduct: (product: ProductFormData) => Promise<void>;
  updateProduct: (id: string, updates: Partial<ProductFormData>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clearAllProducts: () => Promise<void>;
  setFilter: (filter: ProductFilter) => void;

  // Helpers
  getFilteredProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
}

const fallbackImage = '/image.png';

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

const parseSpecs = (value: unknown) => {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return undefined;
  }

  return value as Record<string, string>;
};

const mapSupabaseToProduct = (row: any): Product => {
  const mainImage = row.image || fallbackImage;
  const images = parseImages(row.images, mainImage);

  return {
  id: row.id,
  name: row.name,
  description: row.description,
  price: Number(row.price),
  originalPrice: row.original_price ? Number(row.original_price) : undefined,
  image: mainImage,
  images,
  category: row.category,
  inStock: Number(row.stock),
  seller: row.seller,
  rating: Number(row.rating || 0),
  reviews: Number(row.reviews || 0),
  badge: row.badge || undefined,
  specs: parseSpecs(row.specs),
  warranty: row.warranty || undefined,
  sku: row.sku || undefined,
  color: row.color || undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at || row.created_at),
  };
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
    specs: productData.specs || {},
  };
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  filter: {},
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ products: (data || []).map(mapSupabaseToProduct) });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ error: 'We could not load products from the database.' });
    } finally {
      set({ isLoading: false });
    }
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

      if (error) throw error;

      if (data) {
        set((state) => ({ 
          products: [mapSupabaseToProduct(data), ...state.products] 
        }));
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
      });

      const { data, error } = await supabase
        .from('products')
        .update(nextPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set((state) => ({
          products: state.products.map((p) => 
            p.id === id ? mapSupabaseToProduct(data) : p
          ),
        }));
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  clearAllProducts: async () => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .not('id', 'is', null);

      if (error) throw error;

      set({ products: [] });
    } catch (error) {
      console.error('Error clearing products:', error);
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
}));
