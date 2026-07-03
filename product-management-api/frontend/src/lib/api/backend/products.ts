import { apiFetch } from "@/lib/api/http";
import type { PaginationResponseDto, ProductResponseDto } from "@/lib/api/backend-types";
import { toCategory, toProduct } from "@/lib/api/mappers";
import type { Product } from "@/lib/mock/store";
import type { ProductInput, ProductListParams, ProductListResult } from "@/lib/api/products.mock";

async function resolveCategoryName(categoryId: string): Promise<string> {
  const cats = await listDistinctCategories();
  return cats.find((c) => c.id === categoryId)?.name ?? categoryId.replace(/-/g, " ");
}

function mapSort(sort: ProductListParams["sort"] = "updatedAt"): string {
  switch (sort) {
    case "stock":
      return "quantity";
    case "updatedAt":
      return "createdAt";
    case "name":
    case "price":
      return sort;
    default:
      return "id";
  }
}

function toListResult(
  dto: PaginationResponseDto<ProductResponseDto>,
  page: number,
): ProductListResult {
  return {
    items: dto.products.map(toProduct),
    total: dto.totalElements,
    page: page + 1,
    pageSize: dto.pageSize,
    totalPages: Math.max(1, dto.totalPages),
  };
}

export async function listProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  const {
    page = 1,
    pageSize = 10,
    search = "",
    categoryId,
    sort = "updatedAt",
    order = "desc",
  } = params;
  const backendPage = Math.max(0, page - 1);
  const sortBy = mapSort(sort);
  const direction = order;

  const query = new URLSearchParams({
    page: String(backendPage),
    size: String(pageSize),
    sortBy,
    direction,
  });

  let path: string;
  if (search.trim()) {
    query.set("keyword", search.trim());
    path = `/api/v1/products/search?${query}`;
  } else if (categoryId) {
    query.set("category", await resolveCategoryName(categoryId));
    path = `/api/v1/products/category?${query}`;
  } else {
    path = `/api/v1/products/getProducts?${query}`;
  }

  try {
    const dto = await apiFetch<PaginationResponseDto<ProductResponseDto>>(path);
    return toListResult(dto, backendPage);
  } catch (err) {
    if (search.trim() || categoryId) {
      return { items: [], total: 0, page, pageSize, totalPages: 1 };
    }
    throw err;
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const dto = await apiFetch<ProductResponseDto>(`/api/v1/products/getProduct/${id}`);
    return toProduct(dto);
  } catch {
    return null;
  }
}

export async function searchProducts(keyword: string, limit = 8): Promise<Product[]> {
  const result = await listProducts({ search: keyword, pageSize: limit, page: 1 });
  return result.items;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const categoryName = await resolveCategoryName(input.categoryId);

  const dto = await apiFetch<ProductResponseDto>("/api/v1/products/createProduct", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      description: input.description,
      price: input.price,
      quantity: input.stock,
      category: categoryName,
    }),
  });
  return toProduct(dto);
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.description !== undefined) body.description = input.description;
  if (input.price !== undefined) body.price = input.price;
  if (input.stock !== undefined) body.quantity = input.stock;
  if (input.categoryId !== undefined) {
    body.category = await resolveCategoryName(input.categoryId);
  }

  const dto = await apiFetch<ProductResponseDto>(`/api/v1/products/updateProduct/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return toProduct(dto);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch<string>(`/api/v1/products/deleteProduct/${id}`, { method: "DELETE" });
}

export async function deleteProducts(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteProduct(id)));
}

export async function getStats() {
  const dto = await apiFetch<PaginationResponseDto<ProductResponseDto>>(
    "/api/v1/products/getProducts?page=0&size=100&sortBy=createdAt&direction=desc",
  );
  const products = dto.products.map(toProduct);
  const total = dto.totalElements;
  const low = products.filter((p) => p.stock <= p.lowStockThreshold && p.stock > 0).length;
  const out = products.filter((p) => p.stock === 0).length;
  const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  const categoryNames = new Map<string, string>();
  products.forEach((p) => {
    const name = p.categoryId.replace(/-/g, " ");
    categoryNames.set(p.categoryId, name);
  });

  const byCategory = [...categoryNames.entries()].map(([id, name]) => ({
    id,
    name,
    count: products.filter((p) => p.categoryId === id).length,
  }));

  const recent = [...products]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  return {
    total,
    low,
    out,
    inventoryValue,
    byCategory,
    recent,
    categories: categoryNames.size,
  };
}

export async function listDistinctCategories() {
  const dto = await apiFetch<PaginationResponseDto<ProductResponseDto>>(
    "/api/v1/products/getProducts?page=0&size=100&sortBy=category&direction=asc",
  );
  const seen = new Map<string, ReturnType<typeof toCategory>>();
  dto.products.forEach((p) => {
    const cat = toCategory(p.category);
    seen.set(cat.id, cat);
  });
  return [...seen.values()];
}
