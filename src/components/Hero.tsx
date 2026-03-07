import heroImage from "@/assets/hero-cafe.jpg";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Clock, MapPin } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Mamyr КАФЕ — блюда восточной кухни"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 mb-6 backdrop-blur-sm border border-primary/30">
            <UtensilsCrossed className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary font-body">Вкус традиций</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display text-foreground leading-tight mb-6">
            Mamyr<br />
            <span className="text-primary">КАФЕ</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md font-body">
            Настоящая восточная кухня с душой. Плов, шашлык, манты и многое другое — всё по традиционным рецептам.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-warm font-body font-semibold">
              Смотреть меню
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 rounded-full border-border text-foreground hover:bg-accent font-body"
            >
              Контакты
            </Button>
          </div>

          <div className="flex flex-wrap gap-6">
            {[
              { icon: Clock, text: "10:00 – 22:00" },
              { icon: MapPin, text: "Доставка по городу" },
              { icon: UtensilsCrossed, text: "Свежие продукты" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-body">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
