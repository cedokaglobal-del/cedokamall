import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SolarPlan } from '@/types/solarPlan';

/**
 * In-memory Supabase stub that behaves like the solar_plans table for the
 * query shapes used by solarPlanStore. This lets us verify the FULL lifecycle
 * the administrator performs in the dashboard, without a live database.
 */
const { rows, insertCount } = vi.hoisted(() => ({
  rows: [] as Array<Record<string, unknown>>,
  insertCount: { value: 0 },
}));

vi.mock('@/lib/supabase', () => {
  const makeBuilder = () => {
    let operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
    let payload: Record<string, unknown> = {};
    let filterId: string | null = null;

    const buildRow = (data: Record<string, unknown>) => {
      insertCount.value += 1;
      const id = `00000000-0000-4000-8000-${String(insertCount.value).padStart(12, '0')}`;
      return { id, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...data };
    };

    const execute = () => {
      if (operation === 'select') return { data: [...rows], error: null };
      if (operation === 'update') {
        for (const row of rows) {
          if (!filterId || row.id === filterId) Object.assign(row, payload);
        }
        return { data: null, error: null };
      }
      if (operation === 'delete') {
        rows.splice(0, rows.length, ...rows.filter((row) => !filterId || row.id !== filterId));
        return { data: null, error: null };
      }
      const row = buildRow(payload);
      rows.push(row);
      return { data: [row], error: null };
    };

    const builder: Record<string, unknown> = {
      select: () => builder,
      insert: (data: Record<string, unknown>) => {
        operation = 'insert';
        payload = data;
        return builder;
      },
      update: (data: Record<string, unknown>) => {
        operation = 'update';
        payload = data;
        return builder;
      },
      delete: () => {
        operation = 'delete';
        return builder;
      },
      eq: (_column: string, value: string) => {
        filterId = value;
        return builder;
      },
      order: () => builder,
      single: async () => {
        const result = execute();
        return { data: Array.isArray(result.data) ? result.data[0] ?? null : result.data, error: null };
      },
      then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
        Promise.resolve(execute()).then(resolve, reject),
    };
    return builder;
  };

  return {
    supabase: {
      from: (_table: string) => makeBuilder(),
      channel: () => {
        const channel: Record<string, unknown> = {
          on: () => channel,
          subscribe: () => channel,
        };
        return channel;
      },
      removeChannel: async () => 'ok',
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
      },
    },
    isSupabaseConfigured: true,
  };
});

import { useSolarPlanStore } from '@/store/solarPlanStore';

const makeDraft = (overrides: Partial<SolarPlan> = {}): Omit<SolarPlan, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: 'Cedoka Basic Solar Plan',
  category: 'Basic Plans',
  description: 'Entry level solar package with a 1.5kW inverter, 1.28kWh battery and 820W panels.',
  image: 'https://example.com/plan.jpg',
  price: 850000,
  capacity: '1.5kVA / 12V',
  inverterType: '1.5kW Pure Sine Wave Inverter',
  batteryType: '1.28kWh Lithium LiFePO4',
  panelType: '820W Monocrystalline Panels',
  panelWattage: 410,
  panelCount: 2,
  totalSolarCapacity: '820W',
  warranty: '2 Years Warranty',
  bestFor: '1-2 Bedroom Flat',
  canPower: ['4 LED Bulbs', '2 Fans', 'LED TV'],
  backupTime: '8 to 12 hours',
  notes: 'Not suitable for heaters.',
  items: [
    { id: 'i-1', type: 'inverter', name: '1.5kW Inverter', volts: 12, watts: 1500, quantity: 1 },
    { id: 'i-2', type: 'battery', name: '1.28kWh Battery', volts: 12, watts: 100, quantity: 1 },
    { id: 'i-3', type: 'panel', name: '410W Panel', volts: 24, watts: 410, quantity: 2 },
  ],
  isActive: true,
  ...overrides,
});

const publicPlans = () => useSolarPlanStore.getState().plans.filter((plan) => plan.isActive);

