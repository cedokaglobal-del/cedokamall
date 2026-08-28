import { Suspense, useMemo, useState, useEffect } from 'react';
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
  Lock,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PaginationControls from '@/components/PaginationControls';
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
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { safeLazy } from '@/utils/lazy';
import { toast } from 'sonner';
import { seedHistoricalSales } from '@/utils/seedSales';

const ProductForm = safeLazy(() => import('@/components/ProductForm'));

const currency = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminEmail } = useAuth();
  const products = useProductStore((s) => s.products);
  const isLoading = useProductStore((s) => s.isLoading);
  const error = useProductStore((s) => s.error);
  const addProduct = useProductStore((s) => s.addProduct);
  const updateProduct = useProductStore((s) => s.updateProduct);
  const deleteProduct = useProductStore((s) => s.deleteProduct);
  const clearAllProducts = useProductStore((s) => s.clearAllProducts);

  useEffect(() => { void seedHistoricalSales(); }, []);
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const lastSyncedAt = useProductStore((s) => s.lastSyncedAt);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [isConfirmClearAllOpen, setIsConfirmClearAllOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clearPassword, setClearPassword] = useState('');
  const [clearPasswordError, setClearPasswordError] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState('');
  const [isDeletePasswordOpen, setIsDeletePasswordOpen] = useState(false);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<Product | null>(null);
  const visitorStats = useVisitorStore((state) => state.stats);
  const avgStayDuration = useVisitorStore((state) => state.getAverageStayDuration());
  const syncVisitorStats = useVisitorStore((state) => state.syncWithSupabase);
  const subscribeToVisitorRealtime = useVisitorStore((state) => state.subscribeToRealtime);
  const isVisitorRealtimeConnected = useVisitorStore((state) => state.isRealtimeConnected);

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

  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions);
  const transactions = useTransactionStore((state) => state.transactions);

  const [salesPage, setSalesPage] = useState(1);
  const salesPageSize = 20;
  const [selectedSaleProduct, setSelectedSaleProduct] = useState<string | null>(null);
  const [saleTransactionPage, setSaleTransactionPage] = useState(1);

  const salesData = useMemo(() => {
    const completed = transactions.filter(t => t.status === 'completed');
    const productMap = new Map<string, { totalQty: number; lastSale: Date; productId: string; category: string }>();
    completed.forEach(t => {
      const existing = productMap.get(t.productName);
      if (existing) {
        existing.totalQty += t.quantity;
        if (new Date(t.createdAt) > existing.lastSale) existing.lastSale = new Date(t.createdAt);
      } else {
        productMap.set(t.productName, {
          totalQty: t.quantity,
          lastSale: new Date(t.createdAt),
          productId: t.productId,
          category: t.category,
        });
      }
    });
    return Array.from(productMap.entries())
      .map(([name, data]) => {
        const prod = products.find(p => p.id === data.productId || p.name === name);
        return {
          name,
          totalSold: data.totalQty,
          stockLeft: prod?.inStock ?? 0,
          lastSale: data.lastSale,
          productId: data.productId,
          category: data.category,
        };
      })
      .sort((a, b) => b.totalSold - a.totalSold);
  }, [transactions, products]);

  const paginatedSales = useMemo(
    () => salesData.slice((salesPage - 1) * salesPageSize, salesPage * salesPageSize),
    [salesData, salesPage]
  );

  const selectedSaleTransactions = useMemo(() => {
    if (!selectedSaleProduct) return [];
    return transactions.filter(
      t => t.status === 'completed' && (t.productName === selectedSaleProduct || t.productId === selectedSaleProduct)
    );
  }, [selectedSaleProduct, transactions]);

  useEffect(() => {
    const unsubscribe = subscribeToVisitorRealtime();
    return () => { unsubscribe(); };
  }, [subscribeToVisitorRealtime]);

  const transactionSummary = useMemo(
    () => useTransactionStore.getState().getTransactionSummary(30),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void useTransactionStore.getState().fetchTransactions();
      void useVisitorStore.getState().syncWithSupabase();
    }, 120);
    return () => { window.clearTimeout(timer); };
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        fetchProducts(true),
        fetchTransactions(true),
        syncVisitorStats(true),
      ]);
      toast.success('Dashboard refreshed');
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
      toast.error('Refresh failed. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
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

  const handleVerifyDeletePassword = async () => {
    try {
      setDeletePasswordError('');
      if (!deletePassword) { setDeletePasswordError('Password is required'); return; }
      if (!adminEmail) { setDeletePasswordError('Admin session not found. Please log in again.'); return; }
      setIsSubmitting(true);
      const { error: authError } = await supabase.auth.signInWithPassword({ email: adminEmail, password: deletePassword });
      if (authError) { setDeletePasswordError('Incorrect password. Please try again.'); setIsSubmitting(false); return; }
      setDeletePassword('');
      setDeletePasswordError('');
      setIsDeletePasswordOpen(false);
      setDeleteTarget(pendingDeleteProduct);
    } catch (error) {
      console.error('Password verification failed:', error);
      setDeletePasswordError('An error occurred. Please try again.');
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

  const handleVerifyClearPassword = async () => {
    try {
      setClearPasswordError('');
      if (!clearPassword) { setClearPasswordError('Password is required'); return; }
      if (!adminEmail) { setClearPasswordError('Admin session not found. Please log in again.'); return; }
      setIsSubmitting(true);
      const { error: authError } = await supabase.auth.signInWithPassword({ email: adminEmail, password: clearPassword });
      if (authError) { setClearPasswordError('Incorrect password. Please try again.'); setIsSubmitting(false); return; }
      setClearPassword('');
      setClearPasswordError('');
      setIsClearAllOpen(false);
      setIsConfirmClearAllOpen(true);
    } catch (error) {
      console.error('Password verification failed:', error);
      setClearPasswordError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmClearAll = async () => {
    try {
      setIsSubmitting(true);
      await clearAllProducts();
      setIsConfirmClearAllOpen(false);
      toast.success('Catalog cleared successfully');
    } catch (error) {
      console.error('Clear all failed:', error);
      toast.error('Failed to clear catalog. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: 'Products', value: products.length.toString(), note: 'Live records', icon: Package },
    { label: 'Categories', value: categoryCount.toString(), note: 'From catalog', icon: Shapes },
    { label: 'Low Stock', value: lowStockProducts.length.toString(), note: 'Needs restocking', icon: AlertCircle },
    { label: 'Inventory', value: currency.format(totalInventoryValue), note: 'Current value', icon: RefreshCw },
  ];

  const businessStats = [
    { label: 'Total Sales', value: transactionSummary.totalOrders.toString(), icon: ShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Revenue', value: currency.format(transactionSummary.totalRevenue), icon: CircleDollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { label: 'Visitors', value: visitorStats.totalVisitors.toLocaleString(), icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { label: 'Avg. Stay', value: formatDuration(avgStayDuration), icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">Dashboard</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
              <span className="text-muted-foreground">
                Synced {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'just now'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAddProduct} size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5" disabled={isRefreshing}>
              <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
              {isRefreshing ? 'Syncing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="p-3 border-red-200 bg-red-50">
            <p className="font-medium text-red-700 text-sm">{error}</p>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {businessStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                    <Icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold truncate">{stat.value}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Operations + Top Product */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Operations</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')} className="text-xs font-bold">
                View All
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <Icon className="w-4 h-4 text-navy" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">{stat.label}</p>
                      <p className="text-sm font-bold truncate">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-navy" />
              Top Product
            </h3>
            {transactionSummary.topProduct !== 'N/A' ? (
              <div>
                <p className="font-bold text-sm line-clamp-2">{transactionSummary.topProduct}</p>
                <Button className="w-full mt-3 gap-1.5" size="sm" onClick={() => navigate('/admin/products')}>
                  <Package className="w-3.5 h-3.5" /> View Details
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">No sales data yet</p>
            )}
          </Card>
        </div>

        {/* Recent Products */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-bold text-sm">Recent Products</h2>
            {products.length > 0 && (
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-red-600" onClick={() => setIsClearAllOpen(true)}>
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : recentProducts.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">No products yet</p>
              <Button onClick={handleAddProduct} className="mt-3 gap-1.5" size="sm">
                <Plus className="w-3.5 h-3.5" /> Add First Product
              </Button>
            </div>
          ) : (
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex gap-3 p-3 rounded-lg border hover:shadow-sm transition-shadow">
                  <img
                    src={product.image || '/image.png'}
                    alt={product.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/image.png'; }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold line-clamp-1">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                    <p className="text-sm font-bold text-navy mt-0.5">{currency.format(product.price)}</p>
                    <div className="flex gap-1.5 mt-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)} className="h-7 px-2 text-xs gap-1">
                        <Edit2 className="w-3 h-3" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => { setPendingDeleteProduct(product); setIsDeletePasswordOpen(true); }}>
                        <Trash2 className="w-3 h-3" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Sales Table */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Completed Sales
            </h2>
          </div>
          {salesData.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No sales data yet</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs">Product</TableHead>
                      <TableHead className="text-xs">Qty</TableHead>
                      <TableHead className="text-xs">Stock</TableHead>
                      <TableHead className="text-xs">Last Sale</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSales.map((sale) => (
                      <TableRow
                        key={sale.name}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => { setSelectedSaleProduct(sale.name); setSaleTransactionPage(1); }}
                      >
                        <TableCell className="text-sm font-medium max-w-[200px] truncate">{sale.name}</TableCell>
                        <TableCell className="text-sm font-semibold text-emerald-600">{sale.totalSold}</TableCell>
                        <TableCell className="text-sm">
                          <span className={sale.stockLeft < 10 ? 'text-red-600 font-medium' : ''}>{sale.stockLeft}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Intl.DateTimeFormat('en-NG', { month: 'short', day: 'numeric' }).format(sale.lastSale)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <PaginationControls
                currentPage={salesPage}
                totalPages={Math.max(1, Math.ceil(salesData.length / salesPageSize))}
                onPageChange={setSalesPage}
                totalItems={salesData.length}
                pageSize={salesPageSize}
              />
            </>
          )}
        </Card>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-auto max-h-[90vh] overflow-hidden flex flex-col" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader className="shrink-0">
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product details and save changes.' : 'Fill in details to add a new product.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0">
            <Suspense fallback={<div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">Loading...</div>}>
              <ProductForm
                product={editingProduct}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormOpen(false)}
                isLoading={isSubmitting}
              />
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Password Dialog */}
      <Dialog open={isDeletePasswordOpen} onOpenChange={(open) => { setIsDeletePasswordOpen(open); if (!open) { setDeletePassword(''); setDeletePasswordError(''); setPendingDeleteProduct(null); } }}>
        <DialogContent className="max-w-sm w-[90vw]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-base text-red-600 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-sm">
              Delete <strong>"{pendingDeleteProduct?.name}"</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 border-y">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="password"
                placeholder="Admin password"
                value={deletePassword}
                onChange={(e) => { setDeletePassword(e.target.value); setDeletePasswordError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter' && deletePassword && !isSubmitting) { e.preventDefault(); void handleVerifyDeletePassword(); } }}
                disabled={isSubmitting}
                className="pl-10 h-10"
                autoFocus
              />
            </div>
            {deletePasswordError && <p className="text-xs text-red-600">{deletePasswordError}</p>}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" size="sm" disabled={isSubmitting} onClick={() => { setDeletePassword(''); setDeletePasswordError(''); setIsDeletePasswordOpen(false); setPendingDeleteProduct(null); }}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => void handleVerifyDeletePassword()} disabled={isSubmitting || !deletePassword}>
              {isSubmitting ? 'Verifying...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleConfirmDelete()} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Password */}
      <Dialog open={isClearAllOpen} onOpenChange={(open) => { setIsClearAllOpen(open); if (!open) { setClearPassword(''); setClearPasswordError(''); } }}>
        <DialogContent className="max-w-sm w-[90vw]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-base text-red-600 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Clear Entire Catalog?
            </DialogTitle>
            <DialogDescription className="text-sm">Permanently delete all <strong>{products.length} products</strong>.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 border-y">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="password"
                placeholder="Admin password"
                value={clearPassword}
                onChange={(e) => { setClearPassword(e.target.value); setClearPasswordError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter' && clearPassword && !isSubmitting) { e.preventDefault(); void handleVerifyClearPassword(); } }}
                disabled={isSubmitting}
                className="pl-10 h-10"
                autoFocus
              />
            </div>
            {clearPasswordError && <p className="text-xs text-red-600">{clearPasswordError}</p>}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" size="sm" disabled={isSubmitting} onClick={() => { setClearPassword(''); setClearPasswordError(''); setIsClearAllOpen(false); }}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => void handleVerifyClearPassword()} disabled={isSubmitting || !clearPassword}>
              {isSubmitting ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear All Confirmation */}
      <AlertDialog open={isConfirmClearAllOpen} onOpenChange={setIsConfirmClearAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This permanently deletes all <strong>{products.length} products</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClearAll} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? 'Clearing...' : 'Clear Everything'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sale Transaction Detail */}
      <Dialog open={!!selectedSaleProduct} onOpenChange={(open) => { if (!open) setSelectedSaleProduct(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Transactions for "{selectedSaleProduct}"</DialogTitle>
            <DialogDescription>{selectedSaleTransactions.length} completed sales</DialogDescription>
          </DialogHeader>
          {selectedSaleTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs">Order</TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs">Qty</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const start = (saleTransactionPage - 1) * 20;
                    return selectedSaleTransactions.slice(start, start + 20).map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono text-xs max-w-[120px] truncate">{t.orderId}</TableCell>
                        <TableCell className="text-xs max-w-[150px] truncate">{t.customerEmail}</TableCell>
                        <TableCell className="text-center text-xs">{t.quantity}</TableCell>
                        <TableCell className="text-xs font-semibold">{currency.format(t.amount)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Intl.DateTimeFormat('en-NG', { month: 'short', day: 'numeric' }).format(new Date(t.createdAt))}
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
              <PaginationControls
                currentPage={saleTransactionPage}
                totalPages={Math.max(1, Math.ceil(selectedSaleTransactions.length / 20))}
                onPageChange={setSaleTransactionPage}
                totalItems={selectedSaleTransactions.length}
                pageSize={20}
              />
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">No transactions found.</div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDashboard;
