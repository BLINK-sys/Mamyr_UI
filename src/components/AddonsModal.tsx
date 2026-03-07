import { useState } from "react";
import type { Dish, Addon } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";

interface Props {
  dish: Dish | null;
  open: boolean;
  onClose: () => void;
}

const AddonsModal = ({ dish, open, onClose }: Props) => {
  const [selected, setSelected] = useState<Addon[]>([]);
  const { addItem } = useCart();

  if (!dish) return null;

  const toggle = (addon: Addon) => {
    setSelected((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const handleAdd = () => {
    addItem(dish, selected);
    setSelected([]);
    onClose();
  };

  const addonTotal = selected.reduce((s, a) => s + a.price, 0);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setSelected([]); onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{dish.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 mb-4">
          <p className="text-sm text-muted-foreground font-body">{dish.desc}</p>
          <p className="text-xs text-muted-foreground font-body">Состав: {dish.ingredients || "—"}</p>
          <p className="text-primary font-bold font-body">{dish.price} тг · {dish.weight}</p>
        </div>

        {dish.addons.length > 0 && (
          <div>
            <p className="text-sm font-semibold font-body mb-2">Добавки:</p>
            <div className="space-y-2">
              {dish.addons.map((addon) => (
                <label key={addon.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <Checkbox
                    checked={!!selected.find((a) => a.id === addon.id)}
                    onCheckedChange={() => toggle(addon)}
                  />
                  <span className="flex-1 text-sm font-body">{addon.name}</span>
                  <span className="text-sm text-primary font-body font-semibold">
                    {addon.price > 0 ? `+${addon.price} тг` : "бесплатно"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleAdd} className="w-full rounded-full font-body font-semibold">
            Добавить · {dish.price + addonTotal} тг
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddonsModal;
