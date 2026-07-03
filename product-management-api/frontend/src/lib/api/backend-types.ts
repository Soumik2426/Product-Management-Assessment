/** Types matching the Spring Boot API envelope and DTOs. */

export type BackendRole = "ADMIN" | "USER";

export interface ApiErrorBody {
  status?: string;
  message?: string;
  subErrors?: string[];
}

export interface ApiEnvelope<T> {
  timestamp?: string;
  data?: T;
  message?: string;
  error?: ApiErrorBody;
}

export interface BackendUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: BackendRole;
}

export interface LoginResponseDto {
  token: string;
  tokenType?: string;
  user: BackendUser;
}

export interface ProductResponseDto {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginationResponseDto<T> {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  isLast: boolean;
  products: T[];
}
