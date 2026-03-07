import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { api } from "@/services/api";
import type { Banner } from "@/types";

const AdminBanners = () => {
  const { banners, refreshData } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [order, setOrder] = useState(1);

  const openNew = () => { setEditing(null); setTitle(""); setSubtitle(""); setImage(""); setOrder(banners.length + 1); setOpen(true); };
  const openEdit = (b: Banner) => { setEditing(b); setTitle(b.title); setSubtitle(b.subtitle); setImage(b.image); setOrder(b.order); setOpen(true); };

  const save = async () => {
    const body = { title, subtitle, image: image || editing?.image || "", order };
    try {
      if (editing) {
        await api.put(`/banners/${Number(editing.id)}`, body);
      } else {
        await api.post("/banners", body);
      }
      await refreshData();
    } catch (e) { console.error("Failed to save banner", e); }
    setOpen(false);
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/banners/${Number(id)}`);
      await refreshData();
    } catch (e) { console.error("Failed to delete banner", e); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-foreground">Баннеры</h1>
        <Button onClick={openNew} className="rounded-full font-body gap-1"><Plus className="h-4 w-4" />Добавить</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...banners].sort((a, b) => a.order - b.order).map((banner) => (
          <div key={banner.id} className="relative rounded-xl overflow-hidden border border-border">
            <img src={banner.image} alt={banner.title} className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-background/60 flex items-end p-4">
              <div className="flex-1">
                <p className="font-display text-lg text-foreground">{banner.title}</p>
                <p className="text-sm text-muted-foreground font-body">{banner.subtitle}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(banner)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(banner.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editing ? "Редактировать" : "Новый баннер"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Заголовок" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Подзаголовок" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            <Input placeholder="URL изображения" value={image} onChange={(e) => setImage(e.target.value)} />
            <Input type="number" placeholder="Порядок" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
          </div>
          <DialogFooter><Button onClick={save} className="rounded-full font-body">Сохранить</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBanners;
