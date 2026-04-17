import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { FlashDealRequest } from '@/types/flashDeal';
import { products } from '@/data/products';

interface FlashDealFormProps {
  onSubmit: (data: FlashDealRequest) => void;
  isLoading?: boolean;
}

const FlashDealForm = ({ onSubmit, isLoading = false }: FlashDealFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FlashDealRequest>();
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  const handleFormSubmit = (data: FlashDealRequest) => {
    if (!selectedProduct) {
      alert('Please select a product');
      return;
    }
    onSubmit({
      ...data,
      productId: selectedProduct,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Create Flash Deal</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Product Selection */}
        <div>
          <Label htmlFor="product">Product</Label>
          <select
            id="product"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full mt-2 p-2 border rounded-lg"
          >
            <option value="">Select a product...</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - ₦{product.price.toLocaleString()}
              </option>
            ))}
          </select>
          {!selectedProduct && <p className="text-destructive text-sm mt-1">Product is required</p>}
        </div>

        {/* Discount Percentage */}
        <div>
          <Label htmlFor="discount">Discount Percentage (%)</Label>
          <Input
            id="discount"
            type="number"
            min="1"
            max="100"
            placeholder="e.g., 20"
            {...register('discountPercentage', {
              required: 'Discount percentage is required',
              min: { value: 1, message: 'Discount must be at least 1%' },
              max: { value: 100, message: 'Discount cannot exceed 100%' },
            })}
            className="mt-2"
          />
          {errors.discountPercentage && (
            <p className="text-destructive text-sm mt-1">{errors.discountPercentage.message}</p>
          )}
        </div>

        {/* Start Time */}
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="datetime-local"
            {...register('startTime', {
              required: 'Start time is required',
            })}
            className="mt-2"
          />
          {errors.startTime && (
            <p className="text-destructive text-sm mt-1">{errors.startTime.message}</p>
          )}
        </div>

        {/* End Time */}
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="datetime-local"
            {...register('endTime', {
              required: 'End time is required',
            })}
            className="mt-2"
          />
          {errors.endTime && (
            <p className="text-destructive text-sm mt-1">{errors.endTime.message}</p>
          )}
        </div>

        {/* Max Quantity */}
        <div>
          <Label htmlFor="maxQuantity">Max Quantity Available</Label>
          <Input
            id="maxQuantity"
            type="number"
            min="1"
            placeholder="e.g., 50"
            {...register('maxQuantity', {
              required: 'Max quantity is required',
              min: { value: 1, message: 'Quantity must be at least 1' },
            })}
            className="mt-2"
          />
          {errors.maxQuantity && (
            <p className="text-destructive text-sm mt-1">{errors.maxQuantity.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Creating...' : 'Create Flash Deal'}
        </Button>
      </form>
    </Card>
  );
};

export default FlashDealForm;
