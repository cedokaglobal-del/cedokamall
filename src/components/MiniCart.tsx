import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Link } from 'react-router-dom';

const formatPrice = (n: number) => '₦' + n.toLocaleString();

const MiniCart = () => {
  const { items, toggleCart, removeItem, updateQuantity, getSubtotal } = useCartStore();

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-foreground/40" onClick={toggleCart} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl flex flex-col animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-display text-lg font-bold">Your Cart ({items.length})</h3>
          <button onClick={toggleCart}><X className="w-5 h-5" /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Free shipping bar */}
              {getSubtotal() < 50000 && (
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Add {formatPrice(50000 - getSubtotal())} for FREE shipping!</p>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (getSubtotal() / 50000) * 100)}%` }} />
                  </div>
                </div>
              )}

              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-sm font-bold text-primary">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded border flex items-center justify-center hover:bg-muted"><Minus className="w-3 h-3" /></button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded border flex items-center justify-center hover:bg-muted"><Plus className="w-3 h-3" /></button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between font-bold">
                <span>Subtotal</span>
                <span>{formatPrice(getSubtotal())}</span>
              </div>
              <Link
                to="/cart"
                onClick={toggleCart}
                className="block w-full text-center py-3 rounded-lg bg-accent text-accent-foreground font-bold hover:bg-cta-orange-light transition-colors"
              >
                Checkout — {formatPrice(getSubtotal())}
              </Link>
              <button onClick={toggleCart} className="block w-full text-center py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MiniCart;
