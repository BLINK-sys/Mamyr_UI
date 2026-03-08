import React from "react";
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

// Font sizes as vw units — scale proportionally with viewport width (ref: 1440px)
const SIZE_MAP: Record<string, string> = {
  xs: "0.83vw", sm: "0.97vw", base: "1.11vw", lg: "1.25vw",
  xl: "1.39vw", "2xl": "1.67vw", "3xl": "2.08vw", "4xl": "2.5vw",
  "5xl": "3.33vw", "6xl": "4.17vw", "7xl": "5vw",
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
          <div className="inline-flex items-center gap-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: bgColor || "hsla(42,70%,55%,0.2)", border: "1px solid hsla(42,70%,55%,0.3)", padding: `calc(${fontSize} * 0.3) calc(${fontSize} * 0.8)` }}>
            {el.icon && el.icon !== "none" && <DynIcon name={el.icon} style={{ width: fontSize, height: fontSize, color: color || "hsl(var(--primary))" }} />}
            <span style={{ fontSize, fontFamily: "var(--font-body)", color: color || "hsl(var(--primary))", fontWeight: 500 }}>{el.content}</span>
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
      const handleClick = el.scrollTo
        ? () => document.getElementById(el.scrollTo!)?.scrollIntoView({ behavior: "smooth" })
        : undefined;
      return (
        <div key={el.id} style={s}>
          <button
            className="rounded-full font-semibold transition-shadow duration-300 hover:shadow-[0_0_28px_hsla(42,70%,55%,0.65)]"
            style={{
              backgroundColor: isPrimary ? (bgColor || "hsl(var(--primary))") : "transparent",
              color: isPrimary ? (color || "hsl(var(--primary-foreground))") : (color || "hsl(var(--foreground))"),
              border: !isPrimary ? `2px solid ${color || "hsl(var(--border))"}` : "none",
              fontFamily: "var(--font-body)",
              fontSize,
              cursor: el.scrollTo ? "pointer" : "default",
              padding: `calc(${fontSize} * 0.6) calc(${fontSize} * 1.6)`,
            }}
            onClick={handleClick}
          >
            {el.icon && el.icon !== "none" && <DynIcon name={el.icon} style={{ width: fontSize, height: fontSize, display: "inline-block", marginRight: 6, verticalAlign: "middle" }} />}
            {el.content}
          </button>
        </div>
      );
    }
    case "info":
      return (
        <div key={el.id} style={s}>
          <div className="flex items-center gap-2">
            {el.icon && el.icon !== "none" && <DynIcon name={el.icon} style={{ width: fontSize, height: fontSize, color: "hsl(var(--primary))" }} />}
            <span style={{ fontSize, fontFamily: "var(--font-body)", color: color || "hsl(var(--muted-foreground))" }}>{el.content}</span>
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
  const overlayOpacity = activeBanner?.overlayOpacity ?? 0.4;

  if (!activeBanner?.image) return null;

  return (
    <section className="relative overflow-hidden w-full h-screen">
      <div className="absolute inset-0">
        <img src={api.fullImageUrl(activeBanner.image)} alt="Mamyr КАФЕ" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent"
          style={{ opacity: overlayOpacity }}
        />
      </div>
      {(activeBanner.elements?.length ?? 0) > 0 && (
        <div className="absolute inset-0">
          {activeBanner.elements.map(renderEl)}
        </div>
      )}
    </section>
  );
};

export default Hero;
