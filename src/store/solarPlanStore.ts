import { create } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { SolarPlan, SolarPlanItem, SolarPlanCategory } from '@/types/solarPlan';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_KEY = 'cedokamall.solar-plans.v3';

interface SolarPlanState {
  plans: SolarPlan[];
  /** Set when the server copy could not be read or written. */
  error: string | null;
  isSaving: boolean;
  isLoading: boolean;
  /** Internal guards so concurrent page mounts do not issue duplicate queries. */
  isFetching: boolean;
  hasFetched: boolean;
  fetchPlans: (force?: boolean) => Promise<void>;
  addPlan: (plan: Omit<SolarPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ ok: boolean; message?: string; plan?: SolarPlan }>;
  updatePlan: (id: string, updates: Partial<Omit<SolarPlan, 'id' | 'createdAt'>>) => Promise<{ ok: boolean; message?: string }>;
  deletePlan: (id: string) => Promise<{ ok: boolean; message?: string }>;
  /** Admin-only helper used to populate example plans into an empty catalogue. */
  seedExamplePlans: () => Promise<{ ok: boolean; count: number; message?: string }>;
  getPlanById: (id: string) => SolarPlan | undefined;
  getPlansByCategory: (category: SolarPlanCategory) => SolarPlan[];
}

const makeId = () => `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createSolarPlanItem = (): SolarPlanItem => ({
  id: makeId(),
  type: 'panel',
  name: '',
  volts: 12,
  watts: 100,
  quantity: 1,
});

export const INITIAL_SEEDED_PLANS: Omit<SolarPlan, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Cedoka Basic Solar Plan',
    category: 'Basic Plans',
    description: 'Entry-level reliable solar power package designed for small apartments and essential home backup. Powers lighting, fans, TVs and device charging during blackouts.',
    image: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=800&q=80',
    price: 850000,
    capacity: '1.5kVA / 12V',
    inverterType: '1.5kW Pure Sine Wave Inverter',
    batteryType: '1.28kWh Lithium LiFePO4 (100Ah 12.8V)',
    panelType: '820W Monocrystalline Panels (2x 410W)',
    panelWattage: 410,
    panelCount: 2,
    totalSolarCapacity: '820W',
    warranty: '2 Years Comprehensive Warranty',
    installation: 'Free delivery and standard Lagos installation included',
    accessories: 'Complete DC breaker box, 25m 4mm PV solar cable, MC4 connectors',
    bestFor: '1-2 Bedroom Flat, Studio or Small Office',
    canPower: ['4-6 LED Bulbs', '2 Standing Fans', '1 43-inch LED TV', 'Decoders', 'Laptops and Phones'],
    backupTime: '8 to 12 hours on typical loads',
    notes: 'Not suitable for electric heaters, pressing irons or AC units.',
    items: [
      { id: 'item-b-1', type: 'inverter', name: '1.5kW Pure Sine Wave Hybrid Inverter', volts: 12, watts: 1500, quantity: 1 },
      { id: 'item-b-2', type: 'battery', name: '1.28kWh Lithium LiFePO4 Battery (100Ah 12.8V)', volts: 12, watts: 100, quantity: 1 },
      { id: 'item-b-3', type: 'panel', name: '410W Mono-PERC Solar Panel', volts: 24, watts: 410, quantity: 2 },
      { id: 'item-b-4', type: 'controller', name: '40A MPPT Charge Controller (Integrated)', volts: 12, watts: 500, quantity: 1 },
      { id: 'item-b-5', type: 'accessory', name: 'DC Protection Switchgear & 25m Solar Cable', volts: 12, watts: 0, quantity: 1 },
    ],
    isActive: true,
  },
  {
    name: 'Cedoka Standard Home Solar Plan',
    category: 'Standard Plans',
    description: 'High-performance residential solar system built around a 3.5kVA hybrid inverter and long-life lithium battery. Effortlessly powers standard homes, refrigerators, home entertainment and workstations.',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    price: 1750000,
    capacity: '3.5kVA / 24V',
    inverterType: '3.5kVA 24V Pure Sine Wave Hybrid Inverter',
    batteryType: '2.56kWh Lithium LiFePO4 Battery (100Ah 25.6V)',
    panelType: '1.64kW Monocrystalline Solar Array (4x 410W)',
    panelWattage: 410,
    panelCount: 4,
    totalSolarCapacity: '1.64kW',
    warranty: '3 Years Warranty on Inverter & Battery, 25 Years on Panels',
    installation: 'Complete turnkey installation with aluminium roof mounting brackets',
    accessories: 'DC Disconnect, AC changeover box, surge arrester, 30m PV cable',
    bestFor: '2-3 Bedroom Home, Modern Flat or Active Workstation',
    canPower: ['All Home LED Lighting', '3-4 Fans', '1 Inverter Refrigerator', '55-inch Smart TV', 'Laptops & Sound System'],
    backupTime: '10 to 16 hours continuous backup',
    notes: 'Handles inverter-based energy efficient refrigerators seamlessly.',
    items: [
      { id: 'item-s-1', type: 'inverter', name: '3.5kVA / 24V Smart Hybrid Solar Inverter', volts: 24, watts: 3000, quantity: 1 },
      { id: 'item-s-2', type: 'battery', name: '2.56kWh Lithium LiFePO4 Battery Pack (25.6V 100Ah)', volts: 24, watts: 100, quantity: 1 },
      { id: 'item-s-3', type: 'panel', name: '410W Monocrystalline Tier-1 Solar Panels', volts: 24, watts: 410, quantity: 4 },
      { id: 'item-s-4', type: 'controller', name: '60A MPPT High-Voltage Solar Controller', volts: 24, watts: 1500, quantity: 1 },
      { id: 'item-s-5', type: 'accessory', name: 'Dual Protection AC/DC Distribution Box', volts: 24, watts: 0, quantity: 1 },
    ],
    isActive: true,
  },
  {
    name: 'Cedoka Premium Executive Solar Plan',
    category: 'Premium Plans',
    description: 'Heavy-duty 5kVA / 48V solar powerhouse designed to keep modern duplexes and offices fully operational 24/7. Capable of supporting energy-efficient 1HP Inverter Air Conditioners, pumping machines and multiple deep freezers.',
    image: 'https://images.unsplash.com/photo-1548611716-ad7304b4d7c6?auto=format&fit=crop&w=800&q=80',
    price: 3400000,
    capacity: '5kVA / 48V',
    inverterType: '5kVA 48V High-Efficiency Pure Sine Wave Inverter',
    batteryType: '5.12kWh Wall-Mounted Lithium Battery (100Ah 51.2V)',
    panelType: '2.87kW Tier-1 Monocrystalline Array (7x 410W)',
    panelWattage: 410,
    panelCount: 7,
    totalSolarCapacity: '2.87kW',
    warranty: '5 Years Warranty on Lithium Battery, 3 Years on Inverter',
    installation: 'Turnkey certified electrical installation with earthing and surge protection',
    accessories: 'Automated changeover switch, DC isolator, high-grade PV cables, rail clamps',
    bestFor: '3-4 Bedroom Duplex, Medical Clinic or Corporate Office',
    canPower: ['1 Inverter Air Conditioner (1HP)', 'Deep Freezer & Double-Door Fridge', 'Home Water Pump (1HP intermittent)', 'Full Lighting & Entertainment'],
    backupTime: '14 to 20 hours off-grid capability',
    notes: 'Equipped with smart mobile app monitoring over Wi-Fi.',
    items: [
      { id: 'item-p-1', type: 'inverter', name: '5kVA / 48V Pure Sine Wave Hybrid Solar Inverter', volts: 48, watts: 5000, quantity: 1 },
      { id: 'item-p-2', type: 'battery', name: '5.12kWh 48V Wall-Mount Lithium Iron Phosphate Battery', volts: 48, watts: 100, quantity: 1 },
      { id: 'item-p-3', type: 'panel', name: '410W High-Efficiency Monocrystalline Panels', volts: 24, watts: 410, quantity: 7 },
      { id: 'item-p-4', type: 'controller', name: '80A Dual-Tracking MPPT Controller', volts: 48, watts: 4000, quantity: 1 },
      { id: 'item-p-5', type: 'accessory', name: 'Earthing Rod, Lightning Surge Protection & Distribution Box', volts: 48, watts: 0, quantity: 1 },
    ],
    isActive: true,
  },
  {
    name: 'Cedoka Residential Villa Solar Plan',
    category: 'Residential Plans',
    description: 'Comprehensive 7.5kVA / 48V estate energy independence package. Built for large homes and villas requiring multiple inverter air conditioners, water treatment systems, CCTV, and whole-house uninterrupted power.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    price: 5800000,
    capacity: '7.5kVA / 48V',
    inverterType: '7.5kVA Heavy-Duty Hybrid Low-Frequency Inverter',
    batteryType: '10.24kWh Dual Lithium Battery Bank (2x 5.12kWh)',
    panelType: '4.5kW High-Output Mono Bifacial Array (10x 450W)',
    panelWattage: 450,
    panelCount: 10,
    totalSolarCapacity: '4.5kW',
    warranty: '5 Years Comprehensive System Warranty, 25 Years Panel Performance',
    installation: 'Master electrical engineering team with architectural roof brackets',
    accessories: 'Full bypass panel, SPD type 2 surge protection, industrial DC disconnects',
    bestFor: '4-5 Bedroom Mansions, Luxury Villas & Large Residences',
    canPower: ['2 Inverter Air Conditioners (1HP each)', 'Multiple Refrigerators & Freezers', 'Water Borehole Pumping Machine', 'Security Systems, Gates & Lighting'],
    backupTime: '24 hours continuous whole-home supply',
    notes: 'Allows expansion of additional batteries and panels as energy demands grow.',
    items: [
      { id: 'item-r-1', type: 'inverter', name: '7.5kVA 48V Low-Frequency Heavy Hybrid Inverter', volts: 48, watts: 7500, quantity: 1 },
      { id: 'item-r-2', type: 'battery', name: '10.24kWh Lithium LiFePO4 Powerwall (2x 5.12kWh 48V)', volts: 48, watts: 200, quantity: 2 },
      { id: 'item-r-3', type: 'panel', name: '450W Bifacial High-Efficiency Monocrystalline Panels', volts: 36, watts: 450, quantity: 10 },
      { id: 'item-r-4', type: 'controller', name: '100A High Voltage MPPT Solar Charge Controller', volts: 48, watts: 5500, quantity: 1 },
      { id: 'item-r-5', type: 'accessory', name: 'Whole-house Automatic Changeover & Surge System', volts: 48, watts: 0, quantity: 1 },
    ],
    isActive: true,
  },
  {
    name: 'Cedoka Commercial Enterprise Solar Plan',
    category: 'Commercial Plans',
    description: 'Industrial-grade 15kVA 3-phase commercial solar solution tailored for supermarkets, corporate offices, hotels, hospitals, and light manufacturing. Drastically slashes diesel generator operational overheads.',
    image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80',
    price: 12500000,
    capacity: '15kVA 3-Phase / 48V',
    inverterType: '15kVA 3-Phase Pure Sine Wave Commercial Inverter',
    batteryType: '20.48kWh Rack-Mounted Server Rack Battery Cabinet (4x 5.12kWh)',
    panelType: '8.2kW Commercial Solar Array (15x 550W Tier-1 Panels)',
    panelWattage: 550,
    panelCount: 15,
    totalSolarCapacity: '8.2kW',
    warranty: '5 Years Manufacturer Warranty with SLA Maintenance Contract',
    installation: 'Commercial safety certified engineering team, industrial earthing & commissioning',
    accessories: '3-Phase distribution board, automated smart transfer switch, remote monitoring hub',
    bestFor: 'Offices, Supermarkets, Medical Centers, Schools & Warehouses',
    canPower: ['Multiple Inverter ACs (3-4 units)', 'Commercial Coolers & Freezers', 'Server Infrastructure & Computers', 'Printing Equipment, Lighting & Pumping'],
    backupTime: 'Full business operating day (12-18 hours)',
    notes: 'Customized load audit and site assessment conducted before deployment.',
    items: [
      { id: 'item-c-1', type: 'inverter', name: '15kVA 3-Phase High-Efficiency Industrial Solar Inverter', volts: 48, watts: 15000, quantity: 1 },
      { id: 'item-c-2', type: 'battery', name: '20.48kWh Industrial Lithium Battery Cabinet (4x 5.12kWh 48V)', volts: 48, watts: 400, quantity: 4 },
      { id: 'item-c-3', type: 'panel', name: '550W Commercial Grade Monocrystalline Solar Panels', volts: 48, watts: 550, quantity: 15 },
      { id: 'item-c-4', type: 'controller', name: 'Dual 100A High Voltage Commercial MPPT Controllers', volts: 48, watts: 10000, quantity: 2 },
      { id: 'item-c-5', type: 'accessory', name: '3-Phase Switchgear, Fire-rated Cabling & Central Monitoring', volts: 48, watts: 0, quantity: 1 },
    ],
    isActive: true,
  },
];

const loadPlans = (): SolarPlan[] => {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as unknown;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((plan): plan is SolarPlan => Boolean(plan && typeof plan === 'object' && plan.name));
    }
    // Check older keys
    const oldV2 = JSON.parse(window.localStorage.getItem('cedokamall.solar-plans.v2') || '[]') as unknown;
    if (Array.isArray(oldV2) && oldV2.length > 0) {
      return oldV2.map((p: Record<string, unknown>) => ({
        id: String(p.id || makeId()),
        name: String(p.name || ''),
        category: String(p.category || 'Basic Plans'),
        description: String(p.description || ''),
        image: typeof p.image === 'string' ? p.image : undefined,
        price: Number(p.price || 0),
        capacity: String(p.capacity || ''),
        inverterType: typeof p.inverterType === 'string' ? p.inverterType : undefined,
        batteryType: typeof p.batteryType === 'string' ? p.batteryType : undefined,
        panelType: typeof p.panelType === 'string' ? p.panelType : undefined,
        warranty: typeof p.warranty === 'string' ? p.warranty : '2 Years Warranty',
        installation: typeof p.installation === 'string' ? p.installation : '',
        accessories: typeof p.accessories === 'string' ? p.accessories : '',
        bestFor: String(p.bestFor || ''),
        canPower: Array.isArray(p.canPower) ? (p.canPower as string[]) : [],
        backupTime: String(p.backupTime || ''),
        notes: String(p.notes || ''),
        items: Array.isArray(p.items) ? (p.items as SolarPlanItem[]) : [],
        isActive: Boolean(p.isActive ?? true),
        createdAt: String(p.createdAt || new Date().toISOString()),
        updatedAt: String(p.updatedAt || new Date().toISOString()),
      }));
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
    // Keep in-memory store usable if browser storage is unavailable.
  }
};

const extractCategory = (rawCategory: unknown, features: unknown, name: string): SolarPlanCategory => {
  if (typeof rawCategory === 'string' && rawCategory.trim()) {
    return rawCategory.trim();
  }
  if (features && typeof features === 'object') {
    const featObj = features as Record<string, unknown>;
    if (typeof featObj.category === 'string' && featObj.category.trim()) {
      return featObj.category.trim();
    }
  }
  if (Array.isArray(features)) {
    for (const f of features) {
      if (typeof f === 'string' && f.toLowerCase().startsWith('category:')) {
        return f.split(':')[1]?.trim() || 'Basic Plans';
      }
    }
  }
  // Infer category from name or default to Basic Plans
  const lower = name.toLowerCase();
  if (lower.includes('commercial') || lower.includes('enterprise') || lower.includes('industrial')) return 'Commercial Plans';
  if (lower.includes('residential') || lower.includes('villa') || lower.includes('mansion')) return 'Residential Plans';
  if (lower.includes('premium') || lower.includes('executive')) return 'Premium Plans';
  if (lower.includes('standard')) return 'Standard Plans';
  return 'Basic Plans';
};

const mapRowToPlan = (row: Record<string, unknown>): SolarPlan => {
  const features = row.features as Record<string, unknown> | unknown[] | undefined;
  const featObj = features && typeof features === 'object' && !Array.isArray(features) ? features : {};

  const name = String(row.name || '');
  const category = extractCategory(row.category, features, name);

  let image: string | undefined = undefined;
  if (typeof row.image === 'string' && row.image.trim()) {
    image = row.image.trim();
  } else if (typeof featObj.image === 'string' && featObj.image.trim()) {
    image = featObj.image.trim();
  } else if (Array.isArray(features)) {
    const imgEntry = features.find((f) => typeof f === 'string' && f.startsWith('image:'));
    if (imgEntry && typeof imgEntry === 'string') image = imgEntry.replace(/^image:/, '').trim();
  }

  // Items extraction
  let items: SolarPlanItem[] = [];
  if (Array.isArray(row.items) && row.items.length > 0) {
    items = row.items as SolarPlanItem[];
  } else if (Array.isArray(featObj.items) && featObj.items.length > 0) {
    items = featObj.items as SolarPlanItem[];
  } else {
    // Synthesize items from individual spec columns if available
    if (row.inverter_type) {
      items.push({
        id: makeId(),
        type: 'inverter',
        name: String(row.inverter_type),
        volts: 24,
        watts: 3000,
        quantity: 1,
      });
    }
    if (row.battery_type) {
      items.push({
        id: makeId(),
        type: 'battery',
        name: String(row.battery_type),
        volts: 24,
        watts: 100,
        quantity: 1,
      });
    }
    if (row.panel_type) {
      items.push({
        id: makeId(),
        type: 'panel',
        name: String(row.panel_type),
        volts: 24,
        watts: 410,
        quantity: 2,
      });
    }
  }

  return {
    id: String(row.id),
    name,
    category,
    description: String(row.description || ''),
    image,
    price: Number(row.price || 0),
    capacity: String(row.capacity || ''),
    inverterType: String(row.inverter_type || featObj.inverterType || ''),
    batteryType: String(row.battery_type || featObj.batteryType || ''),
    panelType: String(row.panel_type || featObj.panelType || ''),
    panelWattage: typeof featObj.panelWattage === 'number' ? featObj.panelWattage : undefined,
    panelCount: typeof featObj.panelCount === 'number' ? featObj.panelCount : undefined,
    totalSolarCapacity: typeof featObj.totalSolarCapacity === 'string' ? featObj.totalSolarCapacity : undefined,
    warranty: String(row.warranty || featObj.warranty || '2 Years Comprehensive Warranty'),
    installation: String(featObj.installation || ''),
    accessories: String(featObj.accessories || ''),
    bestFor: String(row.best_for || ''),
    canPower: Array.isArray(row.can_power) ? (row.can_power as string[]) : [],
    backupTime: String(row.backup_time || ''),
    notes: String(row.notes || ''),
    items,
    isActive: Boolean(row.is_active ?? true),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
};

const describeSupabaseError = (error: { message?: string; code?: string } | null): string => {
  if (!error) return 'Unknown database error.';
  if (error.code === '42703' || /column .* does not exist/i.test(error.message || '')) {
    return 'The solar_plans table schema needs updating in Supabase.';
  }
  if (error.code === '42P01' || /relation .* does not exist/i.test(error.message || '')) {
    return 'The solar_plans table does not exist in Supabase.';
  }
  if (error.code === '42501') {
    return 'Permission denied by the database. Check RLS policies on solar_plans.';
  }
  return error.message || 'Unknown database error.';
};

export const useSolarPlanStore = create<SolarPlanState>((set, get) => ({
  plans: loadPlans(),
  error: null,
  isSaving: false,
  isLoading: false,
  isFetching: false,
  hasFetched: false,

  fetchPlans: async (force = false) => {
    const current = get();
    // De-duplicate concurrent fetches (several pages mount at once).
    if (!force && current.isFetching) return;
    if (!force && current.hasFetched && current.plans.length > 0) {
      // Fresh enough; realtime/visibility handlers request forced refetches.
      return;
    }

    set({ isFetching: true, isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('solar_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        const message = describeSupabaseError(error);
        console.warn('[solarPlanStore] Could not load plans from database:', message);
        // Keep the last known good copy so the page never renders an empty
        // section while the database is temporarily unreachable.
        set({ error: message, isLoading: false, isFetching: false, hasFetched: true });
        return;
      }

      // The database is the single source of truth. An empty table means no
      // plans have been published yet — never seed/write from a public visitor.
      const plans = (data ?? []).map(mapRowToPlan);
      savePlans(plans);
      set({
        plans,
        error: null,
        isLoading: false,
        isFetching: false,
        hasFetched: true,
      });
    } catch (err) {
      console.warn('[solarPlanStore] fetchPlans caught error:', err);
      set({
        error: err instanceof Error ? err.message : 'Could not load solar plans.',
        isLoading: false,
        isFetching: false,
        hasFetched: true,
      });
    }
  },

  addPlan: async (plan) => {
    set({ isSaving: true, error: null });

    // Derive primary spec summaries from items if not directly provided
    const inverterItem = plan.items.find((i) => i.type === 'inverter');
    const batteryItem = plan.items.find((i) => i.type === 'battery');
    const panelItems = plan.items.filter((i) => i.type === 'panel');
    const totalPanelWattage = panelItems.reduce((acc, curr) => acc + curr.watts * curr.quantity, 0);
    const totalPanelCount = panelItems.reduce((acc, curr) => acc + curr.quantity, 0);

    const derivedInverter = plan.inverterType || (inverterItem ? `${inverterItem.name} (${inverterItem.watts}W)` : plan.capacity);
    const derivedBattery = plan.batteryType || (batteryItem ? `${batteryItem.name} (${batteryItem.volts}V ${batteryItem.watts}Ah)` : '');
    const derivedPanel = plan.panelType || (totalPanelWattage > 0 ? `${totalPanelWattage}W Total (${totalPanelCount} Panels)` : '');

    const dbPayload = {
      name: plan.name.trim(),
      description: plan.description.trim(),
      price: Math.max(0, Number(plan.price) || 0),
      capacity: plan.capacity.trim(),
      panel_type: derivedPanel,
      inverter_type: derivedInverter,
      battery_type: derivedBattery,
      warranty: plan.warranty?.trim() || '2 Years Comprehensive Warranty',
      best_for: plan.bestFor.trim(),
      can_power: plan.canPower,
      backup_time: plan.backupTime.trim(),
      notes: plan.notes.trim(),
      is_active: plan.isActive,
      features: {
        category: plan.category || 'Basic Plans',
        image: plan.image || '',
        items: plan.items,
        installation: plan.installation?.trim() || '',
        accessories: plan.accessories?.trim() || '',
        panelWattage: plan.panelWattage || (panelItems[0]?.watts ?? 0),
        panelCount: plan.panelCount || totalPanelCount,
        totalSolarCapacity: plan.totalSolarCapacity || (totalPanelWattage > 0 ? `${totalPanelWattage}W` : ''),
      },
    };

    try {
      const { data, error } = await supabase
        .from('solar_plans')
        .insert(dbPayload)
        .select()
        .single();

      if (error || !data) {
        const message = describeSupabaseError(error);
        console.warn('[solarPlanStore] Plan insert error:', message);
        set({ isSaving: false, error: message });
        return { ok: false, message };
      }

      const createdPlan = mapRowToPlan(data);
      set((state) => {
        const next = [createdPlan, ...state.plans.filter((p) => p.id !== createdPlan.id)];
        savePlans(next);
        return { plans: next, isSaving: false, error: null };
      });

      return { ok: true, plan: createdPlan };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Database communication failed';
      set({ isSaving: false, error: message });
      return { ok: false, message };
    }
  },

  updatePlan: async (id, updates) => {
    set({ isSaving: true, error: null });

    const currentPlan = get().plans.find((p) => p.id === id);
    if (!currentPlan) {
      set({ isSaving: false, error: 'Plan not found' });
      return { ok: false, message: 'Plan not found' };
    }

    const merged = { ...currentPlan, ...updates, updatedAt: new Date().toISOString() };

    const inverterItem = merged.items.find((i) => i.type === 'inverter');
    const batteryItem = merged.items.find((i) => i.type === 'battery');
    const panelItems = merged.items.filter((i) => i.type === 'panel');
    const totalPanelWattage = panelItems.reduce((acc, curr) => acc + curr.watts * curr.quantity, 0);
    const totalPanelCount = panelItems.reduce((acc, curr) => acc + curr.quantity, 0);

    const derivedInverter = merged.inverterType || (inverterItem ? `${inverterItem.name} (${inverterItem.watts}W)` : merged.capacity);
    const derivedBattery = merged.batteryType || (batteryItem ? `${batteryItem.name} (${batteryItem.volts}V ${batteryItem.watts}Ah)` : '');
    const derivedPanel = merged.panelType || (totalPanelWattage > 0 ? `${totalPanelWattage}W Total (${totalPanelCount} Panels)` : '');

    const dbPayload = {
      name: merged.name.trim(),
      description: merged.description.trim(),
      price: Math.max(0, Number(merged.price) || 0),
      capacity: merged.capacity.trim(),
      panel_type: derivedPanel,
      inverter_type: derivedInverter,
      battery_type: derivedBattery,
      warranty: merged.warranty?.trim() || '2 Years Comprehensive Warranty',
      best_for: merged.bestFor.trim(),
      can_power: merged.canPower,
      backup_time: merged.backupTime.trim(),
      notes: merged.notes.trim(),
      is_active: merged.isActive,
      updated_at: merged.updatedAt,
      features: {
        category: merged.category || 'Basic Plans',
        image: merged.image || '',
        items: merged.items,
        installation: merged.installation?.trim() || '',
        accessories: merged.accessories?.trim() || '',
        panelWattage: merged.panelWattage || (panelItems[0]?.watts ?? 0),
        panelCount: merged.panelCount || totalPanelCount,
        totalSolarCapacity: merged.totalSolarCapacity || (totalPanelWattage > 0 ? `${totalPanelWattage}W` : ''),
      },
    };

    try {
      // If it's a UUID, persist to Supabase
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        const { error } = await supabase.from('solar_plans').update(dbPayload).eq('id', id);
        if (error) {
          const message = describeSupabaseError(error);
          set({ isSaving: false, error: message });
          return { ok: false, message };
        }
      }

      if (!isUuid) {
        const message = 'This plan exists only on this device. Recreate it in the admin to publish it to the website.';
        set((state) => {
          const next = state.plans.map((p) => (p.id === id ? merged : p));
          savePlans(next);
          return { plans: next, isSaving: false, error: message };
        });
        return { ok: false, message };
      }

      set((state) => {
        const next = state.plans.map((p) => (p.id === id ? merged : p));
        savePlans(next);
        return { plans: next, isSaving: false, error: null };
      });

      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Database update failed';
      set({ isSaving: false, error: message });
      return { ok: false, message };
    }
  },

  deletePlan: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        const { error } = await supabase.from('solar_plans').delete().eq('id', id);
        if (error) {
          const message = describeSupabaseError(error);
          set({ isSaving: false, error: message });
          return { ok: false, message };
        }
      }

      set((state) => {
        const next = state.plans.filter((p) => p.id !== id);
        savePlans(next);
        return { plans: next, isSaving: false, error: null };
      });

      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Database delete failed';
      set({ isSaving: false, error: message });
      return { ok: false, message };
    }
  },

  seedExamplePlans: async () => {
    // Runs from the admin page only, so the authenticated session satisfies the
    // solar_plans write policy. Public visitors must never create database rows.
    let count = 0;
    let firstError: string | undefined;

    for (const seed of INITIAL_SEEDED_PLANS) {
      const result = await get().addPlan(seed as Omit<SolarPlan, 'id' | 'createdAt' | 'updatedAt'>);
      if (result.ok) count += 1;
      else firstError = firstError || result.message;
    }

    if (firstError && count === 0) {
      return { ok: false, count, message: firstError };
    }
    // Refresh so every subscriber (including other tabs) sees the new rows.
    await get().fetchPlans(true);
    return { ok: true, count, message: firstError };
  },

  getPlanById: (id) => {
    return get().plans.find((p) => p.id === id);
  },

  getPlansByCategory: (category) => {
    const active = get().plans.filter((p) => p.isActive);
    if (category === 'All Plans' || !category) return active;
    return active.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  },
}));

let solarPlanChannel: RealtimeChannel | null = null;
let solarPlanRefreshTimeout: ReturnType<typeof setTimeout> | null = null;

const scheduleSolarPlanRefresh = () => {
  if (solarPlanRefreshTimeout) clearTimeout(solarPlanRefreshTimeout);
  solarPlanRefreshTimeout = setTimeout(() => {
    solarPlanRefreshTimeout = null;
    void useSolarPlanStore.getState().fetchPlans(true);
  }, 250);
};

/**
 * Keeps public catalogues in sync with admin edits. Mirrors the products
 * realtime subscription so newly created, updated, unpublished or deleted
 * plans appear without a manual refresh.
 */
export const subscribeToSolarPlanChanges = () => {
  if (!isSupabaseConfigured) return () => undefined;

  if (!solarPlanChannel) {
    solarPlanChannel = supabase
      .channel('solar-plans-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'solar_plans' },
        scheduleSolarPlanRefresh
      )
      .subscribe();
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) scheduleSolarPlanRefresh();
  };
  const onVisibility = () => {
    if (document.visibilityState === 'visible') scheduleSolarPlanRefresh();
  };
  window.addEventListener('storage', onStorage);
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    window.removeEventListener('storage', onStorage);
    document.removeEventListener('visibilitychange', onVisibility);
    if (solarPlanRefreshTimeout) {
      clearTimeout(solarPlanRefreshTimeout);
      solarPlanRefreshTimeout = null;
    }
    if (solarPlanChannel) {
      void supabase.removeChannel(solarPlanChannel);
      solarPlanChannel = null;
    }
  };
};
