// Product Management Form Component
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductFormData, Product } from '@/types/product';
import { useCategoryStore } from '@/store/categoryStore';
import { uploadProductImages } from '@/lib/productImages';
import { 
  X, 
  Paperclip, 
  Plus, 
  Info, 
  Tag, 
  DollarSign, 
  Settings, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  ListPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
}

const normalizeStringArray = (value: unknown, fallback?: string): string[] => {
  if (Array.isArray(value)) {
    const entries = value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
    return entries.length > 0 ? entries : fallback ? [fallback] : [];
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return fallback ? [fallback] : [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const entries = parsed.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
        return entries.length > 0 ? entries : fallback ? [fallback] : [];
      }
    } catch {
      return [trimmed];
    }

    return [trimmed];
  }

  return fallback ? [fallback] : [];
};

const buildInitialFormData = (product?: Product): ProductFormData => ({
  name: product?.name || '',
  price: product?.price ?? 0,
  originalPrice: product?.originalPrice,
  category: product?.category || '',
  description: product?.description || '',
  inStock: product?.inStock ?? 0,
  seller: product?.seller || '',
  image: product?.image || '',
  images: normalizeStringArray(product?.images, product?.image),
  sku: product?.sku || '',
  warranty: product?.warranty || '',
  specs: product?.specs || {},
  features: normalizeStringArray(product?.features),
  color: product?.color || '',
  badge: product?.badge || undefined,
});

const ProductForm = ({ product, onSubmit, onCancel, isLoading = false }: ProductFormProps) => {
  const categories = useCategoryStore((s) => s.categories);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const removeCategory = useCategoryStore((s) => s.removeCategory);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [featureInput, setFeatureInput] = useState('');
  const [formData, setFormData] = useState<ProductFormData>(() => buildInitialFormData(product));
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(buildInitialFormData(product));
    setErrors({});
    setFeatureInput('');
    setActiveTab('general');
    setLoadedImages({});
  }, [product]);

  useEffect(() => {
    const imageUrls = (formData.images || []).filter(Boolean);
    if (imageUrls.length === 0) {
      return;
    }

    imageUrls.forEach((url) => {
      if (loadedImages[url]) {
        return;
      }

      const image = new window.Image();
      image.onload = () => {
        setLoadedImages((prev) => ({ ...prev, [url]: true }));
      };
      image.onerror = () => {
        setLoadedImages((prev) => ({ ...prev, [url]: true }));
      };
      image.src = url;
    });
  }, [formData.images, loadedImages]);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      toast.error('Category name cannot be empty');
      return;
    }

    if (categories.some((cat) => cat.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('This category already exists');
      return;
    }

    addCategory(trimmed);
    setFormData((prev) => ({ ...prev, category: trimmed }));
    setNewCategory('');
    setIsAddingCategory(false);
    toast.success(`Category "${trimmed}" added successfully`);
  };

