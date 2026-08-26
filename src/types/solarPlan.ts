export type SolarPlanItemType = 'panel' | 'battery' | 'inverter' | 'controller' | 'accessory';

export interface SolarPlanItem {
  id: string;
  type: SolarPlanItemType;
  name: string;
  volts: number;
  watts: number;
  quantity: number;
}

export interface SolarPlan {
  id: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  capacity: string;
  bestFor: string;
  canPower: string[];
  backupTime: string;
  notes: string;
  items: SolarPlanItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
