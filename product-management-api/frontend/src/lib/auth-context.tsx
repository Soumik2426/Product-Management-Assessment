import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { readSession, type Session } from "@/lib/api/auth";

function subscribe(cb: () => void) {
  window.addEventListener("nimbus:auth", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("nimbus:auth", cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): Session | null {
  return readSession();
}
function getServerSnapshot(): Session | null {
  return null;
}

const AuthCtx = createContext<Session | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    // no-op — keeps hook order stable
  }, []);
  return <AuthCtx.Provider value={session}>{children}</AuthCtx.Provider>;
}

export function useSession(): Session | null {
  return useContext(AuthCtx);
}

export function useRequiredSession(): Session {
  const s = useContext(AuthCtx);
  if (!s) throw new Error("No session");
  return s;
}
