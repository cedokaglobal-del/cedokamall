import { AnalyticsData } from '@/types/transaction';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AnalyticsChartProps {
  data: AnalyticsData;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const AnalyticsCharts = ({ data }: AnalyticsChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      notation: 'compact',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const StatCard = ({
    label,
    value,
    change,
    isPositive,
  }: {
    label: string;
    value: string;
    change: number;
    isPositive: boolean;
  }) => (
    <Card className="p-6">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold">{value}</p>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Revenue (30 days)"
          value={formatCurrency(data.summary.totalRevenue)}
          change={data.revenueChange}
          isPositive={data.revenueChange >= 0}
        />
        <StatCard
          label="Total Orders (30 days)"
          value={data.summary.totalOrders.toString()}
          change={data.orderChange}
          isPositive={data.orderChange >= 0}
        />
        <StatCard
          label="Average Order Value"
          value={formatCurrency(data.summary.avgOrderValue)}
          change={0}
          isPositive={true}
        />
      </div>

      {/* Charts Row 1: Revenue & Orders Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Revenue Trend (30 days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailyMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Orders Trend */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Orders Trend (30 days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.dailyMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#10b981" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2: Category Performance & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.categoryMetrics}
              layout="vertical"
              margin={{ left: 150, right: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={140} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Sales Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.categoryMetrics}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ category, percentageOfTotal }) =>
                  `${category} (${percentageOfTotal.toFixed(1)}%)`
                }
              >
                {data.categoryMetrics.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Product */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Top Selling Product</h3>
          <p className="text-2xl font-bold text-blue-600">{data.summary.topProduct}</p>
          <p className="text-sm text-muted-foreground mt-2">Best performer in the last 30 days</p>
        </Card>

        {/* Top Category */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Top Category</h3>
          <p className="text-2xl font-bold text-green-600">{data.summary.topCategory}</p>
          <p className="text-sm text-muted-foreground mt-2">Highest revenue generating category</p>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
