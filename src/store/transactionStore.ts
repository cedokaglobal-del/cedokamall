import { create } from 'zustand';
import { Transaction, TransactionSummary, AnalyticsData, DailyMetric, CategoryMetric } from '@/types/transaction';
import { supabase } from '@/lib/supabase';
import { retryWithBackoff } from '@/utils/resilience';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
  lastSyncedAt: string | null;
  
  fetchTransactions: (force?: boolean) => Promise<void>;
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
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((value): value is Record<string, unknown> => Boolean(value && typeof value === 'object'))
      .map((t) => ({
        id: String(t.id ?? ''),
        orderId: String(t.orderId ?? ''),
        productId: String(t.productId ?? ''),
        productName: String(t.productName ?? ''),
        customerEmail: String(t.customerEmail ?? ''),
        amount: Number(t.amount ?? 0),
        currency: String(t.currency ?? 'NGN'),
        quantity: Number(t.quantity ?? 0),
        status: t.status as Transaction['status'],
        type: t.type as Transaction['type'],
        paymentMethod: String(t.paymentMethod ?? ''),
        deliveryMethod: String(t.deliveryMethod ?? t.delivery_method ?? ''),
        category: String(t.category ?? 'General'),
        profit: Number(t.profit ?? 0),
        createdAt: new Date(String(t.createdAt)),
        updatedAt: new Date(String(t.updatedAt)),
      }));
  } catch (e) {
    return [];
  }
};

const cachedTransactions = loadCachedTransactions();

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: cachedTransactions,
  isLoading: false,
  error: null,
  hasLoaded: cachedTransactions.length > 0,
  lastSyncedAt: null,
  
  fetchTransactions: async (force = false) => {
    const state = get();
    // If recently loaded (within 5 mins), don't fetch again unless forced or empty
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (!force && state.hasLoaded && state.lastSyncedAt && new Date(state.lastSyncedAt).getTime() > fiveMinutesAgo) {
      return;
    }

    if (state.isLoading && !force) return;
    set({ isLoading: true });
    try {
      await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const transactions = data.map((row) => ({
            id: String(row.id),
            orderId: String(row.order_id),
            productId: String(row.product_id),
            productName: String(row.product_name),
            customerEmail: String(row.customer_email || ''),
            amount: Number(row.amount),
            currency: '₦',
            quantity: Number(row.quantity),
            status: row.status as Transaction['status'],
            type: (row.type || 'sale') as Transaction['type'],
            paymentMethod: String(row.payment_method || ''),
            deliveryMethod: row.delivery_method || '',
            category: String(row.category || 'General'),
            profit: Number(row.profit || row.amount * 0.3),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at || row.created_at),
          }));
          
          set({ 
            transactions, 
            hasLoaded: true, 
            error: null,
            lastSyncedAt: new Date().toISOString()
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem(TRANSACTION_CACHE_KEY, JSON.stringify(transactions));
          }
        }
      }, { maxRetries: 2 });
    } catch (err: unknown) {
      console.error('Error fetching transactions:', err);
      set({ error: err instanceof Error ? err.message : 'Unable to fetch transactions.' });
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
        delivery_method: transactionData.deliveryMethod || '',
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
    } catch (err: unknown) {
      console.error('Error adding transaction:', err);
      // Local fallback
      const fallbackTxn: Transaction = {
        ...transactionData,
        id: `local-${Date.now()}`,
        deliveryMethod: transactionData.deliveryMethod || '',
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

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const recentCompletedTransactions = transactions.filter(
      (transaction) =>
        transaction.status === 'completed' && new Date(transaction.createdAt) >= cutoffDate
    );

    const dailyBuckets = new Map<
      string,
      { revenue: number; orders: number; customers: Set<string> }
    >();
    const categoryTotals = {} as Record<string, { revenue: number; orders: number }>;

    recentCompletedTransactions.forEach((transaction) => {
      const dateStr = new Date(transaction.createdAt).toISOString().split('T')[0];
      const existingDayBucket = dailyBuckets.get(dateStr) ?? {
        revenue: 0,
        orders: 0,
        customers: new Set<string>(),
      };
      existingDayBucket.revenue += transaction.amount;
      existingDayBucket.orders += 1;
      if (transaction.customerEmail) {
        existingDayBucket.customers.add(transaction.customerEmail);
      }
      dailyBuckets.set(dateStr, existingDayBucket);

      const category = transaction.category || 'General';
      if (!categoryTotals[category]) {
        categoryTotals[category] = { revenue: 0, orders: 0 };
      }
      categoryTotals[category].revenue += transaction.amount;
      categoryTotals[category].orders += 1;
    });

    const dailyMetrics: DailyMetric[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayBucket = dailyBuckets.get(dateStr);
      const dayRevenue = dayBucket?.revenue ?? 0;
      const dayOrders = dayBucket?.orders ?? 0;

      dailyMetrics.push({
        date: dateStr,
        revenue: dayRevenue,
        orders: dayOrders,
        customers: dayBucket?.customers.size ?? 0,
        avgOrderValue: dayOrders > 0 ? Math.round(dayRevenue / dayOrders) : 0,
      });
    }

    const totalRevenue = summary.totalRevenue;

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
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => useTransactionStore.getState().addTransaction(data),
  getTransactionSummary: (days: number) => useTransactionStore.getState().getTransactionSummary(days),
  getAnalyticsData: (days: number) => useTransactionStore.getState().getAnalyticsData(days),
};
