import { apiFetch, writeToken, ApiError } from "@/lib/api/http";
import type { LoginResponseDto } from "@/lib/api/backend-types";
import { splitFullName, toUser } from "@/lib/api/mappers";
import type { Role, User } from "@/lib/mock/store";

const SESSION_KEY = "nimbus.session.v1";

export interface Session {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(s: Session | null) {
  if (typeof window === "undefined") return;
  if (s) window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("nimbus:auth"));
}

function sessionFromLogin(data: LoginResponseDto): Session {
  const user = data.user;
  return {
    userId: String(user.id),
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim(),
    role: user.role,
  };
}

export async function login(email: string, password: string): Promise<Session> {
  try {
    const data = await apiFetch<LoginResponseDto>("/api/v1/auth/login", {
      auth: false,
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    writeToken(data.token);
    const session = sessionFromLogin(data);
    writeSession(session);
    return session;
  } catch (err) {
    if (err instanceof ApiError) {
      const code = err.status === 404 ? "NO_USER" : err.status === 401 ? "BAD_PASSWORD" : undefined;
      if (code) {
        const mapped = new Error(code) as Error & { code?: string };
        mapped.code = code;
        throw mapped;
      }
    }
    throw err;
  }
}

export async function register(input: {
  email: string;
  password: string;
  name: string;
  role?: Role;
}): Promise<User> {
  const { firstName, lastName } = splitFullName(input.name);
  try {
    const data = await apiFetch<{
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      role: Role;
    }>("/api/v1/auth/registerUser", {
      auth: false,
      method: "POST",
      body: JSON.stringify({ firstName, lastName, email: input.email, password: input.password }),
    });
    return toUser(data);
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      const mapped = new Error("EMAIL_EXISTS") as Error & { code?: string };
      mapped.code = "EMAIL_EXISTS";
      throw mapped;
    }
    throw err;
  }
}

export async function logout(): Promise<void> {
  writeToken(null);
  writeSession(null);
}

export async function updateProfile(_input: {
  userId: string;
  name?: string;
  avatarUrl?: string;
  password?: string;
}): Promise<User> {
  throw new Error("PROFILE_NOT_SUPPORTED");
}

export async function getMe(userId: string): Promise<User | null> {
  const session = readSession();
  if (!session || session.userId !== userId) return null;
  return {
    id: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
    password: "",
  };
}
