import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useData } from "@/contexts/DataContext";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

const CartDrawer = () => {
  const { items, updateQuantity, removeItem, clearCart, total, isOpen, setIsOpen } = useCart();
  const { refreshData } = useData();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleOrder = async () => {
    if (!name.trim() || !phone.trim()) {
      toast({ title: "Заполните имя и телефон", variant: "destructive" });
      return;
    }
    try {
      await api.post("/orders", {
        customerName: name,
        customerPhone: phone,
        total,
        items: items.map((i) => ({
          dishId: Number(i.dish.id),
          dishName: i.dish.name,
          dishPrice: i.dish.price,
          quantity: i.quantity,
          addons: i.selectedAddons.map((a) => ({ name: a.name, price: a.price })),
        })),
      });
      await refreshData();
      clearCart();
      setName("");
      setPhone("");
      setIsOpen(false);
      toast({ title: "Заказ оформлен!", description: "Мы скоро свяжемся с вами" });
    } catch (e) {
      toast({ title: "Ошибка при оформлении заказа", variant: "destructive" });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Корзина
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground font-body">
            Корзина пуста
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 py-4">
              {items.map((item, idx) => (
                <div key={item.dish.id + idx} className="flex gap-3 p-3 bg-card rounded-xl">
                  <img src={api.fullImageUrl(item.dish.image)} alt={item.dish.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm truncate">{item.dish.name}</h4>
                    {item.selectedAddons.length > 0 && (
                      <p className="text-xs text-muted-foreground font-body truncate">
                        + {item.selectedAddons.map((a) => a.name).join(", ")}
                      </p>
                    )}
                    {item.comboSelections && item.comboSelections.length > 0 && (
                      <p className="text-xs text-muted-foreground font-body line-clamp-2">
                        {item.comboSelections.map((c) => c.name).join(", ")}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-body font-semibold w-5 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary font-body">
                          {(item.dish.price + item.selectedAddons.reduce((s, a) => s + a.price, 0)) * item.quantity} тг
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.dish.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <Input placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} className="font-body" />
              <Input placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} className="font-body" />
              <div className="flex items-center justify-between">
                <span className="text-lg font-display">Итого:</span>
                <span className="text-xl font-bold text-primary font-body">{total} тг</span>
              </div>
              <Button onClick={handleOrder} className="w-full rounded-full font-body font-semibold text-lg py-6">
                Оформить заказ
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
