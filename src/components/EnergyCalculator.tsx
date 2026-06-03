import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Calculator, Plus, Trash2, Sun, Zap, Battery, BarChart3, ShoppingCart, MessageSquare, Check, ToggleLeft, ToggleRight, Edit3, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNFNkUwREIiLz48cGF0aCBkPSJNMjAwIDExMEwxMjAgMjUwaDE2MEwyMDAgMTEweiIgZmlsbD0iI0M5QTg0QyIvPjwvc3ZnPg==';

interface ApplianceRow {
  id: string;
  name: string;
  watts: number;
  volts: number;
  quantity: number;
  minutes: number;
  enabled: boolean;
  night: boolean;
}

interface CalculatorResults {
  totalWh: number;
  totalKwh: number;
  dayWh: number;
  nightWh: number;
  batteryCapacityAh: number;
  solarPanelW: number;
  inverterW: number;
  systemVoltage: number;
  inverterEff: number;
  batteryEff: number;
}

interface SystemComponent {
  id: string;
  type: 'panel' | 'battery' | 'inverter';
  label: string;
  specs: string;
  quantity: number;
  unitPrice: number;
}

interface StorageData { appliances: ApplianceRow[]; autonomy: number; dod: number; peakSunHours: number; inverterEff: number; batteryEff: number; batteryType: string; mode?: string; tempDerating?: number; systemLosses?: number; }

const QUICK_ADD_PRESETS = [
  { name: 'LED Bulb', watts: 9 },
  { name: 'Ceiling Fan', watts: 75 },
  { name: 'TV', watts: 60 },
  { name: 'Refrigerator', watts: 150 },
  { name: 'Laptop', watts: 65 },
  { name: 'Phone Charger', watts: 10 },
  { name: 'Security Light', watts: 20 },
  { name: 'WiFi Router', watts: 10 },
  { name: 'Decoder', watts: 20 },
  { name: 'Electric Iron', watts: 1000 },
  { name: 'Water Pump', watts: 750 },
  { name: 'AC', watts: 900 },
  { name: 'Freezer', watts: 200 },
  { name: 'Washing Machine', watts: 500 },
  { name: 'Microwave', watts: 1200 },
];

const PEAK_SUN_HOURS_OPTIONS = [
  { label: 'Lagos (5.0h)', value: 5.0 },
  { label: 'Abuja (5.5h)', value: 5.5 },
  { label: 'Kano (6.0h)', value: 6.0 },
  { label: 'Port Harcourt (4.5h)', value: 4.5 },
  { label: 'Custom', value: -1 },
];

const STORAGE_KEY = 'cedoka_energy_calculator';

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const loadFromStorage = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StorageData;
      if (parsed.appliances?.length) {
        parsed.appliances = parsed.appliances.map((a) => ({
          ...a,
          night: a.night ?? !(a as any).night,
          minutes: typeof a.minutes === 'number' ? a.minutes : Math.round((a.hours || 0) * 60),
          hours: undefined,
        }));
      }
      return parsed;
    }
  } catch { }
  return null;
};

const saveToStorage = (data: StorageData) => {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { }
};

const computeResults = (appliances: ApplianceRow[], autonomy: number, dod: number, peakSunHours: number, inverterEff: number = 0.9, batteryEff: number = 0.85, tempDerating: number = 0.9, systemLosses: number = 0.8): CalculatorResults => {
  const enabled = appliances.filter((a) => a.enabled);

  let totalWh = 0;
  let dayWh = 0;
  let nightWh = 0;
  for (const a of enabled) {
    const wh = a.watts * a.quantity * (a.minutes / 60);
    totalWh += wh;
    if (a.night) nightWh += wh;
    else dayWh += wh;
  }

  const systemVoltage = totalWh <= 1000 ? 12 : totalWh <= 3000 ? 24 : 48;

  const nightWhWithLoss = nightWh / inverterEff;
  const effectiveDod = (dod / 100) * tempDerating;
  const batteryCapacityAh = ((nightWhWithLoss * autonomy) / effectiveDod) / systemVoltage;

  const adjustedTotalWh = dayWh + (nightWh / (inverterEff * batteryEff));
  const solarPanelW = (adjustedTotalWh / Math.max(peakSunHours, 1)) / systemLosses;

  const inverterW = enabled.reduce((peak, a) => {
    const surge = a.watts * a.quantity * 1.25;
    return surge > peak ? surge : peak;
  }, 0);

  return {
    totalWh: Math.round(totalWh),
    totalKwh: Math.round((totalWh / 1000) * 100) / 100,
    dayWh: Math.round(dayWh),
    nightWh: Math.round(nightWh),
    batteryCapacityAh: Math.round(batteryCapacityAh * 10) / 10,
    solarPanelW: Math.round(solarPanelW / 10) * 10,
    inverterW: Math.round(inverterW / 10) * 10,
    systemVoltage,
    inverterEff,
    batteryEff,
  };
};

