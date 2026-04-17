import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import TransactionHistory from '@/components/TransactionHistory';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Zap, Users, TrendingUp, ShoppingCart, Package, AlertCircle, ChevronRight, Plus } from 'lucide-react';
import { transactionStore } from '@/store/transactionStore';
import { useProductStore } from '@/store/productStore';
import { flashDealStore } from '@/store/flashDealStore';
import { AnalyticsData } from '@/types/transaction';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { products } = useProductStore();
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [uniqueCustomers, setUniqueCustomers] = useState(0);
  const [activeFlashDeals, setActiveFlashDeals] = useState(0);

  const lowStockCount = useMemo(() => products.filter((p) => p.inStock < 10).length, [products]);
  const totalProducts = products.length;

  useEffect(() => {
    // Load analytics
    const data = transactionStore.getAnalyticsData(30);
    setAnalyticsData(data);

    // Get unique customer count
    const uniqueEmails = new Set(transactionStore.transactions.map((t) => t.customerEmail));
    setUniqueCustomers(uniqueEmails.size);

    // Get active flash deals count
    const activeDeals = flashDealStore.getActiveDealCount();
    setActiveFlashDeals(activeDeals);
  }, []);


  if (!analyticsData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading dashboard...</p>
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
      trend: activeFlashDeals > 0 ? '+' + activeFlashDeals : '0',
    },
    {
      icon: Users,
      label: 'Total Customers',
      value: uniqueCustomers.toLocaleString(),
      color: 'bg-blue-500',
      trend: analyticsData?.customerChange ? `${analyticsData.customerChange > 0 ? '+' : ''}${analyticsData.customerChange.toFixed(1)}%` : '0%',
    },
    {
      icon: TrendingUp,
      label: 'Monthly Revenue',
      value: new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        notation: 'compact',
      }).format(analyticsData?.summary.totalRevenue || 0),
      color: 'bg-green-500',
      trend: `${analyticsData?.revenueChange || 0 > 0 ? '+' : ''}${(analyticsData?.revenueChange || 0).toFixed(1)}%`,
    },
    {
      icon: ShoppingCart,
      label: 'Total Orders',
      value: analyticsData?.summary.totalOrders.toString() || '0',
      color: 'bg-purple-500',
      trend: `${analyticsData?.orderChange || 0 > 0 ? '+' : ''}${(analyticsData?.orderChange || 0).toFixed(1)}%`,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Welcome to Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your store, products, and view analytics</p>
        </div>

        {/* Alert for Low Stock */}
        {lowStockCount > 0 && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">{lowStockCount} products are running low on stock</p>
                  <p className="text-sm text-yellow-700">Consider restocking these items soon</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/products')}
              >
                Manage Products
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isPositive = stat.trend.startsWith('+');
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions & Product Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/admin/products')}
                className="p-4 border rounded-lg hover:bg-muted transition-colors text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold group-hover:text-blue-600 transition-colors">Manage Products</p>
                    <p className="text-sm text-muted-foreground">Add, edit, or delete products</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/flash-deals')}
                className="p-4 border rounded-lg hover:bg-muted transition-colors text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold group-hover:text-yellow-600 transition-colors">Flash Deals</p>
                    <p className="text-sm text-muted-foreground">Create time-limited offers</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-yellow-600 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/analytics')}
                className="p-4 border rounded-lg hover:bg-muted transition-colors text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold group-hover:text-green-600 transition-colors">View Analytics</p>
                    <p className="text-sm text-muted-foreground">See detailed performance metrics</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-green-600 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/products')}
                className="p-4 border rounded-lg hover:bg-muted transition-colors text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold group-hover:text-purple-600 transition-colors">Add New Product</p>
                    <p className="text-sm text-muted-foreground">Upload a new item to catalog</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-600 transition-colors" />
                </div>
              </button>
            </div>
          </Card>

          {/* Product Stats */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold mt-2">{totalProducts}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/products')}
                className="mt-4 w-full"
              >
                View All Products
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold mt-2 text-orange-600">{lowStockCount}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/products')}
                className="mt-4 w-full"
              >
                Restock Now
              </Button>
            </Card>
          </div>
        </div>

        {/* Mini Analytics Overview */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">30-Day Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                  notation: 'compact',
                }).format(analyticsData.summary.totalRevenue)}
              </p>
              <p className={`text-xs mt-1 font-medium ${analyticsData.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analyticsData.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(analyticsData.revenueChange).toFixed(1)}% vs previous period
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Top Selling Category</p>
              <p className="text-2xl font-bold text-green-600">{analyticsData.summary.topCategory}</p>
              <p className="text-xs text-muted-foreground mt-1">Best performer</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Top Product</p>
              <p className="text-2xl font-bold text-blue-600 line-clamp-1">{analyticsData.summary.topProduct}</p>
              <p className="text-xs text-muted-foreground mt-1">Most popular item</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate('/admin/analytics')}
            className="w-full"
          >
            View Full Analytics Dashboard
          </Button>
        </Card>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/analytics')}
            >
              View All
            </Button>
          </div>
          <TransactionHistory
            transactions={transactionStore.transactions}
            limit={8}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
