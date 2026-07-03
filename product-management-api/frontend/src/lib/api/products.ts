import { apiConfig } from "@/lib/api/config";
import * as backend from "@/lib/api/backend/products";
import * as mock from "@/lib/api/products.mock";

const impl = apiConfig.useMock ? mock : backend;

export type {
  ProductInput,
  ProductListParams,
  ProductListResult,
} from "@/lib/api/products.mock";

export const listProducts = impl.listProducts;
export const getProduct = impl.getProduct;
export const searchProducts = impl.searchProducts;
export const createProduct = impl.createProduct;
export const updateProduct = impl.updateProduct;
export const deleteProduct = impl.deleteProduct;
export const deleteProducts = impl.deleteProducts;
export const getStats = impl.getStats;
