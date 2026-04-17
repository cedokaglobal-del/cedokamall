export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  inStock: number;
  seller: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  specs?: Record<string, string>;
  warranty?: string;
  sku?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFormData {
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  inStock: number;
  seller: string;
  image: string;
  specs?: Record<string, string>;
  warranty?: string;
  sku?: string;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  searchTerm?: string;
}
