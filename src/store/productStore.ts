import { Product, ProductFormData, ProductFilter } from '@/types/product';

interface ProductStore {
  products: Product[];
  filter: ProductFilter;
  setProducts: (products: Product[]) => void;
  addProduct: (product: ProductFormData) => void;
  updateProduct: (id: string, product: Partial<ProductFormData>) => void;
  deleteProduct: (id: string) => void;
  setFilter: (filter: ProductFilter) => void;
  getFilteredProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
}

// Mock data for demo
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 799000,
    originalPrice: 850000,
    image: 'https://via.placeholder.com/300',
    category: 'Smartphones',
    description: 'Latest iPhone with advanced features',
    inStock: 45,
    seller: 'Apple',
    rating: 4.8,
    reviews: 2341,
    sku: 'APL-IP15-001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24',
    price: 649000,
    originalPrice: 720000,
    image: 'https://via.placeholder.com/300',
    category: 'Smartphones',
    description: 'Flagship Samsung phone with 5G',
    inStock: 32,
    seller: 'Samsung',
    rating: 4.7,
    reviews: 1892,
    sku: 'SAM-S24-001',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    name: 'Dell XPS 13 Laptop',
    price: 1299000,
    originalPrice: 1450000,
    image: 'https://via.placeholder.com/300',
    category: 'Laptops',
    description: 'Ultra-thin laptop with powerful performance',
    inStock: 18,
    seller: 'Dell',
    rating: 4.6,
    reviews: 1245,
    sku: 'DEL-XPS13-001',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '4',
    name: 'Sony WH-1000XM5 Headphones',
    price: 129000,
    originalPrice: 149000,
    image: 'https://via.placeholder.com/300',
    category: 'Audio & Sound',
    description: 'Noise-cancelling wireless headphones',
    inStock: 67,
    seller: 'Sony',
    rating: 4.9,
    reviews: 3421,
    sku: 'SON-WH-001',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
  },
];

class ProductStoreImpl implements ProductStore {
  products: Product[] = [];
  filter: ProductFilter = {};

  constructor() {
    // Initialize with mock data from localStorage or default
    const stored = localStorage.getItem('products');
    this.products = stored ? JSON.parse(stored) : mockProducts;
  }

  setProducts(products: Product[]): void {
    this.products = products;
    localStorage.setItem('products', JSON.stringify(products));
  }

  addProduct(productData: ProductFormData): void {
    const newProduct: Product = {
      id: Date.now().toString(),
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.push(newProduct);
    this.setProducts(this.products);
  }

  updateProduct(id: string, updates: Partial<ProductFormData>): void {
    const index = this.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.products[index] = {
        ...this.products[index],
        ...updates,
        updatedAt: new Date(),
      };
      this.setProducts(this.products);
    }
  }

  deleteProduct(id: string): void {
    this.products = this.products.filter((p) => p.id !== id);
    this.setProducts(this.products);
  }

  setFilter(filter: ProductFilter): void {
    this.filter = filter;
  }

  getFilteredProducts(): Product[] {
    return this.products.filter((product) => {
      if (this.filter.category && product.category !== this.filter.category) {
        return false;
      }
      if (
        this.filter.minPrice !== undefined &&
        product.price < this.filter.minPrice
      ) {
        return false;
      }
      if (
        this.filter.maxPrice !== undefined &&
        product.price > this.filter.maxPrice
      ) {
        return false;
      }
      if (this.filter.inStock !== undefined && this.filter.inStock) {
        if (product.inStock === 0) {
          return false;
        }
      }
      if (this.filter.searchTerm) {
        const term = this.filter.searchTerm.toLowerCase();
        if (
          !product.name.toLowerCase().includes(term) &&
          !product.description.toLowerCase().includes(term)
        ) {
          return false;
        }
      }
      return true;
    });
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }
}

export const productStore = new ProductStoreImpl();
