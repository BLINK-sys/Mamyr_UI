import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useData } from "@/contexts/DataContext";
import AddonsModal from "@/components/AddonsModal";
import type { Dish } from "@/types";
import { api } from "@/services/api";

const MenuSection = () => {
  const { categories, dishes, selectedLocation } = useData();
  const { addItem } = useCart();
  const [addonDish, setAddonDish] = useState<Dish | null>(null);

  const handleAdd = (dish: Dish) => {
    if (dish.addons.length > 0) {
      setAddonDish(dish);
    } else {
      addItem(dish);
    }
  };

  const isDishVisible = (dish: Dish) => {
    if (!dish.active) return false;
    if (selectedLocation === "all") return true;
    return dish.locationIds.includes(selectedLocation);
  };

  const isDishOnStop = (dish: Dish) => {
    if (selectedLocation === "all") return false;
    return dish.stopLocationIds.includes(selectedLocation);
  };

  const sortedCategories = [...categories].filter((c) => c.active).sort((a, b) => a.order - b.order);

  return (
    <section className="py-16 px-6 bg-background" id="menu">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary font-body">Наше меню</span>
          <h2 className="text-4xl md:text-5xl font-display text-foreground mt-3">Блюда и напитки</h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto font-body">
            Всё готовится из свежих продуктов по традиционным рецептам
          </p>
        </div>

        <div className="space-y-16">
          {sortedCategories.map((category) => {
            const categoryDishes = dishes.filter((d) => d.categoryId === category.id);
            const visibleDishes = categoryDishes.filter(isDishVisible);
            if (visibleDishes.length === 0) return null;
            return (
              <div key={category.id}>
                <h3 className="text-3xl font-display text-primary mb-8 text-center">{category.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {visibleDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-warm transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="relative overflow-hidden h-48">
                        <img src={api.fullImageUrl(dish.image)} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {dish.weight && (
                          <span className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-body px-2 py-1 rounded-full">
                            {dish.weight}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-lg font-display text-foreground">{dish.name}</h4>
                          <span className="text-lg font-bold text-primary font-body whitespace-nowrap ml-2">{dish.price} тг</span>
                        </div>
                        <p className="text-muted-foreground text-sm font-body mb-3">{dish.desc}</p>
                        {isDishOnStop(dish) ? (
                          <Button
                            size="sm"
                            disabled
                            className="w-full rounded-full font-body font-semibold gap-1 bg-destructive text-destructive-foreground opacity-90 cursor-not-allowed"
                          >
                            СТОП
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleAdd(dish)}
                            size="sm"
                            className="w-full rounded-full font-body font-semibold gap-1"
                          >
                            <Plus className="h-4 w-4" />
                            Добавить
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddonsModal dish={addonDish} open={!!addonDish} onClose={() => setAddonDish(null)} />
    </section>
  );
};

export default MenuSection;
