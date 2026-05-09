import { Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';

const formatPrice = (amount: number) => `\u20A6${amount.toLocaleString()}`;

const MiniCart = () => {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = getSubtotal();
  const freeShippingRemaining = Math.max(0, 50000 - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / 50000) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-foreground/40" onClick={toggleCart} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background text-foreground shadow-2xl animate-in slide-in-from-right">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-display text-lg font-bold">Your Cart ({items.length})</h3>
          <button type="button" onClick={toggleCart} aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {subtotal < 50000 && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="mb-1 text-xs text-muted-foreground">
                    Add {formatPrice(freeShippingRemaining)} for FREE shipping!
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-sm font-bold text-primary">{formatPrice(item.price)}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Quantity: {item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-destructive"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t p-4">
              <div className="flex justify-between font-bold">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Link
                to="/cart"
                onClick={toggleCart}
                className="block w-full rounded-lg bg-accent py-3 text-center font-bold text-accent-foreground transition-colors hover:bg-cta-orange-light"
              >
                Checkout - {formatPrice(subtotal)}
              </Link>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleCart}
                  className="flex-1 py-2 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Continue Shopping
                </button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="flex-1 py-2 text-center text-sm text-destructive transition-colors hover:text-destructive/80"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MiniCart;
