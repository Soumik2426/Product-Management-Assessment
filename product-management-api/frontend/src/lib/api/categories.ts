import { apiConfig } from "@/lib/api/config";
import * as backend from "@/lib/api/backend/categories";
import * as mock from "@/lib/api/categories.mock";

const impl = apiConfig.useMock ? mock : backend;

export const listCategories = impl.listCategories;
export const createCategory = impl.createCategory;
export const updateCategory = impl.updateCategory;
export const deleteCategory = impl.deleteCategory;
