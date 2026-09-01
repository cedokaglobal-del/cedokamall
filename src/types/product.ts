export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  inStock: number;
  outOfStock?: boolean;
  seller: string;
  rating?: number;
  reviews?: number;
  searchCount?: number;
  salesCount?: number;
  badge?: string;
  specs?: Record<string, string>;
  features?: string[];
  warranty?: string;
  sku?: string;
  color?: string;
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
  image?: string;
  images?: string[];
  specs?: Record<string, string>;
  features?: string[];
  warranty?: string;
  sku?: string;
  color?: string;
  badge?: string;
}

export interface ProductFilter {
  category?: string;
  brands?: string[];
  solarType?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  searchTerm?: string;
}
