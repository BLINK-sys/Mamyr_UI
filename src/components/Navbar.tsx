import { UtensilsCrossed, ShoppingBag, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useData } from "@/contexts/DataContext";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Navbar = () => {
  const { itemCount, setIsOpen } = useCart();
  const { locations, selectedLocation, setSelectedLocation } = useData();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="text-xl font-display text-foreground">Mamyr <span className="text-primary">КАФЕ</span></span>
          </Link>
          <div className="hidden sm:block">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[180px] h-9 rounded-full border-border/50 bg-muted/50 text-sm font-body">
                <MapPin className="h-3.5 w-3.5 text-primary mr-1" />
                <SelectValue placeholder="Все точки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все точки</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-body font-medium text-muted-foreground">
          <a href="#menu" className="hover:text-primary transition-colors">Меню</a>
          <a href="#about" className="hover:text-primary transition-colors">О нас</a>
          <a href="#contacts" className="hover:text-primary transition-colors">Контакты</a>
        </div>

        <Button size="sm" className="rounded-full font-body font-semibold relative" onClick={() => setIsOpen(true)}>
          <ShoppingBag className="h-4 w-4" />
          Корзина
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {itemCount}
            </span>
          )}
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
