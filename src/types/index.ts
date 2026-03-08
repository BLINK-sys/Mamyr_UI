export interface Location {
  id: string;
  name: string;
  address: string;
}

export interface Category {
  id: string;
  title: string;
  order: number;
  active: boolean;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Dish {
  id: string;
  name: string;
  desc: string;
  ingredients: string;
  price: number;
  weight: string;
  image: string;
  active: boolean;
  categoryId: string;
  locationIds: string[];
  stopLocationIds: string[];
  addons: Addon[];
  isCombo?: boolean;
  comboMin?: number;
  comboMax?: number;
  comboItemIds?: string[];
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  order: number;
}

export type StaffRole = "cook" | "reception" | "admin" | "owner";

export interface Staff {
  id: string;
  name: string;
  email: string;
  password: string;
  role: StaffRole;
  locationId: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  selectedAddons: Addon[];
  comboSelections?: { id: string; name: string }[];
}

export type OrderStatus = "new" | "cooking" | "ready" | "delivered";

export interface OrderItem {
  dish: Dish;
  quantity: number;
  addons: Addon[];
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  cookId?: string;
  cookName?: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
}

export interface FooterContact {
  id: string;
  icon: string;
  text: string;
  order: number;
  iconColor?: string;
  textColor?: string;
}

export interface FooterSchedule {
  id: string;
  text: string;
  order: number;
  textColor?: string;
}

export interface FooterSettings {
  description: string;
  contacts: FooterContact[];
  schedule: FooterSchedule[];
}
