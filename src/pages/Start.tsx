import { UtensilsCrossed, ShieldCheck, ConciergeBell, ChefHat } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const roles = [
  { to: "/menu", label: "Клиент", desc: "Меню и оформление заказа", icon: UtensilsCrossed, color: "bg-primary/10 text-primary", needsAuth: false },
  { to: "/admin", label: "Админ", desc: "Управление кафе", icon: ShieldCheck, color: "bg-accent/50 text-accent-foreground", needsAuth: true },
  { to: "/reception", label: "Рецепшн", desc: "Приём и выдача заказов", icon: ConciergeBell, color: "bg-secondary text-secondary-foreground", needsAuth: true },
  { to: "/kitchen", label: "Кухня", desc: "Приготовление заказов", icon: ChefHat, color: "bg-muted text-muted-foreground", needsAuth: true },
];

const Start = () => {
  const { user, logout } = useAuth();

  const getLink = (r: typeof roles[0]) => {
    if (!r.needsAuth) return r.to;
    if (user) return r.to; // already logged in, RequireAuth will handle redirect
    return `/login?redirect=${encodeURIComponent(r.to)}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-display text-foreground">Mamyr <span className="text-primary">КАФЕ</span></h1>
        <p className="text-muted-foreground mt-3 font-body">Выберите интерфейс для работы</p>
        {user && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-sm font-body text-muted-foreground">Вы вошли как: <span className="text-foreground font-semibold">{user.name}</span></span>
            <button onClick={logout} className="text-sm text-destructive hover:underline font-body">Выйти</button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
        {roles.map((r) => (
          <Link
            key={r.to}
            to={getLink(r)}
            className="group flex flex-col items-center gap-3 p-8 bg-card rounded-2xl border border-border shadow-card hover:shadow-warm hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`p-4 rounded-2xl ${r.color} transition-colors`}>
              <r.icon className="h-8 w-8" />
            </div>
            <span className="text-lg font-display text-foreground">{r.label}</span>
            <span className="text-sm text-muted-foreground font-body text-center">{r.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Start;
