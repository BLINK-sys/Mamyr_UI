import React, { useState, useRef } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Trash2, Pencil, ArrowLeft, Eye, EyeOff, ImageIcon } from "lucide-react";
import {
  UtensilsCrossed, Clock, MapPin, Phone, Mail, Star, Heart,
  ShoppingBag, Coffee, Flame, ChefHat, ArrowRight, Sparkles, Info, ChevronRight,
} from "lucide-react";
import { api } from "@/services/api";
import type { Banner, BannerElement } from "@/types";

// ── Icon registry ────────────────────────────────────────
const ICON_REGISTRY: Record<string, React.ComponentType<any>> = {
  UtensilsCrossed, Clock, MapPin, Phone, Mail, Star, Heart,
  ShoppingBag, Coffee, Flame, ChefHat, ArrowRight, Sparkles, Info, ChevronRight,
};

const ICON_OPTIONS = [
  { label: "— Без иконки —", value: "none" },
  { label: "Приборы", value: "UtensilsCrossed" },
  { label: "Часы", value: "Clock" },
  { label: "Геолокация", value: "MapPin" },
  { label: "Телефон", value: "Phone" },
  { label: "Почта", value: "Mail" },
  { label: "Звезда", value: "Star" },
  { label: "Сердце", value: "Heart" },
  { label: "Корзина", value: "ShoppingBag" },
  { label: "Кофе", value: "Coffee" },
  { label: "Огонь", value: "Flame" },
  { label: "Шеф-повар", value: "ChefHat" },
  { label: "Стрелка", value: "ArrowRight" },
  { label: "Искры", value: "Sparkles" },
  { label: "Инфо", value: "Info" },
  { label: "Шеврон", value: "ChevronRight" },
];

const COLOR_OPTIONS = [
  { label: "Основной (золотой)", value: "primary", css: "hsl(42 70% 55%)" },
  { label: "Текст (светлый)", value: "foreground", css: "hsl(45 30% 90%)" },
  { label: "Приглушённый", value: "muted-foreground", css: "hsl(45 10% 55%)" },
  { label: "Фон (тёмный)", value: "background", css: "hsl(160 30% 12%)" },
];

const SIZE_OPTIONS = [
  { label: "XS", value: "xs" }, { label: "SM", value: "sm" }, { label: "Base", value: "base" },
  { label: "LG", value: "lg" }, { label: "XL", value: "xl" }, { label: "2XL", value: "2xl" },
  { label: "3XL", value: "3xl" }, { label: "4XL", value: "4xl" }, { label: "5XL", value: "5xl" },
  { label: "6XL", value: "6xl" }, { label: "7XL", value: "7xl" },
];

const ELEMENT_TYPES = [
  { label: "Бейдж / пилюля", value: "badge" },
  { label: "Заголовок", value: "heading" },
  { label: "Текст / абзац", value: "text" },
  { label: "Кнопка", value: "button" },
  { label: "Иконка + строка", value: "info" },
];

// Pixel sizes for the editor preview (scaled down ~40% from actual CSS rem sizes)
const PREV_PX: Record<string, number> = {
  xs: 9, sm: 10, base: 12, lg: 13, xl: 14,
  "2xl": 16, "3xl": 19, "4xl": 23, "5xl": 29, "6xl": 36, "7xl": 44,
};

const rc = (c?: string): string => {
  if (!c || c === "none") return "";
  const m: Record<string, string> = {
    primary: "hsl(42 70% 55%)",
    foreground: "hsl(45 30% 90%)",
    "muted-foreground": "hsl(45 10% 55%)",
    background: "hsl(160 30% 12%)",
  };
  return m[c] ?? c;
};

const DynIcon = ({ name, ...p }: { name: string; [k: string]: any }) => {
  const Ic = ICON_REGISTRY[name];
  return Ic ? <Ic {...p} /> : null;
};

const createEl = (type: BannerElement["type"]): BannerElement => ({
  id: crypto.randomUUID(),
  type,
  content: type === "badge" ? "Вкус традиций"
    : type === "heading" ? "Заголовок"
    : type === "text" ? "Описание"
    : type === "button" ? "Кнопка"
    : "Часы работы",
  icon: type === "badge" ? "UtensilsCrossed" : type === "info" ? "Clock" : undefined,
  color: type === "heading" ? "foreground" : type === "button" ? undefined : "primary",
  bgColor: type === "button" ? "primary" : undefined,
  size: type === "heading" ? "7xl" : type === "button" ? "lg" : "sm",
  font: type === "heading" ? "display" : "body",
  weight: type === "heading" ? "bold" : "semibold",
  variant: type === "button" ? "primary" : undefined,
  x: 5,
  y: type === "badge" ? 20 : type === "heading" ? 30 : type === "button" ? 55 : 65,
  width: type === "text" ? 35 : undefined,
});

