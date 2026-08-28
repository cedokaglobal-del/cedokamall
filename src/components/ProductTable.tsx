import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import PaginationControls from '@/components/PaginationControls';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  isLoading?: boolean;
  pageSize?: number;
}

const ngnFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
});

const ProductTable = ({ products, onEdit, onDelete, isLoading = false, pageSize = 20 }: ProductTableProps) => {
  const [page, setPage] = useState(1);

  const formatPrice = (price: number) => ngnFormatter.format(price);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'text-destructive' };
    if (stock < 10) return { label: 'Low Stock', color: 'text-yellow-600' };
    return { label: 'In Stock', color: 'text-green-600' };
  };

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [products.length, totalPages, page]);

  if (products.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold text-base mb-1">No products found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting filters or add a new product</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Product</th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Price</th>
              <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Stock</th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Brand</th>
              <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => {
              const stockStatus = getStockStatus(product.inStock);
              return (
                <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/image.png'; }}
                      />
                      <div className="min-w-0">
                        <p className="font-medium line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[140px] truncate">{product.category}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={stockStatus.color}>{product.inStock} units</span>
                  </td>
                  <td className="px-4 py-3 max-w-[120px] truncate text-muted-foreground">{product.seller}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(product)} disabled={isLoading} className="h-8 w-8 p-0">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(product.id)} disabled={isLoading} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden divide-y">
        {paginatedProducts.map((product) => {
          const stockStatus = getStockStatus(product.inStock);
          return (
            <div key={product.id} className="p-3">
              <div className="flex gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/image.png'; }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                    <span className={`text-xs ${stockStatus.color}`}>{product.inStock} in stock</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-1.5 mt-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(product)} disabled={isLoading} className="h-7 px-2 text-xs gap-1">
                  <Edit2 className="w-3 h-3" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(product.id)} disabled={isLoading} className="h-7 px-2 text-xs gap-1">
                  <Trash2 className="w-3 h-3" /> Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t">
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={products.length}
          pageSize={pageSize}
        />
      </div>
    </Card>
  );
};

export default ProductTable;
