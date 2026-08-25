export interface FlashDeal {
  id: string;
  productId: string;
  discountPercentage: number;
  startTime: Date;
  endTime: Date;
  maxQuantity: number;
  currentQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface FlashDealRequest {
  productId: string;
  discountPercentage: number;
  startTime: Date;
  endTime: Date;
  maxQuantity: number;
  quantityLimit?: number;
}

export interface AdminFlashDealState {
  deals: FlashDeal[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
