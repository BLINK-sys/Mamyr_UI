import type { Location, Category, Dish, Banner, Staff, Order, FooterSettings } from "@/types";

import dishBorscht from "@/assets/dish-borscht.jpg";
import dishPelmeni from "@/assets/dish-pelmeni.jpg";
import dishLagman from "@/assets/dish-lagman.jpg";
import dishPlov from "@/assets/dish-plov.jpg";
import dishManti from "@/assets/dish-manti.jpg";
import dishShashlik from "@/assets/dish-shashlik.jpg";
import dishSamsa from "@/assets/dish-samsa.jpg";
import dishShorpa from "@/assets/dish-shorpa.jpg";
import dishLyulya from "@/assets/dish-lyulya.jpg";
import dishSalad from "@/assets/dish-salad.jpg";
import dishBlini from "@/assets/dish-blini.jpg";
import dishKotlety from "@/assets/dish-kotlety.jpg";
import drinkTea from "@/assets/drink-tea.jpg";
import drinkAyran from "@/assets/drink-ayran.jpg";
import drinkCompot from "@/assets/drink-compot.jpg";
import heroCafe from "@/assets/hero-cafe.jpg";
import heroFood from "@/assets/hero-food.jpg";

export const defaultLocations: Location[] = [
  { id: "loc1", name: "Mamyr Центр", address: "ул. Абая 150, Алматы" },
  { id: "loc2", name: "Mamyr Юг", address: "мкр. Мамыр-4, д.12" },
];

export const defaultCategories: Category[] = [
  { id: "cat1", title: "Супы", order: 1, active: true },
  { id: "cat2", title: "Горячие блюда", order: 2, active: true },
  { id: "cat3", title: "Шашлык и гриль", order: 3, active: true },
  { id: "cat4", title: "Выпечка", order: 4, active: true },
  { id: "cat5", title: "Салаты", order: 5, active: true },
  { id: "cat6", title: "Напитки", order: 6, active: true },
];

export const defaultDishes: Dish[] = [
  { id: "d1", name: "Шорпа", desc: "Наваристый бульон с бараниной и овощами", ingredients: "Баранина, картофель, морковь, лук, зелень", price: 990, weight: "400 г", image: dishShorpa, categoryId: "cat1", locationIds: ["loc1", "loc2"], addons: [{ id: "a1", name: "Лепёшка", price: 150 }, { id: "a2", name: "Сметана", price: 100 }] },
  { id: "d2", name: "Лагман", desc: "Густой суп с домашней лапшой и говядиной", ingredients: "Говядина, лапша, перец, помидоры, лук", price: 1100, weight: "450 г", image: dishLagman, categoryId: "cat1", locationIds: ["loc1", "loc2"], addons: [{ id: "a3", name: "Острый соус", price: 50 }] },
  { id: "d3", name: "Борщ", desc: "Классический с говядиной и сметаной", ingredients: "Говядина, свёкла, капуста, картофель, сметана", price: 850, weight: "400 г", image: dishBorscht, categoryId: "cat1", locationIds: ["loc1"], addons: [{ id: "a4", name: "Сметана доп.", price: 100 }, { id: "a5", name: "Чеснок", price: 50 }] },
  { id: "d4", name: "Плов", desc: "Узбекский плов с бараниной и зирой", ingredients: "Рис, баранина, морковь, лук, зира, барбарис", price: 1500, weight: "400 г", image: dishPlov, categoryId: "cat2", locationIds: ["loc1", "loc2"], addons: [{ id: "a6", name: "Салат к плову", price: 200 }] },
  { id: "d5", name: "Манты", desc: "Домашние с сочной начинкой из баранины", ingredients: "Тесто, баранина, лук, специи", price: 1300, weight: "350 г", image: dishManti, categoryId: "cat2", locationIds: ["loc1", "loc2"], addons: [{ id: "a7", name: "Сметана", price: 100 }, { id: "a8", name: "Острый соус", price: 50 }] },
  { id: "d6", name: "Пельмени", desc: "По-домашнему с маслом и зеленью", ingredients: "Тесто, говядина, свинина, лук", price: 1200, weight: "300 г", image: dishPelmeni, categoryId: "cat2", locationIds: ["loc1"], addons: [] },
  { id: "d7", name: "Котлеты", desc: "Куриные с картофельным пюре", ingredients: "Курица, хлеб, лук, картофель, молоко", price: 1100, weight: "350 г", image: dishKotlety, categoryId: "cat2", locationIds: ["loc1", "loc2"], addons: [] },
  { id: "d8", name: "Шашлык из баранины", desc: "На углях с луком и зеленью", ingredients: "Баранина, лук, зелень, специи", price: 1650, weight: "300 г", image: dishShashlik, categoryId: "cat3", locationIds: ["loc1", "loc2"], addons: [{ id: "a9", name: "Лаваш", price: 100 }, { id: "a10", name: "Соус ткемали", price: 150 }] },
  { id: "d9", name: "Люля-кебаб", desc: "Из рубленой баранины на шампурах", ingredients: "Баранина, курдюк, лук, специи", price: 1200, weight: "250 г", image: dishLyulya, categoryId: "cat3", locationIds: ["loc1"], addons: [{ id: "a11", name: "Лаваш", price: 100 }] },
  { id: "d10", name: "Шашлык из курицы", desc: "Нежное куриное филе на углях", ingredients: "Куриное филе, маринад, специи", price: 950, weight: "300 г", image: dishKotlety, categoryId: "cat3", locationIds: ["loc2"], addons: [] },
  { id: "d11", name: "Самса с мясом", desc: "Слоёная с сочной начинкой", ingredients: "Слоёное тесто, баранина, лук", price: 650, weight: "200 г", image: dishSamsa, categoryId: "cat4", locationIds: ["loc1", "loc2"], addons: [] },
  { id: "d12", name: "Блины", desc: "Золотистые со сметаной", ingredients: "Мука, молоко, яйца, сметана", price: 500, weight: "250 г", image: dishBlini, categoryId: "cat4", locationIds: ["loc1", "loc2"], addons: [{ id: "a12", name: "Мёд", price: 100 }, { id: "a13", name: "Сгущёнка", price: 100 }] },
  { id: "d13", name: "Салат свежий", desc: "Помидоры, огурцы, лук, зелень", ingredients: "Помидоры, огурцы, лук, зелень, масло", price: 600, weight: "250 г", image: dishSalad, categoryId: "cat5", locationIds: ["loc1", "loc2"], addons: [{ id: "a14", name: "Без лука", price: 0 }] },
  { id: "d14", name: "Чай зелёный", desc: "Чайник ароматного зелёного чая", ingredients: "Зелёный чай", price: 400, weight: "500 мл", image: drinkTea, categoryId: "cat6", locationIds: ["loc1", "loc2"], addons: [{ id: "a15", name: "Лимон", price: 50 }] },
  { id: "d15", name: "Айран", desc: "Домашний кисломолочный напиток", ingredients: "Кисломолочная основа, соль", price: 350, weight: "300 мл", image: drinkAyran, categoryId: "cat6", locationIds: ["loc1", "loc2"], addons: [] },
  { id: "d16", name: "Компот", desc: "Из свежих ягод и фруктов", ingredients: "Ягоды, фрукты, сахар", price: 300, weight: "300 мл", image: drinkCompot, categoryId: "cat6", locationIds: ["loc1", "loc2"], addons: [] },
];

