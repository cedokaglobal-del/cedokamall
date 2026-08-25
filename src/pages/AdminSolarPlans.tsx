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

const emptyPlan = () => ({ name: '', description: '', image: '', items: [createSolarPlanItem()] });

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

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);

  const startEdit = (plan: SolarPlan) => {
    setEditingId(plan.id);
    setDraft({ name: plan.name, description: plan.description, image: plan.image || '', items: plan.items });
    setError('');
  };

  const reset = () => {
    setEditingId(null);
    setDraft(emptyPlan());
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
    if (editingId) {
      void updatePlan(editingId, { ...draft, name: draft.name.trim(), items: normalizedItems });
    } else {
      void addPlan({ ...draft, name: draft.name.trim(), items: normalizedItems });
    }
    reset();
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy">Solar Plans</h1>
            <p className="mt-2 text-sm text-muted-foreground">Create reusable solar system packages for your team and customers.</p>
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
              <div className="space-y-2"><Label htmlFor="plan-name">Plan name</Label><Input id="plan-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. Home Essentials 3.5kW" /></div>
              <div className="space-y-2"><Label htmlFor="plan-image">Plan image</Label><label htmlFor="plan-image" className="flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground hover:bg-muted"><Upload className="h-4 w-4" /> Upload image</label><input id="plan-image" type="file" accept="image/*" className="sr-only" onChange={(event) => handleImage(event.target.files?.[0])} /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="plan-description">Description</Label><Textarea id="plan-description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="What this system is designed to power" /></div>
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
            {plans.map((plan) => <article key={plan.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">{plan.image && <img src={plan.image} alt="" className="h-32 w-full object-cover" /> }<div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{plan.name}</h3><p className="mt-1 text-xs text-muted-foreground">{plan.items.length} items</p></div><div className="flex"><Button variant="ghost" size="icon" onClick={() => startEdit(plan)} aria-label={`Edit ${plan.name}`}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deletePlan(plan.id)} aria-label={`Delete ${plan.name}`}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div><ul className="mt-3 space-y-1 text-xs text-muted-foreground">{plan.items.map((item) => <li key={item.id}>{item.quantity} x {item.name} ({item.volts}V / {item.watts}W)</li>)}</ul></div></article>)}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSolarPlans;
