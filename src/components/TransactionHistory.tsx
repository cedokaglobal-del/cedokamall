import { Transaction } from '@/types/transaction';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle2, Clock, XCircle, RotateCcw } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  limit?: number;
}

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

const TransactionHistory = ({ transactions, limit = 10 }: TransactionHistoryProps) => {
  const formatCurrency = (amount: number) => {
    return currencyFormatter.format(amount);
  };

  const formatDate = (date: Date | string) => {
    return dateFormatter.format(new Date(date));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'refunded':
        return <RotateCcw className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      refunded: 'outline',
    };

    return variants[status] || 'default';
  };

  const displayTransactions = transactions.slice(0, limit);

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="font-semibold">Recent Transactions</h3>
        <p className="text-sm text-muted-foreground">Showing {displayTransactions.length} of {transactions.length} transactions</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Order ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayTransactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-sm">{transaction.orderId}</TableCell>
                <TableCell className="font-medium line-clamp-1">{transaction.productName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{transaction.customerEmail}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(transaction.amount)}</TableCell>
                <TableCell className="text-center">{transaction.quantity}</TableCell>
                <TableCell className="text-sm">{transaction.category}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(transaction.status)}
                    <Badge variant={getStatusBadge(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(transaction.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default TransactionHistory;
