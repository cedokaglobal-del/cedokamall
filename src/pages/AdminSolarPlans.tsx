import { useEffect, useState } from 'react';
import { CheckCircle2, Pencil, Plus, RotateCcw, Trash2, Upload, X } from 'lucide-react';
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
  const isSaving = useSolarPlanStore((state) => state.isSaving);
  const syncError = useSolarPlanStore((state) => state.error);
  const fetchPlans = useSolarPlanStore((state) => state.fetchPlans);
  const [draft, setDraft] = useState<PlanDraft>(emptyPlan);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [canPowerInput, setCanPowerInput] = useState('');
  const [imageMeta, setImageMeta] = useState<{ name: string; size: number; width: number; height: number } | null>(null);

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
    setImageMeta(null);
    setError('');
  };

  const reset = () => {
    setEditingId(null);
    setDraft(emptyPlan());
    setCanPowerInput('');
    setImageMeta(null);
    setError('');
  };

  const handleDelete = async (id: string) => {
    const result = await deletePlan(id);
    if (!result.ok) {
      setError(result.message || 'Could not delete the plan from the database.');
    }
  };

  const updateItem = (id: string, field: keyof SolarPlanItem, value: string | number) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item) => item.id === id ? { ...item, [field]: value } : item),
    }));
  };

  // Images are stored inline as base64 in a text column, and base64 inflates by
  // roughly a third. Keep the encoded payload comfortably inside what the
  // database and the REST endpoint will accept.
  const MAX_IMAGE_BYTES = 1024 * 1024;

  const handleImage = (file: File | undefined, input?: HTMLInputElement) => {
    if (input) input.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image is larger than 1 MB. Please choose a smaller file.');
      return;
    }
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result);
      // Read natural dimensions so the admin can confirm the right asset landed.
      const probe = new Image();
      probe.onload = () => {
        setImageMeta({ name: file.name, size: file.size, width: probe.naturalWidth, height: probe.naturalHeight });
        setDraft((current) => ({ ...current, image }));
      };
      probe.onerror = () => {
        setImageMeta({ name: file.name, size: file.size, width: 0, height: 0 });
        setDraft((current) => ({ ...current, image }));
      };
      probe.src = image;
    };
    reader.onerror = () => setError('Could not read that image. Please try another file.');
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageMeta(null);
    setDraft((current) => ({ ...current, image: '' }));
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

  const handleSubmit = async () => {
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

    const result = editingId ? await updatePlan(editingId, planData) : await addPlan(planData);

    if (!result.ok) {
      // Never report success when the database rejected the write.
      setError(result.message || 'Could not save the plan to the database.');
      return;
    }

    setError('');
    setImageMeta(null);
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
              <div className="space-y-2">
                <Label htmlFor="plan-image">Plan image</Label>
                <label
                  htmlFor="plan-image"
                  className="flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
                >
                  <Upload className="h-4 w-4" />
                  {draft.image ? 'Replace image' : 'Upload image'}
                </label>
                <input
                  id="plan-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => handleImage(event.target.files?.[0], event.target)}
                />

                {draft.image && (
                  <div className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50/60 p-2.5">
                    <img
                      src={draft.image}
                      alt="Selected plan image preview"
                      className="h-16 w-16 shrink-0 rounded border border-emerald-200 bg-white object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        Image added
                      </p>
                      {imageMeta ? (
                        <>
                          <p className="mt-0.5 truncate text-[11px] text-emerald-800/90" title={imageMeta.name}>
                            {imageMeta.name}
                          </p>
                          <p className="text-[11px] text-emerald-800/70">
                            {imageMeta.width > 0 && imageMeta.height > 0
                              ? `${imageMeta.width} x ${imageMeta.height}px - `
                              : ''}
                            {(imageMeta.size / 1024).toFixed(0)} KB
                          </p>
                        </>
                      ) : (
                        <p className="mt-0.5 text-[11px] text-emerald-800/80">Saved with this plan</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={clearImage}
                      className="shrink-0 rounded p-1 text-emerald-800/70 transition-colors hover:bg-emerald-100 hover:text-emerald-900"
                      aria-label="Remove plan image"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
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
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="plan-is-active">Visibility</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    id="plan-is-active"
                    type="button"
                    role="switch"
                    aria-checked={draft.isActive}
                    onClick={() => setDraft({ ...draft, isActive: !draft.isActive })}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      draft.isActive ? 'bg-emerald-600' : 'bg-navy/25'
                    }`}
                  >
                    <span className="sr-only">Publish this plan on the site</span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        draft.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {draft.isActive
                      ? 'Published — this plan is shown on the home page, the solar page and offered by the energy calculator.'
                      : 'Hidden — saved to the database but not shown anywhere on the site or offered by the calculator.'}
                  </p>
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="plan-notes">Notes / Cautions</Label><Textarea id="plan-notes" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="e.g. Not suitable for air conditioners. Requires professional installation." /></div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between"><h3 className="font-semibold">Plan items</h3><Button type="button" variant="outline" size="sm" onClick={() => setDraft({ ...draft, items: [...draft.items, createSolarPlanItem()] })}><Plus className="mr-1 h-4 w-4" /> Add item</Button></div>
              <p className="text-xs text-muted-foreground">
                Name each part, pick its type, then enter quantity and energy values. For panels and inverters enter
                watts; for batteries enter the <strong>amp-hour (Ah) rating</strong>, which is multiplied by the volts
                to give stored energy.
                Example: <em>Hybrid Inverter 3kW 24V MPPT 4.5kW</em> — Qty 1 — 3000W — 24V.
                Battery: <em>Lithium Battery 24V 100Ah</em> — Qty 2 — 100Ah — 24V.
              </p>
              <div className="hidden sm:grid gap-2 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:grid-cols-[1fr_140px_90px_90px_90px_36px]">
                <span>Item name</span><span>Type</span><span>Volts (V)</span><span>Watts (W) / Ah</span><span>Qty</span><span />
              </div>
              {draft.items.map((item, index) => (
                <div key={item.id} className="space-y-1.5">
                  <div className="grid gap-2 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[1fr_140px_90px_90px_90px_36px]">
                    <div className="space-y-1">
                      <Label className="text-[11px] sm:hidden">Item name</Label>
                      <Input value={item.name} onChange={(event) => updateItem(item.id, 'name', event.target.value)} placeholder={index === 0 ? 'e.g. Hybrid Inverter 3kW 24V MPPT 4.5kW' : index === 1 ? 'e.g. Lithium Battery 2.56kWh 24V 100Ah' : 'e.g. Solar Panel N-Type Bifacial 620W'} aria-label="Item name" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] sm:hidden">Type</Label>
                      <select value={item.type} onChange={(event) => updateItem(item.id, 'type', event.target.value)} className="h-10 w-full rounded-md border bg-background px-2 text-sm" aria-label="Item type">{itemTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] sm:hidden">Volts (V)</Label>
                      <Input type="number" min="0" value={item.volts} onChange={(event) => updateItem(item.id, 'volts', Number(event.target.value))} placeholder="e.g. 24" aria-label="Volts" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] sm:hidden">{item.type === 'battery' ? 'Capacity (Ah)' : 'Watts (W)'}</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.watts}
                        onChange={(event) => updateItem(item.id, 'watts', Number(event.target.value))}
                        placeholder={item.type === 'battery' ? 'e.g. 100' : 'e.g. 620'}
                        aria-label={item.type === 'battery' ? 'Battery capacity in amp hours' : 'Watts'}
                        title={
                          item.type === 'battery'
                            ? 'Enter the battery rating in amp hours (Ah). It is multiplied by the volts below to get stored energy, so enter 100 for a 100Ah battery - not 2560.'
                            : undefined
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] sm:hidden">Qty</Label>
                      <Input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', Number(event.target.value))} placeholder="e.g. 3" aria-label="Quantity" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setDraft({ ...draft, items: draft.items.filter((entry) => entry.id !== item.id) })} disabled={draft.items.length === 1} aria-label="Remove item"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                  {item.name.trim() && (
                    <p className="px-1 text-xs text-muted-foreground">
                      Preview: <strong className="text-navy">{item.quantity} × {item.name.trim()}</strong>
                      {(Number(item.watts) > 0 || Number(item.volts) > 0) && (
                        <span> ({[Number(item.watts) > 0 ? `${item.watts}${item.type === 'battery' ? 'Ah' : 'W'}` : null, Number(item.volts) > 0 ? `${item.volts}V` : null].filter(Boolean).join(' • ')})</span>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            <Button onClick={handleSubmit} disabled={isSaving} className="mt-6">
        {isSaving ? 'Saving…' : editingId ? 'Save plan' : 'Create solar plan'}
      </Button>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold">Saved plans ({plans.length})</h2>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <p className={`text-xs ${syncError ? 'font-semibold text-destructive' : 'text-muted-foreground'}`}>
          {syncError
            ? `Not synced with the database: ${syncError}`
            : `In sync with the database. ${plans.filter((plan) => plan.id.startsWith('plan-')).length} plan(s) are only on this device and still need a working database connection.`}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => void fetchPlans()} className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Sync now
        </Button>
      </div>
            {plans.length === 0 && <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No Solar Plans yet.</div>}
            {plans.map((plan) => <article key={plan.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">{plan.image && <img src={plan.image} alt="" className="h-32 w-full object-cover" /> }<div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{plan.name}</h3>{plan.capacity && <p className="mt-0.5 text-xs text-gold font-semibold">{plan.capacity}</p>}{plan.price > 0 && <p className="mt-0.5 text-xs text-muted-foreground">₦{plan.price.toLocaleString()}</p>}{plan.bestFor && <p className="mt-1 text-xs text-muted-foreground">Best for: {plan.bestFor}</p>}</div><div className="flex"><Button variant="ghost" size="icon" onClick={() => startEdit(plan)} aria-label={`Edit ${plan.name}`}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)} aria-label={`Delete ${plan.name}`}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div><ul className="mt-3 space-y-1 text-xs text-muted-foreground">{plan.items.map((item) => <li key={item.id}>{item.quantity} x {item.name} ({item.volts}V / {item.watts}W)</li>)}</ul>{plan.canPower.length > 0 && <div className="mt-3 flex flex-wrap gap-1">{plan.canPower.map((item) => <span key={item} className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] text-navy">{item}</span>)}</div>}</div></article>)}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSolarPlans;
