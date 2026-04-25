import { useState, useMemo } from 'react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Product, ProductFormData, ProductFilter } from '@/types/product';
import { getCategoryOptions } from '@/data/products';
import { useProductStore } from '@/store/productStore';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';

const AdminProducts = () => {
  const navigate = useNavigate();
  const { 
    products, 
    filter, 
    setFilter, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    clearAllProducts,
    getFilteredProducts 
  } = useProductStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false);

  const filteredProducts = useMemo(() => getFilteredProducts(), [products, filter, getFilteredProducts]);
  const categories = useMemo(() => getCategoryOptions(products), [products]);

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
      deleteProduct(productId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: ProductFormData) => {
    setIsLoading(true);
    try {
      if (editingProduct) {
        updateProduct(editingProduct.id, formData);
      } else {
        addProduct(formData);
      }
      setIsFormOpen(false);
      setEditingProduct(undefined);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllProducts = () => {
    setIsLoading(true);
    try {
      clearAllProducts();
      setIsClearAllDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ProductFilter, value: any) => {
    setFilter({
      ...filter,
      [key]: value === 'all' ? undefined : value,
    });
  };

  const maxPrice = useMemo(() => 
    products.length > 0 ? Math.max(...products.map((p) => p.price)) : 0
  , [products]);


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground mt-2">
              Manage your product catalog ({filteredProducts.length} products)
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddProduct} size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
            {products.length > 0 && (
              <Button 
                onClick={() => setIsClearAllDialogOpen(true)} 
                size="lg" 
                variant="destructive" 
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            )}
          </div>
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
                value={filter.category || 'all'}
                onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
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
                value={filter.inStock ? 'true' : 'all'}
                onValueChange={(value) => handleFilterChange('inStock', value === 'true' ? true : undefined)}
              >
                <SelectTrigger id="inStock">
                  <SelectValue placeholder="All items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
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

      {/* Clear All Dialog */}
      <AlertDialog open={isClearAllDialogOpen} onOpenChange={setIsClearAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Products?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {products.length} products from your catalog. This action cannot be undone. 
              <br /><br />
              You can still add new products after clearing. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4 justify-end">
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearAllProducts} 
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Clearing...' : 'Clear All'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

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
