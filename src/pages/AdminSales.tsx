import { useState, useMemo, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import PaginationControls from '@/components/PaginationControls';
import { useTransactionStore } from '@/store/transactionStore';
import { ShoppingCart, MapPin, Home, ChevronRight, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { seedHistoricalSales } from '@/utils/seedSales';

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-NG', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const AdminSales = () => {
  const transactions = useTransactionStore((s) => s.transactions);

  const [activeTab, setActiveTab] = useState<'transactions' | 'sales'>('transactions');
  const [salesSearch, setSalesSearch] = useState('');

  useEffect(() => { void seedHistoricalSales(); }, []);

  // Pagination
  const [txPage, setTxPage] = useState(1);
  const [salePage, setSalePage] = useState(1);
  const pageSize = 20;

  const completedTxs = useMemo(
    () => transactions.filter(t => t.status === 'completed'),
    [transactions]
  );

  // --- TRANSACTIONS VIEW (grouped by orderId) ---
  const orderMap = useMemo(() => {
    const map = new Map<string, {
      orderId: string;
      customerName: string;
      deliveryMethod: string;
      paymentMethod: string;
      totalAmount: number;
      itemsCount: number;
      productsCount: number;
      date: Date;
    }>();

    completedTxs.forEach(t => {
      const existing = map.get(t.orderId);
      if (existing) {
        existing.totalAmount += t.amount;
        existing.itemsCount += t.quantity;
        existing.productsCount += 1;
      } else {
        map.set(t.orderId, {
          orderId: t.orderId,
          customerName: t.customerEmail,
          deliveryMethod: t.deliveryMethod || 'Walk-in / Store Pickup',
          paymentMethod: t.paymentMethod,
          totalAmount: t.amount,
          itemsCount: t.quantity,
          productsCount: 1,
          date: new Date(t.createdAt),
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [completedTxs]);

  const filteredOrders = useMemo(() => {
    if (!salesSearch.trim()) return orderMap;
    const q = salesSearch.toLowerCase().trim();
    return orderMap.filter((o) =>
      o.orderId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.paymentMethod.toLowerCase().includes(q) ||
      o.deliveryMethod.toLowerCase().includes(q)
    );
  }, [orderMap, salesSearch]);

  const paginatedOrders = useMemo(
    () => filteredOrders.slice((txPage - 1) * pageSize, txPage * pageSize),
    [filteredOrders, txPage]
  );

  useEffect(() => {
    if (txPage > Math.ceil(filteredOrders.length / pageSize)) setTxPage(1);
  }, [filteredOrders.length, txPage]);

  // --- SALES VIEW (individual line items) ---
  const filteredCompletedSales = useMemo(() => {
    if (!salesSearch.trim()) return completedTxs;
    const q = salesSearch.toLowerCase().trim();
    return completedTxs.filter((t) =>
      t.productName.toLowerCase().includes(q) ||
      t.customerEmail.toLowerCase().includes(q) ||
      t.orderId.toLowerCase().includes(q)
    );
  }, [completedTxs, salesSearch]);

  const paginatedSales = useMemo(
    () => filteredCompletedSales.slice((salePage - 1) * pageSize, salePage * pageSize),
    [filteredCompletedSales, salePage]
  );

  useEffect(() => {
    if (salePage > Math.ceil(filteredCompletedSales.length / pageSize)) setSalePage(1);
  }, [filteredCompletedSales.length, salePage]);

  // --- DETAIL DRAWER for an order ---
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrderItems = useMemo(() => {
    if (!selectedOrderId) return [];
    return completedTxs.filter(t => t.orderId === selectedOrderId);
  }, [selectedOrderId, completedTxs]);

  const totalRevenue = useMemo(() => completedTxs.reduce((s, t) => s + t.amount, 0), [completedTxs]);
  const totalItemsSold = useMemo(() => completedTxs.reduce((s, t) => s + t.quantity, 0), [completedTxs]);

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-emerald-400">
              Sales
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              All completed orders and product sales are automatically recorded here.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Orders</p>
            <p className="text-3xl font-black mt-1">{orderMap.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Revenue</p>
            <p className="text-3xl font-black mt-1">{currencyFormatter.format(totalRevenue)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Items Sold</p>
            <p className="text-3xl font-black mt-1">{totalItemsSold}</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'transactions'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Transactions ({orderMap.length})
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'sales'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Sales ({completedTxs.length})
          </button>
        </div>

        {/* Search Bar for Sales & Orders */}
        <Card className="p-4 bg-white shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="sales-search"
                placeholder="Search by order ID, buyer, product name, payment..."
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
                className="pl-9 pr-14 h-10 w-full"
              />
              {salesSearch && (
                <button
                  type="button"
                  onClick={() => setSalesSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  Clear
                </button>
              )}
            </div>
            <Button type="submit" size="sm" className="h-10 px-5 gap-1.5 shrink-0">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </form>
          {salesSearch && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              Real-time filtering applied for &ldquo;{salesSearch}&rdquo;
            </p>
          )}
        </Card>

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <Card className="overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="font-semibold">Order Transactions</h3>
              <p className="text-sm text-muted-foreground">
                One order can contain multiple products. Click a row to view all items in that order.
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                        No completed orders yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrders.map((order) => (
                      <TableRow
                        key={order.orderId}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedOrderId(order.orderId)}
                      >
                        <TableCell className="max-w-[140px] truncate font-mono text-sm">{order.orderId}</TableCell>
                        <TableCell className="max-w-[150px] truncate font-medium">{order.customerName}</TableCell>
                        <TableCell className="text-center">{order.productsCount}</TableCell>
                        <TableCell className="text-center">{order.itemsCount}</TableCell>
                        <TableCell className="font-semibold whitespace-nowrap">{currencyFormatter.format(order.totalAmount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {order.deliveryMethod === 'Home Delivery' ? (
                              <MapPin className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <Home className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                            <span className="text-xs">{order.deliveryMethod === 'Home Delivery' ? 'Delivery' : 'Walk-in'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{order.paymentMethod}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {dateFormatter.format(order.date)}
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <PaginationControls
              currentPage={txPage}
              totalPages={Math.max(1, Math.ceil(filteredOrders.length / pageSize))}
              onPageChange={setTxPage}
              totalItems={filteredOrders.length}
              pageSize={pageSize}
            />
          </Card>
        )}

        {/* SALES TAB */}
        {activeTab === 'sales' && (
          <Card className="overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="font-semibold">Product Sales</h3>
              <p className="text-sm text-muted-foreground">
                Each row is one product line item within an order.
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead>Product</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Order ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                        No product sales yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSales.map((sale) => (
                      <TableRow key={sale.id} className="hover:bg-muted/50">
                        <TableCell className="max-w-[200px] truncate font-medium">{sale.productName}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{sale.customerEmail}</TableCell>
                        <TableCell className="text-center">{sale.quantity}</TableCell>
                        <TableCell className="whitespace-nowrap">{currencyFormatter.format(sale.amount / sale.quantity)}</TableCell>
                        <TableCell className="font-semibold whitespace-nowrap">{currencyFormatter.format(sale.amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {sale.deliveryMethod === 'Home Delivery' ? (
                              <MapPin className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <Home className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                            <span className="text-xs">{sale.deliveryMethod === 'Home Delivery' ? 'Delivery' : 'Walk-in'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{sale.paymentMethod}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {dateFormatter.format(new Date(sale.createdAt))}
                        </TableCell>
                        <TableCell className="max-w-[120px] truncate font-mono text-xs text-muted-foreground">
                          {sale.orderId}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <PaginationControls
              currentPage={salePage}
              totalPages={Math.max(1, Math.ceil(filteredCompletedSales.length / pageSize))}
              onPageChange={setSalePage}
              totalItems={filteredCompletedSales.length}
              pageSize={pageSize}
            />
          </Card>
        )}
      </div>

      {/* Order Detail Drawer */}
      <Dialog open={!!selectedOrderId} onOpenChange={(open) => { if (!open) setSelectedOrderId(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Order {selectedOrderId}
            </DialogTitle>
            <DialogDescription>
              {selectedOrderItems.length} product{selectedOrderItems.length !== 1 ? 's' : ''} in this order
            </DialogDescription>
          </DialogHeader>

          {selectedOrderItems.length > 0 && (
            <>
              {/* Order summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Buyer</p>
                  <p className="text-sm font-medium truncate">{selectedOrderItems[0].customerEmail}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Delivery</p>
                  <p className="text-sm font-medium">{selectedOrderItems[0].deliveryMethod}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Payment</p>
                  <p className="text-sm font-medium">{selectedOrderItems[0].paymentMethod}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Total</p>
                  <p className="text-sm font-bold">{currencyFormatter.format(selectedOrderItems.reduce((s, t) => s + t.amount, 0))}</p>
                </div>
              </div>

              <div className="overflow-x-auto mt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell>{currencyFormatter.format(item.amount / item.quantity)}</TableCell>
                        <TableCell className="font-semibold">{currencyFormatter.format(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </AdminLayout>
  );
};

export default AdminSales;