const handleDeleteCategory = (cat: string, e: React.MouseEvent) => {
     e.stopPropagation();
     if (categories.length <= 1) {
       toast.error('At least one category must exist');
       return;
     }
     if (cat === 'Kitchen Accessories') {
       toast.error('"Kitchen Accessories" cannot be deleted as it is the default category.');
       return;
     }
     removeCategory(cat);
     if (formData.category === cat) {
       setFormData(prev => ({ ...prev, category: 'Kitchen Accessories' }));
     }
     toast.success(`Category "${cat}" removed`);
   };

  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    
    if (formData.features?.includes(trimmed)) {
      toast.warning('This feature is already listed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), trimmed]
    }));
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const currentImages = formData.images || [];
    const remainingSlots = 6 - currentImages.length;
    const filesToUpload = files.slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      toast.warning(`Maximum 6 images allowed. Only ${remainingSlots} more were added.`);
    }

    try {
      setIsUploadingImages(true);
      const uploadedUrls = await uploadProductImages(filesToUpload);
      const updatedImages = [...currentImages, ...uploadedUrls];

      setFormData(prev => ({
        ...prev,
        images: updatedImages,
        image: updatedImages[0] || '',
      }));
    } catch (error) {
      console.error('Error uploading product images:', error);
      toast.error('Image upload failed. Please try again.');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = (formData.images || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: updatedImages, image: updatedImages[0] || '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.inStock === undefined || formData.inStock < 0) newErrors.inStock = 'Stock cannot be negative';
    if (!formData.seller.trim()) newErrors.seller = 'Brand name is required';
    if (!formData.images || formData.images.length === 0) newErrors.images = 'At least 1 product image is required';
    if (!formData.features || formData.features.length === 0) newErrors.features = 'At least 1 product feature is required';
    if (!formData.warranty?.trim()) newErrors.warranty = 'Warranty is required';
    if (!formData.color?.trim()) newErrors.color = 'Color is required';

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const priorityFields = ['name', 'category', 'seller', 'description', 'price', 'inStock', 'images', 'features', 'warranty', 'color'];
      const missingPriority = Object.keys(newErrors).filter(key => priorityFields.includes(key));
      
      if (missingPriority.length > 0) {
        toast.error('Priority Check Failed: Please fill all mandatory sections and text boxes.');
      }
      
      if (newErrors.name || newErrors.category || newErrors.seller || newErrors.description) setActiveTab('general');
      else if (newErrors.price || newErrors.inStock || newErrors.warranty) setActiveTab('pricing');
      else if (newErrors.features || newErrors.color) setActiveTab('features');
      else if (newErrors.images) setActiveTab('media');
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isUploadingImages) return;

    try {
      await onSubmit(formData);
      toast.success(product ? 'Product updated successfully' : 'Product created successfully');
    } catch (error: any) {
      console.error('Error saving product form:', error);
      const errorMessage = error?.message || 'Please check your details and try again.';
      toast.error(`We could not save this product: ${errorMessage}`);
    }
  };

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 mb-6 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Info className="w-4 h-4 mr-2" />
            <span className="text-xs sm:text-sm">General</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Tag className="w-4 h-4 mr-2" />
            <span className="text-xs sm:text-sm">Pricing</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ListPlus className="w-4 h-4 mr-2" />
            <span className="text-xs sm:text-sm">Features</span>
            <span className="text-destructive ml-1">*</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ImageIcon className="w-4 h-4 mr-2" />
            <span className="text-xs sm:text-sm">Media</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* General Tab */}
            <TabsContent value="general" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-1.5">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g. Ultra HD 4K Smart TV"
                    className={cn("bg-muted/30 h-11 transition-all focus:bg-background", errors.name && "border-destructive ring-destructive/20")}
                    disabled={isLoading}
                  />
                  {errors.name && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-semibold flex items-center gap-1.5">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleChange('category', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className={cn("bg-muted/30 h-11 transition-all focus:bg-background", errors.category && "border-destructive")}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <div key={cat} className="flex items-center justify-between group px-1">
                            <SelectItem value={cat} className="flex-1">
                              {cat}
                            </SelectItem>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded-md transition-all"
                              onClick={(e) => handleDeleteCategory(cat, e)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon" className="shrink-0 h-11 w-11 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all">
                          <Plus className="w-5 h-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl">Add New Category</DialogTitle>
                          <DialogDescription>Enter a unique name for the new product category.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Input
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="e.g. Smart Energy"
                            className="h-11"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                          />
                        </div>
                        <div className="flex flex-wrap justify-end gap-3">
                          <Button variant="ghost" onClick={() => setIsAddingCategory(false)}>Cancel</Button>
                          <Button onClick={handleAddCategory} className="px-6">Add Category</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {errors.category && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seller" className="text-sm font-semibold flex items-center gap-1.5">
                    Brand / Manufacturer <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="seller"
                    value={formData.seller}
                    onChange={(e) => handleChange('seller', e.target.value)}
                    placeholder="e.g. Samsung"
                    className={cn("bg-muted/30 h-11 transition-all focus:bg-background", errors.seller && "border-destructive")}
                    disabled={isLoading}
                  />
                  {errors.seller && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.seller}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-sm font-semibold flex items-center gap-1.5">
                    SKU / Model Number
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku || ''}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="e.g. SN-TV-4K-001"
                    className={cn("bg-muted/30 h-11 transition-all focus:bg-background", errors.sku && "border-destructive")}
                    disabled={isLoading}
                  />
                  {errors.sku && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.sku}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-1.5">
                  Detailed Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Provide a comprehensive description of the product highlights, benefits, and use cases..."
                  rows={8}
                  className={cn("bg-muted/30 resize-none transition-all focus:bg-background p-4 leading-relaxed", errors.description && "border-destructive")}
                  disabled={isLoading}
                />
                {errors.description && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.description}</p>}
              </div>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-semibold flex items-center gap-1.5">
                    Selling Price (₦) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₦</span>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => handleChange('price', e.target.value === '' ? 0 : Number(e.target.value))}
                      onFocus={(e) => e.target.select()}
                      className={cn("pl-8 bg-muted/30 h-11 transition-all focus:bg-background", errors.price && "border-destructive")}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.price && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice" className="text-sm font-semibold">Original Price (₦)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₦</span>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice || ''}
                      onChange={(e) => handleChange('originalPrice', e.target.value ? Number(e.target.value) : undefined)}
                      onFocus={(e) => e.target.select()}
                      className="pl-8 bg-muted/30 h-11 transition-all focus:bg-background"
                      disabled={isLoading}
                      placeholder="Optional"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">Use this to show a "Compare at" price for discounts.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inStock" className="text-sm font-semibold flex items-center gap-1.5">
                    Stock Quantity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="inStock"
                    type="number"
                    value={formData.inStock || ''}
                    onChange={(e) => handleChange('inStock', e.target.value === '' ? 0 : Number(e.target.value))}
                    onFocus={(e) => e.target.select()}
                    className={cn("bg-muted/30 h-11 transition-all focus:bg-background", errors.inStock && "border-destructive")}
                    disabled={isLoading}
                  />
                  {errors.inStock && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.inStock}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty" className="text-sm font-semibold flex items-center gap-1.5">
                    Warranty Period <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="warranty"
                    value={formData.warranty || ''}
                    onChange={(e) => handleChange('warranty', e.target.value)}
                    placeholder="e.g. 1 Year Official Warranty"
                    className={cn("bg-muted/30 h-11 transition-all focus:bg-background", errors.warranty && "border-destructive")}
                    disabled={isLoading}
                  />
                  {errors.warranty && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.warranty}</p>}
                </div>
              </div>
            </TabsContent>

            {/* Features & Specs Tab */}
            <TabsContent value="features" className="space-y-8 mt-0">
              {/* Feature Box */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    Key Features <span className="text-destructive">*</span> <span className="text-xs font-normal text-muted-foreground">(Displayed as bullet points)</span>
                  </Label>
                  <span className="text-xs font-medium text-primary">{(formData.features || []).length} items added</span>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Add a product feature..."
                    className="bg-muted/30 h-11 transition-all focus:bg-background"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleAddFeature}
                    className="h-11 px-6 rounded-lg gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>

                <div className="min-h-[100px] overflow-hidden rounded-xl border border-dashed border-muted-foreground/30 bg-muted/5 p-4">
                  {(formData.features || []).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-4 text-muted-foreground">
                      <ListPlus className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-sm">No features added yet. Add some highlights!</p>
                    </div>
                  ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <AnimatePresence>
                        {(formData.features || []).map((feature, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center justify-between gap-3 p-3 rounded-lg bg-background border shadow-sm group"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                              <span className="text-sm truncate">{feature}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFeature(idx)}
                              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-destructive/10 text-destructive transition-colors shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-sm font-semibold flex items-center gap-1.5">
                    Color / Variant <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="color"
                    value={formData.color || ''}
                    onChange={(e) => handleChange('color', e.target.value)}
                    placeholder="e.g. Midnight Black"
                    className={cn("bg-muted/30 h-11 transition-all focus:bg-background", errors.color && "border-destructive")}
                    disabled={isLoading}
                  />
                  {errors.color && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.color}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Product Status Badge</Label>
                  <Select
                    value={formData.badge || 'none'}
                    onValueChange={(value) => handleChange('badge', value === 'none' ? undefined : value)}
                  >
                    <SelectTrigger className="bg-muted/30 h-11">
                      <SelectValue placeholder="Select a badge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Badge</SelectItem>
                      <SelectItem value="NEW ARRIVAL">New Arrival</SelectItem>
                      <SelectItem value="BEST SELLER">Best Seller</SelectItem>
                      <SelectItem value="FLASH DEAL">Flash Deal</SelectItem>
                      <SelectItem value="LIMITED">Limited Edition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6 mt-0">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div>
                    <Label className="text-base font-bold flex items-center gap-2">
                      Product Gallery 
                      <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
                        {formData.images?.length || 0} / 6 Images
                      </span>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      The first image will be used as the primary product cover.
                    </p>
                  </div>
                  
                  <label className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all font-semibold text-sm shadow-sm",
                    (formData.images?.length || 0) >= 6 
                      ? "bg-muted text-muted-foreground cursor-not-allowed" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
                  )}>
                    <Plus className="w-4 h-4" />
                    Upload Photos
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={isLoading || isUploadingImages || (formData.images?.length || 0) >= 6}
                    />
                  </label>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(formData.images || []).map((url, idx) => (
                    <motion.div 
                      key={idx}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "relative aspect-square rounded-2xl overflow-hidden border-2 shadow-sm transition-all group bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.14),_transparent_55%),linear-gradient(135deg,_hsl(var(--muted)),_hsl(var(--background)))]",
                        idx === 0 ? "border-primary ring-4 ring-primary/10" : "border-border hover:border-primary/40"
                      )}
                    >
                      {!loadedImages[url] && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-sm">
                          <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                          <div className="space-y-2 w-3/5">
                            <div className="h-2.5 rounded-full bg-muted animate-pulse" />
                            <div className="h-2.5 rounded-full bg-muted/70 animate-pulse" />
                          </div>
                        </div>
                      )}
                      <img
                        src={url}
                        alt={`Product ${idx}`}
                        className={cn(
                          "w-full h-full object-cover transition-all duration-500 group-hover:scale-105",
                          loadedImages[url] ? "opacity-100" : "opacity-0"
                        )}
                        onLoad={() => {
                          setLoadedImages((prev) => ({ ...prev, [url]: true }));
                        }}
                        onError={(event) => {
                          const target = event.currentTarget as HTMLImageElement;
                          if (target.dataset.fallbackApplied === 'true') {
                            setLoadedImages((prev) => ({ ...prev, [url]: true, '/image.png': true }));
                            return;
                          }

                          target.dataset.fallbackApplied = 'true';
                          target.src = '/image.png';
                          setLoadedImages((prev) => ({ ...prev, [url]: true, '/image.png': true }));
                        }}
                      />
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="h-10 w-10 rounded-full bg-destructive text-white flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-xl"
                          title="Remove image"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {idx === 0 && (
                        <div className="absolute top-3 left-3 px-3 py-1 bg-primary text-[10px] text-primary-foreground rounded-full font-bold uppercase tracking-widest shadow-lg">
                          Cover Image
                        </div>
                      )}
                      
                      <div className="absolute bottom-3 right-3 h-6 w-6 rounded-full bg-black/50 backdrop-blur-md text-[10px] text-white flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                    </motion.div>
                  ))}
                  
                  {(formData.images?.length || 0) < 6 && (
                    <label className={cn(
                      "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/50 group",
                      errors.images ? "border-destructive/50 bg-destructive/5" : "border-muted-foreground/20 bg-muted/5"
                    )}>
                      <div className="text-center p-4 group-hover:scale-110 transition-transform">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-tight text-muted-foreground group-hover:text-primary">Add Product Photo</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={isLoading || isUploadingImages}
                      />
                    </label>
                  )}
                </div>

                {errors.images && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {errors.images}
                  </div>
                )}
                
                {isUploadingImages && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-dashed animate-pulse">
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium text-primary">Uploading and optimizing images...</span>
                  </div>
                )}
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/50">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-11 px-8 rounded-xl font-semibold"
          disabled={isLoading || isUploadingImages}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || isUploadingImages}
          className="h-11 px-10 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] min-w-[160px]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              Processing...
            </div>
          ) : product ? 'Update Changes' : 'Launch Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
