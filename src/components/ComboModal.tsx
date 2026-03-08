import { useState } from "react";
import type { Dish } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";
import { useData } from "@/contexts/DataContext";
import { api } from "@/services/api";

interface Props {
  dish: Dish | null;
  open: boolean;
  onClose: () => void;
}

const ComboModal = ({ dish, open, onClose }: Props) => {
  const [selected, setSelected] = useState<{ id: string; name: string }[]>([]);
  const { addItem } = useCart();
  const { dishes } = useData();

  if (!dish) return null;

  const min = dish.comboMin ?? 1;
  const max = dish.comboMax ?? 4;
  const comboItems = dishes.filter((d) => (dish.comboItemIds || []).includes(d.id));

  const toggle = (item: Dish) => {
    setSelected((prev) => {
      const exists = prev.find((s) => s.id === item.id);
      if (exists) return prev.filter((s) => s.id !== item.id);
      if (prev.length >= max) return prev;
      return [...prev, { id: item.id, name: item.name }];
    });
  };

  const canAdd = selected.length >= min && selected.length <= max;

  const handleAdd = () => {
    addItem(dish, [], selected);
    setSelected([]);
    onClose();
  };

  const handleClose = () => {
    setSelected([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{dish.name}</DialogTitle>
        </DialogHeader>

        {dish.image && (
          <img
            src={api.fullImageUrl(dish.image)}
            alt={dish.name}
            className="w-full h-40 object-cover rounded-lg"
          />
        )}

        <div className="space-y-1 mb-2">
          <p className="text-primary font-bold font-body text-lg">{dish.price} тг</p>
          {dish.desc && <p className="text-sm text-muted-foreground font-body">{dish.desc}</p>}
        </div>

        <div>
          <p className="text-sm font-semibold font-body mb-1">Модификаторы</p>
          <p className="text-xs text-muted-foreground font-body mb-3">
            минимум: {min} · максимум: {max} · выбрано: {selected.length}
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {comboItems.map((item) => {
              const isSelected = !!selected.find((s) => s.id === item.id);
              const isDisabled = !isSelected && selected.length >= max;
              return (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-accent/50"
                  } ${isSelected ? "bg-accent/40" : ""}`}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => !isDisabled && toggle(item)}
                  />
                  {item.image && (
                    <img src={api.fullImageUrl(item.image)} alt={item.name} className="w-10 h-10 rounded object-cover" />
                  )}
                  <span className="flex-1 text-sm font-body">{item.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAdd}
            disabled={!canAdd}
            className="w-full rounded-full font-body font-semibold"
          >
            Добавить · {dish.price} тг
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComboModal;
