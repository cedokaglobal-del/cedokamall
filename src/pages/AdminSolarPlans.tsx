import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSolarPlanStore, createSolarPlanItem } from '@/store/solarPlanStore';
import type { SolarPlan, SolarPlanItem, SolarPlanItemType } from '@/types/solarPlan';

const itemTypes: { value: SolarPlanItemType; label: string }[] = [
  { value: 'panel', label: 'Panel' },
  { value: 'battery', label: 'Battery' },
  { value: 'inverter', label: 'Inverter' },
  { value: 'controller', label: 'Charge controller' },
  { value: 'accessory', label: 'Accessory' },
];

const emptyPlan = () => ({
  name: '',
  description: '',
  image: '',
  price: 0,
  capacity: '',
  bestFor: '',
  canPower: [] as string[],
  backupTime: '',
  notes: '',
  items: [createSolarPlanItem()],
  isActive: true,
});

type PlanDraft = ReturnType<typeof emptyPlan>;

const AdminSolarPlans = () => {
  const plans = useSolarPlanStore((state) => state.plans);
  const addPlan = useSolarPlanStore((state) => state.addPlan);
  const updatePlan = useSolarPlanStore((state) => state.updatePlan);
  const deletePlan = useSolarPlanStore((state) => state.deletePlan);
  const fetchPlans = useSolarPlanStore((state) => state.fetchPlans);
  const [draft, setDraft] = useState<PlanDraft>(emptyPlan);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [canPowerInput, setCanPowerInput] = useState('');

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);

  const startEdit = (plan: SolarPlan) => {
    setEditingId(plan.id);
    setDraft({
      name: plan.name,
      description: plan.description,
      image: plan.image || '',
      price: plan.price,
      capacity: plan.capacity,
      bestFor: plan.bestFor,
      canPower: plan.canPower,
      backupTime: plan.backupTime,
      notes: plan.notes,
      items: plan.items,
      isActive: plan.isActive,
    });
    setCanPowerInput(plan.canPower.join(', '));
    setError('');
  };

  const reset = () => {
    setEditingId(null);
    setDraft(emptyPlan());
    setCanPowerInput('');
    setError('');
  };

  const updateItem = (id: string, field: keyof SolarPlanItem, value: string | number) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item) => item.id === id ? { ...item, [field]: value } : item),
    }));
  };

  const handleImage = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setDraft((current) => ({ ...current, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const addCanPowerItem = () => {
    const item = canPowerInput.trim();
    if (item && !draft.canPower.includes(item)) {
      setDraft((current) => ({ ...current, canPower: [...current.canPower, item] }));
      setCanPowerInput('');
    }
  };

  const removeCanPowerItem = (item: string) => {
    setDraft((current) => ({ ...current, canPower: current.canPower.filter((i) => i !== item) }));
  };

  const handleSubmit = () => {
    const items = draft.items.filter((item) => item.name.trim());
    if (!draft.name.trim() || items.length === 0) {
      setError('Add a plan name and at least one named plan item.');
      return;
    }
    const normalizedItems = items.map((item) => ({
      ...item,
      name: item.name.trim(),
      volts: Math.max(0, Number(item.volts) || 0),
      watts: Math.max(0, Number(item.watts) || 0),
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));
    const planData = {
      ...draft,
      name: draft.name.trim(),
      price: Math.max(0, Number(draft.price) || 0),
      items: normalizedItems,
    };
    if (editingId) {
      void updatePlan(editingId, planData);
    } else {
      void addPlan(planData);
    }
    reset();
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy">Solar Plans</h1>
            <p className="mt-2 text-sm text-muted-foreground">Create detailed solar system plans for your team and customers.</p>
          </div>
          <Button onClick={reset} className="gap-2"><Plus className="h-4 w-4" /> New plan</Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingId ? 'Edit plan' : 'Plan details'}</h2>
              {editingId && <Button variant="ghost" size="sm" onClick={reset}><X className="mr-1 h-4 w-4" />Cancel</Button>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="plan-name">Plan name *</Label><Input id="plan-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. Home Essentials 3.5kW" /></div>
              <div className="space-y-2"><Label htmlFor="plan-capacity">Capacity</Label><Input id="plan-capacity" value={draft.capacity} onChange={(event) => setDraft({ ...draft, capacity: event.target.value })} placeholder="e.g. 3.5kVA / 48V" /></div>
              <div className="space-y-2"><Label htmlFor="plan-price">Price (₦)</Label><Input id="plan-price" type="number" min="0" value={draft.price || ''} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} placeholder="e.g. 850000" /></div>
              <div className="space-y-2"><Label htmlFor="plan-image">Plan image</Label><label htmlFor="plan-image" className="flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground hover:bg-muted"><Upload className="h-4 w-4" /> Upload image</label><input id="plan-image" type="file" accept="image/*" className="sr-only" onChange={(event) => handleImage(event.target.files?.[0])} /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="plan-description">Description</Label><Textarea id="plan-description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Brief description of what this plan includes" /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="plan-best-for">Best For</Label><Input id="plan-best-for" value={draft.bestFor} onChange={(event) => setDraft({ ...draft, bestFor: event.target.value })} placeholder="e.g. 2-3 bedroom flat, small office" /></div>
              <div className="space-y-2"><Label htmlFor="plan-backup-time">Backup Time</Label><Input id="plan-backup-time" value={draft.backupTime} onChange={(event) => setDraft({ ...draft, backupTime: event.target.value })} placeholder="e.g. 8-12 hours (light loads)" /></div>
              <div className="space-y-2"><Label htmlFor="plan-can-power-input">Can Power</Label>
                <div className="flex gap-2">
                  <Input id="plan-can-power-input" value={canPowerInput} onChange={(event) => setCanPowerInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCanPowerItem(); } }} placeholder="Type an item and press Enter" />
                  <Button type="button" variant="outline" onClick={addCanPowerItem}>Add</Button>
                </div>
                {draft.canPower.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {draft.canPower.map((item) => (
                      <span key={item} className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-navy">
                        {item}
                        <button type="button" onClick={() => removeCanPowerItem(item)} className="ml-0.5 hover:text-destructive"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="plan-notes">Notes / Cautions</Label><Textarea id="plan-notes" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="e.g. Not suitable for air conditioners. Requires professional installation." /></div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between"><h3 className="font-semibold">Plan items</h3><Button type="button" variant="outline" size="sm" onClick={() => setDraft({ ...draft, items: [...draft.items, createSolarPlanItem()] })}><Plus className="mr-1 h-4 w-4" /> Add item</Button></div>
              {draft.items.map((item) => <div key={item.id} className="grid gap-2 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[1fr_140px_90px_90px_90px_36px]"><Input value={item.name} onChange={(event) => updateItem(item.id, 'name', event.target.value)} placeholder="Item name" aria-label="Item name" /><select value={item.type} onChange={(event) => updateItem(item.id, 'type', event.target.value)} className="h-10 rounded-md border bg-background px-2 text-sm" aria-label="Item type">{itemTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select><Input type="number" min="0" value={item.volts} onChange={(event) => updateItem(item.id, 'volts', Number(event.target.value))} placeholder="Volts" aria-label="Volts" /><Input type="number" min="0" value={item.watts} onChange={(event) => updateItem(item.id, 'watts', Number(event.target.value))} placeholder="Watts" aria-label="Watts" /><Input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', Number(event.target.value))} placeholder="Qty" aria-label="Quantity" /><Button type="button" variant="ghost" size="icon" onClick={() => setDraft({ ...draft, items: draft.items.filter((entry) => entry.id !== item.id) })} disabled={draft.items.length === 1} aria-label="Remove item"><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)}
            </div>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            <Button onClick={handleSubmit} className="mt-6">{editingId ? 'Save plan' : 'Create solar plan'}</Button>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold">Saved plans ({plans.length})</h2>
            {plans.length === 0 && <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No Solar Plans yet.</div>}
            {plans.map((plan) => <article key={plan.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">{plan.image && <img src={plan.image} alt="" className="h-32 w-full object-cover" /> }<div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{plan.name}</h3>{plan.capacity && <p className="mt-0.5 text-xs text-gold font-semibold">{plan.capacity}</p>}{plan.price > 0 && <p className="mt-0.5 text-xs text-muted-foreground">₦{plan.price.toLocaleString()}</p>}{plan.bestFor && <p className="mt-1 text-xs text-muted-foreground">Best for: {plan.bestFor}</p>}</div><div className="flex"><Button variant="ghost" size="icon" onClick={() => startEdit(plan)} aria-label={`Edit ${plan.name}`}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deletePlan(plan.id)} aria-label={`Delete ${plan.name}`}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div><ul className="mt-3 space-y-1 text-xs text-muted-foreground">{plan.items.map((item) => <li key={item.id}>{item.quantity} x {item.name} ({item.volts}V / {item.watts}W)</li>)}</ul>{plan.canPower.length > 0 && <div className="mt-3 flex flex-wrap gap-1">{plan.canPower.map((item) => <span key={item} className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] text-navy">{item}</span>)}</div>}</div></article>)}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSolarPlans;
