import { create } from 'zustand';
import type { SolarPlan, SolarPlanItem } from '@/types/solarPlan';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'cedokamall.solar-plans.v2';

interface SolarPlanState {
  plans: SolarPlan[];
  fetchPlans: () => Promise<void>;
  addPlan: (plan: Omit<SolarPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePlan: (id: string, updates: Partial<Omit<SolarPlan, 'id' | 'createdAt'>>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
}

const makeId = () => `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const loadPlans = (): SolarPlan[] => {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as unknown;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((plan): plan is SolarPlan => Boolean(plan && typeof plan === 'object'));
    }
    // Migrate from old format
    const old = JSON.parse(window.localStorage.getItem('cedokamall.solar-plans.v1') || '[]') as unknown;
    if (Array.isArray(old) && old.length > 0) {
      const migrated: SolarPlan[] = old.map((p: Record<string, unknown>) => ({
        id: String(p.id || makeId()),
        name: String(p.name || ''),
        description: String(p.description || ''),
        image: typeof p.image === 'string' ? p.image : undefined,
        price: 0,
        capacity: '',
        bestFor: '',
        canPower: [],
        backupTime: '',
        notes: '',
        items: Array.isArray(p.items) ? (p.items as SolarPlanItem[]) : [],
        isActive: true,
        createdAt: String(p.createdAt || new Date().toISOString()),
        updatedAt: String(p.updatedAt || new Date().toISOString()),
      }));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return [];
  } catch {
    return [];
  }
};

const savePlans = (plans: SolarPlan[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch {
    // Keep the in-memory store usable if browser storage is unavailable.
  }
};

const mapRowToPlan = (row: Record<string, unknown>): SolarPlan => ({
  id: String(row.id),
  name: String(row.name),
  description: String(row.description || ''),
  image: typeof row.image === 'string' ? row.image : undefined,
  price: Number(row.price || 0),
  capacity: String(row.capacity || ''),
  bestFor: String(row.best_for || ''),
  canPower: Array.isArray(row.can_power) ? (row.can_power as string[]) : [],
  backupTime: String(row.backup_time || ''),
  notes: String(row.notes || ''),
  items: Array.isArray(row.items) ? (row.items as SolarPlanItem[]) : [],
  isActive: Boolean(row.is_active ?? true),
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at),
});

export const useSolarPlanStore = create<SolarPlanState>((set) => ({
  plans: loadPlans(),
  fetchPlans: async () => {
    const { data, error } = await supabase.from('solar_plans').select('*').order('created_at', { ascending: false });
    if (error || !data) return;
    const plans = data.map(mapRowToPlan);
    savePlans(plans);
    set({ plans });
  },
  addPlan: async (plan) => {
    const now = new Date().toISOString();
    const localPlan = { ...plan, id: makeId(), createdAt: now, updatedAt: now };
    set((state) => {
      const next = [localPlan, ...state.plans];
      savePlans(next);
      return { plans: next };
    });
    await supabase.from('solar_plans').insert({
      name: plan.name,
      description: plan.description,
      image: plan.image || null,
      price: plan.price,
      capacity: plan.capacity,
      best_for: plan.bestFor,
      can_power: plan.canPower,
      backup_time: plan.backupTime,
      notes: plan.notes,
      items: plan.items,
      is_active: plan.isActive,
    });
  },
  updatePlan: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    set((state) => {
      const next = state.plans.map((plan) => plan.id === id
        ? { ...plan, ...updates, updatedAt }
        : plan);
      savePlans(next);
      return { plans: next };
    });
    if (!id.startsWith('plan-')) {
      const dbUpdates: Record<string, unknown> = { updated_at: updatedAt };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
      if (updates.bestFor !== undefined) dbUpdates.best_for = updates.bestFor;
      if (updates.canPower !== undefined) dbUpdates.can_power = updates.canPower;
      if (updates.backupTime !== undefined) dbUpdates.backup_time = updates.backupTime;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.items !== undefined) dbUpdates.items = updates.items;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      await supabase.from('solar_plans').update(dbUpdates).eq('id', id);
    }
  },
  deletePlan: async (id) => {
    set((state) => {
      const next = state.plans.filter((plan) => plan.id !== id);
      savePlans(next);
      return { plans: next };
    });
    if (!id.startsWith('plan-')) await supabase.from('solar_plans').delete().eq('id', id);
  },
}));

export const createSolarPlanItem = (): SolarPlanItem => ({
  id: makeId(),
  type: 'panel',
  name: '',
  volts: 12,
  watts: 100,
  quantity: 1,
});
