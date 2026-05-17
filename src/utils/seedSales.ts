import { useProductStore } from '@/store/productStore';
import { useTransactionStore } from '@/store/transactionStore';

const SEED_KEY = 'cedokamall.seed.historical.v2';

const HISTORICAL_ORDERS = [
  {
    orderId: 'CDK-AA3PLBML',
    customer: 'IG Otteh',
    items: [
      { name: '1.8 Litres Electric Kettle', qty: 1, price: 12000 },
      { name: '6L + 6L Deep Fryer', qty: 1, price: 69999 },
    ],
  },
  {
    orderId: 'CDK-F82OJC8Y',
    customer: 'Julia',
    items: [
      { name: '1200w Dry Iron', qty: 1, price: 14000 },
    ],
  },
];

const findProduct = (itemName: string) => {
  const products = useProductStore.getState().products;
  const words = itemName.toLowerCase().split(/[\s+]+/).filter(w => w.length >= 3);
  return products.find(p => {
    const pName = p.name.toLowerCase();
    return words.some(w => pName.includes(w));
  });
};

export const seedHistoricalSales = async () => {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(SEED_KEY)) return;

    const existing = useTransactionStore.getState().transactions;
    const allExist = HISTORICAL_ORDERS.every(o =>
      existing.some(tx => tx.orderId === o.orderId)
    );
    if (allExist) {
      localStorage.setItem(SEED_KEY, 'done');
      return;
    }

    let seeded = false;
    for (const order of HISTORICAL_ORDERS) {
      if (existing.some(tx => tx.orderId === order.orderId)) continue;

      for (const item of order.items) {
        const product = findProduct(item.name);
        const productId = product?.id || `historical-${order.orderId}`;
        const productName = product?.name || item.name;
        const category = product?.category || 'General';

        await useTransactionStore.getState().addTransaction({
          orderId: order.orderId,
          productId,
          productName,
          customerEmail: order.customer,
          amount: item.price * item.qty,
          quantity: item.qty,
          status: 'completed',
          type: 'sale',
          paymentMethod: 'Cash',
          deliveryMethod: 'Walk-in / Store Pickup',
          category,
        });

        if (product) {
          await useProductStore.getState().decrementStock(product.id, item.qty);
        }
        seeded = true;
      }
    }

    if (seeded) {
      await Promise.all([
        useTransactionStore.getState().fetchTransactions(true),
        useProductStore.getState().fetchProducts(true),
      ]);
    }

    localStorage.setItem(SEED_KEY, 'done');
  } catch {
    // Silent fail — seed is best-effort
  }
};
