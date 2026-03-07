import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, ChefHat, CheckCircle, Package, LogOut } from "lucide-react";
import type { OrderStatus, Order } from "@/types";

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "Новый", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Package },
  cooking: { label: "Готовится", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: ChefHat },
  ready: { label: "Готов к выдаче", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
  delivered: { label: "Выдан", color: "bg-muted text-muted-foreground border-border", icon: CheckCircle },
};

const columns: OrderStatus[] = ["new", "cooking", "ready", "delivered"];

const Reception = () => {
  const { orders, updateOrderStatus } = useData();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/"); };

  const ordersByStatus = (status: OrderStatus): Order[] =>
    orders.filter((o) => o.status === status).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-display text-foreground">Рецепшн — Заказы</h1>
        <div className="ml-auto flex items-center gap-3">
          {user && <span className="text-sm text-muted-foreground font-body">{user.name}</span>}
          <button onClick={handleLogout} className="text-destructive hover:text-destructive/80"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          return (
            <div key={status} className="bg-card rounded-xl border border-border p-4">
              <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg border ${config.color}`}>
                <Icon className="h-4 w-4" />
                <span className="font-body font-semibold text-sm">{config.label}</span>
                <span className="ml-auto text-xs font-body">{ordersByStatus(status).length}</span>
              </div>

              <div className="space-y-3">
                {ordersByStatus(status).map((order) => (
                  <div key={order.id} className="bg-accent/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-body font-semibold text-sm text-foreground">{order.customerName}</span>
                      <span className="text-xs text-muted-foreground font-body">{new Date(order.createdAt).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body">{order.customerPhone}</p>
                    <div className="space-y-1">
                      {order.items.map((item, i) => (
                        <p key={i} className="text-xs font-body text-foreground">
                          {item.quantity}× {item.dish.name}
                          {item.addons.length > 0 && <span className="text-muted-foreground"> (+{item.addons.map(a => a.name).join(", ")})</span>}
                        </p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-sm font-bold text-primary font-body">{order.total} тг</span>
                      {order.cookName && <span className="text-xs text-muted-foreground font-body">Повар: {order.cookName}</span>}
                    </div>

                    {status === "new" && (
                      <Button size="sm" className="w-full rounded-full font-body gap-1" onClick={() => updateOrderStatus(order.id, "cooking")}>
                        <Send className="h-3 w-3" />На кухню
                      </Button>
                    )}
                    {status === "ready" && (
                      <Button size="sm" className="w-full rounded-full font-body gap-1" onClick={() => updateOrderStatus(order.id, "delivered")}>
                        <CheckCircle className="h-3 w-3" />Выдать
                      </Button>
                    )}
                  </div>
                ))}
                {ordersByStatus(status).length === 0 && (
                  <p className="text-center text-xs text-muted-foreground font-body py-4">Пусто</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reception;
