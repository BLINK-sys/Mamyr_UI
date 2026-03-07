import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/services/api";
import type { Dish, Addon } from "@/types";

const AdminDishes = () => {
  const { dishes, categories, locations, refreshData } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Dish | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>("all");

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [price, setPrice] = useState(0);
  const [weight, setWeight] = useState("");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState(0);

  const reset = () => {
    setName(""); setDesc(""); setIngredients(""); setPrice(0); setWeight(""); setImage(""); setCategoryId(""); setLocationIds([]); setAddons([]);
  };

  const openNew = () => { setEditing(null); reset(); setCategoryId(categories[0]?.id || ""); setOpen(true); };
  const openEdit = (d: Dish) => {
    setEditing(d); setName(d.name); setDesc(d.desc); setIngredients(d.ingredients); setPrice(d.price);
    setWeight(d.weight); setImage(d.image); setCategoryId(d.categoryId); setLocationIds(d.locationIds); setAddons(d.addons);
    setOpen(true);
  };

  const toggleLocation = (id: string) => {
    setLocationIds((prev) => prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]);
  };

  const addAddon = () => {
    if (!newAddonName.trim()) return;
    setAddons((prev) => [...prev, { id: "addon" + Date.now(), name: newAddonName, price: newAddonPrice }]);
    setNewAddonName(""); setNewAddonPrice(0);
  };

  const removeAddon = (id: string) => setAddons((prev) => prev.filter((a) => a.id !== id));

  const save = async () => {
    const body = {
      name, desc, ingredients, price, weight,
      image: image || editing?.image || "",
      categoryId: Number(categoryId),
      locationIds: locationIds.map(Number),
      addons: addons.map((a) => ({ name: a.name, price: a.price })),
    };
    try {
      if (editing) {
        await api.put(`/dishes/${Number(editing.id)}`, body);
      } else {
        await api.post("/dishes", body);
      }
      await refreshData();
    } catch (e) { console.error("Failed to save dish", e); }
    setOpen(false);
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/dishes/${Number(id)}`);
      await refreshData();
    } catch (e) { console.error("Failed to delete dish", e); }
  };

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.title || "—";

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
  const filteredDishes = selectedCat === "all" ? dishes : dishes.filter((d) => d.categoryId === selectedCat);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-display text-foreground">Блюда</h1>
        <Button onClick={openNew} className="rounded-full font-body gap-1"><Plus className="h-4 w-4" />Добавить</Button>
      </div>

      {/* Category filter cards */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        <button
          onClick={() => setSelectedCat("all")}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-body font-semibold border transition-colors ${selectedCat === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"}`}
        >
          Все ({dishes.length})
        </button>
        {sortedCategories.map((cat) => {
          const count = dishes.filter((d) => d.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-body font-semibold border transition-colors ${selectedCat === cat.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"}`}
            >
              {cat.title} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filteredDishes.map((dish) => (
          <div key={dish.id} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
            <img src={dish.image} alt={dish.name} className="w-14 h-14 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-foreground truncate">{dish.name}</p>
              <p className="text-xs text-muted-foreground font-body">{getCategoryName(dish.categoryId)} · {dish.price} тг · {dish.weight}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => openEdit(dish)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(dish.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle className="font-display">{editing ? "Редактировать блюдо" : "Новое блюдо"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea placeholder="Описание" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <Textarea placeholder="Состав" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Цена" value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} />
              <Input placeholder="Граммовка" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <Input placeholder="URL изображения" value={image} onChange={(e) => setImage(e.target.value)} />
            <div>
              <p className="text-sm font-body font-semibold mb-2">Категория</p>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-body font-semibold mb-2">Точки</p>
              <div className="space-y-2">
                {locations.map((loc) => (
                  <label key={loc.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={locationIds.includes(loc.id)} onCheckedChange={() => toggleLocation(loc.id)} />
                    <span className="text-sm font-body">{loc.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-body font-semibold mb-2">Добавки</p>
              <div className="space-y-2 mb-3">
                {addons.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
                    <span className="text-sm font-body">{a.name} — {a.price} тг</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeAddon(a.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Название" value={newAddonName} onChange={(e) => setNewAddonName(e.target.value)} className="flex-1" />
                <Input type="number" placeholder="Цена" value={newAddonPrice || ""} onChange={(e) => setNewAddonPrice(Number(e.target.value))} className="w-24" />
                <Button variant="outline" size="sm" onClick={addAddon}>+</Button>
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={save} className="rounded-full font-body">Сохранить</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDishes;
