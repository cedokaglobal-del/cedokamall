import { FlashDeal, FlashDealRequest } from '@/types/flashDeal';

interface FlashDealStore {
  deals: FlashDeal[];
  setDeals: (deals: FlashDeal[]) => void;
  addDeal: (deal: FlashDealRequest) => void;
  updateDeal: (id: string, updates: Partial<FlashDealRequest>) => void;
  deleteDeal: (id: string) => void;
  getActiveDealCount: () => number;
  getAllDeals: () => FlashDeal[];
}

class FlashDealStoreImpl implements FlashDealStore {
  deals: FlashDeal[] = [];

  constructor() {
    try {
      const stored = localStorage.getItem('flashDeals');
      this.deals = stored ? JSON.parse(stored) : [];
    } catch {
      this.deals = [];
    }
  }

  setDeals(deals: FlashDeal[]): void {
    this.deals = deals;
    localStorage.setItem('flashDeals', JSON.stringify(deals));
  }

  addDeal(dealData: FlashDealRequest): void {
    const newDeal: FlashDeal = {
      id: `deal-${Date.now()}`,
      ...dealData,
      currentQuantity: dealData.quantityLimit,
      isActive: new Date(dealData.startTime) <= new Date() && new Date(dealData.endTime) >= new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
    };
    this.deals.push(newDeal);
    this.setDeals(this.deals);
  }

  updateDeal(id: string, updates: Partial<FlashDealRequest>): void {
    const index = this.deals.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.deals[index] = {
        ...this.deals[index],
        ...updates,
        updatedAt: new Date(),
      };
      this.setDeals(this.deals);
    }
  }

  deleteDeal(id: string): void {
    this.deals = this.deals.filter((d) => d.id !== id);
    this.setDeals(this.deals);
  }

  getActiveDealCount(): number {
    const now = new Date();
    return this.deals.filter(
      (deal) =>
        new Date(deal.startTime) <= now &&
        new Date(deal.endTime) >= now &&
        deal.isActive
    ).length;
  }

  getAllDeals(): FlashDeal[] {
    return this.deals;
  }
}

export const flashDealStore = new FlashDealStoreImpl();
