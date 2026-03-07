import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ChefHat, Package, LogOut, Ban } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StopListSheet from "@/components/StopListSheet";

const Kitchen = () => {
  const { orders, updateOrderStatus, staff } = useData();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/"); };
  const cooks = staff.filter((s) => s.role === "cook");

  const newOrders = orders.filter((o) => o.status === "cooking" && !o.cookId);
  const cookingOrders = orders.filter((o) => o.status === "cooking" && o.cookId);
  const readyOrders = orders.filter((o) => o.status === "ready");

  const [pickCookForOrder, setPickCookForOrder] = useState<string | null>(null);
  const [stopListOpen, setStopListOpen] = useState(false);
  const userLocationId = user?.locationId ? String(user.locationId) : "";

  const acceptOrder = (cookId: string) => {
    if (!pickCookForOrder) return;
    const cook = cooks.find((c) => c.id === cookId);
    if (!cook) return;
    updateOrderStatus(pickCookForOrder, "cooking", cook.id, cook.name);
    setPickCookForOrder(null);
  };

  const markReady = (orderId: string) => {
    updateOrderStatus(orderId, "ready");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-display text-foreground">Кухня</h1>
        <div className="ml-auto flex items-center gap-3">
          {user && <span className="text-sm text-muted-foreground font-body">{user.name}</span>}
          <Button variant="outline" size="sm" className="rounded-full font-body gap-1 border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => setStopListOpen(true)}>
            <Ban className="h-4 w-4" />Стоп-лист
          </Button>
          <button onClick={handleLogout} className="text-destructive hover:text-destructive/80"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New orders */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="font-display text-xl text-foreground">Новые</h2>
            <span className="text-sm text-muted-foreground font-body">({newOrders.length})</span>
          </div>
          <div className="space-y-3">
            {newOrders.map((order) => (
              <div key={order.id} className="bg-card rounded-xl border border-blue-500/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-body font-semibold text-foreground">{order.customerName}</span>
                  <span className="text-xs text-muted-foreground font-body">
                    {new Date(order.createdAt).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-body text-foreground">
                        {item.quantity}× {item.dish.name}
                        {item.addons.length > 0 && <span className="text-muted-foreground"> (+{item.addons.map(a => a.name).join(", ")})</span>}
                      </span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setPickCookForOrder(order.id)} className="w-full rounded-full font-body gap-1">
                  <ChefHat className="h-4 w-4" />Принять
                </Button>
              </div>
            ))}
            {newOrders.length === 0 && (
              <p className="text-center text-muted-foreground font-body py-8">Нет новых заказов</p>
            )}
          </div>
        </div>

        {/* Currently cooking */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
            <h2 className="font-display text-xl text-foreground">Готовятся</h2>
            <span className="text-sm text-muted-foreground font-body">({cookingOrders.length})</span>
          </div>
          <div className="space-y-3">
            {cookingOrders.map((order) => (
              <div key={order.id} className="bg-card rounded-xl border border-orange-500/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-body font-semibold text-foreground">{order.customerName}</span>
                  <span className="text-xs text-primary font-body">Повар: {order.cookName}</span>
                </div>
                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <p key={i} className="text-sm font-body text-foreground">
                      {item.quantity}× {item.dish.name}
                    </p>
                  ))}
                </div>
                <Button onClick={() => markReady(order.id)} variant="outline" className="w-full rounded-full font-body gap-1 border-green-500/50 text-green-400 hover:bg-green-500/10">
                  <Check className="h-4 w-4" />Готово
                </Button>
              </div>
            ))}
            {cookingOrders.length === 0 && (
              <p className="text-center text-muted-foreground font-body py-8">Нет заказов в работе</p>
            )}
          </div>
        </div>

        {/* Ready / delivered */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <h2 className="font-display text-xl text-foreground">Выдан</h2>
            <span className="text-sm text-muted-foreground font-body">({readyOrders.length})</span>
          </div>
          <div className="space-y-3">
            {readyOrders.map((order) => (
              <div key={order.id} className="bg-card rounded-xl border border-green-500/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-body font-semibold text-foreground">{order.customerName}</span>
                  <span className="text-xs text-muted-foreground font-body">
                    {new Date(order.createdAt).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <p key={i} className="text-sm font-body text-foreground">
                      {item.quantity}× {item.dish.name}
                    </p>
                  ))}
                </div>
                {order.cookName && <p className="text-xs text-muted-foreground font-body">Повар: {order.cookName}</p>}
              </div>
            ))}
            {readyOrders.length === 0 && (
              <p className="text-center text-muted-foreground font-body py-8">Пусто</p>
            )}
          </div>
        </div>
      </div>

      <StopListSheet open={stopListOpen} onClose={() => setStopListOpen(false)} locationId={userLocationId} />

      {/* Cook selection modal */}
      <Dialog open={!!pickCookForOrder} onOpenChange={(v) => !v && setPickCookForOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Выберите повара</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {cooks.map((cook) => (
              <button
                key={cook.id}
                onClick={() => acceptOrder(cook.id)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-accent/30 hover:border-primary hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-primary" />
                </div>
                <span className="font-body font-semibold text-foreground text-sm">{cook.name}</span>
              </button>
            ))}
          </div>
          {cooks.length === 0 && (
            <p className="text-center text-muted-foreground font-body py-4">Нет поваров в системе</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Kitchen;
