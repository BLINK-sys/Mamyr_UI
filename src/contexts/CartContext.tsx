import React, { createContext, useContext, useState, useCallback } from "react";
import type { CartItem, Dish, Addon } from "@/types";

interface CartContextType {
  items: CartItem[];
  addItem: (dish: Dish, addons?: Addon[]) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((dish: Dish, addons: Addon[] = []) => {
    setItems((prev) => {
      const key = dish.id + addons.map(a => a.id).sort().join(",");
      const existing = prev.find(
        (i) => i.dish.id === dish.id && i.selectedAddons.map(a => a.id).sort().join(",") === addons.map(a => a.id).sort().join(",")
      );
      if (existing) {
        return prev.map((i) => i === existing ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { dish, quantity: 1, selectedAddons: addons }];
    });
  }, []);

  const removeItem = useCallback((dishId: string) => {
    setItems((prev) => prev.filter((i) => i.dish.id !== dishId));
  }, []);

  const updateQuantity = useCallback((dishId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.dish.id !== dishId));
    } else {
      setItems((prev) => prev.map((i) => i.dish.id === dishId ? { ...i, quantity: qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => {
    const addonTotal = i.selectedAddons.reduce((s, a) => s + a.price, 0);
    return sum + (i.dish.price + addonTotal) * i.quantity;
  }, 0);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
};
