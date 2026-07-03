import { delay, getDb, nextId, persist, type Product } from "@/lib/mock/store";

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  sort?: "name" | "price" | "stock" | "updatedAt";
  order?: "asc" | "desc";
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export async function listProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  const {
    page = 1,
    pageSize = 10,
    search = "",
    categoryId,
    sort = "updatedAt",
    order = "desc",
  } = params;
  const db = getDb();
  let items = [...db.products];
  if (categoryId) items = items.filter((p) => p.categoryId === categoryId);
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  items.sort((a, b) => {
    const dir = order === "asc" ? 1 : -1;
    const av = a[sort];
    const bv = b[sort];
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);
  return delay({ items: paged, total, page, pageSize, totalPages }, 300);
}

export async function getProduct(id: string): Promise<Product | null> {
  return delay(getDb().products.find((p) => p.id === id) ?? null, 200);
}

export async function searchProducts(keyword: string, limit = 8): Promise<Product[]> {
  const q = keyword.trim().toLowerCase();
  if (!q) return delay([], 100);
  const items = getDb()
    .products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    )
    .slice(0, limit);
  return delay(items, 200);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const db = getDb();
  const now = new Date().toISOString();
  const product: Product = { ...input, id: nextId("p"), createdAt: now, updatedAt: now };
  db.products.unshift(product);
  persist();
  return delay(product, 350);
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const db = getDb();
  const p = db.products.find((x) => x.id === id);
  if (!p) throw new Error("NOT_FOUND");
  Object.assign(p, input, { updatedAt: new Date().toISOString() });
  persist();
  return delay(p, 300);
}

export async function deleteProduct(id: string): Promise<void> {
  const db = getDb();
  db.products = db.products.filter((p) => p.id !== id);
  persist();
  return delay(undefined, 200);
}

export async function deleteProducts(ids: string[]): Promise<void> {
  const db = getDb();
  const set = new Set(ids);
  db.products = db.products.filter((p) => !set.has(p.id));
  persist();
  return delay(undefined, 300);
}

export async function getStats() {
  const db = getDb();
  const total = db.products.length;
  const low = db.products.filter((p) => p.stock <= p.lowStockThreshold && p.stock > 0).length;
  const out = db.products.filter((p) => p.stock === 0).length;
  const inventoryValue = db.products.reduce((s, p) => s + p.price * p.stock, 0);
  const byCategory = db.categories.map((c) => ({
    id: c.id,
    name: c.name,
    count: db.products.filter((p) => p.categoryId === c.id).length,
  }));
  const recent = [...db.products]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);
  return delay(
    { total, low, out, inventoryValue, byCategory, recent, categories: db.categories.length },
    250,
  );
}
