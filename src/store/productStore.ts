import { Product, ProductFormData, ProductFilter } from '@/types/product';
import { initialProducts } from '@/data/products';

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

class ProductStoreImpl implements ProductStore {
  products: Product[] = [];
  filter: ProductFilter = {};

  constructor() {
    // Initialize with mock data from localStorage or default
    const stored = localStorage.getItem('products');
    this.products = stored ? JSON.parse(stored) : initialProducts;
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
