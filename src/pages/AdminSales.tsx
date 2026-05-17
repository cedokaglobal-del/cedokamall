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
import { ShoppingCart, MapPin, Home, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

  useEffect(() => {
    void seedHistoricalSales();
  }, []);

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

  const paginatedOrders = useMemo(
    () => orderMap.slice((txPage - 1) * pageSize, txPage * pageSize),
    [orderMap, txPage]
  );

  useEffect(() => {
    if (txPage > Math.ceil(orderMap.length / pageSize)) setTxPage(1);
  }, [orderMap.length, txPage]);

  // --- SALES VIEW (individual line items) ---
  const paginatedSales = useMemo(
    () => completedTxs.slice((salePage - 1) * pageSize, salePage * pageSize),
    [completedTxs, salePage]
  );

  useEffect(() => {
    if (salePage > Math.ceil(completedTxs.length / pageSize)) setSalePage(1);
  }, [completedTxs.length, salePage]);

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
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-emerald bg-clip-text text-transparent">
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
              totalPages={Math.max(1, Math.ceil(orderMap.length / pageSize))}
              onPageChange={setTxPage}
              totalItems={orderMap.length}
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
              totalPages={Math.max(1, Math.ceil(completedTxs.length / pageSize))}
              onPageChange={setSalePage}
              totalItems={completedTxs.length}
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
