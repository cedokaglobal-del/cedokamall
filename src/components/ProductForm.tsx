// Product Management Form Component
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DEFAULT_CATEGORY_NAMES, getCategoryOptions } from '@/data/products';
import { ProductFormData, Product } from '@/types/product';
import { useProductStore } from '@/store/productStore';
import { X, Paperclip, Plus } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Load custom categories from localStorage
const loadCategories = (): string[] => {
  try {
    const stored = localStorage.getItem('product_categories');
    if (stored) {
      const customCategories = JSON.parse(stored);
      return Array.from(new Set([...DEFAULT_CATEGORY_NAMES, ...customCategories])).sort();
    }
  } catch (e) {
    console.error('Error loading categories:', e);
  }
  return DEFAULT_CATEGORY_NAMES;
};

// Save custom categories to localStorage
const saveCategories = (cats: string[]): void => {
  try {
    const custom = cats.filter(c => !DEFAULT_CATEGORY_NAMES.includes(c));
    localStorage.setItem('product_categories', JSON.stringify(custom));
  } catch (e) {
    console.error('Error saving categories:', e);
  }
};

const ProductForm = ({ product, onSubmit, onCancel, isLoading = false }: ProductFormProps) => {
  const { products } = useProductStore();
  const [customCategories, setCustomCategories] = useState<string[]>(loadCategories());
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const categories = useMemo(
    () => getCategoryOptions(products, customCategories),
    [products, customCategories]
  );

  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    price: product?.price || (undefined as any),
    originalPrice: product?.originalPrice || (undefined as any),
    category: product?.category || '',
    description: product?.description || '',
    inStock: product?.inStock !== undefined ? product.inStock : (undefined as any),
    seller: product?.seller || '',
    image: product?.image || '',
    images: product?.images || (product?.image ? [product.image] : []),
    sku: product?.sku || '',
    warranty: product?.warranty || '',
    specs: product?.specs || {},
    color: product?.color || '',
  });

  const handleAddCategory = () => {
    setCategoryError('');
    const trimmed = newCategory.trim();

    if (!trimmed) {
      setCategoryError('Category name cannot be empty');
      return;
    }

    if (categories.includes(trimmed)) {
      setCategoryError('This category already exists');
      return;
    }

    if (trimmed.length > 50) {
      setCategoryError('Category name must be less than 50 characters');
      return;
    }

    const updatedCategories = [...customCategories, trimmed].sort();
    setCustomCategories(updatedCategories);
    saveCategories(updatedCategories);
    setFormData((prev) => ({ ...prev, category: trimmed }));
    setNewCategory('');
    setIsAddingCategory(false);
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800;
          let { width, height } = img;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const currentImages = formData.images || [];
    const remainingSlots = 4 - currentImages.length;
    const filesToUpload = files.slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      alert(`You can only add up to 4 images max.`);
    }

    const newBase64Images = await Promise.all(filesToUpload.map(f => resizeImage(f)));
    const updatedImages = [...currentImages, ...newBase64Images];
    
    setFormData(prev => ({ 
      ...prev, 
      images: updatedImages, 
      image: updatedImages[0] || '' 
    }));
    
    if (errors.images) {
      setErrors(prev => { const n = { ...prev }; delete n.images; return n; });
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = (formData.images || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: updatedImages, image: updatedImages[0] || '' }));
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.inStock < 0) newErrors.inStock = 'Stock cannot be negative';
    if (!formData.seller.trim()) newErrors.seller = 'Brand name is required';
    if (!formData.images || formData.images.length === 0) newErrors.images = 'At least 1 product image is required';

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
    if (field === 'price' || field === 'originalPrice' || field === 'inStock') {
      const numValue = value === '' ? undefined : Number(value);
      setFormData((prev) => ({ ...prev, [field]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
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
          <div className="flex gap-2">
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange('category', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={`flex-1 ${errors.category ? 'border-destructive' : ''}`}>
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

            {/* Add New Category Dialog */}
            <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Add new category"
                  disabled={isLoading}
                  className="h-10 w-10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Enter the name of the new product category. It will be automatically added to the list.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="newCat">Category Name</Label>
                    <Input
                      id="newCat"
                      placeholder="e.g., Solar, Kitchen Accessories"
                      value={newCategory}
                      onChange={(e) => {
                        setNewCategory(e.target.value);
                        if (categoryError) setCategoryError('');
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCategory();
                        }
                      }}
                      disabled={isLoading}
                      autoFocus
                    />
                    {categoryError && (
                      <p className="text-sm text-destructive mt-1">{categoryError}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategory('');
                      setCategoryError('');
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={isLoading || !newCategory.trim()}
                  >
                    Add Category
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
        </div>

        {/* Price */}
        <div>
          <Label htmlFor="price">Price (₦) *</Label>
          <Input
            id="price"
            type="text"
            inputMode="decimal"
            value={formData.price === undefined ? '' : formData.price}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                handleChange('price', val);
              }
            }}
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
            type="text"
            inputMode="decimal"
            value={formData.originalPrice === undefined ? '' : formData.originalPrice}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                handleChange('originalPrice', val);
              }
            }}
            placeholder="0.00"
            disabled={isLoading}
          />
        </div>

        {/* Stock */}
        <div>
          <Label htmlFor="inStock">Stock Quantity *</Label>
          <Input
            id="inStock"
            type="text"
            inputMode="numeric"
            value={formData.inStock === undefined ? '' : formData.inStock}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || /^\d+$/.test(val)) {
                handleChange('inStock', val);
              }
            }}
            placeholder="Enter quantity"
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

        {/* Brand Name */}
        <div>
          <Label htmlFor="seller">Brand Name *</Label>
          <Input
            id="seller"
            value={formData.seller}
            onChange={(e) => handleChange('seller', e.target.value)}
            placeholder="Enter brand name"
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

        {/* Color (Optional) */}
        <div>
          <Label htmlFor="color">Color (Optional)</Label>
          <Input
            id="color"
            value={formData.color || ''}
            onChange={(e) => handleChange('color', e.target.value)}
            placeholder="e.g., Black, Red, Silver"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">Leave blank if product doesn't have a specific color</p>
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

      {/* Device Image Upload (Max 4) */}
      <div>
        <div className="mt-1">
          <label 
            htmlFor="imageUpload" 
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${errors.images ? 'border-destructive' : 'border-muted-foreground/20'}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Paperclip className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG or WebP (MAX. 800x800px)</p>
            </div>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={isLoading || (formData.images && formData.images.length >= 4)}
              className="hidden"
            />
          </label>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground italic">Add up to 4 images</span>
            <span className="text-sm font-medium">
              {(formData.images?.length || 0)} / 4 uploaded
            </span>
          </div>
        </div>
        {errors.images && <p className="text-sm text-destructive mt-1">{errors.images}</p>}
        {formData.images && formData.images.length > 0 && (
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {formData.images.map((imgUrl, i) => (
              <div key={i} className="relative w-24 h-24 flex-shrink-0 group">
                <img
                  src={imgUrl}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-border group-hover:opacity-80 transition-opacity"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded shadow">
                    Main
                  </span>
                )}
              </div>
            ))}
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
