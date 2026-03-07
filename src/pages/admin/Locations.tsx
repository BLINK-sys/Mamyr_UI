import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { api } from "@/services/api";
import type { Location } from "@/types";

const AdminLocations = () => {
  const { locations, refreshData } = useData();
  const [editing, setEditing] = useState<Location | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const openNew = () => { setEditing(null); setName(""); setAddress(""); setOpen(true); };
  const openEdit = (loc: Location) => { setEditing(loc); setName(loc.name); setAddress(loc.address); setOpen(true); };

  const save = async () => {
    try {
      if (editing) {
        await api.put(`/locations/${Number(editing.id)}`, { name, address });
      } else {
        await api.post("/locations", { name, address });
      }
      await refreshData();
    } catch (e) { console.error("Failed to save location", e); }
    setOpen(false);
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/locations/${Number(id)}`);
      await refreshData();
    } catch (e) { console.error("Failed to delete location", e); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-foreground">Точки</h1>
        <Button onClick={openNew} className="rounded-full font-body gap-1"><Plus className="h-4 w-4" />Добавить</Button>
      </div>
      <div className="space-y-3">
        {locations.map((loc) => (
          <div key={loc.id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div>
              <p className="font-body font-semibold text-foreground">{loc.name}</p>
              <p className="text-sm text-muted-foreground font-body">{loc.address}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => openEdit(loc)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(loc.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editing ? "Редактировать" : "Новая точка"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Адрес" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <DialogFooter><Button onClick={save} className="rounded-full font-body">Сохранить</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLocations;
