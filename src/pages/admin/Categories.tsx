import { useState, useCallback } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Pencil, GripVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { api } from "@/services/api";
import type { Category } from "@/types";

const AdminCategories = () => {
  const { categories, setCategories, refreshData } = useData();
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const sorted = [...categories].sort((a, b) => a.order - b.order);

  const openNew = () => { setEditing(null); setTitle(""); setOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setTitle(c.title); setOpen(true); };

  const save = async () => {
    try {
      if (editing) {
        await api.put(`/categories/${Number(editing.id)}`, { title, order: editing.order, active: editing.active });
      } else {
        const maxOrder = categories.reduce((m, c) => Math.max(m, c.order), 0);
        await api.post("/categories", { title, order: maxOrder + 1, active: true });
      }
      await refreshData();
    } catch (e) { console.error("Failed to save category", e); }
    setOpen(false);
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/categories/${Number(id)}`);
      await refreshData();
    } catch (e) { console.error("Failed to delete category", e); }
  };

  const toggleActive = async (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    try {
      await api.put(`/categories/${Number(id)}`, { title: cat.title, order: cat.order, active: !cat.active });
      await refreshData();
    } catch (e) { console.error("Failed to toggle category", e); }
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);

  const handleDragOver = useCallback((e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) return;
    const newSorted = [...sorted];
    const [moved] = newSorted.splice(dragIdx, 1);
    newSorted.splice(targetIdx, 0, moved);
    const reordered = newSorted.map((c, i) => ({ ...c, order: i + 1 }));
    setCategories(reordered);
    setDragIdx(targetIdx);
  }, [dragIdx, sorted, setCategories]);

  const handleDragEnd = async () => {
    setDragIdx(null);
    try {
      await Promise.all(sorted.map((c) => api.put(`/categories/${Number(c.id)}`, { title: c.title, order: c.order, active: c.active })));
    } catch (e) { console.error("Failed to reorder categories", e); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-foreground">Разделы</h1>
        <Button onClick={openNew} className="rounded-full font-body gap-1"><Plus className="h-4 w-4" />Добавить</Button>
      </div>
      <div className="space-y-3">
        {sorted.map((cat, idx) => (
          <div
            key={cat.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            className={`flex items-center justify-between p-4 bg-card rounded-xl border border-border cursor-grab active:cursor-grabbing transition-opacity ${dragIdx === idx ? "opacity-50" : ""} ${!cat.active ? "opacity-60" : ""}`}
          >
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-body">#{cat.order}</span>
              <p className="font-body font-semibold text-foreground">{cat.title}</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={cat.active} onCheckedChange={() => toggleActive(cat.id)} />
              <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(cat.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editing ? "Редактировать" : "Новый раздел"}</DialogTitle></DialogHeader>
          <Input placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} />
          <DialogFooter><Button onClick={save} className="rounded-full font-body">Сохранить</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