const calcSystemComponents = (results: CalculatorResults): SystemComponent[] => {
  const panelWattage = 300;
  const panelQuantity = Math.max(1, Math.ceil(results.solarPanelW / panelWattage));

  const batteryCapacity = 200;
  const batteryVoltage = 12;
  const totalBatteryEnergy = results.batteryCapacityAh * results.systemVoltage;
  const batteryEnergyPerUnit = batteryCapacity * batteryVoltage;
  const batteryQuantity = Math.max(1, Math.ceil(totalBatteryEnergy / batteryEnergyPerUnit));

  const invQty = Math.max(1, Math.ceil(results.inverterW / 2000));

  return [
    {
      id: generateId(),
      type: 'panel',
      label: 'Solar Panel',
      specs: `${panelWattage}W`,
      quantity: panelQuantity,
      unitPrice: 150000,
    },
    {
      id: generateId(),
      type: 'battery',
      label: 'Battery',
      specs: `${batteryCapacity}Ah ${batteryVoltage}V`,
      quantity: batteryQuantity,
      unitPrice: 300000,
    },
    {
      id: generateId(),
      type: 'inverter',
      label: 'Inverter',
      specs: `${results.inverterW}W`,
      quantity: invQty,
      unitPrice: results.inverterW * 500,
    },
  ];
};

const energyIconMap: Record<string, React.ReactNode> = {
  panel: <Sun className="h-4 w-4" />,
  battery: <Battery className="h-4 w-4" />,
  inverter: <Zap className="h-4 w-4" />,
};