export const defaultBanners: Banner[] = [
  { id: "b1", image: heroCafe, title: "Mamyr КАФЕ", subtitle: "Настоящая восточная кухня с душой", order: 1 },
  { id: "b2", image: heroFood, title: "Свежие блюда", subtitle: "Готовим из свежих продуктов каждый день", order: 2 },
];

export const defaultStaff: Staff[] = [
  { id: "s1", name: "Алмат", email: "almat@mamyr.kz", password: "owner123", role: "owner", locationId: "loc1" },
  { id: "s2", name: "Динара", email: "dinara@mamyr.kz", password: "admin123", role: "admin", locationId: "loc1" },
  { id: "s3", name: "Бауыржан", email: "baurzhan@mamyr.kz", password: "cook123", role: "cook", locationId: "loc1" },
  { id: "s4", name: "Айгуль", email: "aigul@mamyr.kz", password: "cook123", role: "cook", locationId: "loc2" },
  { id: "s5", name: "Марат", email: "marat@mamyr.kz", password: "rec123", role: "reception", locationId: "loc1" },
  { id: "s6", name: "Жанна", email: "zhanna@mamyr.kz", password: "rec123", role: "reception", locationId: "loc2" },
];

export const defaultOrders: Order[] = [
  {
    id: "ord1",
    items: [
      { dish: defaultDishes[3], quantity: 2, addons: [] },
      { dish: defaultDishes[0], quantity: 1, addons: [{ id: "a1", name: "Лепёшка", price: 150 }] },
    ],
    total: 4140,
    status: "new",
    createdAt: new Date().toISOString(),
    customerName: "Ержан",
    customerPhone: "+7 777 111 22 33",
  },
  {
    id: "ord2",
    items: [
      { dish: defaultDishes[7], quantity: 1, addons: [{ id: "a9", name: "Лаваш", price: 100 }] },
    ],
    total: 1750,
    status: "cooking",
    cookId: "s3",
    cookName: "Бауыржан",
    createdAt: new Date(Date.now() - 600000).toISOString(),
    customerName: "Асель",
    customerPhone: "+7 777 444 55 66",
  },
];

export const defaultFooterSettings: FooterSettings = {
  description: "Настоящая восточная кухня с душой. Готовим по традиционным рецептам из свежих продуктов каждый день.",
  contacts: [
    { id: "fc1", icon: "Phone", text: "+7 (777) 123-45-67", order: 1 },
    { id: "fc2", icon: "Mail", text: "info@mamyr-cafe.kz", order: 2 },
    { id: "fc3", icon: "MapPin", text: "Доставка по всему городу", order: 3 },
  ],
  schedule: [
    { id: "fs1", text: "Пн–Вс: 10:00 – 22:00", order: 1 },
    { id: "fs2", text: "Доставка бесплатно от 5000 тг", order: 2, textColor: "hsl(42, 70%, 55%)" },
  ],
};
