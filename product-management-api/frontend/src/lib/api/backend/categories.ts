import type { Category } from "@/lib/mock/store";
import { listDistinctCategories } from "@/lib/api/backend/products";

export async function listCategories(): Promise<Category[]> {
  return listDistinctCategories();
}

export async function createCategory(_input: { name: string; description?: string }): Promise<Category> {
  const err = new Error("CATEGORY_NOT_SUPPORTED") as Error & { code?: string };
  err.code = "CATEGORY_NOT_SUPPORTED";
  throw err;
}

export async function updateCategory(
  _id: string,
  _input: { name?: string; description?: string },
): Promise<Category> {
  const err = new Error("CATEGORY_NOT_SUPPORTED") as Error & { code?: string };
  err.code = "CATEGORY_NOT_SUPPORTED";
  throw err;
}

export async function deleteCategory(_id: string): Promise<void> {
  const err = new Error("CATEGORY_NOT_SUPPORTED") as Error & { code?: string };
  err.code = "CATEGORY_NOT_SUPPORTED";
  throw err;
}
