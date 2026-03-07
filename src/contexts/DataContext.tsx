import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Location, Category, Dish, Banner, Staff, Order, OrderStatus, FooterSettings } from "@/types";
import { defaultLocations, defaultCategories, defaultDishes, defaultBanners, defaultStaff, defaultOrders, defaultFooterSettings } from "@/data/mockData";
import { api } from "@/services/api";

interface DataContextType {
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  dishes: Dish[];
  setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
  banners: Banner[];
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>;
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  updateOrderStatus: (orderId: string, status: OrderStatus, cookId?: string, cookName?: string) => void;
  footerSettings: FooterSettings;
  setFooterSettings: React.Dispatch<React.SetStateAction<FooterSettings>>;
  refreshData: () => void;
  selectedLocation: string;
  setSelectedLocation: React.Dispatch<React.SetStateAction<string>>;
  toggleDishStop: (dishId: string, locationId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be inside DataProvider");
  return ctx;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>(defaultLocations);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [dishes, setDishes] = useState<Dish[]>(defaultDishes);
  const [banners, setBanners] = useState<Banner[]>(defaultBanners);
  const [staff, setStaff] = useState<Staff[]>(defaultStaff);
  const [orders, setOrders] = useState<Order[]>(defaultOrders);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const fetchAll = useCallback(async () => {
    try {
      const [locs, cats, dsh, bans, stf, ords, ftr] = await Promise.all([
        api.get("/locations").catch(() => null),
        api.get("/categories").catch(() => null),
        api.get("/dishes").catch(() => null),
        api.get("/banners").catch(() => null),
        api.get("/staff").catch(() => null),
        api.get("/orders").catch(() => null),
        api.get("/footer").catch(() => null),
      ]);
      if (locs) setLocations(locs.map((l: any) => ({ ...l, id: String(l.id) })));
      if (cats) setCategories(cats.map((c: any) => ({ ...c, id: String(c.id) })));
      if (dsh) setDishes(dsh.map((d: any) => ({
        ...d,
        id: String(d.id),
        categoryId: String(d.categoryId),
        locationIds: d.locationIds.map(String),
        stopLocationIds: (d.stopLocationIds || []).map(String),
        active: d.active ?? true,
        addons: d.addons.map((a: any) => ({ ...a, id: String(a.id) })),
      })));
      if (bans) setBanners(bans.map((b: any) => ({ ...b, id: String(b.id) })));
      if (stf) setStaff(stf.map((s: any) => ({ ...s, id: String(s.id), locationId: String(s.locationId), password: "" })));
      if (ords) setOrders(ords.map((o: any) => ({
        id: String(o.id),
        status: o.status,
        total: o.total,
        cookId: o.cookId ? String(o.cookId) : undefined,
        cookName: o.cookName,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        createdAt: o.createdAt,
        items: o.items.map((item: any) => ({
          dish: { id: String(item.dishId), name: item.dishName, price: item.dishPrice, desc: "", ingredients: "", weight: "", image: "", active: true, categoryId: "", locationIds: [], stopLocationIds: [], addons: [] },
          quantity: item.quantity,
          addons: item.addons || [],
        })),
      })));
      if (ftr) setFooterSettings(ftr);
    } catch (e) {
      console.log("API not available, using mock data");
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateOrderStatus = async (orderId: string, status: OrderStatus, cookId?: string, cookName?: string) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status, ...(cookId ? { cookId, cookName } : {}) }
          : o
      )
    );
    // Sync with API
    try {
      await api.patch(`/orders/${orderId}/status`, { status, cookId: cookId ? Number(cookId) : null, cookName: cookName || null });
    } catch {
      console.log("Failed to update order status on server");
    }
  };

  const toggleDishStop = async (dishId: string, locationId: string) => {
    const dish = dishes.find((d) => d.id === dishId);
    if (!dish) return;
    const isOnStop = dish.stopLocationIds.includes(locationId);
    // Optimistic update
    setDishes((prev) => prev.map((d) =>
      d.id === dishId
        ? { ...d, stopLocationIds: isOnStop ? d.stopLocationIds.filter((id) => id !== locationId) : [...d.stopLocationIds, locationId] }
        : d
    ));
    try {
      if (isOnStop) {
        await api.delete(`/dishes/${Number(dishId)}/stop/${Number(locationId)}`);
      } else {
        await api.post(`/dishes/${Number(dishId)}/stop`, { locationId: Number(locationId) });
      }
    } catch {
      await fetchAll();
    }
  };

  return (
    <DataContext.Provider value={{ locations, setLocations, categories, setCategories, dishes, setDishes, banners, setBanners, staff, setStaff, orders, setOrders, updateOrderStatus, footerSettings, setFooterSettings, refreshData: fetchAll, selectedLocation, setSelectedLocation, toggleDishStop }}>
      {children}
    </DataContext.Provider>
  );
};
