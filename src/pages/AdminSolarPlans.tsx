import { useEffect, useState } from 'react';
import { CheckCircle2, Pencil, Plus, RotateCcw, Trash2, Upload, X, Shield, Wrench, Battery, Cpu, SunMedium } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSolarPlanStore, createSolarPlanItem } from '@/store/solarPlanStore';
import { SOLAR_PLAN_BUCKET, uploadImage, readAsDataUrl } from '@/lib/imageUpload';
import { SOLAR_PLAN_CATEGORIES, type SolarPlan, type SolarPlanCategory, type SolarPlanItem, type SolarPlanItemType } from '@/types/solarPlan';
import { toast } from 'sonner';

const itemTypes: { value: SolarPlanItemType; label: string }[] = [
  { value: 'panel', label: 'Panel' },
  { value: 'battery', label: 'Battery' },
  { value: 'inverter', label: 'Inverter' },
  { value: 'controller', label: 'Charge controller' },
  { value: 'accessory', label: 'Accessory' },
];

const emptyPlan = () => ({
  name: '',
  category: 'Basic Plans' as SolarPlanCategory,
  description: '',
  image: '',
  price: 0,
  capacity: '',
  inverterType: '',
  batteryType: '',
  panelType: '',
  warranty: '2 Years Comprehensive Warranty',
  installation: 'Free delivery and standard Lagos installation included',
  accessories: 'DC breaker box, 25m PV solar cable, MC4 connectors',
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
  const seedExamplePlans = useSolarPlanStore((state) => state.seedExamplePlans);
  const [isSeeding, setIsSeeding] = useState(false);
  const [draft, setDraft] = useState<PlanDraft>(emptyPlan);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [canPowerInput, setCanPowerInput] = useState('');
  const [imageMeta, setImageMeta] = useState<{ name: string; size: number; width: number; height: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);

  const startEdit = (plan: SolarPlan) => {
    setEditingId(plan.id);
    setDraft({
      name: plan.name,
      category: plan.category || 'Basic Plans',
      description: plan.description,
      image: plan.image || '',
      price: plan.price,
      capacity: plan.capacity,
      inverterType: plan.inverterType || '',
      batteryType: plan.batteryType || '',
      panelType: plan.panelType || '',
      warranty: plan.warranty || '2 Years Comprehensive Warranty',
      installation: plan.installation || '',
      accessories: plan.accessories || '',
      bestFor: plan.bestFor,
      canPower: plan.canPower,
      backupTime: plan.backupTime,
      notes: plan.notes,
      items: plan.items && plan.items.length > 0 ? plan.items : [createSolarPlanItem()],
      isActive: plan.isActive,
    });
    setCanPowerInput(plan.canPower.join(', '));
    setImageMeta(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    setEditingId(null);
    setDraft(emptyPlan());
    setCanPowerInput('');
    setImageMeta(null);
    setError('');
  };

  const handleSeedExamples = async () => {
    setIsSeeding(true);
    const result = await seedExamplePlans();
    setIsSeeding(false);
    if (result.count > 0) {
      toast.success(`${result.count} example solar plan${result.count === 1 ? '' : 's'} loaded and published.`);
    } else {
      toast.error(result.message || 'Could not load example plans.');
    }
    if (result.message && result.count > 0) {
      setError(`Some example plans could not be saved: ${result.message}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the plan "${name}"?`)) return;
    const result = await deletePlan(id);
    if (!result.ok) {
      setError(result.message || 'Could not delete the plan from the database.');
      toast.error(result.message || 'Could not delete plan');
    } else {
      toast.success(`Plan "${name}" deleted`);
      if (editingId === id) reset();
    }
  };

  const updateItem = (id: string, field: keyof SolarPlanItem, value: string | number) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const MAX_IMAGE_BYTES = 1024 * 1024 * 2; // 2MB

  const handleImage = async (file: File | undefined, input?: HTMLInputElement) => {
    if (input) input.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image is larger than 2 MB. Please choose a smaller file.');
      return;
    }
    setError('');
    setIsUploading(true);

    try {
      const uploaded = await uploadImage(file, SOLAR_PLAN_BUCKET, 'plans');
      let image: string;

      if (uploaded.ok && uploaded.url) {
        image = uploaded.url;
      } else {
        image = await readAsDataUrl(file);
      }

      const probe = new Image();
      probe.onload = () => {
        setImageMeta({ name: file.name, size: file.size, width: probe.naturalWidth, height: probe.naturalHeight });
        setDraft((current) => ({ ...current, image }));
        setIsUploading(false);
      };
      probe.onerror = () => {
        setImageMeta({ name: file.name, size: file.size, width: 0, height: 0 });
        setDraft((current) => ({ ...current, image }));
        setIsUploading(false);
      };
      probe.src = image;
    } catch (err) {
      setIsUploading(false);
      setError(err instanceof Error ? err.message : 'Could not process that image.');
    }
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
    if (!draft.name.trim()) {
      setError('Please provide a solar plan name.');
      return;
    }
    if (!draft.category.trim()) {
      setError('Please select a category for this plan.');
      return;
    }

    const items = draft.items.filter((item) => item.name.trim());
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
      category: draft.category.trim(),
      price: Math.max(0, Number(draft.price) || 0),
      capacity: draft.capacity.trim(),
      inverterType: draft.inverterType.trim(),
      batteryType: draft.batteryType.trim(),
      panelType: draft.panelType.trim(),
      warranty: draft.warranty.trim(),
      installation: draft.installation.trim(),
      accessories: draft.accessories.trim(),
      bestFor: draft.bestFor.trim(),
      backupTime: draft.backupTime.trim(),
      notes: draft.notes.trim(),
      items: normalizedItems.length > 0 ? normalizedItems : draft.items,
    };

    const result = editingId ? await updatePlan(editingId, planData) : await addPlan(planData);

    if (!result.ok) {
      setError(result.message || 'Could not save the plan to the database.');
      toast.error(result.message || 'Failed to save solar plan');
      return;
    }

    toast.success(editingId ? 'Solar plan updated and published!' : 'Solar plan created and published!');
    setError('');
    setImageMeta(null);
    reset();
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy">Solar Plans Management</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create and manage packaged solar systems that appear on the public website. Published plans automatically update live catalog pages.
            </p>
          </div>
          <Button onClick={reset} className="gap-2 bg-navy text-gold hover:bg-gold hover:text-navy">
            <Plus className="h-4 w-4" /> New Solar Plan
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
          {/* Editor Form */}
          <form
            className="rounded-xl border bg-white p-6 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <div className="mb-6 flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-navy">{editingId ? 'Edit Solar Plan' : 'Create Solar Plan'}</h2>
                <p className="text-xs text-muted-foreground">Fill in the specifications below. The plan will publish dynamically to its category section.</p>
              </div>
              {editingId && (
                <Button type="button" variant="ghost" size="sm" onClick={reset}>
                  <X className="mr-1 h-4 w-4" />Cancel Edit
                </Button>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="plan-name" className="font-semibold text-navy">Plan Name *</Label>
                <Input
                  id="plan-name"
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  placeholder="e.g. Cedoka Basic Solar Plan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-category" className="font-semibold text-navy">Plan Category *</Label>
                <select
                  id="plan-category"
                  value={draft.category}
                  onChange={(event) => setDraft({ ...draft, category: event.target.value as SolarPlanCategory })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  {SOLAR_PLAN_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">Determines which section of the public website this plan appears in.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-price" className="font-semibold text-navy">Price (₦) [Optional - 0 for quote]</Label>
                <Input
                  id="plan-price"
                  type="number"
                  min="0"
                  value={draft.price || ''}
                  onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })}
                  placeholder="e.g. 850000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-capacity" className="font-semibold text-navy">System Capacity</Label>
                <Input
                  id="plan-capacity"
                  value={draft.capacity}
                  onChange={(event) => setDraft({ ...draft, capacity: event.target.value })}
                  placeholder="e.g. 1.5kVA / 12V or 5kVA / 48V"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-inverter" className="font-semibold text-navy flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-gold" /> Inverter Specification
                </Label>
                <Input
                  id="plan-inverter"
                  value={draft.inverterType}
                  onChange={(event) => setDraft({ ...draft, inverterType: event.target.value })}
                  placeholder="e.g. 1.5kW Pure Sine Wave Inverter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-battery" className="font-semibold text-navy flex items-center gap-1.5">
                  <Battery className="h-3.5 w-3.5 text-gold" /> Battery Specification
                </Label>
                <Input
                  id="plan-battery"
                  value={draft.batteryType}
                  onChange={(event) => setDraft({ ...draft, batteryType: event.target.value })}
                  placeholder="e.g. 1.28kWh Lithium LiFePO4 (100Ah 12.8V)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-panel" className="font-semibold text-navy flex items-center gap-1.5">
                  <SunMedium className="h-3.5 w-3.5 text-gold" /> Solar Panels Specification
                </Label>
                <Input
                  id="plan-panel"
                  value={draft.panelType}
                  onChange={(event) => setDraft({ ...draft, panelType: event.target.value })}
                  placeholder="e.g. 820W Monocrystalline (2x 410W Panels)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-warranty" className="font-semibold text-navy flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-gold" /> Warranty Terms
                </Label>
                <Input
                  id="plan-warranty"
                  value={draft.warranty}
                  onChange={(event) => setDraft({ ...draft, warranty: event.target.value })}
                  placeholder="e.g. 2 Years Comprehensive Warranty"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-installation" className="font-semibold text-navy flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-gold" /> Installation Coverage
                </Label>
                <Input
                  id="plan-installation"
                  value={draft.installation}
                  onChange={(event) => setDraft({ ...draft, installation: event.target.value })}
                  placeholder="e.g. Free delivery and standard Lagos installation included"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="plan-image" className="font-semibold text-navy">Plan Image</Label>
                <label
                  htmlFor="plan-image"
                  className="flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
                >
                  <Upload className="h-4 w-4" />
                  {isUploading ? 'Uploading…' : draft.image ? 'Replace image' : 'Upload system image'}
                </label>
                <input
                  id="plan-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => handleImage(event.target.files?.[0], event.target)}
                />

                {draft.image && (
                  <div className="mt-2 flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50/60 p-2.5">
                    <img
                      src={draft.image}
                      alt="Plan image preview"
                      className="h-16 w-16 shrink-0 rounded border border-emerald-200 bg-white object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        Image ready
                      </p>
                      {imageMeta ? (
                        <p className="truncate text-[11px] text-emerald-800/90">{imageMeta.name} ({(imageMeta.size / 1024).toFixed(0)} KB)</p>
                      ) : (
                        <p className="text-[11px] text-emerald-800/80">Saved with plan</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={clearImage}
                      className="shrink-0 rounded p-1 text-emerald-800/70 hover:bg-emerald-100 hover:text-emerald-900"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="plan-description" className="font-semibold text-navy">Description</Label>
                <Textarea
                  id="plan-description"
                  rows={3}
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  placeholder="Complete summary of what this system includes and the lifestyle or business needs it fulfills..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-best-for" className="font-semibold text-navy">Best For</Label>
                <Input
                  id="plan-best-for"
                  value={draft.bestFor}
                  onChange={(event) => setDraft({ ...draft, bestFor: event.target.value })}
                  placeholder="e.g. 1-2 Bedroom Flat, Studio or Small Office"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-backup-time" className="font-semibold text-navy">Backup Time</Label>
                <Input
                  id="plan-backup-time"
                  value={draft.backupTime}
                  onChange={(event) => setDraft({ ...draft, backupTime: event.target.value })}
                  placeholder="e.g. 8 to 12 hours on typical loads"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="plan-can-power-input" className="font-semibold text-navy">Can Power (Appliances)</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="plan-can-power-input"
                    className="min-w-0 flex-1"
                    value={canPowerInput}
                    onChange={(event) => setCanPowerInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addCanPowerItem();
                      }
                    }}
                    placeholder="e.g. 4 LED Bulbs, Standing Fan, 43-inch TV (Press Enter)"
                  />
                  <Button type="button" variant="outline" onClick={addCanPowerItem}>Add Appliance</Button>
                </div>
                {draft.canPower.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {draft.canPower.map((item) => (
                      <span key={item} className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-navy border border-gold/30">
                        {item}
                        <button type="button" onClick={() => removeCanPowerItem(item)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="plan-accessories" className="font-semibold text-navy">Included Accessories</Label>
                <Input
                  id="plan-accessories"
                  value={draft.accessories}
                  onChange={(event) => setDraft({ ...draft, accessories: event.target.value })}
                  placeholder="e.g. DC breaker box, 25m PV solar cable, MC4 connectors, mounting rails"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="plan-notes" className="font-semibold text-navy">Notes & Cautions</Label>
                <Textarea
                  id="plan-notes"
                  rows={2}
                  value={draft.notes}
                  onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                  placeholder="e.g. Not suitable for electric heaters, pressing irons or AC units. Requires certified installation."
                />
              </div>

              <div className="space-y-2 sm:col-span-2 rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Label htmlFor="plan-is-active" className="font-bold text-navy">Publication Status</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {draft.isActive
                        ? 'Published — Visible on homepage, solar page, and public catalog.'
                        : 'Draft / Unpublished — Hidden from public website.'}
                    </p>
                  </div>
                  <button
                    id="plan-is-active"
                    type="button"
                    role="switch"
                    aria-label="Publication status"
                    aria-checked={draft.isActive}
                    onClick={() => setDraft({ ...draft, isActive: !draft.isActive })}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      draft.isActive ? 'bg-emerald-600' : 'bg-navy/25'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        draft.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Bill of Materials Items */}
            <div className="mt-8 space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-navy">Bill of Materials / Included Items</h3>
                  <p className="text-xs text-muted-foreground">Detailed technical items that appear in the specifications breakdown.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDraft({ ...draft, items: [...draft.items, createSolarPlanItem()] })}
                  className="gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
              </div>

              <div className="space-y-2">
                {draft.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 gap-2 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_130px_80px_80px_80px_36px]">
                    <Input
                      value={item.name}
                      onChange={(event) => updateItem(item.id, 'name', event.target.value)}
                      placeholder="e.g. 1.5kW Pure Sine Wave Inverter"
                    />
                    <select
                      value={item.type}
                      onChange={(event) => updateItem(item.id, 'type', event.target.value)}
                      className="h-10 rounded-md border bg-background px-2 text-xs"
                    >
                      {itemTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      min="0"
                      value={item.volts || ''}
                      onChange={(event) => updateItem(item.id, 'volts', Number(event.target.value))}
                      placeholder="Volts"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={item.watts || ''}
                      onChange={(event) => updateItem(item.id, 'watts', Number(event.target.value))}
                      placeholder={item.type === 'battery' ? 'Ah' : 'Watts'}
                    />
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity || ''}
                      onChange={(event) => updateItem(item.id, 'quantity', Number(event.target.value))}
                      placeholder="Qty"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove included item"
                      onClick={() => setDraft({ ...draft, items: draft.items.filter((entry) => entry.id !== item.id) })}
                      disabled={draft.items.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="mt-4 text-sm font-semibold text-destructive">{error}</p>}

            <div className="mt-8 flex items-center gap-3">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-navy px-8 py-2.5 font-bold text-gold hover:bg-gold hover:text-navy"
              >
                {isSaving ? 'Saving to Database…' : editingId ? 'Update & Publish Plan' : 'Save & Publish Solar Plan'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={reset}>
                  Cancel
                </Button>
              )}
            </div>
          </form>

          {/* Saved Plans List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-navy">Published Solar Plans ({plans.length})</h2>
                <p className="text-xs text-muted-foreground">Plans currently in database and visible on the website.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void fetchPlans(true)}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Refresh
              </Button>
            </div>

            {syncError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                Database sync notice: {syncError}
              </div>
            )}

            {plans.length === 0 && (
              <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground bg-white">
                <p>No solar plans in catalog yet. Create your first plan above.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleSeedExamples()}
                  disabled={isSeeding}
                  className="mt-4 gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {isSeeding ? 'Loading…' : 'Load example plans'}
                </Button>
                <p className="mt-2 text-[11px]">Optional — you can also publish your own plans from the form.</p>
              </div>
            )}

            <div className="space-y-4">
              {plans.map((plan) => (
                <article
                  key={plan.id}
                  className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-all ${
                    editingId === plan.id ? 'ring-2 ring-gold border-gold' : 'hover:border-navy/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row">
                    {plan.image ? (
                      <img src={plan.image} alt={plan.name} className="h-32 sm:h-auto sm:w-36 object-cover bg-navy/5" />
                    ) : (
                      <div className="flex h-24 sm:h-auto sm:w-36 items-center justify-center bg-navy/5 text-navy/40 font-serif text-xs font-bold">
                        {plan.category}
                      </div>
                    )}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-3">
                        {/* min-w-0 keeps long names from pushing the action cluster off-screen */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-navy border border-gold/30">
                              {plan.category || 'Basic Plans'}
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              plan.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-navy/10 text-navy/60'
                            }`}>
                              {plan.isActive ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <h3 className="mt-1 break-words font-bold text-navy text-base">{plan.name}</h3>
                          {plan.capacity && (
                            <p className="text-xs font-semibold text-gold">{plan.capacity}</p>
                          )}
                          <p className="mt-1 text-sm font-bold text-navy">
                            {plan.price > 0 ? `₦${plan.price.toLocaleString()}` : 'Request a Quote'}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(plan)}
                            className="h-10 w-10" aria-label={`Edit ${plan.name}`}
                          >
                            <Pencil className="h-4 w-4 text-navy" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(plan.id, plan.name)}
                            className="h-10 w-10" aria-label={`Delete ${plan.name}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {plan.bestFor && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                          <strong>Best for:</strong> {plan.bestFor}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-1">
                        {plan.canPower.slice(0, 4).map((item) => (
                          <span key={item} className="rounded-full bg-navy/5 px-2 py-0.5 text-[11px] text-navy/70">
                            {item}
                          </span>
                        ))}
                        {plan.canPower.length > 4 && (
                          <span className="text-[11px] text-muted-foreground self-center">
                            +{plan.canPower.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSolarPlans;
