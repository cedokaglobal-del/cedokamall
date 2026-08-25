import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  inStock: number;
  category?: string;
  variant?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string;
  discount: number;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: () => void;
  applyCoupon: (code: string) => boolean;
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
  clearCart: () => void;
}

const COUPONS: Record<string, number> = {
  'LAGOS2026': 0.15,
  'CEDOKA10': 0.10,
  'WELCOME': 0.05,
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  couponCode: '',
  discount: 0,
  addItem: (item) => set((state) => {
    if (item.inStock <= 0) return state;
    const desiredQuantity = Math.min(item.quantity ?? 1, item.inStock);
    const existing = state.items.find((i) => i.id === item.id);
    if (existing) {
      return {
        items: state.items.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                quantity: Math.min(entry.quantity + desiredQuantity, entry.inStock),
              }
            : entry
        ),
      };
    }
    return { items: [...state.items, { ...item, quantity: desiredQuantity }] };
  }),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clearCart: () => set({ items: [] }),
  updateQuantity: (id, quantity) => set((state) => {
    const item = state.items.find(i => i.id === id);
    if (!item || quantity < 1) return { items: state.items.filter((i) => i.id !== id) };
    
    const validQuantity = Math.min(quantity, item.inStock);
    
    return {
      items: validQuantity <= 0 
        ? state.items.filter((i) => i.id !== id) 
        : state.items.map((i) => i.id === id ? { ...i, quantity: validQuantity } : i),
    };
  }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  applyCoupon: (code) => {
    const upper = code.toUpperCase();
    if (COUPONS[upper]) {
      set({ couponCode: upper, discount: COUPONS[upper] });
      return true;
    }
    return false;
  },
  getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  getTotal: () => {
    const sub = get().getSubtotal();
    return sub - sub * get().discount;
  },
  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
