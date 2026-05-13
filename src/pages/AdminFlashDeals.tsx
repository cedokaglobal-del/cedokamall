import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import FlashDealForm from '@/components/FlashDealForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlashDealRequest, FlashDeal } from '@/types/flashDeal';
import { flashDealStore } from '@/store/flashDealStore';
import { Trash2, Edit2, Eye } from 'lucide-react';

const AdminFlashDeals = () => {
  const [deals, setDeals] = useState<FlashDeal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load deals from store
    setDeals(flashDealStore.getAllDeals());
  }, []);

  const handleCreateDeal = async (data: FlashDealRequest) => {
    setIsLoading(true);
    try {
      flashDealStore.addDeal(data);
      setDeals(flashDealStore.getAllDeals());
      setShowForm(false);
      console.log('Flash deal created successfully');
    } catch (error) {
      console.error('Error creating flash deal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDeal = (dealId: string) => {
    if (confirm('Are you sure you want to delete this flash deal?')) {
      flashDealStore.deleteDeal(dealId);
      setDeals(flashDealStore.getAllDeals());
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Flash Deals Management</h1>
            <p className="text-muted-foreground mt-2">Create and manage flash sales</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="md:inline-flex"
          >
            {showForm ? 'Hide Form' : 'Create New Deal'}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <FlashDealForm onSubmit={handleCreateDeal} isLoading={isLoading} />
        )}

        {/* Deals List */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Product ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Discount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Start Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">End Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Quantity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {deals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No flash deals yet. Create one to get started!
                    </td>
                  </tr>
                ) : (
                  deals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm">{deal.productId}</td>
                      <td className="px-6 py-4 text-sm">{deal.discountPercentage}%</td>
                      <td className="px-6 py-4 text-sm">{formatDate(deal.startTime)}</td>
                      <td className="px-6 py-4 text-sm">{formatDate(deal.endTime)}</td>
                      <td className="px-6 py-4 text-sm">
                        {deal.currentQuantity} / {deal.maxQuantity}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            deal.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {deal.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement view functionality
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement edit functionality
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDeal(deal.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminFlashDeals;
