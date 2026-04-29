import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Edit2,
  Package,
  Plus,
  RefreshCw,
  Shapes,
  Trash2,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import ProductForm from '@/components/ProductForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Product, ProductFormData } from '@/types/product';
import { useProductStore } from '@/store/productStore';

const currency = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    products,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    clearAllProducts,
    fetchProducts,
  } = useProductStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.inStock > 0 && product.inStock < 10),
    [products]
  );
  const outOfStockProducts = useMemo(
    () => products.filter((product) => product.inStock <= 0),
    [products]
  );
  const categoryCount = useMemo(() => {
    const uniqueCategories = new Set(
      products
        .map((product) => product.category?.trim())
        .filter((category): category is string => Boolean(category))
    );
    return uniqueCategories.size;
  }, [products]);

  const totalInventoryValue = useMemo(
    () =>
      products.reduce(
        (sum, product) => sum + product.price * Math.max(product.inStock || 0, 0),
        0
      ),
    [products]
  );
  const recentProducts = useMemo(() => products.slice(0, 6), [products]);

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: ProductFormData) => {
    try {
      setIsSubmitting(true);

      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await addProduct(formData);
      }

      setEditingProduct(undefined);
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsSubmitting(true);
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setIsSubmitting(true);
      await clearAllProducts();
      setIsClearAllOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    {
      label: 'Products',
      value: products.length.toString(),
      note: 'Live records in Supabase',
      icon: Package,
    },
    {
      label: 'Categories',
      value: categoryCount.toString(),
      note: 'Derived from your catalog',
      icon: Shapes,
    },
    {
      label: 'Low Stock',
      value: lowStockProducts.length.toString(),
      note: 'Needs restocking soon',
      icon: AlertCircle,
    },
    {
      label: 'Inventory Value',
      value: currency.format(totalInventoryValue),
      note: 'Based on current stock levels',
      icon: RefreshCw,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-emerald bg-clip-text text-transparent">
              Product Operations
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              This dashboard now reflects your live product catalog instead of demo analytics.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button onClick={handleAddProduct} size="lg" className="gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => void fetchProducts()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/admin/products')}
              className="gap-2"
            >
              <Package className="w-4 h-4" /> Manage Catalog
            </Button>
          </div>
        </div>

        {error && (
          <Card className="p-4 border-destructive/30 bg-destructive/5">
            <p className="font-medium text-destructive">Database connection issue</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </Card>
        )}

        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    {lowStockProducts.length} low-stock and {outOfStockProducts.length} out-of-stock products
                  </p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    Keep your storefront fresh by replenishing inventory before launch.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/products')}
                className="flex-shrink-0"
              >
                Review Catalog
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6 border-l-4 border-l-primary/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider mb-2">
                  {stat.label}
                </p>
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{stat.note}</p>
              </Card>
            );
          })}
        </div>

        <Card className="overflow-hidden shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 border-b bg-gradient-to-r from-muted/50 to-transparent">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                Recent Products
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Your homepage and shop now depend on the database rows listed here.
              </p>
            </div>

            {products.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                onClick={() => setIsClearAllOpen(true)}
              >
                <Trash2 className="w-4 h-4" /> Clear Catalog
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading products from Supabase...</div>
          ) : recentProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-muted-foreground">No products found in the database</p>
              <p className="text-sm text-muted-foreground mt-2">
                Run the Supabase SQL setup, then add your first live product.
              </p>
              <Button onClick={handleAddProduct} className="mt-4 gap-2">
                <Plus className="w-4 h-4" /> Add First Product
              </Button>
            </div>
          ) : (
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border bg-background p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <img
                      src={product.image || '/image.png'}
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      onError={(event) => {
                        (event.target as HTMLImageElement).src = '/image.png';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold line-clamp-2">{product.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
                      <p className="text-sm font-semibold text-primary mt-2">
                        {currency.format(product.price)}
                      </p>
                      <p
                        className={`text-xs mt-2 font-medium ${
                          product.inStock <= 0
                            ? 'text-red-600'
                            : product.inStock < 10
                              ? 'text-yellow-600'
                              : 'text-green-600'
                        }`}
                      >
                        {product.inStock} units in stock
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="gap-1.5"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget(product)}
                      className="gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update the live product record stored in Supabase.'
                : 'Create a product that will appear on the storefront once saved.'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <ProductForm
              product={editingProduct}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              isLoading={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{deleteTarget?.name}"</strong> will be permanently removed from the catalog.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isClearAllOpen} onOpenChange={setIsClearAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Entire Catalog?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all <strong>{products.length} products</strong> from the
              database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleClearAll()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear Catalog
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminDashboard;
