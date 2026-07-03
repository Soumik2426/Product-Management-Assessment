import type { ProductResponseDto } from "@/lib/api/backend-types";
import type { Category, Product, Role, User } from "@/lib/mock/store";

export function categoryIdFromName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function toProduct(dto: ProductResponseDto): Product {
  const updatedAt = dto.updatedAt ?? dto.createdAt;
  return {
    id: String(dto.id),
    sku: `PRD-${dto.id}`,
    name: dto.name,
    description: dto.description,
    categoryId: categoryIdFromName(dto.category),
    price: Number(dto.price),
    stock: dto.quantity,
    lowStockThreshold: 10,
    tags: [],
    supplier: "",
    warehouseLocation: "",
    createdAt: dto.createdAt,
    updatedAt,
  };
}

export function toCategory(name: string, description?: string): Category {
  return {
    id: categoryIdFromName(name),
    name,
    description,
  };
}

export function toUser(dto: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}): User {
  return {
    id: String(dto.id),
    email: dto.email,
    name: `${dto.firstName} ${dto.lastName}`.trim(),
    role: dto.role,
    password: "",
  };
}

export function splitFullName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "User", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "User" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}
