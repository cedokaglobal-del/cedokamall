import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import ProductForm from '@/components/ProductForm';
import ProductTable from '@/components/ProductTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Product, ProductFormData, ProductFilter } from '@/types/product';
import { getCategoryOptions } from '@/data/products';
import { useProductStore } from '@/store/productStore';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/lib/supabase';
import { Lock, Plus, Search, Filter, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminProducts = () => {
  const navigate = useNavigate();
  const { adminEmail } = useAuth();
  const products = useProductStore((s) => s.products);
  const filter = useProductStore((s) => s.filter);
  const setFilter = useProductStore((s) => s.setFilter);
  const addProduct = useProductStore((s) => s.addProduct);
  const updateProduct = useProductStore((s) => s.updateProduct);
  const toggleOutOfStock = useProductStore((s) => s.toggleOutOfStock);
  const deleteProduct = useProductStore((s) => s.deleteProduct);
  const clearAllProducts = useProductStore((s) => s.clearAllProducts);
  const getFilteredProducts = useProductStore((s) => s.getFilteredProducts);
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  
const [isFormOpen, setIsFormOpen] = useState(false);
   const [editingProduct, setEditingProduct] = useState<Product | undefined>();
   const [isLoading, setIsLoading] = useState(false);
   const [isClearAllPasswordOpen, setIsClearAllPasswordOpen] = useState(false);
   const [isConfirmClearAllOpen, setIsConfirmClearAllOpen] = useState(false);
   const [clearPassword, setClearPassword] = useState('');
   const [clearPasswordError, setClearPasswordError] = useState('');
   const [isClearing, setIsClearing] = useState(false);
   const [deletePassword, setDeletePassword] = useState('');
   const [deletePasswordError, setDeletePasswordError] = useState('');
   const [isDeletePasswordOpen, setIsDeletePasswordOpen] = useState(false);
   const [pendingDeleteProduct, setPendingDeleteProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => getFilteredProducts(), [getFilteredProducts]);
  const categories = useMemo(() => getCategoryOptions(products), [products]);

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

const handleDeleteProduct = async (productId: string) => {
     try {
       setIsLoading(true);
       await deleteProduct(productId);
     } finally {
       setIsLoading(false);
     }
   };

   const handleDeleteWithPassword = (productId: string) => {
     const product = products.find((p) => p.id === productId);
     if (!product) return;
     setPendingDeleteProduct(product);
     setIsDeletePasswordOpen(true);
   };

   const handleVerifyDeletePassword = async () => {
     try {
       setDeletePasswordError('');

       if (!deletePassword) {
         setDeletePasswordError('Password is required');
         return;
       }

       if (!adminEmail) {
         setDeletePasswordError('Admin session not found. Please log in again.');
         return;
       }

       setIsLoading(true);

       const { error: authError } = await supabase.auth.signInWithPassword({
         email: adminEmail,
         password: deletePassword,
       });

       if (authError) {
         setDeletePasswordError('Incorrect password. Please try again.');
         setIsLoading(false);
         return;
       }

       setDeletePassword('');
       setDeletePasswordError('');
       setIsDeletePasswordOpen(false);

       if (pendingDeleteProduct) {
         await deleteProduct(pendingDeleteProduct.id);
       }
       setPendingDeleteProduct(null);
     } catch (error) {
       console.error('Password verification failed:', error);
       setDeletePasswordError('An error occurred. Please try again.');
     } finally {
       setIsLoading(false);
     }
    };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchProducts(true);
      toast.success('Product catalog refreshed from database');
    } catch {
      toast.error('Failed to refresh products');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFilterChange = <K extends keyof ProductFilter>(
    key: K,
    value: ProductFilter[K]
  ) => {
    setFilter({
      ...filter,
      [key]: value === 'all' ? undefined : value,
    });
  };

  const handleFormSubmit = async (formData: ProductFormData) => {
    try {
      setIsLoading(true);

      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await addProduct(formData);
      }

      setIsFormOpen(false);
      setEditingProduct(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyClearPassword = async () => {
    try {
      setClearPasswordError('');

      if (!clearPassword) {
        setClearPasswordError('Password is required');
        return;
      }

      if (!adminEmail) {
        setClearPasswordError('Admin session not found. Please log in again.');
        return;
      }

      setIsClearing(true);

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: clearPassword,
      });

      if (authError) {
        setClearPasswordError('Incorrect password. Please try again.');
        setIsClearing(false);
        return;
      }

      setClearPassword('');
      setClearPasswordError('');
      setIsClearAllPasswordOpen(false);
      setIsConfirmClearAllOpen(true);
    } catch (error) {
      console.error('Password verification failed:', error);
      setClearPasswordError('An error occurred. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleConfirmClearAll = async () => {
    try {
      setIsClearing(true);
      await clearAllProducts();
      setIsConfirmClearAllOpen(false);
      toast.success('Catalog cleared successfully');
    } catch (error) {
      console.error('Clear all failed:', error);
      toast.error('Failed to clear catalog. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const maxPrice = useMemo(() => 
    products.length > 0 ? Math.max(...products.map((p) => p.price)) : 0
  , [products]);


  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">Products</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {filteredProducts.length} products
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleRefresh} size="sm" variant="outline" className="gap-1.5" disabled={isRefreshing}>
              <svg className={'w-3.5 h-3.5' + (isRefreshing ? ' animate-spin' : '')} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              {isRefreshing ? 'Syncing...' : 'Refresh'}
            </Button>
            <Button onClick={handleAddProduct} size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </Button>
            {products.length > 0 && (
              <Button onClick={() => setIsClearAllPasswordOpen(true)} size="sm" variant="destructive" className="gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4" />
            <h3 className="font-semibold text-sm">Filters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div>
              <Label htmlFor="search" className="text-xs mb-2 block">
                Search Product
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Product name..."
                  value={filter.searchTerm || ''}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Label htmlFor="category" className="text-xs mb-2 block">
                Category
              </Label>
              <Select
                value={filter.category || 'all'}
                onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Price */}
            <div>
              <Label htmlFor="minPrice" className="text-xs mb-2 block">
                Min Price (₦)
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={filter.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            {/* Max Price */}
            <div>
              <Label htmlFor="maxPrice" className="text-xs mb-2 block">
                Max Price (₦)
              </Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder={maxPrice.toString()}
                value={filter.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            {/* In Stock Filter */}
            <div>
              <Label htmlFor="inStock" className="text-xs mb-2 block">
                Stock Status
              </Label>
              <Select
                value={filter.inStock ? 'true' : 'all'}
                onValueChange={(value) => handleFilterChange('inStock', value === 'true' ? true : undefined)}
              >
                <SelectTrigger id="inStock">
                  <SelectValue placeholder="All items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="true">In Stock Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters */}
          {Object.keys(filter).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter({})}
              className="mt-4"
            >
              Clear All Filters
            </Button>
          )}
        </Card>

        {/* Products Table */}
<ProductTable
           products={filteredProducts}
           onEdit={handleEditProduct}
           onDelete={handleDeleteWithPassword}
           onToggleOutOfStock={toggleOutOfStock}
           isLoading={isLoading}
         />
      </div>

{/* Single Product Delete - Password Verification */}
       <Dialog open={isDeletePasswordOpen} onOpenChange={(open) => {
         setIsDeletePasswordOpen(open);
         if (!open) {
           setDeletePassword('');
           setDeletePasswordError('');
           setPendingDeleteProduct(null);
         }
       }}>
         <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2 text-lg text-red-600">
               <Lock className="w-5 h-5" />
               Verify Password to Delete
             </DialogTitle>
             <DialogDescription className="text-base">
               Enter your admin password to delete <strong>"{pendingDeleteProduct?.name}"</strong>. This action cannot be undone.
             </DialogDescription>
           </DialogHeader>

           <div className="space-y-4 py-6 border-y">
             <p className="text-sm text-muted-foreground">
               For security verification, please enter your admin password:
             </p>
             <div className="space-y-2">
               <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                 Admin Password
               </label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                 <Input
                   type="password"
                   placeholder="Enter your admin password"
                   value={deletePassword}
                   onChange={(e) => {
                     setDeletePassword(e.target.value);
                     setDeletePasswordError('');
                   }}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && deletePassword && !isLoading) {
                       e.preventDefault();
                       void handleVerifyDeletePassword();
                     }
                   }}
                   disabled={isLoading}
                   className="pl-10 h-11"
                   autoFocus
                 />
               </div>
               {deletePasswordError && (
                 <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded">{deletePasswordError}</p>
               )}
             </div>
           </div>

           <div className="flex gap-3 justify-end">
             <Button
               variant="outline"
               disabled={isLoading}
               onClick={() => {
                 setDeletePassword('');
                 setDeletePasswordError('');
                 setIsDeletePasswordOpen(false);
                 setPendingDeleteProduct(null);
               }}
             >
               Cancel
             </Button>
             <Button
               variant="destructive"
               onClick={() => void handleVerifyDeletePassword()}
               disabled={isLoading || !deletePassword}
             >
               {isLoading ? 'Verifying...' : 'Verify Password'}
             </Button>
           </div>
         </DialogContent>
       </Dialog>

       {/* Clear All - Password Verification */}
       <Dialog open={isClearAllPasswordOpen} onOpenChange={(open) => {
        setIsClearAllPasswordOpen(open);
        if (!open) {
          setClearPassword('');
          setClearPasswordError('');
        }
      }}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-red-600">
              <Lock className="w-5 h-5" />
              Clear All Products
            </DialogTitle>
            <DialogDescription className="text-base">
              This will permanently delete all <strong>{products.length} products</strong>. Please verify your identity.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-6 border-y">
            <p className="text-sm text-muted-foreground">
              Enter your admin password to continue:
            </p>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="password"
                  placeholder="Enter your admin password"
                  value={clearPassword}
                  onChange={(e) => {
                    setClearPassword(e.target.value);
                    setClearPasswordError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && clearPassword && !isClearing) {
                      e.preventDefault();
                      void handleVerifyClearPassword();
                    }
                  }}
                  disabled={isClearing}
                  className="pl-10 h-11"
                  autoFocus
                />
              </div>
              {clearPasswordError && (
                <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded">{clearPasswordError}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline"
              disabled={isClearing}
              onClick={() => {
                setClearPassword('');
                setClearPasswordError('');
                setIsClearAllPasswordOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleVerifyClearPassword()}
              disabled={isClearing || !clearPassword}
            >
              {isClearing ? 'Verifying...' : 'Verify Password'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear All Confirmation */}
      <AlertDialog open={isConfirmClearAllOpen} onOpenChange={setIsConfirmClearAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg text-red-600">
              <Trash2 className="w-5 h-5" />
              Are You Absolutely Sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-3">
              <p className="font-semibold text-red-600">
                ⚠️ WARNING: This action is irreversible!
              </p>
              <p>
                You are about to permanently delete all <strong>{products.length} products</strong> from your catalog and database.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>All product data will be lost forever</li>
                <li>Product images will remain on the server but will be orphaned</li>
                <li>Customer reviews and ratings for these products will be deleted</li>
                <li>This action cannot be undone or recovered</li>
              </ul>
              <p className="pt-2 text-sm font-medium">
                Are you sure you want to proceed?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClearAll}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? 'Clearing...' : 'Yes, Clear Everything'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-auto max-h-[90vh] overflow-hidden flex flex-col" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-base">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription className="text-sm">
              {editingProduct ? 'Update product details and save changes.' : 'Fill in details to add a new product.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0">
            <ProductForm
              product={editingProduct}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              isLoading={isLoading}
            />
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProducts;
