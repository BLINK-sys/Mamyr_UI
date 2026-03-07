import { useState, useCallback } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Pencil, GripVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { Category } from "@/types";

const AdminCategories = () => {
  const { categories, setCategories } = useData();
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const sorted = [...categories].sort((a, b) => a.order - b.order);

  const openNew = () => { setEditing(null); setTitle(""); setOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setTitle(c.title); setOpen(true); };

  const save = () => {
    if (editing) {
      setCategories((prev) => prev.map((c) => c.id === editing.id ? { ...c, title } : c));
    } else {
      const maxOrder = categories.reduce((m, c) => Math.max(m, c.order), 0);
      setCategories((prev) => [...prev, { id: "cat" + Date.now(), title, order: maxOrder + 1, active: true }]);
    }
    setOpen(false);
  };

  const remove = (id: string) => setCategories((prev) => prev.filter((c) => c.id !== id));

  const toggleActive = (id: string) => {
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c));
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

  const handleDragEnd = () => setDragIdx(null);

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