describe('solar plan lifecycle (admin -> public)', () => {
  beforeEach(async () => {
    rows.length = 0;
    insertCount.value = 0;
    useSolarPlanStore.setState({
      plans: [],
      error: null,
      isSaving: false,
      isLoading: false,
      isFetching: false,
      hasFetched: false,
    });
  });

  it('TEST 1-5: a created + published plan appears in the catalogue and its category', async () => {
    await useSolarPlanStore.getState().fetchPlans();
    expect(rows).toHaveLength(0);
    expect(publicPlans()).toHaveLength(0);

    const created = await useSolarPlanStore.getState().addPlan(makeDraft());
    expect(created.ok).toBe(true);
    expect(rows).toHaveLength(1);

    // Simulate a fresh public visitor loading the site from the database.
    useSolarPlanStore.setState({ plans: [], hasFetched: false });
    await useSolarPlanStore.getState().fetchPlans(true);

    const visible = publicPlans();
    expect(visible).toHaveLength(1);
    expect(visible[0].name).toBe('Cedoka Basic Solar Plan');
    expect(visible[0].category).toBe('Basic Plans');
    expect(visible[0].price).toBe(850000);
    expect(visible[0].items).toHaveLength(3);
    expect(useSolarPlanStore.getState().getPlansByCategory('Basic Plans')).toHaveLength(1);
    expect(useSolarPlanStore.getState().getPlansByCategory('Premium Plans')).toHaveLength(0);
  });

  it('TEST 6-7: updates to details and price reach the public site', async () => {
    await useSolarPlanStore.getState().addPlan(makeDraft());
    const id = rows[0].id as string;

    const updated = await useSolarPlanStore.getState().updatePlan(id, {
      name: 'Cedoka Basic Solar Plan (2026)',
      price: 920000,
      image: 'https://example.com/plan-v2.jpg',
    });
    expect(updated.ok).toBe(true);

    useSolarPlanStore.setState({ plans: [], hasFetched: false });
    await useSolarPlanStore.getState().fetchPlans(true);

    const plan = publicPlans()[0];
    expect(plan.name).toBe('Cedoka Basic Solar Plan (2026)');
    expect(plan.price).toBe(920000);
    expect(plan.image).toBe('https://example.com/plan-v2.jpg');
  });

  it('TEST 8: changing the category moves the plan to the new section', async () => {
    await useSolarPlanStore.getState().addPlan(makeDraft());
    const id = rows[0].id as string;

    await useSolarPlanStore.getState().updatePlan(id, { category: 'Residential Plans' });

    useSolarPlanStore.setState({ plans: [], hasFetched: false });
    await useSolarPlanStore.getState().fetchPlans(true);

    expect(useSolarPlanStore.getState().getPlansByCategory('Basic Plans')).toHaveLength(0);
    expect(useSolarPlanStore.getState().getPlansByCategory('Residential Plans')).toHaveLength(1);
  });

  it('TEST 9: unpublishing removes the plan from every public listing', async () => {
    await useSolarPlanStore.getState().addPlan(makeDraft());
    const id = rows[0].id as string;

    await useSolarPlanStore.getState().updatePlan(id, { isActive: false });

    useSolarPlanStore.setState({ plans: [], hasFetched: false });
    await useSolarPlanStore.getState().fetchPlans(true);

    expect(publicPlans()).toHaveLength(0);
    expect(useSolarPlanStore.getState().getPlansByCategory('Basic Plans')).toHaveLength(0);
    expect(useSolarPlanStore.getState().getPlanById(id)?.isActive).toBe(false);

    // Publishing again restores it.
    await useSolarPlanStore.getState().updatePlan(id, { isActive: true });
    expect(publicPlans()).toHaveLength(1);
  });

  it('TEST DELETE: deleting a plan removes it from the catalogue', async () => {
    await useSolarPlanStore.getState().addPlan(makeDraft());
    const id = rows[0].id as string;

    const result = await useSolarPlanStore.getState().deletePlan(id);
    expect(result.ok).toBe(true);

    useSolarPlanStore.setState({ plans: [], hasFetched: false });
    await useSolarPlanStore.getState().fetchPlans(true);
    expect(publicPlans()).toHaveLength(0);
  });
});
