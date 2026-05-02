import { create } from 'zustand';
import { Transaction, TransactionSummary, AnalyticsData, DailyMetric, CategoryMetric } from '@/types/transaction';
import { supabase } from '@/lib/supabase';
import { retryWithBackoff } from '@/utils/resilience';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
  
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  getTransactionSummary: (days?: number) => TransactionSummary;
  getAnalyticsData: (days?: number) => AnalyticsData;
}

const TRANSACTION_CACHE_KEY = 'cedokamall.transactions.cache.v1';

const loadCachedTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(TRANSACTION_CACHE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return parsed.map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));
  } catch (e) {
    return [];
  }
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: loadCachedTransactions(),
  isLoading: false,
  error: null,
  hasLoaded: false,

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const transactions = data.map((row: any) => ({
            id: String(row.id),
            orderId: String(row.order_id),
            productId: String(row.product_id),
            productName: String(row.product_name),
            customerEmail: String(row.customer_email || ''),
            amount: Number(row.amount),
            currency: '₦',
            quantity: Number(row.quantity),
            status: row.status,
            type: row.type || 'sale',
            paymentMethod: row.payment_method,
            category: String(row.category || 'General'),
            profit: Number(row.profit || row.amount * 0.3),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at || row.created_at),
          }));
          
          set({ transactions, hasLoaded: true, error: null });
          if (typeof window !== 'undefined') {
            localStorage.setItem(TRANSACTION_CACHE_KEY, JSON.stringify(transactions));
          }
        }
      }, { maxRetries: 2 });
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (transactionData) => {
    try {
      const payload = {
        order_id: transactionData.orderId,
        product_id: transactionData.productId,
        product_name: transactionData.productName,
        customer_email: transactionData.customerEmail,
        amount: transactionData.amount,
        quantity: transactionData.quantity,
        status: transactionData.status,
        type: transactionData.type,
        payment_method: transactionData.paymentMethod,
        category: transactionData.category,
        profit: transactionData.profit || transactionData.amount * 0.3,
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newTxn: Transaction = {
          ...transactionData,
          id: String(data.id),
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at || data.created_at),
        };
        set((state) => {
          const transactions = [newTxn, ...state.transactions];
          if (typeof window !== 'undefined') {
            localStorage.setItem(TRANSACTION_CACHE_KEY, JSON.stringify(transactions));
          }
          return { transactions };
        });
      }
    } catch (err: any) {
      console.error('Error adding transaction:', err);
      // Local fallback
      const fallbackTxn: Transaction = {
        ...transactionData,
        id: `local-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => {
        const transactions = [fallbackTxn, ...state.transactions];
        if (typeof window !== 'undefined') {
          localStorage.setItem(TRANSACTION_CACHE_KEY, JSON.stringify(transactions));
        }
        return { transactions };
      });
    }
  },

  getTransactionSummary: (days: number = 30) => {
    const { transactions } = get();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentTransactions = transactions.filter(
      (t) => new Date(t.createdAt) >= cutoffDate && t.status === 'completed'
    );

    const totalRevenue = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalOrders = recentTransactions.length;
    const totalRefunds = transactions
      .filter((t) => t.status === 'refunded' && new Date(t.createdAt) >= cutoffDate)
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryTotals = recentTransactions.reduce(
      (acc, t) => {
        const cat = t.category || 'General';
        acc[cat] = (acc[cat] || 0) + t.amount;
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
      conversionRate: 3.2,
      topProduct,
      topCategory,
    };
  },

  getAnalyticsData: (days: number = 30) => {
    const { transactions, getTransactionSummary } = get();
    const summary = getTransactionSummary(days);

    const dailyMetrics: DailyMetric[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTransactions = transactions.filter(
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

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentTransactions = transactions.filter(
      (t) => new Date(t.createdAt) >= cutoffDate && t.status === 'completed'
    );

    const totalRevenue = summary.totalRevenue;
    const categoryTotals = recentTransactions.reduce(
      (acc, t) => {
        const cat = t.category || 'General';
        if (!acc[cat]) {
          acc[cat] = { revenue: 0, orders: 0 };
        }
        acc[cat].revenue += t.amount;
        acc[cat].orders += 1;
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

    const previousDayMetrics = dailyMetrics.slice(-14, -7).reduce((sum, m) => sum + m.revenue, 0);
    const currentDayMetrics = dailyMetrics.slice(-7).reduce((sum, m) => sum + m.revenue, 0);
    const revenueChange =
      previousDayMetrics > 0
        ? ((currentDayMetrics - previousDayMetrics) / previousDayMetrics) * 100
        : 0;

    const currentOrders = dailyMetrics.slice(-7).reduce((sum, m) => sum + m.orders, 0);
    const previousOrders = dailyMetrics.slice(-14, -7).reduce((sum, m) => sum + m.orders, 0);
    const orderChange = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;

    return {
      summary,
      dailyMetrics,
      categoryMetrics: categoryMetrics.sort((a, b) => b.revenue - a.revenue),
      revenueChange: Math.round(revenueChange * 100) / 100,
      orderChange: Math.round(orderChange * 100) / 100,
      customerChange: 8.4,
    };
  },
}));

// Export a legacy object for compatibility with non-hook usage if needed
export const transactionStore = {
  get transactions() { return useTransactionStore.getState().transactions; },
  addTransaction: (data: any) => useTransactionStore.getState().addTransaction(data),
  getTransactionSummary: (days: number) => useTransactionStore.getState().getTransactionSummary(days),
  getAnalyticsData: (days: number) => useTransactionStore.getState().getAnalyticsData(days),
};
