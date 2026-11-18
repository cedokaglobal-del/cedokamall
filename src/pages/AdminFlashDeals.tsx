import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import FlashDealForm from '@/components/FlashDealForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FlashDealRequest, FlashDeal } from '@/types/flashDeal';
import { flashDealStore } from '@/store/flashDealStore';
import { Trash2, Edit2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const AdminFlashDeals = () => {
  const [deals, setDeals] = useState<FlashDeal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<FlashDeal | null>(null);
  const [viewingDeal, setViewingDeal] = useState<FlashDeal | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load deals from store
    setDeals(flashDealStore.getAllDeals());
  }, []);

  const handleCreateDeal = async (data: FlashDealRequest) => {
    setIsLoading(true);
    try {
      if (editingDeal) {
        flashDealStore.updateDeal(editingDeal.id, data);
        toast.success('Flash deal updated');
      } else {
        flashDealStore.addDeal(data);
        toast.success('Flash deal created');
      }
      setDeals(flashDealStore.getAllDeals());
      setShowForm(false);
      setEditingDeal(null);
    } catch {
      toast.error('Could not save the flash deal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (deal: FlashDeal) => {
    setEditingDeal(deal);
    setViewingDeal(null);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingDeal(null);
  };

  const handleDeleteDeal = (dealId: string) => {
    if (window.confirm('Are you sure you want to delete this flash deal?')) {
      flashDealStore.deleteDeal(dealId);
      setDeals(flashDealStore.getAllDeals());
      toast.success('Flash deal deleted');
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
          <FlashDealForm
            key={editingDeal?.id || 'new'}
            initialDeal={editingDeal || undefined}
            onSubmit={handleCreateDeal}
            onCancel={cancelForm}
            isLoading={isLoading}
          />
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
                              : 'bg-ivory text-navy'
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
                            className="h-10 w-10"
                            aria-label="View deal"
                            onClick={() => setViewingDeal(deal)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10"
                            aria-label="Edit deal"
                            onClick={() => startEdit(deal)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10"
                            aria-label="Delete deal"
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

      <Dialog open={!!viewingDeal} onOpenChange={(open) => !open && setViewingDeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flash deal details</DialogTitle>
            <DialogDescription>Full configuration for this promotion.</DialogDescription>
          </DialogHeader>
          {viewingDeal && (
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div><dt className="font-semibold text-muted-foreground">Product ID</dt><dd className="break-all">{viewingDeal.productId}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Discount</dt><dd>{viewingDeal.discountPercentage}%</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Starts</dt><dd>{formatDate(viewingDeal.startTime)}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Ends</dt><dd>{formatDate(viewingDeal.endTime)}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Claimed / Available</dt><dd>{viewingDeal.currentQuantity} / {viewingDeal.maxQuantity}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Status</dt><dd>{viewingDeal.isActive ? 'Active' : 'Inactive'}</dd></div>
            </dl>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {viewingDeal && (
              <Button onClick={() => startEdit(viewingDeal)} className="w-full sm:w-auto">Edit deal</Button>
            )}
            <Button variant="outline" onClick={() => setViewingDeal(null)} className="w-full sm:w-auto">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminFlashDeals;