// ── Element visual in editor preview ────────────────────
const ElVis = ({ el }: { el: BannerElement }) => {
  const color = rc(el.color) || undefined;
  const bgColor = rc(el.bgColor) || undefined;
  const fs = PREV_PX[el.size || "base"] ?? 12;
  const ff = el.font === "display" ? "var(--font-display)" : "var(--font-body)";
  const fw = el.weight === "bold" ? 700 : el.weight === "semibold" ? 600 : 400;

  if (el.type === "badge") return (
    <div className="inline-flex items-center gap-1 rounded-full backdrop-blur-sm"
      style={{ backgroundColor: bgColor || "hsla(42,70%,55%,0.2)", border: "1px solid hsla(42,70%,55%,0.3)", padding: `${fs * 0.3}px ${fs * 0.8}px` }}>
      {el.icon && el.icon !== "none" && <DynIcon name={el.icon} style={{ width: fs, height: fs, color: color || "hsl(42 70% 55%)" }} />}
      <span style={{ fontSize: fs, fontFamily: "var(--font-body)", color: color || "hsl(42 70% 55%)", fontWeight: 500, whiteSpace: "nowrap" }}>{el.content}</span>
    </div>
  );
  if (el.type === "heading") return (
    <span style={{ fontSize: fs, fontFamily: ff, fontWeight: fw, color, lineHeight: 1.1, display: "block", whiteSpace: "pre-wrap" }}>{el.content}</span>
  );
  if (el.type === "text") return (
    <p style={{ fontSize: fs, fontFamily: ff, fontWeight: fw, color, margin: 0, whiteSpace: "pre-wrap" }}>{el.content}</p>
  );
  if (el.type === "button") {
    const isPrimary = el.variant !== "outline";
    return (
      <span style={{
        fontSize: fs, fontFamily: "var(--font-body)", fontWeight: 600,
        backgroundColor: isPrimary ? (bgColor || "hsl(42 70% 55%)") : "transparent",
        color: isPrimary ? (color || "hsl(160 30% 10%)") : (color || "hsl(45 30% 90%)"),
        border: !isPrimary ? `1.5px solid ${color || "hsl(160 15% 22%)"}` : "none",
        borderRadius: 9999, padding: `${fs * 0.4}px ${fs * 1.2}px`, whiteSpace: "nowrap", display: "inline-block",
      }}>{el.content}</span>
    );
  }
  if (el.type === "info") return (
    <div className="flex items-center gap-1">
      {el.icon && el.icon !== "none" && <DynIcon name={el.icon} style={{ width: fs, height: fs, color: "hsl(42 70% 55%)" }} />}
      <span style={{ fontSize: fs, fontFamily: "var(--font-body)", color: color || "hsl(45 10% 55%)", whiteSpace: "nowrap" }}>{el.content}</span>
    </div>
  );
  return null;
};

