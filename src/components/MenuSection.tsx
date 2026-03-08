import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useData } from "@/contexts/DataContext";
import AddonsModal from "@/components/AddonsModal";
import ComboModal from "@/components/ComboModal";
import type { Dish } from "@/types";
import { api } from "@/services/api";

const scrollToCategory = (id: string) => {
  const el = document.getElementById(`cat-${id}`);
  if (!el) return;
  const navbarH = 64;
  const stickyNavH = 52;
  const top = el.getBoundingClientRect().top + window.scrollY - navbarH - stickyNavH - 16;
  window.scrollTo({ top, behavior: "smooth" });
};

const MenuSection = () => {
  const { categories, dishes, selectedLocation } = useData();
  const { addItem, items } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const navRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const isInCart = (dishId: string) => items.some((i) => i.dish.id === dishId);
  const [addonDish, setAddonDish] = useState<Dish | null>(null);
  const [comboDish, setComboDish] = useState<Dish | null>(null);

  const handleAdd = (dish: Dish) => {
    if (dish.isCombo) {
      setComboDish(dish);
    } else if (dish.addons.length > 0) {
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

  const visibleCategoryIds = sortedCategories
    .filter((c) => dishes.filter((d) => d.categoryId === c.id).filter(isDishVisible).length > 0)
    .map((c) => c.id);

  useEffect(() => {
    if (visibleCategoryIds.length === 0) return;
    if (!activeCategory) setActiveCategory(visibleCategoryIds[0]);

    observerRef.current?.disconnect();
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id.replace("cat-", "");
          setActiveCategory(id);
          const btn = navRef.current?.querySelector(`[data-cat="${id}"]`) as HTMLElement | null;
          btn?.scrollIntoView({ inline: "nearest", block: "nearest" });
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    visibleCategoryIds.forEach((id) => {
      const el = document.getElementById(`cat-${id}`);
      if (el) observer.observe(el);
    });
    observerRef.current = observer;
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCategoryIds.join(",")]);

  return (
    <section className="bg-background" id="menu">
      {/* Sticky category nav */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div
          ref={navRef}
          className="container mx-auto px-6 flex gap-2 overflow-x-auto py-3 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {sortedCategories
            .filter((c) => visibleCategoryIds.includes(c.id))
            .map((c) => (
              <button
                key={c.id}
                data-cat={c.id}
                onClick={() => scrollToCategory(c.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-body font-semibold transition-colors flex-shrink-0 ${
                  activeCategory === c.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.title}
              </button>
            ))}
        </div>
      </div>

      <div className="py-16 px-6">
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
              <div key={category.id} id={`cat-${category.id}`}>
                <h3 className="text-3xl font-display text-primary mb-8 text-center">{category.title}</h3>
                <div className="flex flex-wrap justify-center gap-5">
                  {visibleDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-warm transition-all duration-300 hover:-translate-y-1 w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] xl:w-[calc(25%-15px)] flex flex-col"
                    >
                      <div className="relative overflow-hidden aspect-[4/3] w-full bg-card">
                        <img src={api.fullImageUrl(dish.image)} alt={dish.name} className="absolute inset-0 w-full h-full object-fill group-hover:scale-105 transition-transform duration-500" />
                        {dish.weight && (
                          <span className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-body px-2 py-1 rounded-full">
                            {dish.weight}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-lg font-display text-foreground">{dish.name}</h4>
                          <span className="text-lg font-bold text-primary font-body whitespace-nowrap ml-2">{dish.price} тг</span>
                        </div>
                        <p className="text-muted-foreground text-sm font-body mb-3">{dish.desc}</p>
                        <div className="mt-auto">
                          {isDishOnStop(dish) ? (
                            <Button
                              size="sm"
                              disabled
                              className="w-full rounded-full font-body font-semibold gap-1 bg-destructive text-destructive-foreground opacity-90 cursor-not-allowed"
                            >
                              СТОП
                            </Button>
                          ) : isInCart(dish.id) ? (
                            <Button
                              onClick={() => handleAdd(dish)}
                              size="sm"
                              variant="outline"
                              className="w-full rounded-full font-body font-semibold border-primary text-primary hover:bg-primary/10"
                            >
                              В корзине
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
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>

      <AddonsModal dish={addonDish} open={!!addonDish} onClose={() => setAddonDish(null)} />
      <ComboModal dish={comboDish} open={!!comboDish} onClose={() => setComboDish(null)} />
    </section>
  );
};

export default MenuSection;
