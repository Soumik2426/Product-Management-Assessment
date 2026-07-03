// In-memory + localStorage-backed mock data store.
// Swap the API layer's function bodies with real fetch() calls when the
// backend is ready; nothing else needs to change.

export type Role = "ADMIN" | "USER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  password: string; // plaintext — mock only
  avatarUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  tags: string[];
  supplier: string;
  warehouseLocation: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const KEY = "nimbus.mock.v1";

type Db = { users: User[]; categories: Category[]; products: Product[] };

const seedCategories: Category[] = [
  { id: "c-audio", name: "Audio", description: "Headphones, speakers, mics" },
  { id: "c-computing", name: "Computing", description: "Laptops, keyboards, mice" },
  { id: "c-mobile", name: "Mobile", description: "Phones and accessories" },
  { id: "c-wearables", name: "Wearables", description: "Watches and trackers" },
  { id: "c-home", name: "Home", description: "Smart home devices" },
  { id: "c-gaming", name: "Gaming", description: "Consoles, controllers" },
  { id: "c-office", name: "Office", description: "Chairs, desks, lamps" },
  { id: "c-apparel", name: "Apparel", description: "Branded apparel" },
];

const seedUsers: User[] = [
  {
    id: "u-admin",
    email: "admin@nimbus.dev",
    name: "Ada Admin",
    role: "ADMIN",
    password: "password",
  },
  {
    id: "u-user",
    email: "user@nimbus.dev",
    name: "Uma User",
    role: "USER",
    password: "password",
  },
];

