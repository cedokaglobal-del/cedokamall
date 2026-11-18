export type SolarPlanItemType = 'panel' | 'battery' | 'inverter' | 'controller' | 'accessory';

export interface SolarPlanItem {
  id: string;
  type: SolarPlanItemType;
  name: string;
  volts: number;
  watts: number;
  quantity: number;
}

export type SolarPlanCategory =
  | 'Basic Plans'
  | 'Standard Plans'
  | 'Premium Plans'
  | 'Residential Plans'
  | 'Commercial Plans'
  | 'Custom Plans'
  | string;

export interface SolarPlan {
  id: string;
  name: string;
  category: SolarPlanCategory;
  description: string;
  image?: string;
  price: number;
  capacity: string;
  inverterType?: string;
  batteryType?: string;
  panelType?: string;
  panelWattage?: number;
  panelCount?: number;
  totalSolarCapacity?: string;
  warranty?: string;
  installation?: string;
  accessories?: string;
  bestFor: string;
  canPower: string[];
  backupTime: string;
  notes: string;
  items: SolarPlanItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const SOLAR_PLAN_CATEGORIES: SolarPlanCategory[] = [
  'Basic Plans',
  'Standard Plans',
  'Premium Plans',
  'Residential Plans',
  'Commercial Plans',
  'Custom Plans',
];
