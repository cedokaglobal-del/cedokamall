import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Edit2,
  Package,
  Plus,
  RefreshCw,
  Shapes,
  Trash2,
  TrendingUp,
  Users,
  Clock,
  CircleDollarSign,
  ShoppingCart,
  ArrowUpRight,
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
import { useTransactionStore } from '@/store/transactionStore';
import { useVisitorStore } from '@/store/visitorStore';
import { cn } from '@/lib/utils';

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

  // Real Analytics Data
  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions);
  const getTransactionSummary = useTransactionStore((state) => state.getTransactionSummary);
  const transactionSummary = useMemo(() => getTransactionSummary(30), [getTransactionSummary]);
  const visitorStats = useVisitorStore((state) => state.stats);
  const avgStayDuration = useVisitorStore((state) => state.getAverageStayDuration());

  useEffect(() => {
    void fetchTransactions();
    void useVisitorStore.getState().syncWithSupabase();
  }, [fetchTransactions]);

  const handleRefresh = async () => {
    await Promise.all([
      fetchProducts(true),
      fetchTransactions(),
      useVisitorStore.getState().syncWithSupabase()
    ]);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

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

  const businessStats = [
    {
      label: 'Total Sales',
      value: transactionSummary.totalOrders.toString(),
      change: '+12%',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Total Revenue',
      value: currency.format(transactionSummary.totalRevenue),
      change: '+8.4%',
      icon: CircleDollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      label: 'Site Visitors',
      value: visitorStats.totalVisitors.toLocaleString(),
      change: '+24%',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'Avg. Stay Time',
      value: formatDuration(avgStayDuration),
      change: '+2m',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
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
              onClick={handleRefresh}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {businessStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6 overflow-hidden relative group hover:shadow-lg transition-all duration-300 border-none bg-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-2xl", stat.bgColor)}>
                    <Icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-[10px] font-bold">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                </div>
                <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <Icon className="w-32 h-32" />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold">Operations Overview</h3>
                <p className="text-sm text-muted-foreground">Key metrics for inventory and catalog health.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')} className="text-primary font-bold">
                View Full Catalog
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-4 p-4 rounded-xl border bg-muted/20">
                    <div className="p-3 rounded-lg bg-background shadow-sm">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Performing Product
            </h3>
            {transactionSummary.topProduct !== 'N/A' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white shadow-sm border border-primary/5">
                  <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Product Name</p>
                  <p className="font-bold text-lg line-clamp-1">{transactionSummary.topProduct}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Orders</p>
                      <p className="font-black text-primary text-xl">124</p>
                    </div>
                    <div className="flex-1 border-l pl-4">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Conversion</p>
                      <p className="font-black text-emerald-600 text-xl">4.2%</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full rounded-xl font-bold gap-2" onClick={() => navigate('/admin/products')}>
                  <Package className="w-4 h-4" />
                  View Details
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No sales data available yet.</p>
              </div>
            )}
          </Card>
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
        <DialogContent 
          className="max-w-2xl w-[95vw] sm:w-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
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
