import { createFileRoute, Link, redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { register, readSession } from "@/lib/api/auth";
import { AuthShell } from "@/routes/login";

const searchSchema = z.object({ email: z.string().optional() });

export const Route = createFileRoute("/register")({
  validateSearch: searchSchema,
  beforeLoad: () => {
    if (readSession()) throw redirect({ to: "/app/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Create account — Nimbus" },
      { name: "description", content: "Create a Nimbus inventory management account." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/register" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState(search.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");

  const m = useMutation({
    mutationFn: () =>
      register({ name, email, password, role }),
    onSuccess: () => {
      toast.success("Account created. Please sign in.");
      navigate({ to: "/login" });
    },
    onError: (err: Error & { code?: string }) => {
      if (err.code === "EMAIL_EXISTS") toast.error("An account with that email already exists");
      else toast.error("Could not create account");
    },
  });

  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight">Create your Nimbus account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Free to start. Upgrade only when it pays for itself.
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return toast.error("Enter your name");
          if (!email.trim()) return toast.error("Enter your email");
          if (password.length < 6) return toast.error("Password must be at least 6 characters");
          m.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </div>
        <div className="space-y-2">
          <Label>Account type</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["USER", "ADMIN"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-md border px-3 py-2 text-sm text-left transition-colors ${
                  role === r ? "border-primary bg-primary/10" : "border-border bg-card/40 hover:border-primary/40"
                }`}
              >
                <div className="font-medium">{r === "USER" ? "Team member" : "Administrator"}</div>
                <div className="text-xs text-muted-foreground">
                  {r === "USER" ? "Browse and search products" : "Full read/write access"}
                </div>
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={m.isPending} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
          {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
