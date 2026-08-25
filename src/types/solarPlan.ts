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
  items: SolarPlanItem[];
  createdAt: string;
  updatedAt: string;
}
