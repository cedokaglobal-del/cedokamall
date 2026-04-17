import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ProductFormData, Product } from '@/types/product';
import { X } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const categories = [
  'Smartphones',
  'Laptops',
  'Tablets',
  'Audio & Sound',
  'Cameras',
  'Gaming',
  'Accessories',
  'TV',
  'Refrigerators',
  'Washing Machines',
  'Air Conditioners',
  'Fans',
  'Generators',
  'Freezers',
  'Sound Systems',
  'Smart Home',
];

const ProductForm = ({ product, onSubmit, onCancel, isLoading = false }: ProductFormProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    price: product?.price || 0,
    originalPrice: product?.originalPrice || 0,
    category: product?.category || '',
    description: product?.description || '',
    inStock: product?.inStock || 0,
    seller: product?.seller || '',
    image: product?.image || '',
    sku: product?.sku || '',
    warranty: product?.warranty || '',
    specs: product?.specs || {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.inStock < 0) newErrors.inStock = 'Stock cannot be negative';
    if (!formData.seller.trim()) newErrors.seller = 'Seller name is required';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter product name"
            className={errors.name ? 'border-destructive' : ''}
            disabled={isLoading}
          />
          {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleChange('category', value)}
            disabled={isLoading}
          >
            <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
        </div>

        {/* Price */}
        <div>
          <Label htmlFor="price">Price (₦) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleChange('price', Number(e.target.value))}
            placeholder="0.00"
            className={errors.price ? 'border-destructive' : ''}
            disabled={isLoading}
          />
          {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
        </div>

        {/* Original Price */}
        <div>
          <Label htmlFor="originalPrice">Original Price (₦)</Label>
          <Input
            id="originalPrice"
            type="number"
            value={formData.originalPrice}
            onChange={(e) => handleChange('originalPrice', Number(e.target.value))}
            placeholder="0.00"
            disabled={isLoading}
          />
        </div>

        {/* Stock */}
        <div>
          <Label htmlFor="inStock">Stock Quantity *</Label>
          <Input
            id="inStock"
            type="number"
            value={formData.inStock}
            onChange={(e) => handleChange('inStock', Number(e.target.value))}
            placeholder="0"
            className={errors.inStock ? 'border-destructive' : ''}
            disabled={isLoading}
          />
          {errors.inStock && <p className="text-sm text-destructive mt-1">{errors.inStock}</p>}
        </div>

        {/* SKU */}
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="e.g., SKU-12345"
            disabled={isLoading}
          />
        </div>

        {/* Seller */}
        <div>
          <Label htmlFor="seller">Seller Name *</Label>
          <Input
            id="seller"
            value={formData.seller}
            onChange={(e) => handleChange('seller', e.target.value)}
            placeholder="Enter seller name"
            className={errors.seller ? 'border-destructive' : ''}
            disabled={isLoading}
          />
          {errors.seller && <p className="text-sm text-destructive mt-1">{errors.seller}</p>}
        </div>

        {/* Warranty */}
        <div>
          <Label htmlFor="warranty">Warranty</Label>
          <Input
            id="warranty"
            value={formData.warranty}
            onChange={(e) => handleChange('warranty', e.target.value)}
            placeholder="e.g., 1 year"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter product description"
          rows={4}
          className={errors.description ? 'border-destructive' : ''}
          disabled={isLoading}
        />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
      </div>

      {/* Image URL */}
      <div>
        <Label htmlFor="image">Image URL *</Label>
        <Input
          id="image"
          type="url"
          value={formData.image}
          onChange={(e) => handleChange('image', e.target.value)}
          placeholder="https://example.com/image.jpg"
          className={errors.image ? 'border-destructive' : ''}
          disabled={isLoading}
        />
        {errors.image && <p className="text-sm text-destructive mt-1">{errors.image}</p>}
        {formData.image && (
          <div className="mt-3">
            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
            <img
              src={formData.image}
              alt="Preview"
              className="h-32 w-32 object-cover rounded-lg border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=Invalid+Image';
              }}
            />
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
