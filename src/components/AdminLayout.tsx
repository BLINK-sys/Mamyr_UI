import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapPin, Layers, UtensilsCrossed, Image, Users, ArrowLeft, PanelBottom, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/admin/locations", label: "Точки", icon: MapPin },
  { to: "/admin/categories", label: "Разделы", icon: Layers },
  { to: "/admin/dishes", label: "Блюда", icon: UtensilsCrossed },
  { to: "/admin/banners", label: "Баннеры", icon: Image },
  { to: "/admin/staff", label: "Работники", icon: Users },
  { to: "/admin/footer", label: "Подвал", icon: PanelBottom },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-56 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body">
            <ArrowLeft className="h-4 w-4" />
            На сайт
          </Link>
          <h2 className="font-display text-lg text-foreground mt-2">Админка</h2>
          {user && <p className="text-xs text-muted-foreground font-body mt-1">{user.name}</p>}
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors",
                location.pathname === link.to
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-destructive hover:bg-destructive/10 w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