function seedProducts(): Product[] {
  const now = new Date().toISOString();
  const items: Array<Omit<Product, "id" | "createdAt" | "updatedAt">> = [
    { sku: "AUD-001", name: "Aurora Studio Headphones", description: "Over-ear studio headphones with active noise cancellation and 40-hour battery.", categoryId: "c-audio", price: 249, stock: 128, lowStockThreshold: 20, tags: ["wireless", "anc"], supplier: "Auralux", warehouseLocation: "SF-A-01" },
    { sku: "AUD-002", name: "Nova Compact Earbuds", description: "In-ear buds with adaptive EQ and IPX5 water resistance.", categoryId: "c-audio", price: 129, stock: 12, lowStockThreshold: 15, tags: ["wireless"], supplier: "Auralux", warehouseLocation: "SF-A-02" },
    { sku: "AUD-003", name: "Orbit Bluetooth Speaker", description: "Portable 360° speaker with 20-hour playback.", categoryId: "c-audio", price: 89, stock: 54, lowStockThreshold: 10, tags: ["portable"], supplier: "SoundHive", warehouseLocation: "SF-A-03" },
    { sku: "CMP-001", name: "Halo 14 Ultrabook", description: "14-inch ultrabook with M-series chip and 18-hour battery.", categoryId: "c-computing", price: 1499, stock: 32, lowStockThreshold: 8, tags: ["laptop", "flagship"], supplier: "Halo Labs", warehouseLocation: "NY-B-01" },
    { sku: "CMP-002", name: "Halo 16 Pro Laptop", description: "16-inch performance laptop with dedicated GPU.", categoryId: "c-computing", price: 2399, stock: 4, lowStockThreshold: 6, tags: ["laptop", "pro"], supplier: "Halo Labs", warehouseLocation: "NY-B-02" },
    { sku: "CMP-003", name: "Tactile Mechanical Keyboard", description: "75% hot-swappable mechanical keyboard, tactile switches.", categoryId: "c-computing", price: 179, stock: 96, lowStockThreshold: 20, tags: ["keyboard", "mechanical"], supplier: "KeyForge", warehouseLocation: "NY-B-03" },
    { sku: "CMP-004", name: "Precision Wireless Mouse", description: "Ergonomic wireless mouse with 8K DPI sensor.", categoryId: "c-computing", price: 79, stock: 210, lowStockThreshold: 30, tags: ["mouse", "ergonomic"], supplier: "KeyForge", warehouseLocation: "NY-B-04" },
    { sku: "CMP-005", name: "Studio 4K Monitor 27\"", description: "27-inch 4K IPS monitor with USB-C hub.", categoryId: "c-computing", price: 549, stock: 18, lowStockThreshold: 10, tags: ["monitor"], supplier: "ClearView", warehouseLocation: "NY-B-05" },
    { sku: "MBL-001", name: "Ripple Phone 15", description: "Flagship 6.1-inch smartphone with triple camera.", categoryId: "c-mobile", price: 999, stock: 42, lowStockThreshold: 10, tags: ["phone", "flagship"], supplier: "Ripple", warehouseLocation: "LA-C-01" },
    { sku: "MBL-002", name: "Ripple Phone 15 Pro", description: "Pro model with titanium frame and telephoto lens.", categoryId: "c-mobile", price: 1199, stock: 7, lowStockThreshold: 8, tags: ["phone", "pro"], supplier: "Ripple", warehouseLocation: "LA-C-02" },
    { sku: "MBL-003", name: "MagFast Charger 30W", description: "Wireless magnetic charger, 30W fast charging.", categoryId: "c-mobile", price: 49, stock: 320, lowStockThreshold: 40, tags: ["charger", "wireless"], supplier: "ChargeCo", warehouseLocation: "LA-C-03" },
    { sku: "MBL-004", name: "Silicone Phone Case", description: "Slim silicone protective case, six colors.", categoryId: "c-mobile", price: 29, stock: 540, lowStockThreshold: 60, tags: ["case"], supplier: "CoverKit", warehouseLocation: "LA-C-04" },
    { sku: "WBL-001", name: "Pulse Smartwatch S3", description: "Health-tracking smartwatch with GPS.", categoryId: "c-wearables", price: 349, stock: 68, lowStockThreshold: 12, tags: ["watch"], supplier: "Pulse", warehouseLocation: "SF-A-04" },
    { sku: "WBL-002", name: "Pulse Fitness Band", description: "Slim fitness band with 14-day battery.", categoryId: "c-wearables", price: 99, stock: 140, lowStockThreshold: 25, tags: ["band"], supplier: "Pulse", warehouseLocation: "SF-A-05" },
    { sku: "HOM-001", name: "Ember Smart Bulb (4-pack)", description: "Color-changing smart bulbs with app control.", categoryId: "c-home", price: 59, stock: 88, lowStockThreshold: 15, tags: ["smart-home"], supplier: "Ember", warehouseLocation: "NY-B-06" },
    { sku: "HOM-002", name: "Vista Video Doorbell", description: "1080p video doorbell with two-way audio.", categoryId: "c-home", price: 199, stock: 22, lowStockThreshold: 10, tags: ["security"], supplier: "Vista", warehouseLocation: "NY-B-07" },
    { sku: "HOM-003", name: "Breeze Smart Thermostat", description: "Learning thermostat, save up to 20% on energy.", categoryId: "c-home", price: 249, stock: 34, lowStockThreshold: 8, tags: ["smart-home"], supplier: "Breeze", warehouseLocation: "NY-B-08" },
    { sku: "GAM-001", name: "Arc Console X", description: "Next-gen home console with 4K gaming.", categoryId: "c-gaming", price: 499, stock: 15, lowStockThreshold: 6, tags: ["console"], supplier: "Arc", warehouseLocation: "LA-C-05" },
    { sku: "GAM-002", name: "Arc Wireless Controller", description: "Adaptive-trigger wireless controller.", categoryId: "c-gaming", price: 69, stock: 180, lowStockThreshold: 30, tags: ["controller"], supplier: "Arc", warehouseLocation: "LA-C-06" },
    { sku: "GAM-003", name: "PixelPad Handheld", description: "Portable handheld with 7-inch OLED.", categoryId: "c-gaming", price: 399, stock: 9, lowStockThreshold: 8, tags: ["handheld"], supplier: "PixelWorks", warehouseLocation: "LA-C-07" },
    { sku: "OFC-001", name: "Ergo Mesh Chair", description: "Fully adjustable mesh office chair.", categoryId: "c-office", price: 449, stock: 26, lowStockThreshold: 6, tags: ["chair"], supplier: "Formwork", warehouseLocation: "SF-A-06" },
    { sku: "OFC-002", name: "Standing Desk 60\"", description: "Electric standing desk with memory presets.", categoryId: "c-office", price: 599, stock: 11, lowStockThreshold: 5, tags: ["desk"], supplier: "Formwork", warehouseLocation: "SF-A-07" },
    { sku: "OFC-003", name: "Halo Desk Lamp", description: "Dimmable LED desk lamp with USB-C port.", categoryId: "c-office", price: 89, stock: 74, lowStockThreshold: 15, tags: ["lamp"], supplier: "Lumen", warehouseLocation: "SF-A-08" },
    { sku: "APR-001", name: "Nimbus Cotton Tee", description: "Branded cotton tee, unisex fit.", categoryId: "c-apparel", price: 29, stock: 240, lowStockThreshold: 50, tags: ["tee"], supplier: "Nimbus", warehouseLocation: "NY-B-09" },
    { sku: "APR-002", name: "Nimbus Zip Hoodie", description: "Heavyweight zip hoodie in charcoal.", categoryId: "c-apparel", price: 79, stock: 96, lowStockThreshold: 20, tags: ["hoodie"], supplier: "Nimbus", warehouseLocation: "NY-B-10" },
    { sku: "APR-003", name: "Nimbus Trucker Cap", description: "Structured trucker cap with woven patch.", categoryId: "c-apparel", price: 24, stock: 3, lowStockThreshold: 25, tags: ["cap"], supplier: "Nimbus", warehouseLocation: "NY-B-11" },
    { sku: "AUD-004", name: "Podcaster USB Mic", description: "Cardioid USB condenser mic for podcasting.", categoryId: "c-audio", price: 119, stock: 47, lowStockThreshold: 10, tags: ["mic"], supplier: "SoundHive", warehouseLocation: "SF-A-09" },
    { sku: "CMP-006", name: "USB-C Docking Station", description: "12-in-1 USB-C dock with dual HDMI.", categoryId: "c-computing", price: 189, stock: 60, lowStockThreshold: 12, tags: ["dock"], supplier: "ClearView", warehouseLocation: "NY-B-12" },
    { sku: "MBL-005", name: "Braided USB-C Cable", description: "2m braided USB-C cable, 100W PD.", categoryId: "c-mobile", price: 19, stock: 800, lowStockThreshold: 100, tags: ["cable"], supplier: "ChargeCo", warehouseLocation: "LA-C-08" },
    { sku: "HOM-004", name: "Zephyr Smart Plug", description: "Wi-Fi smart plug with energy monitoring.", categoryId: "c-home", price: 24, stock: 260, lowStockThreshold: 40, tags: ["smart-home"], supplier: "Ember", warehouseLocation: "NY-B-13" },
    { sku: "WBL-003", name: "Pulse Sleep Ring", description: "Titanium sleep-tracking ring, sizes 6–13.", categoryId: "c-wearables", price: 299, stock: 5, lowStockThreshold: 8, tags: ["ring"], supplier: "Pulse", warehouseLocation: "SF-A-10" },
    { sku: "GAM-004", name: "Arc VR Headset", description: "Standalone VR headset with pancake lenses.", categoryId: "c-gaming", price: 599, stock: 14, lowStockThreshold: 6, tags: ["vr"], supplier: "Arc", warehouseLocation: "LA-C-09" },
    { sku: "OFC-004", name: "Anti-Fatigue Mat", description: "Cushioned mat for standing desks.", categoryId: "c-office", price: 79, stock: 58, lowStockThreshold: 12, tags: ["accessory"], supplier: "Formwork", warehouseLocation: "SF-A-11" },
    { sku: "APR-004", name: "Nimbus Beanie", description: "Ribbed knit beanie, one size.", categoryId: "c-apparel", price: 22, stock: 130, lowStockThreshold: 30, tags: ["beanie"], supplier: "Nimbus", warehouseLocation: "NY-B-14" },
    { sku: "CMP-007", name: "External SSD 2TB", description: "USB 3.2 portable SSD, 1050 MB/s.", categoryId: "c-computing", price: 219, stock: 40, lowStockThreshold: 10, tags: ["storage"], supplier: "ClearView", warehouseLocation: "NY-B-15" },
    { sku: "AUD-005", name: "Aurora Studio Stand", description: "Aluminum headphone stand with cable channel.", categoryId: "c-audio", price: 39, stock: 92, lowStockThreshold: 15, tags: ["accessory"], supplier: "Auralux", warehouseLocation: "SF-A-12" },
    { sku: "HOM-005", name: "Vista Indoor Camera", description: "1080p indoor camera with night vision.", categoryId: "c-home", price: 79, stock: 44, lowStockThreshold: 10, tags: ["security"], supplier: "Vista", warehouseLocation: "NY-B-16" },
    { sku: "MBL-006", name: "Ripple Phone SE", description: "Compact affordable phone with modern chip.", categoryId: "c-mobile", price: 499, stock: 78, lowStockThreshold: 15, tags: ["phone"], supplier: "Ripple", warehouseLocation: "LA-C-10" },
    { sku: "GAM-005", name: "Arcade Fight Stick", description: "Tournament-grade arcade fight stick.", categoryId: "c-gaming", price: 249, stock: 6, lowStockThreshold: 8, tags: ["accessory"], supplier: "Arc", warehouseLocation: "LA-C-11" },
    { sku: "OFC-005", name: "Focus Noise Panel Set", description: "Acoustic wall panels, 12-pack, hex tiles.", categoryId: "c-office", price: 129, stock: 20, lowStockThreshold: 5, tags: ["acoustic"], supplier: "Lumen", warehouseLocation: "SF-A-13" },
  ];
  return items.map((it, i) => ({
    ...it,
    id: `p-${(i + 1).toString().padStart(4, "0")}`,
    createdAt: new Date(Date.now() - (items.length - i) * 86_400_000).toISOString(),
    updatedAt: now,
  }));
}

function loadDb(): Db {
  if (typeof window === "undefined") {
    return { users: seedUsers, categories: seedCategories, products: seedProducts() };
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    /* ignore */
  }
  const fresh: Db = { users: seedUsers, categories: seedCategories, products: seedProducts() };
  window.localStorage.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}

function saveDb(db: Db) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(db));
}

let db: Db | null = null;
export function getDb(): Db {
  if (!db) db = loadDb();
  return db;
}
export function persist() {
  if (db) saveDb(db);
}
export function resetDb() {
  const fresh: Db = { users: seedUsers, categories: seedCategories, products: seedProducts() };
  db = fresh;
  saveDb(fresh);
}

export function delay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}

export function nextId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}
