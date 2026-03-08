import { useState, useRef, useEffect, useCallback } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil, Upload, X, Link, ClipboardPaste, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageMode, setImageMode] = useState<"file" | "url">("file");
  const [active, setActive] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setName(""); setDesc(""); setIngredients(""); setPrice(0); setWeight("");
    setImage(""); setImageUrl(""); setImagePreview(""); setImageFile(null); setImageMode("file");
    setActive(true); setCategoryId(""); setLocationIds([]); setAddons([]);
  };

  const openNew = () => { setEditing(null); reset(); setCategoryId(categories[0]?.id || ""); setOpen(true); };
  const openEdit = (d: Dish) => {
    setEditing(d); setName(d.name); setDesc(d.desc); setIngredients(d.ingredients); setPrice(d.price);
    setWeight(d.weight); setImage(d.image); setImageUrl(""); setImageFile(null); setImageMode("file");
    setImagePreview(d.image ? api.fullImageUrl(d.image) : "");
    setActive(d.active); setCategoryId(d.categoryId); setLocationIds(d.locationIds); setAddons(d.addons);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageUrl("");
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    setImage("");
    setImageUrl("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!open) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setImageUrl("");
        setImageMode("file");
        return;
      }
    }
  }, [open]);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        name, desc, ingredients, price, weight,
        image: image || "",
        active,
        categoryId: Number(categoryId),
        locationIds: locationIds.map(Number),
        addons: addons.map((a) => ({ name: a.name, price: a.price })),
      };

      let savedDish: any;
      if (editing) {
        savedDish = await api.put(`/dishes/${Number(editing.id)}`, body);
      } else {
        savedDish = await api.post("/dishes", body);
      }

      const dishId = savedDish.id;
      const catId = Number(categoryId);

      let finalImageUrl = image;
      if (imageFile) {
        finalImageUrl = await api.uploadDishImage(imageFile, catId, dishId);
      } else if (imageUrl.trim() && imageUrl !== image) {
        finalImageUrl = await api.uploadDishImageUrl(imageUrl, catId, dishId);
      } else if (!image && !imageFile && !imageUrl.trim() && editing?.image) {
        await api.deleteDishImage(catId, dishId);
        finalImageUrl = "";
      }

      if (finalImageUrl !== body.image) {
        await api.put(`/dishes/${dishId}`, { ...body, image: finalImageUrl });
      }

      await refreshData();
    } catch (e) { console.error("Failed to save dish", e); }
    setSaving(false);
    setOpen(false);
  };

  const toggleActive = async (dish: Dish) => {
    try {
      await api.put(`/dishes/${Number(dish.id)}`, {
        name: dish.name, desc: dish.desc, ingredients: dish.ingredients,
        price: dish.price, weight: dish.weight, image: dish.image,
        active: !dish.active,
        categoryId: Number(dish.categoryId),
        locationIds: dish.locationIds.map(Number),
        addons: dish.addons.map((a) => ({ name: a.name, price: a.price })),
      });
      await refreshData();
    } catch (e) { console.error("Failed to toggle active", e); }
  };

  const remove = async (id: string) => {
    const dish = dishes.find((d) => d.id === id);
    try {
      if (dish?.image && dish.image.includes("/dish-image/")) {
        await api.deleteDishImage(Number(dish.categoryId), Number(id));
      }
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
            {dish.image ? (
              <img src={api.fullImageUrl(dish.image)} alt={dish.name} className="w-14 h-14 rounded-lg object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs font-body">нет</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-body font-semibold text-foreground truncate">{dish.name}</p>
                {!dish.active && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-body shrink-0">неактивно</span>}
                {dish.stopLocationIds.length > 0 && <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full font-body shrink-0">стоп</span>}
              </div>
              <p className="text-xs text-muted-foreground font-body">{getCategoryName(dish.categoryId)} · {dish.price} тг · {dish.weight}</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={dish.active} onCheckedChange={() => toggleActive(dish)} />
              <Button variant="ghost" size="icon" onClick={() => openEdit(dish)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(dish.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader><DialogTitle className="font-display">{editing ? "Редактировать блюдо" : "Новое блюдо"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: image, name, description, ingredients, price/weight */}
            <div className="space-y-4">
              {/* Image section */}
              <div>
                <p className="text-sm font-body font-semibold mb-2">Изображение</p>

                {imagePreview && (
                  <div className="relative mb-3 inline-block">
                    <img src={imagePreview} alt="Превью" className="w-full max-w-[200px] h-32 object-cover rounded-lg border border-border" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={clearImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant={imageMode === "file" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setImageMode("file")}
                    className="gap-1"
                  >
                    <Upload className="h-3.5 w-3.5" />С компьютера
                  </Button>
                  <Button
                    type="button"
                    variant={imageMode === "url" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setImageMode("url")}
                    className="gap-1"
                  >
                    <Link className="h-3.5 w-3.5" />По URL
                  </Button>
                </div>

                {imageMode === "file" ? (
                  <div className="space-y-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-muted-foreground font-body
                        file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0
                        file:text-sm file:font-semibold file:bg-primary/10 file:text-primary
                        hover:file:bg-primary/20 file:cursor-pointer cursor-pointer"
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                      <ClipboardPaste className="h-3.5 w-3.5" />
                      <span>Или вставьте скриншот из буфера (Ctrl+V)</span>
                    </div>
                  </div>
                ) : (
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (e.target.value.trim()) setImagePreview(e.target.value);
                    }}
                  />
                )}
              </div>

              <Input placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} />
              <Textarea placeholder="Описание" value={desc} onChange={(e) => setDesc(e.target.value)} />
              <Textarea placeholder="Состав" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Цена" value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} />
                <Input placeholder="Граммовка" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
            </div>

            {/* Right column: active, category, locations, addons */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                <div className="flex items-center gap-2">
                  {active ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm font-body font-semibold">{active ? "Активно" : "Скрыто"}</span>
                </div>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
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
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving} className="rounded-full font-body">
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDishes;