// ── Main Component ───────────────────────────────────────
const AdminBanners = () => {
  const { banners, refreshData } = useData();
  const [view, setView] = useState<"list" | "edit">("list");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [bName, setBName] = useState("");
  const [bActive, setBActive] = useState(true);
  const [bOverlayOpacity, setBOverlayOpacity] = useState(0.5);
  const [bOrder, setBOrder] = useState(1);
  const [bElements, setBElements] = useState<BannerElement[]>([]);
  const [bImageUrl, setBImageUrl] = useState("");
  const [bImagePreview, setBImagePreview] = useState("");
  const [bImageFile, setBImageFile] = useState<File | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setEditingId(null);
    setBName("Новый баннер");
    setBActive(true);
    setBOverlayOpacity(0.5);
    setBOrder(banners.length + 1);
    setBElements([]);
    setBImageUrl("");
    setBImagePreview("");
    setBImageFile(null);
    setSelectedId(null);
    setView("edit");
  };

  const openEdit = (b: Banner) => {
    setEditingId(Number(b.id));
    setBName(b.name);
    setBActive(b.active);
    setBOverlayOpacity(b.overlayOpacity);
    setBOrder(b.order);
    setBElements(JSON.parse(JSON.stringify(b.elements || [])));
    setBImageUrl(b.image || "");
    setBImagePreview(b.image ? api.fullImageUrl(b.image) : "");
    setBImageFile(null);
    setSelectedId(null);
    setView("edit");
  };

  const save = async () => {
    try {
      let id = editingId;
      const order = id ? (banners.find((b) => Number(b.id) === id)?.order ?? bOrder) : bOrder;
      if (!id) {
        const res = await api.post("/banners", {
          name: bName, active: bActive, image: "", overlay_opacity: bOverlayOpacity, order, elements: bElements,
        });
        id = res.id;
        setEditingId(id);
      }
      let finalImage = bImageUrl;
      if (bImageFile && id) {
        finalImage = await api.uploadBannerImage(bImageFile, id);
        setBImageUrl(finalImage);
        setBImageFile(null);
      }
      await api.put(`/banners/${id}`, {
        name: bName, active: bActive, image: finalImage, overlay_opacity: bOverlayOpacity, order, elements: bElements,
      });
      await refreshData();
      setView("list");
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const remove = async (id: string) => {
    try { await api.delete(`/banners/${Number(id)}`); await refreshData(); } catch (e) { console.error(e); }
  };

  const toggle = async (id: string) => {
    try { await api.patch(`/banners/${Number(id)}/toggle`, {}); await refreshData(); } catch (e) { console.error(e); }
  };

  const addElement = (type: BannerElement["type"]) => {
    const el = createEl(type);
    setBElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  };

  const updateEl = (patch: Partial<BannerElement>) => {
    if (!selectedId) return;
    setBElements((prev) => prev.map((e) => e.id === selectedId ? { ...e, ...patch } : e));
  };

  const startDrag = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    const el = bElements.find((x) => x.id === id);
    if (!el || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const ox = e.clientX - rect.left - (el.x / 100) * rect.width;
    const oy = e.clientY - rect.top - (el.y / 100) * rect.height;
    setDragging({ id, ox, oy });
    setSelectedId(id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const moveDrag = (e: React.PointerEvent) => {
    if (!dragging || !previewRef.current) return;
    e.preventDefault();
    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(95, ((e.clientX - rect.left - dragging.ox) / rect.width) * 100));
    const y = Math.max(0, Math.min(95, ((e.clientY - rect.top - dragging.oy) / rect.height) * 100));
    setBElements((prev) => prev.map((el) =>
      el.id === dragging.id ? { ...el, x: parseFloat(x.toFixed(1)), y: parseFloat(y.toFixed(1)) } : el
    ));
  };

  const sel = bElements.find((e) => e.id === selectedId);

  // ── List view ────────────────────────────────────────
  if (view === "list") {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display text-foreground">Баннеры</h1>
          <Button onClick={openNew} className="rounded-full font-body gap-1">
            <Plus className="h-4 w-4" /> Добавить
          </Button>
        </div>
        {banners.length === 0 ? (
          <p className="text-muted-foreground font-body text-center py-12">Баннеров пока нет</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...banners].sort((a, b) => a.order - b.order).map((banner) => (
              <div key={banner.id} className="relative rounded-xl overflow-hidden border border-border">
                {banner.image ? (
                  <img src={api.fullImageUrl(banner.image)} alt={banner.name} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-muted flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground opacity-40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-background/60 flex items-end p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-display text-foreground">{banner.name || "Без названия"}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-body ${banner.active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {banner.active ? "Вкл" : "Выкл"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body">{banner.elements?.length ?? 0} элементов</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggle(banner.id)}>
                      {banner.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(banner)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(banner.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Editor view ──────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="icon" onClick={() => setView("list")} className="rounded-full flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Input
          value={bName}
          onChange={(e) => setBName(e.target.value)}
          placeholder="Название баннера"
          className="font-display max-w-[220px]"
        />
        <div className="flex items-center gap-2">
          <Switch checked={bActive} onCheckedChange={setBActive} id="bactive" />
          <Label htmlFor="bactive" className="text-sm font-body text-muted-foreground cursor-pointer">Активен</Label>
        </div>
        <Button onClick={save} className="rounded-full font-body font-semibold ml-auto">
          Сохранить
        </Button>
      </div>

      {/* Image + overlay row */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="outline" size="sm" className="rounded-full font-body gap-1 flex-shrink-0"
          onClick={() => imgInputRef.current?.click()}>
          <ImageIcon className="h-4 w-4" />
          {bImagePreview ? "Заменить фото" : "Загрузить фото"}
        </Button>
        <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBImageFile(f);
          setBImagePreview(URL.createObjectURL(f));
        }} />
        {bImagePreview && (
          <button onClick={() => { setBImageFile(null); setBImagePreview(""); setBImageUrl(""); }}
            className="text-xs text-destructive font-body hover:underline">
            Удалить фото
          </button>
        )}
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-muted-foreground font-body whitespace-nowrap">Затемнение:</span>
          <div className="w-28">
            <Slider min={0} max={100} step={5} value={[Math.round(bOverlayOpacity * 100)]}
              onValueChange={([v]) => setBOverlayOpacity(v / 100)} />
          </div>
          <span className="text-xs text-muted-foreground font-body w-8">{Math.round(bOverlayOpacity * 100)}%</span>
        </div>
      </div>

      {/* Preview + Properties */}
      <div className="flex gap-4 items-start">
        {/* Preview */}
        <div className="flex-1 min-w-0">
          <div
            ref={previewRef}
            className="relative w-full rounded-xl overflow-hidden border border-border"
            style={{ aspectRatio: "16/9", background: bImagePreview ? undefined : "hsl(160 30% 12%)" }}
            onClick={() => setSelectedId(null)}
          >
            {bImagePreview && (
              <img src={bImagePreview} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent"
              style={{ opacity: bOverlayOpacity }} />

            {bElements.map((el) => (
              <div
                key={el.id}
                style={{
                  position: "absolute",
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  ...(el.width ? { width: `${el.width}%` } : {}),
                  cursor: dragging?.id === el.id ? "grabbing" : "grab",
                  zIndex: selectedId === el.id ? 10 : 1,
                }}
                className={`select-none rounded px-1 ${selectedId === el.id
                  ? "ring-2 ring-primary ring-offset-1 ring-offset-transparent"
                  : "ring-1 ring-dashed ring-white/30"}`}
                onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                onPointerDown={(e) => startDrag(e, el.id)}
                onPointerMove={moveDrag}
                onPointerUp={() => setDragging(null)}
              >
                <ElVis el={el} />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-body mt-1.5 text-center">
            Перетащите элементы для позиционирования. Клик на фон — снять выделение.
          </p>
        </div>

        {/* Properties panel */}
        <div className="w-72 flex-shrink-0 bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
          style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full rounded-full font-body gap-1">
                <Plus className="h-4 w-4" /> Добавить элемент
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {ELEMENT_TYPES.map((t) => (
                <DropdownMenuItem key={t.value} onClick={() => addElement(t.value as BannerElement["type"])}>
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {sel ? (
            <div className="space-y-3">
              {/* Type */}
              <div>
                <Label className="text-xs font-body">Тип</Label>
                <Select value={sel.type} onValueChange={(v) => updateEl({ type: v as BannerElement["type"] })}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ELEMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Content */}
              <div>
                <Label className="text-xs font-body">Содержание</Label>
                <textarea
                  value={sel.content}
                  onChange={(e) => updateEl({ content: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-body min-h-[56px] resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {/* Icon */}
              {["badge", "button", "info"].includes(sel.type) && (
                <div>
                  <Label className="text-xs font-body">Иконка</Label>
                  <Select value={sel.icon || "none"} onValueChange={(v) => updateEl({ icon: v === "none" ? undefined : v })}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Без иконки" /></SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((ic) => <SelectItem key={ic.value} value={ic.value}>{ic.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Text color */}
              <div>
                <Label className="text-xs font-body">Цвет текста</Label>
                <div className="flex gap-1.5 flex-wrap mt-1.5 items-center">
                  {COLOR_OPTIONS.map((c) => (
                    <button key={c.value} onClick={() => updateEl({ color: c.value })} title={c.label}
                      className={`w-5 h-5 rounded-full border-2 transition-transform ${sel.color === c.value ? "border-white scale-125" : "border-transparent"}`}
                      style={{ backgroundColor: c.css }} />
                  ))}
                  <input type="color"
                    value={COLOR_OPTIONS.find((c) => c.value === sel.color) ? "#ffffff" : (sel.color || "#ffffff")}
                    onChange={(e) => updateEl({ color: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border-0 p-0" title="Свой цвет" />
                </div>
              </div>

              {/* Background color */}
              {["badge", "button"].includes(sel.type) && (
                <div>
                  <Label className="text-xs font-body">Цвет фона</Label>
                  <div className="flex gap-1.5 flex-wrap mt-1.5 items-center">
                    {COLOR_OPTIONS.map((c) => (
                      <button key={c.value} onClick={() => updateEl({ bgColor: c.value })} title={c.label}
                        className={`w-5 h-5 rounded-full border-2 transition-transform ${sel.bgColor === c.value ? "border-white scale-125" : "border-transparent"}`}
                        style={{ backgroundColor: c.css }} />
                    ))}
                    <input type="color"
                      value={COLOR_OPTIONS.find((c) => c.value === sel.bgColor) ? "#ffffff" : (sel.bgColor || "#ffffff")}
                      onChange={(e) => updateEl({ bgColor: e.target.value })}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0" title="Свой цвет" />
                    <button onClick={() => updateEl({ bgColor: undefined })}
                      className="text-xs text-muted-foreground hover:text-foreground px-1">✕</button>
                  </div>
                </div>
              )}

              {/* Button variant */}
              {sel.type === "button" && (
                <div>
                  <Label className="text-xs font-body">Стиль кнопки</Label>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => updateEl({ variant: "primary" })}
                      className={`text-xs px-3 py-1 rounded-full flex-1 ${sel.variant !== "outline" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      Filled
                    </button>
                    <button onClick={() => updateEl({ variant: "outline" })}
                      className={`text-xs px-3 py-1 rounded-full flex-1 border ${sel.variant === "outline" ? "border-primary text-primary" : "border-muted text-muted-foreground"}`}>
                      Outline
                    </button>
                  </div>
                </div>
              )}

              {/* Size */}
              <div>
                <Label className="text-xs font-body">Размер текста</Label>
                <Select value={sel.size || "base"} onValueChange={(v) => updateEl({ size: v })}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SIZE_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Font family */}
              {["heading", "text"].includes(sel.type) && (
                <div>
                  <Label className="text-xs font-body">Шрифт</Label>
                  <div className="flex gap-2 mt-1">
                    {[{ v: "display", l: "Заголовочный" }, { v: "body", l: "Текстовый" }].map((f) => (
                      <button key={f.v} onClick={() => updateEl({ font: f.v as "display" | "body" })}
                        className={`text-xs px-2 py-1 rounded-full flex-1 ${sel.font === f.v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {f.l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Font weight */}
              {["heading", "text"].includes(sel.type) && (
                <div>
                  <Label className="text-xs font-body">Жирность</Label>
                  <div className="flex gap-1.5 mt-1">
                    {[{ v: "normal", l: "Норм" }, { v: "semibold", l: "Semi" }, { v: "bold", l: "Bold" }].map((w) => (
                      <button key={w.v} onClick={() => updateEl({ weight: w.v as "normal" | "semibold" | "bold" })}
                        className={`text-xs px-2 py-1 rounded-full flex-1 ${sel.weight === w.v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {w.l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Position */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-body">X (%)</Label>
                  <Input type="number" value={Math.round(sel.x)} min={0} max={99}
                    onChange={(e) => updateEl({ x: Number(e.target.value) })}
                    className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-body">Y (%)</Label>
                  <Input type="number" value={Math.round(sel.y)} min={0} max={99}
                    onChange={(e) => updateEl({ y: Number(e.target.value) })}
                    className="h-8 text-xs mt-1" />
                </div>
              </div>

              {/* Width */}
              <div>
                <Label className="text-xs font-body">Ширина (% или пусто = авто)</Label>
                <Input type="number" value={sel.width ?? ""} min={0} max={100}
                  onChange={(e) => updateEl({ width: e.target.value ? Number(e.target.value) : undefined })}
                  className="h-8 text-xs mt-1" placeholder="авто" />
              </div>

              {/* Delete element */}
              <Button variant="destructive" size="sm" className="w-full rounded-full font-body text-xs mt-1"
                onClick={() => { setBElements((prev) => prev.filter((e) => e.id !== sel.id)); setSelectedId(null); }}>
                <Trash2 className="h-3 w-3 mr-1" /> Удалить элемент
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground font-body text-center py-4">
              Выберите элемент на превью или добавьте новый
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBanners;
