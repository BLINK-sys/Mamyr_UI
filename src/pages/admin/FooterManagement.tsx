import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus, Save, X, icons, GripVertical, Palette } from "lucide-react";
import { api } from "@/services/api";
import type { FooterContact, FooterSchedule, FooterSettings } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const availableIcons = ["Phone", "Mail", "MapPin", "Globe", "Instagram", "MessageCircle", "Clock", "Star", "Heart", "ExternalLink"] as const;

const presetColors = [
  { label: "По умолчанию", value: "" },
  { label: "Золотой", value: "hsl(42, 70%, 55%)" },
  { label: "Зелёный", value: "hsl(160, 50%, 50%)" },
  { label: "Белый", value: "hsl(45, 30%, 90%)" },
  { label: "Красный", value: "hsl(0, 70%, 60%)" },
  { label: "Голубой", value: "hsl(200, 70%, 60%)" },
  { label: "Оранжевый", value: "hsl(25, 90%, 55%)" },
  { label: "Серый", value: "hsl(45, 10%, 55%)" },
];

const DynamicIcon = ({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) => {
  const LucideIcon = (icons as Record<string, any>)[name];
  if (!LucideIcon) return null;
  return <LucideIcon className={className} style={style} />;
};

const ColorPicker = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
        <div className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: value || "hsl(var(--primary))" }} />
        {label}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-48 p-2">
      <div className="grid grid-cols-4 gap-1.5">
        {presetColors.map((c) => (
          <button
            key={c.label}
            onClick={() => onChange(c.value)}
            className="h-8 w-full rounded-md border border-border hover:scale-110 transition-transform flex items-center justify-center"
            style={{ backgroundColor: c.value || "hsl(var(--muted-foreground))" }}
            title={c.label}
          >
            {value === c.value && <div className="h-2 w-2 rounded-full bg-background" />}
          </button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

// Preview components
const DescriptionPreview = ({ description }: { description: string }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <h3 className="text-lg font-display text-foreground mb-2">Mamyr <span className="text-primary">КАФЕ</span></h3>
    <p className="text-sm font-body leading-relaxed text-muted-foreground">{description}</p>
  </div>
);

const ContactsPreview = ({ contacts }: { contacts: FooterContact[] }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <h4 className="font-body font-semibold text-foreground mb-3">Контакты</h4>
    <div className="space-y-2.5 text-sm font-body text-muted-foreground">
      {[...contacts].sort((a, b) => a.order - b.order).map((c) => (
        <div key={c.id} className="flex items-center gap-3">
          <DynamicIcon name={c.icon} className="h-4 w-4" style={{ color: c.iconColor || "hsl(var(--primary))" }} />
          <span style={{ color: c.textColor || undefined }}>{c.text}</span>
        </div>
      ))}
    </div>
  </div>
);

const SchedulePreview = ({ schedule }: { schedule: FooterSchedule[] }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <h4 className="font-body font-semibold text-foreground mb-3">Режим работы</h4>
    <div className="space-y-1.5 text-sm font-body text-muted-foreground">
      {[...schedule].sort((a, b) => a.order - b.order).map((s) => (
        <p key={s.id} style={{ color: s.textColor || undefined }}>{s.text}</p>
      ))}
    </div>
  </div>
);

const syncFooterToApi = async (settings: FooterSettings) => {
  try {
    await api.put("/footer", {
      description: settings.description,
      contacts: settings.contacts.map((c) => ({ icon: c.icon, text: c.text, order: c.order, iconColor: c.iconColor || null, textColor: c.textColor || null })),
      schedule: settings.schedule.map((s) => ({ text: s.text, order: s.order, textColor: s.textColor || null })),
    });
  } catch (e) { console.error("Failed to sync footer", e); }
};

const FooterManagement = () => {
  const { footerSettings, setFooterSettings, refreshData } = useData();
  const [description, setDescription] = useState(footerSettings.description);
  const [descEditing, setDescEditing] = useState(false);

  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState<{ icon: string; text: string; iconColor: string; textColor: string }>({ icon: "Phone", text: "", iconColor: "", textColor: "" });
  const [addingContact, setAddingContact] = useState(false);

  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState("");
  const [scheduleColor, setScheduleColor] = useState("");
  const [addingSchedule, setAddingSchedule] = useState(false);

  const [dragContact, setDragContact] = useState<number | null>(null);
  const [dragSchedule, setDragSchedule] = useState<number | null>(null);

  const saveDescription = async () => {
    const updated = { ...footerSettings, description };
    setFooterSettings(updated);
    setDescEditing(false);
    await syncFooterToApi(updated);
    await refreshData();
  };

  // Contact CRUD
  const sortedContacts = [...footerSettings.contacts].sort((a, b) => a.order - b.order);

  const startEditContact = (c: FooterContact) => {
    setEditingContact(c.id);
    setContactForm({ icon: c.icon, text: c.text, iconColor: c.iconColor || "", textColor: c.textColor || "" });
  };

  const saveContact = async (id: string) => {
    const updated = {
      ...footerSettings,
      contacts: footerSettings.contacts.map((c) => (c.id === id ? { ...c, icon: contactForm.icon, text: contactForm.text, iconColor: contactForm.iconColor || undefined, textColor: contactForm.textColor || undefined } : c)),
    };
    setFooterSettings(updated);
    setEditingContact(null);
    await syncFooterToApi(updated);
    await refreshData();
  };

  const deleteContact = async (id: string) => {
    const updated = { ...footerSettings, contacts: footerSettings.contacts.filter((c) => c.id !== id) };
    setFooterSettings(updated);
    await syncFooterToApi(updated);
    await refreshData();
  };

  const addContact = async () => {
    const maxOrder = footerSettings.contacts.reduce((m, c) => Math.max(m, c.order), 0);
    const newContact: FooterContact = {
      id: `fc-${Date.now()}`,
      icon: contactForm.icon,
      text: contactForm.text,
      order: maxOrder + 1,
      iconColor: contactForm.iconColor || undefined,
      textColor: contactForm.textColor || undefined,
    };
    const updated = { ...footerSettings, contacts: [...footerSettings.contacts, newContact] };
    setFooterSettings(updated);
    setAddingContact(false);
    setContactForm({ icon: "Phone", text: "", iconColor: "", textColor: "" });
    await syncFooterToApi(updated);
    await refreshData();
  };

  const handleContactDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (dragContact === null || dragContact === targetIdx) return;
    const reordered = [...sortedContacts];
    const [moved] = reordered.splice(dragContact, 1);
    reordered.splice(targetIdx, 0, moved);
    const updatedContacts = reordered.map((c, i) => ({ ...c, order: i + 1 }));
    setFooterSettings((prev) => ({ ...prev, contacts: updatedContacts }));
    setDragContact(targetIdx);
  };

  const handleContactDragEnd = async () => {
    setDragContact(null);
    await syncFooterToApi(footerSettings);
  };

  // Schedule CRUD
  const sortedSchedule = [...footerSettings.schedule].sort((a, b) => a.order - b.order);

  const startEditSchedule = (s: FooterSchedule) => {
    setEditingSchedule(s.id);
    setScheduleForm(s.text);
    setScheduleColor(s.textColor || "");
  };

  const saveSchedule = async (id: string) => {
    const updated = {
      ...footerSettings,
      schedule: footerSettings.schedule.map((s) => (s.id === id ? { ...s, text: scheduleForm, textColor: scheduleColor || undefined } : s)),
    };
    setFooterSettings(updated);
    setEditingSchedule(null);
    await syncFooterToApi(updated);
    await refreshData();
  };

  const deleteSchedule = async (id: string) => {
    const updated = { ...footerSettings, schedule: footerSettings.schedule.filter((s) => s.id !== id) };
    setFooterSettings(updated);
    await syncFooterToApi(updated);
    await refreshData();
  };

  const addSchedule = async () => {
    const maxOrder = footerSettings.schedule.reduce((m, s) => Math.max(m, s.order), 0);
    const newSchedule: FooterSchedule = {
      id: `fs-${Date.now()}`,
      text: scheduleForm,
      order: maxOrder + 1,
      textColor: scheduleColor || undefined,
    };
    const updated = { ...footerSettings, schedule: [...footerSettings.schedule, newSchedule] };
    setFooterSettings(updated);
    setAddingSchedule(false);
    setScheduleForm("");
    setScheduleColor("");
    await syncFooterToApi(updated);
    await refreshData();
  };

  const handleScheduleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (dragSchedule === null || dragSchedule === targetIdx) return;
    const reordered = [...sortedSchedule];
    const [moved] = reordered.splice(dragSchedule, 1);
    reordered.splice(targetIdx, 0, moved);
    const updatedSchedule = reordered.map((s, i) => ({ ...s, order: i + 1 }));
    setFooterSettings((prev) => ({ ...prev, schedule: updatedSchedule }));
    setDragSchedule(targetIdx);
  };

  const handleScheduleDragEnd = async () => {
    setDragSchedule(null);
    await syncFooterToApi(footerSettings);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-display text-foreground">Управление подвалом</h1>

      {/* Description */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-display text-lg text-foreground">Описание кафе</h2>
          <p className="text-sm text-muted-foreground font-body">Текст под названием кафе в подвале</p>
          {descEditing ? (
            <div className="space-y-2">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="font-body" rows={3} />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveDescription}><Save className="h-4 w-4 mr-1" />Сохранить</Button>
                <Button size="sm" variant="ghost" onClick={() => { setDescEditing(false); setDescription(footerSettings.description); }}><X className="h-4 w-4 mr-1" />Отмена</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <p className="text-sm font-body text-muted-foreground flex-1">{footerSettings.description}</p>
              <Button size="sm" variant="ghost" onClick={() => setDescEditing(true)}><Pencil className="h-4 w-4" /></Button>
            </div>
          )}
        </section>
        <div>
          <p className="text-xs font-body text-muted-foreground mb-2 uppercase tracking-wider">Превью</p>
          <DescriptionPreview description={footerSettings.description} />
        </div>
      </div>

      {/* Contacts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg text-foreground">Контакты</h2>
              <p className="text-sm text-muted-foreground font-body">Перетаскивайте для изменения порядка</p>
            </div>
            <Button size="sm" onClick={() => { setAddingContact(true); setContactForm({ icon: "Phone", text: "", iconColor: "", textColor: "" }); }}>
              <Plus className="h-4 w-4 mr-1" />Добавить
            </Button>
          </div>

          <div className="space-y-2">
            {sortedContacts.map((c, idx) => (
              <div
                key={c.id}
                draggable={editingContact !== c.id}
                onDragStart={() => setDragContact(idx)}
                onDragOver={(e) => handleContactDragOver(e, idx)}
                onDragEnd={handleContactDragEnd}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50 cursor-grab active:cursor-grabbing"
              >
                {editingContact !== c.id && <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />}
                {editingContact === c.id ? (
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Select value={contactForm.icon} onValueChange={(v) => setContactForm((p) => ({ ...p, icon: v }))}>
                        <SelectTrigger className="w-[140px] h-9">
                          <div className="flex items-center gap-2">
                            <DynamicIcon name={contactForm.icon} className="h-4 w-4" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {availableIcons.map((icon) => (
                            <SelectItem key={icon} value={icon}>
                              <div className="flex items-center gap-2"><DynamicIcon name={icon} className="h-4 w-4" />{icon}</div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input value={contactForm.text} onChange={(e) => setContactForm((p) => ({ ...p, text: e.target.value }))} className="flex-1 h-9 min-w-[180px]" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <ColorPicker value={contactForm.iconColor} onChange={(v) => setContactForm((p) => ({ ...p, iconColor: v }))} label="Иконка" />
                      <ColorPicker value={contactForm.textColor} onChange={(v) => setContactForm((p) => ({ ...p, textColor: v }))} label="Текст" />
                      <div className="flex-1" />
                      <Button size="sm" onClick={() => saveContact(c.id)}><Save className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingContact(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <DynamicIcon name={c.icon} className="h-4 w-4 shrink-0" style={{ color: c.iconColor || "hsl(var(--primary))" }} />
                    <span className="flex-1 text-sm font-body" style={{ color: c.textColor || undefined }}>{c.text}</span>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEditContact(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteContact(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </>
                )}
              </div>
            ))}

            {addingContact && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Select value={contactForm.icon} onValueChange={(v) => setContactForm((p) => ({ ...p, icon: v }))}>
                    <SelectTrigger className="w-[140px] h-9">
                      <div className="flex items-center gap-2"><DynamicIcon name={contactForm.icon} className="h-4 w-4" /><SelectValue /></div>
                    </SelectTrigger>
                    <SelectContent>
                      {availableIcons.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center gap-2"><DynamicIcon name={icon} className="h-4 w-4" />{icon}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input value={contactForm.text} onChange={(e) => setContactForm((p) => ({ ...p, text: e.target.value }))} placeholder="Текст контакта..." className="flex-1 h-9 min-w-[180px]" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <ColorPicker value={contactForm.iconColor} onChange={(v) => setContactForm((p) => ({ ...p, iconColor: v }))} label="Иконка" />
                  <ColorPicker value={contactForm.textColor} onChange={(v) => setContactForm((p) => ({ ...p, textColor: v }))} label="Текст" />
                  <div className="flex-1" />
                  <Button size="sm" onClick={addContact} disabled={!contactForm.text.trim()}><Save className="h-4 w-4 mr-1" />Добавить</Button>
                  <Button size="sm" variant="ghost" onClick={() => setAddingContact(false)}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </div>
        </section>
        <div>
          <p className="text-xs font-body text-muted-foreground mb-2 uppercase tracking-wider">Превью</p>
          <ContactsPreview contacts={footerSettings.contacts} />
        </div>
      </div>

      {/* Schedule */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg text-foreground">Режим работы</h2>
              <p className="text-sm text-muted-foreground font-body">Перетаскивайте для изменения порядка</p>
            </div>
            <Button size="sm" onClick={() => { setAddingSchedule(true); setScheduleForm(""); setScheduleColor(""); }}>
              <Plus className="h-4 w-4 mr-1" />Добавить
            </Button>
          </div>

          <div className="space-y-2">
            {sortedSchedule.map((s, idx) => (
              <div
                key={s.id}
                draggable={editingSchedule !== s.id}
                onDragStart={() => setDragSchedule(idx)}
                onDragOver={(e) => handleScheduleDragOver(e, idx)}
                onDragEnd={handleScheduleDragEnd}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50 cursor-grab active:cursor-grabbing"
              >
                {editingSchedule !== s.id && <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />}
                {editingSchedule === s.id ? (
                  <div className="flex-1 space-y-2">
                    <Input value={scheduleForm} onChange={(e) => setScheduleForm(e.target.value)} className="h-9" />
                    <div className="flex items-center gap-2">
                      <ColorPicker value={scheduleColor} onChange={setScheduleColor} label="Цвет текста" />
                      <div className="flex-1" />
                      <Button size="sm" onClick={() => saveSchedule(s.id)}><Save className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingSchedule(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-body" style={{ color: s.textColor || undefined }}>{s.text}</span>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEditSchedule(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteSchedule(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </>
                )}
              </div>
            ))}

            {addingSchedule && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                <Input value={scheduleForm} onChange={(e) => setScheduleForm(e.target.value)} placeholder="Новая строка..." className="h-9" />
                <div className="flex items-center gap-2">
                  <ColorPicker value={scheduleColor} onChange={setScheduleColor} label="Цвет текста" />
                  <div className="flex-1" />
                  <Button size="sm" onClick={addSchedule} disabled={!scheduleForm.trim()}><Save className="h-4 w-4 mr-1" />Добавить</Button>
                  <Button size="sm" variant="ghost" onClick={() => setAddingSchedule(false)}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </div>
        </section>
        <div>
          <p className="text-xs font-body text-muted-foreground mb-2 uppercase tracking-wider">Превью</p>
          <SchedulePreview schedule={footerSettings.schedule} />
        </div>
      </div>
    </div>
  );
};

export default FooterManagement;
