import { create } from 'zustand';
import type { SolarPlan, SolarPlanItem } from '@/types/solarPlan';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'cedokamall.solar-plans.v1';

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
    return Array.isArray(parsed) ? parsed.filter((plan): plan is SolarPlan => Boolean(plan && typeof plan === 'object')) : [];
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

export const useSolarPlanStore = create<SolarPlanState>((set) => ({
  plans: loadPlans(),
  fetchPlans: async () => {
    const { data, error } = await supabase.from('solar_plans').select('*').order('created_at', { ascending: false });
    if (error || !data) return;
    const plans = data.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      description: String(row.description || ''),
      image: typeof row.image === 'string' ? row.image : undefined,
      items: Array.isArray(row.items) ? row.items as SolarPlanItem[] : [],
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    }));
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
    await supabase.from('solar_plans').insert({ name: plan.name, description: plan.description, image: plan.image || null, items: plan.items });
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
    if (!id.startsWith('plan-')) await supabase.from('solar_plans').update({ ...updates, updated_at: updatedAt }).eq('id', id);
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
