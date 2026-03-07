import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/services/api";
import type { Staff, StaffRole } from "@/types";

const roleLabels: Record<StaffRole, string> = {
  owner: "Владелец",
  admin: "Админ",
  cook: "Повар",
  reception: "Рецепшн",
};

const AdminStaff = () => {
  const { staff, locations, refreshData } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("cook");
  const [locationId, setLocationId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const filteredStaff = selectedLocation === "all"
    ? staff
    : staff.filter((s) => s.locationId === selectedLocation);

  const openNew = () => { setEditing(null); setName(""); setEmail(""); setPassword(""); setRole("cook"); setLocationId(locations[0]?.id || ""); setOpen(true); };
  const openEdit = (s: Staff) => { setEditing(s); setName(s.name); setEmail(s.email); setPassword(""); setRole(s.role); setLocationId(s.locationId); setOpen(true); };

  const save = async () => {
    const body = { name, email, password, role, locationId: Number(locationId) };
    try {
      if (editing) {
        await api.put(`/staff/${Number(editing.id)}`, body);
      } else {
        await api.post("/staff", body);
      }
      await refreshData();
    } catch (e) { console.error("Failed to save staff", e); }
    setOpen(false);
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/staff/${Number(id)}`);
      await refreshData();
    } catch (e) { console.error("Failed to delete staff", e); }
  };

  const getLocationName = (id: string) => locations.find((l) => l.id === id)?.name || "—";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-display text-foreground">Работники</h1>
        <Button onClick={openNew} className="rounded-full font-body gap-1"><Plus className="h-4 w-4" />Добавить</Button>
      </div>

      {/* Location filter cards */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedLocation("all")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-body text-sm whitespace-nowrap transition-colors ${
            selectedLocation === "all"
              ? "border-primary bg-primary/10 text-primary font-semibold"
              : "border-border bg-card text-muted-foreground hover:border-primary/50"
          }`}
        >
          <MapPin className="h-4 w-4" />
          Все точки
          <span className="ml-1 text-xs opacity-70">({staff.length})</span>
        </button>
        {locations.map((loc) => {
          const count = staff.filter((s) => s.locationId === loc.id).length;
          return (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(loc.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-body text-sm whitespace-nowrap transition-colors ${
                selectedLocation === loc.id
                  ? "border-primary bg-primary/10 text-primary font-semibold"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              <MapPin className="h-4 w-4" />
              {loc.name}
              <span className="ml-1 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filteredStaff.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div>
              <p className="font-body font-semibold text-foreground">{s.name}</p>
              <p className="text-sm text-muted-foreground font-body">{s.email}</p>
              <p className="text-sm text-muted-foreground font-body">{roleLabels[s.role]} · {getLocationName(s.locationId)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {filteredStaff.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-8">Нет работников</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editing ? "Редактировать" : "Новый работник"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Почта" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Пароль" type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(roleLabels) as StaffRole[]).map((r) => <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter><Button onClick={save} className="rounded-full font-body">Сохранить</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStaff;
