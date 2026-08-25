import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import TransactionHistory from '@/components/TransactionHistory';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactionStore } from '@/store/transactionStore';
import { useVisitorStore } from '@/store/visitorStore';
import { Calendar, Download, Users, Clock } from 'lucide-react';
import TrackingPanel from '@/components/TrackingPanel';

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  notation: 'compact',
});

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [isVisitorLoading, setIsVisitorLoading] = useState(true);

  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions);
  const getAnalyticsData = useTransactionStore((state) => state.getAnalyticsData);
  const transactions = useTransactionStore((state) => state.transactions);
  const isTransactionLoading = useTransactionStore((state) => state.isLoading);
  const visitorStats = useVisitorStore((state) => state.stats);
  const avgStayDuration = useVisitorStore((state) => state.getAverageStayDuration());
  const visitorDailyMetrics = useVisitorStore((state) => state.getDailyVisitorMetrics());
  const syncVisitorStats = useVisitorStore((state) => state.syncWithSupabase);
  const subscribeToVisitorRealtime = useVisitorStore((state) => state.subscribeToRealtime);
  const analyticsData = useMemo(
    () => getAnalyticsData(Number(timeRange)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeRange, transactions]
  );

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const loadVisitors = async () => {
      setIsVisitorLoading(true);
      try {
        await useVisitorStore.getState().syncWithSupabase();
      } catch (error) {
        console.error('Error loading visitor analytics:', error);
      } finally {
        setIsVisitorLoading(false);
      }
    };
    void loadVisitors();
  }, []);

  useEffect(() => {
    const unsubscribe = useVisitorStore.getState().subscribeToRealtime();
    return () => {
      unsubscribe();
    };
  }, []);

  const handleExport = () => {
    if (!analyticsData) return;

    const dataToExport = {
      exportedAt: new Date().toISOString(),
      timeRange: `${timeRange} days`,
      summary: analyticsData.summary,
      dailyMetrics: analyticsData.dailyMetrics,
      categoryMetrics: analyticsData.categoryMetrics,
    };

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2)));
    element.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isTransactionLoading || isVisitorLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Insights</h1>
            <p className="text-muted-foreground mt-2">Track your store performance and transactions</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Time Range Selector */}
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Analytics Charts */}
        <AnalyticsCharts data={analyticsData} visitorDailyMetrics={visitorDailyMetrics} />

        {/* On-Site Tracking */}
        <TrackingPanel />

        {/* Transaction History */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
          <TransactionHistory
            transactions={transactions}
            limit={15}
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversion Rate */}
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Conversion Rate</h3>
            <p className="text-3xl font-bold text-blue-600">{analyticsData.summary.conversionRate}%</p>
            <p className="text-sm text-muted-foreground mt-2">Store conversion rate</p>
          </Card>

          {/* Total Refunds */}
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Total Refunds</h3>
            <p className="text-3xl font-bold text-orange-600">
              {currencyFormatter.format(analyticsData.summary.totalRefunds)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Refunded in last {timeRange} days</p>
          </Card>

          {/* Avg Order Value */}
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Avg Order Value</h3>
            <p className="text-3xl font-bold text-green-600">
              {currencyFormatter.format(analyticsData.summary.avgOrderValue)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Average per transaction</p>
          </Card>

          {/* Site Visitors */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-orange-600" />
              <h3 className="font-semibold">Site Visitors</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {visitorStats.totalVisitors.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Total unique visitors</p>
          </Card>

          {/* Avg. Stay Duration */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold">Avg. Stay Duration</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {Math.floor(avgStayDuration / 60)}m {avgStayDuration % 60}s
            </p>
            <p className="text-sm text-muted-foreground mt-2">Average session time</p>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
