import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { api } from "@/services/api";
import { Ban, CheckCircle } from "lucide-react";

interface StopListSheetProps {
  open: boolean;
  onClose: () => void;
  locationId: string;
}

const StopListSheet = ({ open, onClose, locationId }: StopListSheetProps) => {
  const { categories, dishes, toggleDishStop } = useData();
  const [loading, setLoading] = useState<string | null>(null);

  const locationDishes = dishes.filter(
    (d) => d.active && d.locationIds.includes(locationId)
  );

  const sortedCategories = [...categories]
    .filter((c) => c.active)
    .sort((a, b) => a.order - b.order)
    .filter((cat) => locationDishes.some((d) => d.categoryId === cat.id));

  const handleToggle = async (dishId: string) => {
    setLoading(dishId);
    await toggleDishStop(dishId, locationId);
    setLoading(null);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="left" className="w-full sm:max-w-full flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="font-display flex items-center gap-2">
            <Ban className="h-5 w-5 text-destructive" />
            Стоп-лист
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {sortedCategories.map((cat) => {
            const catDishes = locationDishes.filter((d) => d.categoryId === cat.id);
            return (
              <div key={cat.id}>
                <h3 className="font-display text-lg text-foreground mb-3">{cat.title}</h3>
                <div className="space-y-2">
                  {catDishes.map((dish) => {
                    const onStop = dish.stopLocationIds.includes(locationId);
                    return (
                      <div
                        key={dish.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                          onStop
                            ? "border-destructive/40 bg-destructive/10"
                            : "border-border bg-card"
                        }`}
                      >
                        {dish.image ? (
                          <img
                            src={api.fullImageUrl(dish.image)}
                            alt={dish.name}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-body font-semibold text-foreground truncate">{dish.name}</p>
                          <p className="text-xs text-muted-foreground font-body">{dish.price} тг</p>
                        </div>
                        <Button
                          size="sm"
                          variant={onStop ? "outline" : "destructive"}
                          className="shrink-0 rounded-full font-body gap-1"
                          disabled={loading === dish.id}
                          onClick={() => handleToggle(dish.id)}
                        >
                          {onStop ? (
                            <><CheckCircle className="h-3.5 w-3.5" />Снять</>
                          ) : (
                            <><Ban className="h-3.5 w-3.5" />На стоп</>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {locationDishes.length === 0 && (
            <p className="text-center text-muted-foreground font-body py-12">
              Нет блюд для этой точки
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StopListSheet;
