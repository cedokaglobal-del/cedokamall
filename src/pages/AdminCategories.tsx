import { useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DEFAULT_CATEGORY_NAMES } from '@/data/products';
import { useCategoryStore } from '@/store/categoryStore';
import { useSolarCategoryStore } from '@/store/solarCategoryStore';
import { useProductStore } from '@/store/productStore';
import { Pencil, Plus, Trash2, FolderOpen, Sun, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface PendingDelete {
  section: 'general' | 'solar';
  name: string;
  count: number;
}

const AdminCategories = () => {
  const generalCategories = useCategoryStore((s) => s.categories);
  const addGeneral = useCategoryStore((s) => s.addCategory);
  const renameGeneral = useCategoryStore((s) => s.renameCategory);
  const removeGeneral = useCategoryStore((s) => s.removeCategory);

  const solarCategories = useSolarCategoryStore((s) => s.categories);
  const addSolar = useSolarCategoryStore((s) => s.addCategory);
  const renameSolar = useSolarCategoryStore((s) => s.renameCategory);
  const removeSolar = useSolarCategoryStore((s) => s.removeCategory);

  const products = useProductStore((s) => s.products);

  const [newGeneral, setNewGeneral] = useState('');
  const [newSolar, setNewSolar] = useState('');
  const [editing, setEditing] = useState<{ section: 'general' | 'solar'; oldName: string; value: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [blockedDelete, setBlockedDelete] = useState<PendingDelete | null>(null);

  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      const key = p.category?.trim();
      if (!key) continue;
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [products]);

  const isProtectedGeneral = (name: string) => DEFAULT_CATEGORY_NAMES.includes(name);
  const isProtectedSolar = (name: string) => name === 'Solar Accessories';

  const handleAdd = (section: 'general' | 'solar') => {
    const raw = section === 'general' ? newGeneral : newSolar;
    const name = raw.trim();
    if (!name) {
      toast.error('Enter a category name first.');
      return;
    }
    const list = section === 'general' ? generalCategories : solarCategories;
    if (list.some((c) => c.toLowerCase() === name.toLowerCase())) {
      toast.error(`"${name}" already exists in this section.`);
      return;
    }
    if (section === 'general') {
      addGeneral(name);
      setNewGeneral('');
    } else {
      addSolar(name);
      setNewSolar('');
    }
    toast.success(`Category "${name}" created.`);
  };

  const handleRename = () => {
    if (!editing) return;
    const value = editing.value.trim();
    if (!value) {
      toast.error('Category name cannot be empty.');
      return;
    }
    const list = editing.section === 'general' ? generalCategories : solarCategories;
    if (list.some((c) => c.toLowerCase() === value.toLowerCase() && c !== editing.oldName)) {
      toast.error(`"${value}" already exists. Choose a different name.`);
      return;
    }
    if (editing.section === 'general') renameGeneral(editing.oldName, value);
    else renameSolar(editing.oldName, value);
    toast.success(`Renamed to "${value}".`);
    setEditing(null);
  };

  const requestDelete = (section: 'general' | 'solar', name: string) => {
    const count = productCounts[name] || 0;
    const candidate: PendingDelete = { section, name, count };
    const protectedCategory =
      section === 'general' ? isProtectedGeneral(name) : isProtectedSolar(name);
    // Task 7: never delete a category that has products or is protected.
    if (protectedCategory || count > 0) {
      setBlockedDelete(candidate);
      return;
    }
    setPendingDelete(candidate);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.section === 'general') removeGeneral(pendingDelete.name);
    else removeSolar(pendingDelete.name);
    toast.success(`Category "${pendingDelete.name}" deleted.`);
    setPendingDelete(null);
  };

  const renderSection = (
    section: 'general' | 'solar',
    title: string,
    description: string,
    icon: typeof FolderOpen,
    list: string[],
    newValue: string,
    setNewValue: (v: string) => void
  ) => {
    const Icon = icon;
    return (
      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-gold">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-bold text-navy">{title}</h2>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mt-4">
          <Label className="text-xs mb-2 block">Add new category</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Home Appliances"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd(section);
                }
              }}
            />
            <Button size="sm" onClick={() => handleAdd(section)} className="gap-1.5 shrink-0">
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </div>
        </div>

        <ul className="mt-4 divide-y rounded-lg border">
          {list.map((name) => {
            const count = productCounts[name] || 0;
            const isProtected =
              section === 'general' ? isProtectedGeneral(name) : isProtectedSolar(name);
            const isEditingThis =
              editing?.section === section && editing.oldName === name;
            return (
              <li key={name} className="flex items-center gap-2 p-2.5">
                <div className="min-w-0 flex-1">
                  {isEditingThis ? (
                    <div className="flex gap-2">
                      <Input
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleRename();
                          }
                        }}
                        autoFocus
                      />
                      <Button size="sm" onClick={handleRename}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-sm truncate">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        {count} product{count === 1 ? '' : 's'}
                        {isProtected && ' • Built-in'}
                      </p>
                    </>
                  )}
                </div>
                {!isEditingThis && (
                  <div className="flex shrink-0 gap-1">
                    {!isProtected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditing({ section, oldName: name, value: name })}
                        aria-label={`Rename ${name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => requestDelete(section, name)}
                      aria-label={`Delete ${name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy">Categories</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create, rename or delete product categories. Categories with products cannot be deleted.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {renderSection(
            'general',
            'General Categories',
            'Used across the main shop catalog.',
            FolderOpen,
            generalCategories,
            newGeneral,
            setNewGeneral
          )}
          {renderSection(
            'solar',
            'Solar Categories',
            'Used on the Solar Energy page.',
            Sun,
            solarCategories,
            newSolar,
            setNewSolar
          )}
        </div>
      </div>

      {/* Confirm delete (only reachable when category is empty & not protected) */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete <strong>"{pendingDelete?.name}"</strong>. This category has no
              products, so it is safe to remove. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Blocked delete notice (Task 6 & 7) */}
      <AlertDialog open={!!blockedDelete} onOpenChange={(open) => !open && setBlockedDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
              Cannot delete this category
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                <strong>"{blockedDelete?.name}"</strong>{' '}
                {(blockedDelete?.count || 0) > 0 ? (
                  <>
                    already has <strong>{blockedDelete?.count} product{blockedDelete && blockedDelete.count === 1 ? '' : 's'}</strong> under
                    it. Move or delete those products first, or rename the category instead.
                  </>
                ) : (
                  <>
                    is a built-in category and cannot be deleted. You can rename custom categories, but
                    built-in ones stay to keep the storefront working.
                  </>
                )}
              </p>
              <p className="text-xs">
                Tip: use the Products page to filter by this category and re-assign its products before
                trying again.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogAction>Understood</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminCategories;
