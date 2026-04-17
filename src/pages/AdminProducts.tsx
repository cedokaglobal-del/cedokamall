import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import ProductForm from '@/components/ProductForm';
import ProductTable from '@/components/ProductTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product, ProductFormData, ProductFilter } from '@/types/product';
import { productStore } from '@/store/productStore';
import { Plus, Search, Filter } from 'lucide-react';

const categories = [
  'Smartphones',
  'Laptops',
  'Tablets',
  'Audio & Sound',
  'Cameras',
  'Gaming',
  'Accessories',
  'TV',
  'Refrigerators',
  'Washing Machines',
  'Air Conditioners',
  'Fans',
  'Generators',
  'Freezers',
  'Sound Systems',
  'Smart Home',
];

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<ProductFilter>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Load products on mount
  useEffect(() => {
    const allProducts = productStore.products;
    setProducts(allProducts);
    setFilteredProducts(allProducts);
  }, []);

  // Apply filters
  useEffect(() => {
    productStore.setFilter(filter);
    setFilteredProducts(productStore.getFilteredProducts());
  }, [filter]);

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setIsLoading(true);
    try {
      productStore.deleteProduct(productId);
      setProducts(productStore.products);
      const updated = productStore.getFilteredProducts();
      setFilteredProducts(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: ProductFormData) => {
    setIsLoading(true);
    try {
      if (editingProduct) {
        productStore.updateProduct(editingProduct.id, formData);
      } else {
        productStore.addProduct(formData);
      }

      setProducts(productStore.products);
      const updated = productStore.getFilteredProducts();
      setFilteredProducts(updated);
      setIsFormOpen(false);
      setEditingProduct(undefined);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ProductFilter, value: string | number | boolean | undefined) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const minPrice = Math.min(...(products.length > 0 ? products.map((p) => p.price) : [0]));
  const maxPrice = Math.max(...(products.length > 0 ? products.map((p) => p.price) : [0]));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground mt-2">
              Manage your product catalog ({filteredProducts.length} products)
            </p>
          </div>
          <Button onClick={handleAddProduct} size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" />
            <h3 className="font-semibold">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <Label htmlFor="search" className="text-xs mb-2 block">
                Search Product
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Product name..."
                  value={filter.searchTerm || ''}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Label htmlFor="category" className="text-xs mb-2 block">
                Category
              </Label>
              <Select
                value={filter.category || ''}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Price */}
            <div>
              <Label htmlFor="minPrice" className="text-xs mb-2 block">
                Min Price (₦)
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={filter.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            {/* Max Price */}
            <div>
              <Label htmlFor="maxPrice" className="text-xs mb-2 block">
                Max Price (₦)
              </Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder={maxPrice.toString()}
                value={filter.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            {/* In Stock Filter */}
            <div>
              <Label htmlFor="inStock" className="text-xs mb-2 block">
                Stock Status
              </Label>
              <Select
                value={filter.inStock ? 'true' : ''}
                onValueChange={(value) => handleFilterChange('inStock', value === 'true')}
              >
                <SelectTrigger id="inStock">
                  <SelectValue placeholder="All items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Items</SelectItem>
                  <SelectItem value="true">In Stock Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters */}
          {Object.keys(filter).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter({})}
              className="mt-4"
            >
              Clear All Filters
            </Button>
          )}
        </Card>

        {/* Products Table */}
        <ProductTable
          products={filteredProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          isLoading={isLoading}
        />
      </div>

      {/* Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update the product details and save changes'
                : 'Fill in the product details to add a new item to your catalog'}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto">
            <ProductForm
              product={editingProduct}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              isLoading={isLoading}
            />
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProducts;
