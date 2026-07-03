import { apiConfig } from "@/lib/api/config";
import * as backend from "@/lib/api/backend/auth";
import * as mock from "@/lib/api/auth.mock";

const impl = apiConfig.useMock ? mock : backend;

export type { Session } from "@/lib/api/auth.mock";

export const readSession = impl.readSession;
export const login = impl.login;
export const register = impl.register;
export const logout = impl.logout;
export const updateProfile = impl.updateProfile;
export const getMe = impl.getMe;
