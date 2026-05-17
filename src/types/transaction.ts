export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';
export type TransactionType = 'sale' | 'refund' | 'adjustment';

export interface Transaction {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  quantity: number;
  status: TransactionStatus;
  type: TransactionType;
  paymentMethod: string;
  deliveryMethod: string;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  profit: number;
}

export interface TransactionSummary {
  totalRevenue: number;
  totalOrders: number;
  totalRefunds: number;
  avgOrderValue: number;
  conversionRate: number;
  topProduct: string;
  topCategory: string;
}

export interface DailyMetric {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
}

export interface CategoryMetric {
  category: string;
  revenue: number;
  orders: number;
  percentageOfTotal: number;
}

export interface AnalyticsData {
  summary: TransactionSummary;
  dailyMetrics: DailyMetric[];
  categoryMetrics: CategoryMetric[];
  revenueChange: number;
  orderChange: number;
  customerChange: number;
}
