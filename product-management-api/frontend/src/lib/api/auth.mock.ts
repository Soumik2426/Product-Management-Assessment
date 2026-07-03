import { delay, getDb, nextId, persist, type Role, type User } from "@/lib/mock/store";

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

export async function login(email: string, password: string): Promise<Session> {
  const db = getDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    await delay(null, 300);
    const err = new Error("NO_USER") as Error & { code?: string };
    err.code = "NO_USER";
    throw err;
  }
  if (user.password !== password) {
    await delay(null, 300);
    const err = new Error("BAD_PASSWORD") as Error & { code?: string };
    err.code = "BAD_PASSWORD";
    throw err;
  }
  const session: Session = { userId: user.id, email: user.email, name: user.name, role: user.role };
  writeSession(session);
  return delay(session, 250);
}

export async function register(input: {
  email: string;
  password: string;
  name: string;
  role?: Role;
}): Promise<User> {
  const db = getDb();
  if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    const err = new Error("EMAIL_EXISTS") as Error & { code?: string };
    err.code = "EMAIL_EXISTS";
    throw err;
  }
  const user: User = {
    id: nextId("u"),
    email: input.email,
    name: input.name,
    password: input.password,
    role: input.role ?? "USER",
  };
  db.users.push(user);
  persist();
  return delay(user, 400);
}

export async function logout(): Promise<void> {
  writeSession(null);
  return delay(undefined, 150);
}

export async function updateProfile(input: {
  userId: string;
  name?: string;
  avatarUrl?: string;
  password?: string;
}): Promise<User> {
  const db = getDb();
  const user = db.users.find((u) => u.id === input.userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  if (input.name) user.name = input.name;
  if (input.avatarUrl !== undefined) user.avatarUrl = input.avatarUrl;
  if (input.password) user.password = input.password;
  persist();
  const s = readSession();
  if (s && s.userId === user.id) {
    writeSession({ ...s, name: user.name });
  }
  return delay(user, 350);
}

export async function getMe(userId: string): Promise<User | null> {
  const db = getDb();
  return delay(db.users.find((u) => u.id === userId) ?? null, 150);
}
