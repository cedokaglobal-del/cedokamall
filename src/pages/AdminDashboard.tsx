import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import TransactionHistory from '@/components/TransactionHistory';
import ProductForm from '@/components/ProductForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  BarChart3, Zap, Users, TrendingUp, ShoppingCart, Package,
  AlertCircle, ChevronRight, Plus, Trash2, Edit2, RefreshCw,
} from 'lucide-react';
import { transactionStore } from '@/store/transactionStore';
import { useProductStore } from '@/store/productStore';
import { flashDealStore } from '@/store/flashDealStore';
import { AnalyticsData } from '@/types/transaction';
import { Product, ProductFormData } from '@/types/product';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct, clearAllProducts } = useProductStore();

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [uniqueCustomers, setUniqueCustomers] = useState(0);
  const [activeFlashDeals, setActiveFlashDeals] = useState(0);

  // Stock control state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const lowStockProducts = useMemo(() => products.filter((p) => p.inStock < 10), [products]);
  const totalProducts = products.length;

  useEffect(() => {
    const data = transactionStore.getAnalyticsData(30);
    setAnalyticsData(data);
    const uniqueEmails = new Set(transactionStore.transactions.map((t) => t.customerEmail));
    setUniqueCustomers(uniqueEmails.size);
    const activeDeals = flashDealStore.getActiveDealCount();
    setActiveFlashDeals(activeDeals);
  }, []);

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: ProductFormData) => {
    setIsFormLoading(true);
    try {
      if (editingProduct) {
        updateProduct(editingProduct.id, formData);
      } else {
        addProduct(formData);
      }
      setIsFormOpen(false);
      setEditingProduct(undefined);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleClearAll = () => {
    clearAllProducts();
    setIsClearAllOpen(false);
  };

  if (!analyticsData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Loading dashboard…</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      icon: Zap,
      label: 'Active Flash Deals',
      value: activeFlashDeals.toString(),
      color: 'bg-yellow-500',
      trend: activeFlashDeals > 0 ? `+${activeFlashDeals}` : '0',
    },
    {
      icon: Users,
      label: 'Total Customers',
      value: uniqueCustomers.toLocaleString(),
      color: 'bg-blue-500',
      trend: analyticsData?.customerChange
        ? `${analyticsData.customerChange > 0 ? '+' : ''}${analyticsData.customerChange.toFixed(1)}%`
        : '0%',
    },
    {
      icon: TrendingUp,
      label: 'Monthly Revenue',
      value: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', notation: 'compact' }).format(
        analyticsData?.summary.totalRevenue || 0
      ),
      color: 'bg-green-500',
      trend: `${(analyticsData?.revenueChange || 0) >= 0 ? '+' : ''}${(analyticsData?.revenueChange || 0).toFixed(1)}%`,
    },
    {
      icon: ShoppingCart,
      label: 'Total Orders',
      value: analyticsData?.summary.totalOrders.toString() || '0',
      color: 'bg-purple-500',
      trend: `${(analyticsData?.orderChange || 0) >= 0 ? '+' : ''}${(analyticsData?.orderChange || 0).toFixed(1)}%`,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8 min-h-screen">

        {/* Page title with gradient accent */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 md:gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-emerald bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-2">Welcome back! Here's your store performance at a glance.</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button onClick={handleAddProduct} size="lg" className="gap-2 flex-1 sm:flex-none shadow-emerald hover:shadow-lg transition-shadow">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/admin/products')} className="gap-2 flex-1 sm:flex-none hover:border-primary">
              <Package className="w-4 h-4" /> All Products
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/admin/analytics')} className="gap-2 hidden lg:flex hover:border-primary">
              <BarChart3 className="w-4 h-4" /> Analytics
            </Button>
          </div>
        </div>

        {/* Low stock alert */}
        {lowStockProducts.length > 0 && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's are' : ' is'} running low on stock
                  </p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    {lowStockProducts.map(p => p.name).slice(0, 3).join(', ')}
                    {lowStockProducts.length > 3 ? ` +${lowStockProducts.length - 3} more` : ''}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/products')} className="flex-shrink-0">
                Restock Now
              </Button>
            </div>
          </Card>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isPositive = stat.trend.startsWith('+') || stat.trend === '0' || stat.trend === '0%';
            return (
              <Card key={index} className="p-6 sm:p-8 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/30 hover:border-l-primary">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl text-white ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`text-sm font-semibold px-2.5 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isPositive ? '↑' : '↓'} {stat.trend}
                  </div>
                </div>
                <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider mb-2">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
              </Card>
            );
          })}
        </div>

        {/* ─── STOCK CONTROL PANEL ─── */}
        <Card className="overflow-hidden shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 border-b bg-gradient-to-r from-muted/50 to-transparent">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                Stock Control
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                <strong className="text-foreground">{totalProducts}</strong> product{totalProducts !== 1 ? 's' : ''} in catalogue
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button onClick={handleAddProduct} size="sm" className="gap-1.5 shadow-emerald hover:shadow-lg transition-shadow">
                <Plus className="w-4 h-4" /> Add Product
              </Button>
              {totalProducts > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setIsClearAllOpen(true)}
                >
                  <Trash2 className="w-4 h-4" /> Clear All Stock
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/products')} className="gap-1.5">
                <RefreshCw className="w-4 h-4" /> Full View
              </Button>
            </div>
          </div>

          {totalProducts === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-muted-foreground">No products in catalogue</p>
              <Button onClick={handleAddProduct} className="mt-4 gap-2">
                <Plus className="w-4 h-4" /> Add First Product
              </Button>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              {/* Mobile cards / Desktop table */}
              <div className="block sm:hidden space-y-3">
                {products.slice(0, 10).map((product) => {
                  const isLow = product.inStock === 0;
                  const isWarning = product.inStock > 0 && product.inStock < 10;
                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Img'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                        <p className={`text-xs font-semibold mt-0.5 ${isLow ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600'}`}>
                          {product.inStock} in stock
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 rounded-md hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {products.length > 10 && (
                  <button
                    onClick={() => navigate('/admin/products')}
                    className="w-full text-center text-sm text-primary py-2 hover:underline"
                  >
                    View all {products.length} products →
                  </button>
                )}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b">
                      <th className="text-left py-2 font-medium">Product</th>
                      <th className="text-left py-2 font-medium">Category</th>
                      <th className="text-right py-2 font-medium">Price</th>
                      <th className="text-right py-2 font-medium">Stock</th>
                      <th className="text-right py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.slice(0, 12).map((product) => {
                      const isLow = product.inStock === 0;
                      const isWarning = product.inStock > 0 && product.inStock < 10;
                      return (
                        <tr key={product.id} className="hover:bg-muted/30 transition-colors group">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-9 h-9 rounded object-cover flex-shrink-0"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/36?text=×'; }}
                              />
                              <span className="font-medium line-clamp-1">{product.name}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{product.category}</td>
                          <td className="py-3 pr-4 text-right font-semibold">
                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(product.price)}
                          </td>
                          <td className="py-3 pr-4 text-right">
                            <span className={`font-semibold ${isLow ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600'}`}>
                              {product.inStock}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-1.5 rounded hover:bg-muted transition-colors"
                                title="Edit product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(product)}
                                className="p-1.5 rounded hover:bg-red-100 hover:text-red-600 transition-colors"
                                title="Delete product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {products.length > 12 && (
                  <div className="pt-4 text-center">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')} className="gap-1">
                      View all {products.length} products <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Manage Products', sub: 'Full catalogue view', color: 'text-blue-600', href: '/admin/products', icon: Package },
              { label: 'Flash Deals', sub: 'Create time-limited offers', color: 'text-yellow-600', href: '/admin/flash-deals', icon: Zap },
              { label: 'Analytics', sub: 'Performance metrics', color: 'text-green-600', href: '/admin/analytics', icon: BarChart3 },
              { label: 'Add Product', sub: 'Upload new item', color: 'text-purple-600', href: null, icon: Plus },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => action.href ? navigate(action.href) : handleAddProduct()}
                  className="p-4 border rounded-xl hover:bg-muted/50 transition-all text-left group active:scale-[0.98]"
                >
                  <Icon className={`w-5 h-5 ${action.color} mb-2`} />
                  <p className={`font-semibold text-sm group-hover:${action.color} transition-colors`}>{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.sub}</p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Performance overview */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-4">30-Day Performance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-xl font-bold">
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', notation: 'compact' }).format(analyticsData.summary.totalRevenue)}
              </p>
              <p className={`text-xs mt-0.5 font-medium ${analyticsData.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analyticsData.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(analyticsData.revenueChange).toFixed(1)}% vs previous
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Top Category</p>
              <p className="text-xl font-bold text-green-600">{analyticsData.summary.topCategory}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Best performer</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Top Product</p>
              <p className="text-xl font-bold text-blue-600 line-clamp-1">{analyticsData.summary.topProduct}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Most popular item</p>
            </div>
          </div>
          <AnalyticsCharts data={analyticsData} />
          <Button variant="outline" onClick={() => navigate('/admin/analytics')} className="w-full mt-4">
            Full Analytics Dashboard →
          </Button>
        </Card>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Recent Transactions</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/analytics')}>
              View All
            </Button>
          </div>
          <TransactionHistory transactions={transactionStore.transactions} limit={8} />
        </div>
      </div>

      {/* ─── Add / Edit Product dialog ─── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product details and save.' : 'Fill in details to add a product to the catalogue.'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <ProductForm
              product={editingProduct}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              isLoading={isFormLoading}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Single delete confirm ─── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{deleteTarget?.name}"</strong> will be permanently removed from the catalogue.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Clear all stock confirm ─── */}
      <AlertDialog open={isClearAllOpen} onOpenChange={setIsClearAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Entire Stock?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all <strong>{totalProducts} products</strong> from the catalogue.
              This action cannot be undone. You can still add new products afterwards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Clear All {totalProducts} Products
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminDashboard;
