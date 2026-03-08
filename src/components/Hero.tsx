import React from "react";
import heroImage from "@/assets/hero-cafe.jpg";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed, Clock, MapPin, Phone, Mail, Star, Heart,
  ShoppingBag, Coffee, Flame, ChefHat, ArrowRight, Sparkles, Info, ChevronRight,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { api } from "@/services/api";
import type { BannerElement } from "@/types";

const ICON_REGISTRY: Record<string, React.ComponentType<any>> = {
  UtensilsCrossed, Clock, MapPin, Phone, Mail, Star, Heart,
  ShoppingBag, Coffee, Flame, ChefHat, ArrowRight, Sparkles, Info, ChevronRight,
};

const COLOR_MAP: Record<string, string> = {
  primary: "hsl(var(--primary))",
  foreground: "hsl(var(--foreground))",
  "muted-foreground": "hsl(var(--muted-foreground))",
  background: "hsl(var(--background))",
};

const SIZE_MAP: Record<string, string> = {
  xs: "0.75rem", sm: "0.875rem", base: "1rem", lg: "1.125rem",
  xl: "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem",
  "5xl": "3rem", "6xl": "3.75rem", "7xl": "4.5rem",
};

const rc = (c?: string) => c ? (COLOR_MAP[c] ?? c) : undefined;

const DynIcon = ({ name, ...p }: { name: string; [k: string]: any }) => {
  const Ic = ICON_REGISTRY[name];
  return Ic ? <Ic {...p} /> : null;
};

const renderEl = (el: BannerElement) => {
  const color = rc(el.color);
  const bgColor = rc(el.bgColor);
  const fontSize = SIZE_MAP[el.size || "base"] || "1rem";
  const fontFamily = el.font === "display" ? "var(--font-display)" : "var(--font-body)";
  const fontWeight = el.weight === "bold" ? 700 : el.weight === "semibold" ? 600 : 400;
  const s: React.CSSProperties = {
    position: "absolute",
    left: `${el.x}%`,
    top: `${el.y}%`,
    ...(el.width ? { width: `${el.width}%` } : {}),
  };

  switch (el.type) {
    case "badge":
      return (
        <div key={el.id} style={s}>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-sm"
            style={{ backgroundColor: bgColor || "hsla(42,70%,55%,0.2)", border: "1px solid hsla(42,70%,55%,0.3)" }}>
            {el.icon && el.icon !== "none" && <DynIcon name={el.icon} style={{ width: 16, height: 16, color: color || "hsl(var(--primary))" }} />}
            <span style={{ fontSize: "0.875rem", fontFamily: "var(--font-body)", color: color || "hsl(var(--primary))", fontWeight: 500 }}>{el.content}</span>
          </div>
        </div>
      );
    case "heading":
      return (
        <div key={el.id} style={s}>
          <h1 style={{ color, fontSize, fontFamily, fontWeight, lineHeight: 1.1, margin: 0 }}>{el.content}</h1>
        </div>
      );
    case "text":
      return (
        <div key={el.id} style={s}>
          <p style={{ color, fontSize, fontFamily, fontWeight, margin: 0 }}>{el.content}</p>
        </div>
      );
    case "button": {
      const isPrimary = el.variant !== "outline";
      return (
        <div key={el.id} style={s}>
          <button className="rounded-full font-semibold px-8 py-3" style={{
            backgroundColor: isPrimary ? (bgColor || "hsl(var(--primary))") : "transparent",
            color: isPrimary ? (color || "hsl(var(--primary-foreground))") : (color || "hsl(var(--foreground))"),
            border: !isPrimary ? `2px solid ${color || "hsl(var(--border))"}` : "none",
            fontFamily: "var(--font-body)",
            fontSize,
            cursor: "default",
          }}>
            {el.icon && el.icon !== "none" && <DynIcon name={el.icon} style={{ width: 16, height: 16, display: "inline-block", marginRight: 6, verticalAlign: "middle" }} />}
            {el.content}
          </button>
        </div>
      );
    }
    case "info":
      return (
        <div key={el.id} style={s}>
          <div className="flex items-center gap-2">
            {el.icon && el.icon !== "none" && <DynIcon name={el.icon} style={{ width: 16, height: 16, color: "hsl(var(--primary))" }} />}
            <span style={{ fontSize: "0.875rem", fontFamily: "var(--font-body)", color: color || "hsl(var(--muted-foreground))" }}>{el.content}</span>
          </div>
        </div>
      );
    default:
      return null;
  }
};

const Hero = () => {
  const { banners } = useData();
  const activeBanner = [...banners].filter((b) => b.active).sort((a, b) => a.order - b.order)[0];
  const hasElements = (activeBanner?.elements?.length ?? 0) > 0;
  const overlayOpacity = activeBanner?.overlayOpacity ?? 0.4;
  const bgSrc = activeBanner?.image ? api.fullImageUrl(activeBanner.image) : (heroImage as string);

  return (
    <section className="relative overflow-hidden" style={{ minHeight: "90vh" }}>
      <div className="absolute inset-0">
        <img src={bgSrc} alt="Mamyr КАФЕ" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent"
          style={{ opacity: overlayOpacity }}
        />
      </div>

      {hasElements ? (
        <div className="absolute inset-0">
          {activeBanner!.elements.map(renderEl)}
        </div>
      ) : (
        <div className="relative z-10 container mx-auto px-6 py-20 flex items-center" style={{ minHeight: "90vh" }}>
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
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full shadow-warm font-body font-semibold"
                onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
              >
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
      )}
    </section>
  );
};

export default Hero;
