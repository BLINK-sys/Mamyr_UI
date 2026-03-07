import { icons } from "lucide-react";
import { useData } from "@/contexts/DataContext";

const DynamicIcon = ({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) => {
  const LucideIcon = (icons as Record<string, any>)[name];
  if (!LucideIcon) return null;
  return <LucideIcon className={className} style={style} />;
};

const Footer = () => {
  const { footerSettings } = useData();
  const sortedContacts = [...footerSettings.contacts].sort((a, b) => a.order - b.order);
  const sortedSchedule = [...footerSettings.schedule].sort((a, b) => a.order - b.order);

  return (
    <footer className="bg-card border-t border-border py-16 px-6" id="contacts">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-2xl font-display text-foreground mb-4">Mamyr <span className="text-primary">КАФЕ</span></h3>
            <p className="text-sm font-body leading-relaxed text-muted-foreground">{footerSettings.description}</p>
          </div>

          <div>
            <h4 className="font-body font-semibold text-foreground mb-4">Контакты</h4>
            <div className="space-y-3 text-sm font-body text-muted-foreground">
              {sortedContacts.map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <DynamicIcon name={c.icon} className="h-4 w-4" style={{ color: c.iconColor || "hsl(var(--primary))" }} />
                  <span style={{ color: c.textColor || undefined }}>{c.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-body font-semibold text-foreground mb-4">Режим работы</h4>
            <div className="space-y-2 text-sm font-body text-muted-foreground">
              {sortedSchedule.map((s) => (
                <p key={s.id} style={{ color: s.textColor || undefined }}>{s.text}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-6 text-center text-xs font-body text-muted-foreground">
          © 2026 Mamyr КАФЕ. Все права защищены.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
