import { Transaction, TransactionSummary, AnalyticsData, DailyMetric, CategoryMetric } from '@/types/transaction';

interface TransactionStore {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getTransactionSummary: (days?: number) => TransactionSummary;
  getAnalyticsData: (days?: number) => AnalyticsData;
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[];
  getTransactionsByCategory: (category: string) => Transaction[];
}

// Mock transaction data for demo
const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const categories = ['Smartphones', 'Laptops', 'Audio & Sound', 'Accessories'];
  const statuses: Array<'completed' | 'pending' | 'failed' | 'refunded'> = ['completed', 'pending', 'completed', 'completed'];
  const products = [
    { id: '1', name: 'iPhone 15 Pro' },
    { id: '2', name: 'Samsung Galaxy S24' },
    { id: '3', name: 'Dell XPS 13' },
    { id: '4', name: 'Sony Headphones' },
  ];

  // Generate last 30 days of transactions
  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const product = products[Math.floor(Math.random() * products.length)];
    const amount = Math.floor(Math.random() * 1500000) + 50000;

    transactions.push({
      id: `txn-${i}`,
      orderId: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      productId: product.id,
      productName: product.name,
      customerEmail: `customer${i}@example.com`,
      amount,
      currency: '₦',
      quantity: Math.floor(Math.random() * 5) + 1,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      type: 'sale',
      paymentMethod: ['Card', 'Transfer', 'Wallet'][Math.floor(Math.random() * 3)],
      createdAt: date,
      updatedAt: date,
      category: categories[Math.floor(Math.random() * categories.length)],
      profit: Math.floor(amount * 0.3), // 30% profit margin
    });
  }

  return transactions;
};

class TransactionStoreImpl implements TransactionStore {
  transactions: Transaction[] = [];

  constructor() {
    const stored = localStorage.getItem('transactions');
    this.transactions = stored ? JSON.parse(stored) : generateMockTransactions();
  }

  setTransactions(transactions: Transaction[]): void {
    this.transactions = transactions;
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }

  addTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `txn-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.push(newTransaction);
    this.setTransactions(this.transactions);
  }

  getTransactionSummary(days: number = 30): TransactionSummary {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentTransactions = this.transactions.filter(
      (t) => new Date(t.createdAt) >= cutoffDate && t.status === 'completed'
    );

    const totalRevenue = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalOrders = recentTransactions.length;
    const totalRefunds = this.transactions
      .filter((t) => t.status === 'refunded' && new Date(t.createdAt) >= cutoffDate)
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryTotals = recentTransactions.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    const productTotals = recentTransactions.reduce(
      (acc, t) => {
        acc[t.productName] = (acc[t.productName] || 0) + t.quantity;
        return acc;
      },
      {} as Record<string, number>
    );

    const topProduct = Object.entries(productTotals).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalRevenue,
      totalOrders,
      totalRefunds,
      avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      conversionRate: 3.2, // Mock conversion rate
      topProduct,
      topCategory,
    };
  }

  getAnalyticsData(days: number = 30): AnalyticsData {
    const summary = this.getTransactionSummary(days);

    // Generate daily metrics
    const dailyMetrics: DailyMetric[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTransactions = this.transactions.filter(
        (t) =>
          new Date(t.createdAt).toISOString().split('T')[0] === dateStr &&
          t.status === 'completed'
      );

      dailyMetrics.push({
        date: dateStr,
        revenue: dayTransactions.reduce((sum, t) => sum + t.amount, 0),
        orders: dayTransactions.length,
        customers: new Set(dayTransactions.map((t) => t.customerEmail)).size,
        avgOrderValue:
          dayTransactions.length > 0
            ? Math.round(
                dayTransactions.reduce((sum, t) => sum + t.amount, 0) / dayTransactions.length
              )
            : 0,
      });
    }

    // Generate category metrics
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentTransactions = this.transactions.filter(
      (t) => new Date(t.createdAt) >= cutoffDate && t.status === 'completed'
    );

    const totalRevenue = summary.totalRevenue;
    const categoryTotals = recentTransactions.reduce(
      (acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = { revenue: 0, orders: 0 };
        }
        acc[t.category].revenue += t.amount;
        acc[t.category].orders += 1;
        return acc;
      },
      {} as Record<string, { revenue: number; orders: number }>
    );

    const categoryMetrics: CategoryMetric[] = Object.entries(categoryTotals).map(
      ([category, data]) => ({
        category,
        revenue: data.revenue,
        orders: data.orders,
        percentageOfTotal: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      })
    );

    // Calculate changes
    const previousDayMetrics = dailyMetrics.slice(-7).reduce((sum, m) => sum + m.revenue, 0);
    const currentDayMetrics = dailyMetrics.slice(-14, -7).reduce((sum, m) => sum + m.revenue, 0);
    const revenueChange =
      currentDayMetrics > 0
        ? ((previousDayMetrics - currentDayMetrics) / currentDayMetrics) * 100
        : 0;

    const currentOrders = dailyMetrics.slice(-7).reduce((sum, m) => sum + m.orders, 0);
    const previousOrders = dailyMetrics.slice(-14, -7).reduce((sum, m) => sum + m.orders, 0);
    const orderChange = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;

    const currentCustomers = dailyMetrics
      .slice(-7)
      .reduce((set, m) => {
        dailyMetrics
          .filter((d) => d.date >= m.date)
          .forEach((d) => set.add(d.date));
        return set;
      }, new Set()).size;

    const previousCustomers = dailyMetrics
      .slice(-14, -7)
      .reduce((set, m) => {
        dailyMetrics
          .filter((d) => d.date >= m.date && d.date < dailyMetrics[dailyMetrics.length - 7].date)
          .forEach((d) => set.add(d.date));
        return set;
      }, new Set()).size;

    const customerChange =
      previousCustomers > 0 ? ((currentCustomers - previousCustomers) / previousCustomers) * 100 : 0;

    return {
      summary,
      dailyMetrics,
      categoryMetrics: categoryMetrics.sort((a, b) => b.revenue - a.revenue),
      revenueChange: Math.round(revenueChange * 100) / 100,
      orderChange: Math.round(orderChange * 100) / 100,
      customerChange: Math.round(customerChange * 100) / 100,
    };
  }

  getTransactionsByDateRange(startDate: Date, endDate: Date): Transaction[] {
    return this.transactions.filter(
      (t) =>
        new Date(t.createdAt) >= startDate &&
        new Date(t.createdAt) <= endDate &&
        t.status === 'completed'
    );
  }

  getTransactionsByCategory(category: string): Transaction[] {
    return this.transactions.filter((t) => t.category === category && t.status === 'completed');
  }
}

export const transactionStore = new TransactionStoreImpl();