const EnergyCalculator = () => {
  const saved = loadFromStorage();
  const [appliances, setAppliances] = useState<ApplianceRow[]>(
    saved?.appliances?.length
      ? saved.appliances
      : []
  );
  const [autonomy, setAutonomy] = useState(saved?.autonomy ?? 1);
  const [dod, setDoD] = useState(saved?.dod ?? 50);
  const [peakSunHours, setPeakSunHours] = useState(saved?.peakSunHours ?? 5);
  const [inverterEff, setInverterEff] = useState(saved?.inverterEff ?? 0.9);
  const [batteryEff, setBatteryEff] = useState(saved?.batteryEff ?? 0.85);
  const [batteryType, setBatteryType] = useState(saved?.batteryType ?? 'not-sure');
  const [tempDerating, setTempDerating] = useState(saved?.tempDerating ?? 0.9);
  const [systemLosses, setSystemLosses] = useState(saved?.systemLosses ?? 0.8);
  const [mode, setMode] = useState<'basic' | 'advanced'>((saved?.mode as 'basic' | 'advanced') ?? 'basic');
  const [customSunHours, setCustomSunHours] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [systemComponents, setSystemComponents] = useState<SystemComponent[]>([]);
  const [infoApplianceId, setInfoApplianceId] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useCartStore((s) => s.toggleCart);

  useEffect(() => {
    saveToStorage({ appliances, autonomy, dod, peakSunHours, inverterEff, batteryEff, batteryType, mode, tempDerating, systemLosses });
  }, [appliances, autonomy, dod, peakSunHours, inverterEff, batteryEff, batteryType, mode, tempDerating, systemLosses]);

  const results = useMemo(() => computeResults(appliances, autonomy, dod, peakSunHours, inverterEff, batteryEff, tempDerating, systemLosses), [appliances, autonomy, dod, peakSunHours, inverterEff, batteryEff, tempDerating, systemLosses]);

  const enabledCount = useMemo(() => appliances.filter((a) => a.enabled).length, [appliances]);

  const addAppliance = useCallback((preset?: { name: string; watts: number }) => {
    setAppliances((prev) => [...prev, {
      id: generateId(),
      name: preset?.name || '',
      watts: preset?.watts || 50,
      volts: 12,
      quantity: 1,
      minutes: 60,
      enabled: true,
      night: true,
    }]);
  }, []);

  const removeAppliance = useCallback((id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateAppliance = useCallback((id: string, field: keyof ApplianceRow, value: string | number | boolean) => {
    setAppliances((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }, []);

  const applianceNames = useMemo(() => new Set(appliances.map((a) => a.name)), [appliances]);

  const clampNum = (val: number, min: number, max?: number) => {
    const v = isNaN(val) || val < min ? min : val;
    return max !== undefined ? Math.min(v, max) : v;
  };

  const handleCalculate = useCallback(() => {
    const comps = calcSystemComponents(results);
    setSystemComponents(comps);
    setCustomizing(false);
    setCalculated(true);
  }, [results]);

  const handleBuySystem = useCallback(() => {
    systemComponents.forEach((comp) => {
      addItem({
        id: `solar-${comp.type}-${Date.now()}`,
        name: `${comp.label} (${comp.specs})`,
        price: comp.unitPrice,
        image: PLACEHOLDER_IMAGE,
        inStock: 99,
        quantity: comp.quantity,
      });
    });
    toggleCart();
  }, [systemComponents, addItem, toggleCart]);

  const handleBuyCustom = useCallback(() => {
    systemComponents.forEach((comp) => {
      if (comp.quantity > 0) {
        addItem({
          id: `solar-${comp.type}-${Date.now()}`,
          name: `${comp.label} (${comp.specs})`,
          price: comp.unitPrice,
          image: PLACEHOLDER_IMAGE,
          inStock: 99,
          quantity: comp.quantity,
        });
      }
    });
    toggleCart();
  }, [systemComponents, addItem, toggleCart]);

  const updateComponentQty = useCallback((id: string, qty: number) => {
    setSystemComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, quantity: Math.max(0, qty) } : c))
    );
  }, []);

  const removeComponent = useCallback((id: string) => {
    setSystemComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const systemTotal = useMemo(
    () => systemComponents.reduce((s, c) => s + c.quantity * c.unitPrice, 0),
    [systemComponents]
  );

  const infoAppliance = infoApplianceId ? appliances.find((a) => a.id === infoApplianceId) : null;

  useEffect(() => {
    if (!infoApplianceId) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setInfoApplianceId(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [infoApplianceId]);

  const energyInfo = useCallback((app: ApplianceRow) => {
    const amps = app.watts / app.volts;
    const dailyWh = app.watts * app.quantity * (app.minutes / 60);
    const monthlyKwh = (dailyWh * 30) / 1000;
    const dailyAh = dailyWh / app.volts;
    const isAcAppliance = [220, 230, 240].includes(Math.round(app.volts));
    return { amps, dailyWh, monthlyKwh, dailyAh, isAcAppliance };
  }, []);

  return (
    <>
    <div className="rounded-[1.5rem] border border-gold-antique/10 bg-white shadow-premium overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 md:px-8 md:py-6 bg-gradient-to-r from-navy to-navy-deep">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20">
              <Calculator className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-champagne">Solar System Calculator</h2>
              <p className="text-xs text-champagne/60 mt-0.5 hidden sm:block">Tap appliances to add them, then calculate your solar needs.</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setMode('basic')}
              className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${
                mode === 'basic' ? 'bg-gold text-navy shadow-sm' : 'text-champagne/60 hover:text-champagne'
              }`}
            >
              Basic
            </button>
            <button
              type="button"
              onClick={() => setMode('advanced')}
              className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${
                mode === 'advanced' ? 'bg-gold text-navy shadow-sm' : 'text-champagne/60 hover:text-champagne'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6">

        {/* Quick-add presets */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-navy/50 mb-3">Quick Add Appliances</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ADD_PRESETS.map((preset) => {
              const alreadyAdded = applianceNames.has(preset.name);
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    if (alreadyAdded) {
                      const match = appliances.find((a) => a.name === preset.name);
                      if (match) removeAppliance(match.id);
                    } else {
                      addAppliance(preset);
                    }
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all',
                    alreadyAdded
                      ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-red-100 hover:text-red-600 hover:border-red-300 cursor-pointer'
                      : 'bg-ivory text-navy/70 border border-gold-antique/20 hover:bg-gold hover:text-navy hover:border-gold active:scale-95'
                  )}
                >
                  {alreadyAdded ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* My Appliances List */}
        {appliances.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-navy/50">
                My Appliances ({enabledCount} active)
              </p>
            </div>

            <div className="space-y-2">
              {appliances.map((appliance) => (
                <div
                  key={appliance.id}
                  className={cn(
                    'rounded-xl border p-3 transition-all',
                    appliance.enabled ? 'border-gold-antique/20 bg-white' : 'border-gold-antique/5 bg-ivory/50 opacity-60'
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => updateAppliance(appliance.id, 'enabled', !appliance.enabled)}
                        className="shrink-0"
                        aria-label={appliance.enabled ? 'Disable appliance' : 'Enable appliance'}
                      >
                        {appliance.enabled ? (
                          <ToggleRight className="h-6 w-6 text-gold" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-navy/30" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={appliance.name}
                        onChange={(e) => updateAppliance(appliance.id, 'name', e.target.value)}
                        className="min-w-0 flex-1 bg-transparent text-sm font-bold text-navy placeholder:text-navy/30 focus:outline-none truncate"
                        placeholder="Appliance"
                      />
                      <button
                        type="button"
                        onClick={() => updateAppliance(appliance.id, 'night', !appliance.night)}
                        className={`shrink-0 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md border transition-all ${
                          appliance.night
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-amber-100 hover:text-amber-700 hover:border-amber-300'
                            : 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-300'
                        }`}
                        aria-label={appliance.night ? 'Switch to day use' : 'Switch to night use'}
                        title={appliance.night ? 'Night use (battery powered)' : 'Day use (direct solar)'}
                      >
                        {appliance.night ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
                      </button>
                      <button type="button" onClick={() => setInfoApplianceId(appliance.id)} className="shrink-0 text-navy/30 hover:text-gold transition-colors" aria-label="Energy details">
                        <Info className="h-4 w-4" />
                      </button>
                    </div>
                    <button type="button" onClick={() => removeAppliance(appliance.id)} className="text-navy/30 hover:text-red-500 shrink-0" aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {mode === 'basic' && (
                  <>
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[140px]">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-navy/40 block mb-1">
                        Hours per day
                      </label>
                      <div className="flex items-center gap-2">
                        <input type="range" min={0.25} max={24} step={0.5}
                          value={Math.round((appliance.minutes / 60) * 2) / 2}
                          onChange={(e) => updateAppliance(appliance.id, 'minutes', Math.round(Number(e.target.value) * 60))}
                          className="flex-1 accent-gold h-1.5" />
                        <span className="text-sm font-bold text-navy w-10 text-right">
                          {appliance.minutes >= 60
                            ? `${Math.round(appliance.minutes / 60)}h`
                            : `${appliance.minutes}min`}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-navy/40 block mb-1">Qty</label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateAppliance(appliance.id, 'quantity', Math.max(1, appliance.quantity - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-gold-antique/20 bg-white text-navy hover:bg-gold hover:text-navy transition-colors text-sm font-bold"
                        >-</button>
                        <span className="w-8 text-center text-sm font-bold text-navy">{appliance.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateAppliance(appliance.id, 'quantity', Math.min(99, appliance.quantity + 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-gold-antique/20 bg-white text-navy hover:bg-gold hover:text-navy transition-colors text-sm font-bold"
                        >+</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-navy/40 block mb-1">Device size</label>
                      <select
                        value={
                          appliance.watts <= 30 ? 10 :
                          appliance.watts <= 150 ? 100 :
                          appliance.watts <= 750 ? 500 : 1500
                        }
                        onChange={(e) => updateAppliance(appliance.id, 'watts', Number(e.target.value))}
                        className="w-full bg-ivory rounded-md border border-gold-antique/10 px-2 py-1.5 text-sm text-navy focus:border-gold focus:outline-none"
                      >
                        <option value={10}>Small &mdash; bulb, charger, router</option>
                        <option value={100}>Medium &mdash; fan, TV, laptop</option>
                        <option value={500}>Large &mdash; fridge, freezer, pump</option>
                        <option value={1500}>Extra Large &mdash; AC, iron, microwave</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-end gap-3 mt-2.5 pt-2.5 border-t border-gold-antique/10">
                    <div className="w-24">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-navy/30 block mb-0.5">Exact watts (opt.)</label>
                      <input type="number" min={1} value={appliance.watts || ''}
                        onChange={(e) => updateAppliance(appliance.id, 'watts', Math.max(1, Number(e.target.value) || 1))}
                        className="w-full bg-white rounded-md border border-gold-antique/10 px-2 py-1 text-xs text-navy focus:border-gold focus:outline-none placeholder:text-navy/20"
                        placeholder="e.g. 110" />
                    </div>
                    <div className="w-24">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-navy/30 block mb-0.5">Exact volts (opt.)</label>
                      <input type="number" min={1} step={0.1} value={appliance.volts || ''}
                        onChange={(e) => updateAppliance(appliance.id, 'volts', Math.max(1, Number(e.target.value) || 1))}
                        className="w-full bg-white rounded-md border border-gold-antique/10 px-2 py-1 text-xs text-navy focus:border-gold focus:outline-none placeholder:text-navy/20"
                        placeholder="e.g. 220" />
                    </div>
                    <p className="text-[10px] text-navy/30 italic leading-tight pt-1">
                      Know the exact watts/volts? Enter them here for a more accurate sizing.
                    </p>
                  </div>
                  </>
                  )}

                  {mode === 'advanced' && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-navy/40">Watts</label>
                      <input type="number" min={1} value={appliance.watts || ''}
                        onChange={(e) => updateAppliance(appliance.id, 'watts', Number(e.target.value))}
                        onBlur={(e) => { const v = Number(e.target.value); if (!v || v < 1) updateAppliance(appliance.id, 'watts', 1); }}
                        className="w-full bg-ivory rounded-md border border-gold-antique/10 px-2 py-1.5 text-sm text-navy focus:border-gold focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-navy/40">Volts</label>
                      <input type="number" min={1} step={0.1} value={appliance.volts || ''}
                        onChange={(e) => updateAppliance(appliance.id, 'volts', Number(e.target.value))}
                        onBlur={(e) => { const v = Number(e.target.value); if (!v || v < 1) updateAppliance(appliance.id, 'volts', 12); }}
                        className="w-full bg-ivory rounded-md border border-gold-antique/10 px-2 py-1.5 text-sm text-navy focus:border-gold focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-navy/40">Qty</label>
                      <input type="number" min={1} value={appliance.quantity || ''}
                        onChange={(e) => updateAppliance(appliance.id, 'quantity', Number(e.target.value))}
                        onBlur={(e) => { const v = Number(e.target.value); if (!v || v < 1) updateAppliance(appliance.id, 'quantity', 1); }}
                        className="w-full bg-ivory rounded-md border border-gold-antique/10 px-2 py-1.5 text-sm text-navy focus:border-gold focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-navy/40">Hours</label>
                      <input type="number" min={0.25} max={24} step={0.5}
                        value={Math.round((appliance.minutes / 60) * 2) / 2 || ''}
                        onChange={(e) => updateAppliance(appliance.id, 'minutes', Math.round(Number(e.target.value) * 60))}
                        onBlur={(e) => { const v = Number(e.target.value); if (!v || v < 0.25) updateAppliance(appliance.id, 'minutes', 60); if (v > 24) updateAppliance(appliance.id, 'minutes', 1440); }}
                        className="w-full bg-ivory rounded-md border border-gold-antique/10 px-2 py-1.5 text-sm text-navy focus:border-gold focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-navy/40">Wh</label>
                      <p className="mt-1.5 text-sm font-bold text-navy pt-0.5">
                        {(appliance.watts * appliance.quantity * (appliance.minutes / 60)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {appliances.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gold-antique/20 p-8 text-center">
            <Calculator className="mx-auto h-8 w-8 text-navy/20" />
            <p className="mt-3 text-sm text-navy/50">Tap an appliance above to add it, or add a custom one.</p>
            <button
              type="button"
              onClick={() => addAppliance()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gold transition-all hover:bg-gold hover:text-navy"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Custom Appliance
            </button>
          </div>
        )}

        {appliances.length > 0 && (
          <button
            type="button"
            onClick={() => addAppliance()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold-antique/30 py-3 text-xs font-bold uppercase tracking-widest text-navy/50 transition-all hover:border-gold hover:text-gold"
          >
            <Plus className="h-4 w-4" />
            Add Custom Appliance
          </button>
        )}

        {/* Parameters — hidden by default for beginners */}
        <div className="rounded-xl border border-gold-antique/10 bg-ivory/50 p-4 md:p-5">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex w-full items-center justify-between text-left"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-navy/50">
              {showSettings ? 'System Settings' : 'Adjust Settings (optional)'}
            </p>
            <span className={`text-navy/30 text-sm transition-transform ${showSettings ? 'rotate-180' : ''}`}>&#9660;</span>
          </button>

          {showSettings && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-navy/60 block mb-1.5">What battery type?</label>
                <select value={batteryType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBatteryType(val);
                    if (val === 'lead-acid') { setDoD(50); setBatteryEff(0.8); }
                    else if (val === 'lithium') { setDoD(80); setBatteryEff(0.95); }
                    else { setDoD(50); setBatteryEff(0.85); }
                  }}
                  className="w-full bg-white rounded-lg border border-gold-antique/20 px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none">
                  <option value="not-sure">I'm not sure</option>
                  <option value="lead-acid">Lead-Acid</option>
                  <option value="lithium">Lithium</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-navy/60 block mb-1.5">Where are you located?</label>
                <select value={customSunHours ? -1 : peakSunHours}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val === -1) { setCustomSunHours(true); return; }
                    setCustomSunHours(false);
                    setPeakSunHours(val);
                  }}
                  className="w-full bg-white rounded-lg border border-gold-antique/20 px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none">
                  {PEAK_SUN_HOURS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {customSunHours && (
                  <input type="number" min={1} max={12} step={0.5} value={peakSunHours}
                    onChange={(e) => setPeakSunHours(clampNum(Number(e.target.value), 1, 12))}
                    onBlur={(e) => { if (!e.target.value || Number(e.target.value) < 1) setPeakSunHours(5); }}
                    className="w-full bg-white rounded-lg border border-gold-antique/20 px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none mt-2"
                    placeholder="Enter custom sun hours" />
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-navy/60 block mb-1.5">Backup days (cloudy)</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((d) => (
                    <button key={d} type="button"
                      onClick={() => setAutonomy(d)}
                      className={`flex-1 rounded-lg border py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                        autonomy === d
                          ? 'bg-navy text-gold border-navy'
                          : 'bg-white text-navy/50 border-gold-antique/20 hover:border-gold hover:text-gold'
                      }`}
                    >{d} {d === 1 ? 'day' : 'days'}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Settings (for experts) */}
            <details className="group" ref={detailsRef}>
              <summary className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy/40 hover:text-navy/70 cursor-pointer transition-colors select-none list-none flex items-center gap-1.5">
                <span className="inline-block transition-transform group-open:rotate-90">&#9654;</span>
                Advanced Settings (for experts)
              </summary>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-navy/60 block mb-1.5 flex items-center gap-1.5">
                    Inverter Efficiency
                    <span className="relative group">
                      <Info className="h-3 w-3 text-navy/30 hover:text-gold cursor-pointer transition-colors" />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-xl bg-navy text-champagne text-[11px] leading-relaxed shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                        How efficiently your inverter converts DC battery power to AC for your appliances. Typical values: 85-95%. Lower = more energy lost as heat.
                      </span>
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="range" min={75} max={98} value={Math.round(inverterEff * 100)}
                      onChange={(e) => setInverterEff(Number(e.target.value) / 100)}
                      className="flex-1 accent-gold h-1.5" />
                    <span className="text-sm font-bold text-navy w-12 text-right">{Math.round(inverterEff * 100)}%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/60 block mb-1.5 flex items-center gap-1.5">
                    Battery Discharge Limit
                    <span className="relative group">
                      <Info className="h-3 w-3 text-navy/30 hover:text-gold cursor-pointer transition-colors" />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-navy text-champagne text-[11px] leading-relaxed shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                        <strong className="text-gold block mb-1.5">Depth of Discharge (DoD)</strong>
                        The maximum percentage of battery capacity you can safely use before recharging. Exceeding this damages the battery and shortens its lifespan.<br /><br />
                        <strong className="text-champagne">Recommended:</strong><br />
                        &bull; Lead-Acid: 50% max<br />
                        &bull; Lithium: 80% max
                      </span>
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="range" min={20} max={80} value={dod}
                      onChange={(e) => { setDoD(Number(e.target.value)); setBatteryType('custom'); }}
                      className="flex-1 accent-gold h-1.5" />
                    <span className="text-sm font-bold text-navy w-12 text-right">{dod}%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/60 block mb-1.5 flex items-center gap-1.5">
                    Battery Temp. Derating
                    <span className="relative group">
                      <Info className="h-3 w-3 text-navy/30 hover:text-gold cursor-pointer transition-colors" />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-navy text-champagne text-[11px] leading-relaxed shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                        Nigerian heat (30°C+) reduces battery effective capacity. 0.9 = battery holds 90% of rated capacity. Lower for outdoor/unventilated battery banks.
                      </span>
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="range" min={70} max={100} value={Math.round(tempDerating * 100)}
                      onChange={(e) => setTempDerating(Number(e.target.value) / 100)}
                      className="flex-1 accent-gold h-1.5" />
                    <span className="text-sm font-bold text-navy w-12 text-right">{Math.round(tempDerating * 100)}%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/60 block mb-1.5 flex items-center gap-1.5">
                    System Losses Factor
                    <span className="relative group">
                      <Info className="h-3 w-3 text-navy/30 hover:text-gold cursor-pointer transition-colors" />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-navy text-champagne text-[11px] leading-relaxed shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                        Accounts for wiring losses, dust/dirt on panels, panel heating (Nigeria 30°C+), and shading. 0.80 = 80% of rated panel output reaches your system. Typical range: 0.75&ndash;0.90.
                      </span>
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="range" min={70} max={95} value={Math.round(systemLosses * 100)}
                      onChange={(e) => setSystemLosses(Number(e.target.value) / 100)}
                      className="flex-1 accent-gold h-1.5" />
                    <span className="text-sm font-bold text-navy w-12 text-right">{Math.round(systemLosses * 100)}%</span>
                  </div>
                </div>
                <div className="sm:col-span-2 rounded-lg bg-white/60 border border-gold-antique/10 p-3">
                  <p className="text-[11px] text-navy/60">
                    <strong className="text-navy">Combined system efficiency:</strong> {Math.round(inverterEff * batteryEff * 100)}% &mdash;
                    Night appliances need {Math.round(100 / (inverterEff * batteryEff) - 100)}% more panels than day appliances
                    due to inverter &amp; battery losses.
                  </p>
                </div>
              </div>
            </details>
          </div>
          )}
        </div>

        {/* Calculate Button */}
        {appliances.length > 0 && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleCalculate}
              className="inline-flex items-center gap-3 rounded-xl bg-navy px-10 py-4 text-sm font-bold uppercase tracking-widest text-gold shadow-lg transition-all hover:bg-gold hover:text-navy hover:scale-105 active:scale-95"
            >
              <Calculator className="h-5 w-5" />
              Calculate
            </button>
          </div>
        )}

        {/* Results */}
        {calculated && (
        <div className="rounded-[1.5rem] border border-gold-antique/10 bg-gradient-to-br from-navy to-navy-deep p-5 md:p-6 text-champagne">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-5 w-5 text-gold" />
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-gold">Your Solar Recommendation</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 md:p-4">
              <div className="flex items-center gap-2 text-champagne/60 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Zap className="h-3.5 w-3.5" />
                Daily Use
              </div>
              <p className="text-xl md:text-2xl font-bold text-gold">{results.totalKwh} <span className="text-sm font-normal text-champagne/60">kWh</span></p>
              <p className="text-[11px] text-champagne/40 mt-1">{results.totalWh.toLocaleString()} Wh</p>
              <div className="flex gap-2 mt-1.5 text-[10px]">
                <span className="text-amber-400/80">{results.dayWh.toLocaleString()} Wh day</span>
                <span className="text-indigo-400/80">{results.nightWh.toLocaleString()} Wh night</span>
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 md:p-4">
              <div className="flex items-center gap-2 text-champagne/60 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Battery className="h-3.5 w-3.5" />
                Battery Bank
              </div>
              <p className="text-xl md:text-2xl font-bold text-gold">{results.batteryCapacityAh.toLocaleString()} <span className="text-sm font-normal text-champagne/60">Ah</span></p>
              <p className="text-[11px] text-champagne/40 mt-1">@ {results.systemVoltage}V</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 md:p-4">
              <div className="flex items-center gap-2 text-champagne/60 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sun className="h-3.5 w-3.5" />
                Solar Panels
              </div>
              <p className="text-xl md:text-2xl font-bold text-gold">{results.solarPanelW.toLocaleString()} <span className="text-sm font-normal text-champagne/60">Wp</span></p>
              <p className="text-[11px] text-champagne/40 mt-1">{peakSunHours}h sun</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 md:p-4">
              <div className="flex items-center gap-2 text-champagne/60 text-[11px] font-bold uppercase tracking-wider mb-2">
                <span className="text-base">⚡</span>
                Inverter
              </div>
              <p className="text-xl md:text-2xl font-bold text-gold">{results.inverterW.toLocaleString()} <span className="text-sm font-normal text-champagne/60">W</span></p>
              <p className="text-[11px] text-champagne/40 mt-1">25% buffer</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="rounded-full bg-gold/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold">
              System: {results.systemVoltage}V
            </span>
            {results.systemVoltage >= 48 && (
              <span className="rounded-full bg-blue-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-400">
                High-Voltage System
              </span>
            )}
          </div>

          {/* Professional Advised Solar System */}
          <div className="rounded-xl bg-white/5 border border-gold/20 p-4 md:p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold text-xs font-bold">!</span>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Professional Advised Solar System</h4>
            </div>

            {!customizing ? (
              <>
                <p className="text-sm text-champagne/80 mb-4">
                  Based on your daily usage of <strong className="text-champagne">{results.totalKwh}kWh</strong>, here is the recommended system:
                </p>

                <div className="space-y-3 mb-5">
                  {systemComponents.map((comp) => (
                    <div key={comp.id} className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3.5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-gold">{energyIconMap[comp.type]}</span>
                        <div>
                          <p className="text-sm font-bold text-champagne">{comp.label}</p>
                          <p className="text-[11px] text-champagne/50">{comp.specs} &times; {comp.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gold">₦{(comp.quantity * comp.unitPrice).toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-lg bg-gold/10 border border-gold/30 px-3.5 py-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-gold">Estimated Total</p>
                    <p className="text-lg font-bold text-gold">₦{systemTotal.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleBuySystem}
                    className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 text-xs font-bold uppercase tracking-widest text-navy transition-all hover:bg-gold-antique hover:text-white"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Buy This System
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomizing(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-gold/40 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gold transition-all hover:bg-gold hover:text-navy"
                  >
                    <Edit3 className="h-4 w-4" />
                    Customize
                  </button>
                  <a href={`https://wa.me/2349128817136?text=${encodeURIComponent(`Hi Cedokamall! I need a solar quote. My daily consumption is ${results.totalKwh}kWh, battery bank: ${results.batteryCapacityAh}Ah @ ${results.systemVoltage}V, solar array: ${results.solarPanelW}Wp, inverter: ${results.inverterW}W.`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-emerald-600">
                    <MessageSquare className="h-4 w-4" />
                    Get Quote
                  </a>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-champagne/80 mb-4">
                  Adjust quantities below, remove items you already have, or add more. When ready, add to cart.
                </p>

                <div className="space-y-3 mb-5">
                  {systemComponents.map((comp) => (
                    <div key={comp.id} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 border border-white/10 px-3.5 py-2.5">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-gold shrink-0">{energyIconMap[comp.type]}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-champagne truncate">{comp.label}</p>
                          <p className="text-[11px] text-champagne/50">{comp.specs}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          min={0}
                          value={comp.quantity || ''}
                          onChange={(e) => updateComponentQty(comp.id, Number(e.target.value))}
                          onBlur={(e) => { const v = Number(e.target.value); if (!v || v < 0) updateComponentQty(comp.id, 0); }}
                          className="w-16 bg-white/10 border border-white/20 rounded-md px-2 py-1.5 text-sm text-champagne text-center focus:border-gold focus:outline-none"
                        />
                        <button type="button" onClick={() => removeComponent(comp.id)} className="text-champagne/40 hover:text-red-400" aria-label="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-lg bg-gold/10 border border-gold/30 px-3.5 py-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-gold">Estimated Total</p>
                    <p className="text-lg font-bold text-gold">₦{systemTotal.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleBuyCustom}
                    className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 text-xs font-bold uppercase tracking-widest text-navy transition-all hover:bg-gold-antique hover:text-white"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart &amp; Checkout
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomizing(false)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-xs font-bold uppercase tracking-widest text-champagne/70 transition-all hover:border-gold hover:text-gold"
                  >
                    Back to Suggested
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/solar?category=inverters"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 text-xs font-bold uppercase tracking-widest text-navy transition-all hover:bg-gold-antique hover:text-white">
              <ShoppingCart className="h-4 w-4" />
              Inverters
            </Link>
            <Link to="/solar?category=batteries-storage"
              className="inline-flex items-center gap-2 rounded-xl border border-gold/40 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gold transition-all hover:bg-gold hover:text-navy">
              <ShoppingCart className="h-4 w-4" />
              Batteries
            </Link>
            <Link to="/solar?category=solar-panels"
              className="inline-flex items-center gap-2 rounded-xl border border-gold/40 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gold transition-all hover:bg-gold hover:text-navy">
              <ShoppingCart className="h-4 w-4" />
              Solar Panels
            </Link>
            <a href={`https://wa.me/2349128817136?text=${encodeURIComponent(`Hi Cedokamall! I need a solar quote. My daily consumption is ${results.totalKwh}kWh, battery bank: ${results.batteryCapacityAh}Ah @ ${results.systemVoltage}V, solar array: ${results.solarPanelW}Wp, inverter: ${results.inverterW}W.`)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-emerald-600">
              <MessageSquare className="h-4 w-4" />
              Get Quote
            </a>
          </div>
        </div>
        )}
      </div>
    </div>

    {/* Energy Info Modal */}
    {infoAppliance && (() => {
      const app = infoAppliance;
      const info = energyInfo(app);
      return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6" onClick={() => setInfoApplianceId(null)}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <div
          className="relative w-full max-w-md md:max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gold-antique/10 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-navy to-navy-deep px-5 py-4 rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/20">
                <Info className="h-3.5 w-3.5 text-gold" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-champagne truncate pr-2">{app.name || 'Appliance'}</h3>
            </div>
            <button type="button" onClick={() => setInfoApplianceId(null)} className="shrink-0 text-champagne/50 hover:text-champagne transition-colors" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Power Rating */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-2.5">Power Rating</h4>
              <div className="rounded-xl border border-gold-antique/10 bg-ivory/30 divide-y divide-gold-antique/5">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-semibold text-navy/60">Voltage</span>
                  <span className="text-sm font-bold text-navy">{app.volts}V</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-semibold text-navy/60">Current</span>
                  <span className="text-sm font-bold text-navy">{info.amps.toFixed(2)}A <span className="text-[10px] font-normal text-navy/40">({info.isAcAppliance ? 'AC' : 'DC'})</span></span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-semibold text-navy/60">Power</span>
                  <span className="text-sm font-bold text-navy">{app.watts}W</span>
                </div>
              </div>
            </div>

            {/* Your Usage */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-2.5">Your Usage</h4>
              <div className="rounded-xl border border-gold-antique/10 bg-ivory/30 divide-y divide-gold-antique/5">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-semibold text-navy/60">Quantity</span>
                  <span className="text-sm font-bold text-navy">&times;{app.quantity}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-semibold text-navy/60">Daily Usage</span>
                  <span className="text-sm font-bold text-navy">{app.minutes}min</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-semibold text-navy/60">Daily Energy</span>
                  <span className="text-sm font-bold text-navy">{info.dailyWh.toLocaleString()} Wh <span className="text-[10px] font-normal text-navy/40">({(info.dailyWh / 1000).toFixed(3)} kWh)</span></span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-semibold text-navy/60">Monthly Energy</span>
                  <span className="text-sm font-bold text-navy">{info.monthlyKwh.toFixed(2)} kWh</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-semibold text-navy/60">Time of Use</span>
                  <span className={`text-sm font-bold ${app.night ? 'text-indigo-600' : 'text-amber-600'}`}>
                    {app.night ? '\u{1F319} Night (battery)' : '\u{2600}\u{FE0F} Day (direct solar)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Battery Impact */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-2.5">Battery Impact</h4>
              <div className="rounded-xl border border-gold-antique/10 bg-ivory/30 divide-y divide-gold-antique/5">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-semibold text-navy/60">Daily Draw</span>
                  <span className="text-sm font-bold text-navy">{info.dailyAh.toFixed(2)} Ah <span className="text-[10px] font-normal text-navy/40">@ {app.volts}V</span></span>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="rounded-xl bg-gradient-to-br from-navy to-navy-deep p-4">
              <p className="text-xs leading-relaxed text-champagne/80">
                <strong className="text-champagne">How energy works here:</strong>
                {' '}This {app.name || 'appliance'} uses <strong className="text-champagne">{app.watts}W</strong> of power at <strong className="text-champagne">{app.volts}V</strong>, drawing{' '}
                <strong className="text-champagne">{info.amps.toFixed(2)}A</strong> of current{info.isAcAppliance ? ' (alternating current, requires an inverter to run from battery)' : ' (direct current, can run directly from battery)'}.
                {' '}With {app.quantity} unit{app.quantity > 1 ? 's' : ''} running {app.minutes}min per day, total daily consumption is{' '}
                <strong className="text-champagne">{info.dailyWh.toLocaleString()} Wh</strong>{' '}({info.monthlyKwh.toFixed(2)} kWh/month).
                {' '}This draws <strong className="text-champagne">{info.dailyAh.toFixed(2)} Ah</strong> from your battery bank daily.
                {' '}{info.dailyAh > 0 && (Math.round(200 / info.dailyAh) > 0) ? `A standard 200Ah battery could power it for about ${Math.round(200 / info.dailyAh)} days alone.` : ''}
                {' '}<strong className="text-champagne">Time of use:</strong> Marked as <strong className="text-champagne">{app.night ? 'night' : 'day'}</strong> &mdash;
                {app.night
                  ? ' runs through the battery (includes inverter &amp; battery losses).'
                  : ' runs directly from solar panels when the sun is shining.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      );
    })()}
    </>
  );
};

export default EnergyCalculator;
