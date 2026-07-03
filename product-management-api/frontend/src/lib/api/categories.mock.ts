import { delay, getDb, nextId, persist, type Category } from "@/lib/mock/store";

export async function listCategories(): Promise<Category[]> {
  return delay([...getDb().categories], 200);
}

export async function createCategory(input: { name: string; description?: string }): Promise<Category> {
  const db = getDb();
  const cat: Category = { id: nextId("c"), name: input.name, description: input.description };
  db.categories.push(cat);
  persist();
  return delay(cat, 250);
}

export async function updateCategory(
  id: string,
  input: { name?: string; description?: string },
): Promise<Category> {
  const db = getDb();
  const cat = db.categories.find((c) => c.id === id);
  if (!cat) throw new Error("NOT_FOUND");
  if (input.name !== undefined) cat.name = input.name;
  if (input.description !== undefined) cat.description = input.description;
  persist();
  return delay(cat, 250);
}

export async function deleteCategory(id: string): Promise<void> {
  const db = getDb();
  if (db.products.some((p) => p.categoryId === id)) {
    const err = new Error("CATEGORY_IN_USE") as Error & { code?: string };
    err.code = "CATEGORY_IN_USE";
    throw err;
  }
  db.categories = db.categories.filter((c) => c.id !== id);
  persist();
  return delay(undefined, 200);
}
