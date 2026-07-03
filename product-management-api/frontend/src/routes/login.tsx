import { createFileRoute, Link, redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { login, readSession } from "@/lib/api/auth";
import { NimbusWordmark } from "@/components/nimbus/logo";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  beforeLoad: () => {
    if (readSession()) {
      throw redirect({ to: "/app/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Sign in — Nimbus" },
      { name: "description", content: "Sign in to your Nimbus inventory workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const m = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: () => {
      toast.success("Welcome back");
      navigate({ to: search.redirect ?? "/app/dashboard" });
    },
    onError: (err: Error & { code?: string }) => {
      if (err.code === "NO_USER") {
        toast.info("No account for that email. Redirecting to sign up.");
        navigate({ to: "/register", search: { email } });
      } else if (err.code === "BAD_PASSWORD") {
        toast.error("That password doesn't match. Try again.");
      } else {
        toast.error("Sign in failed");
      }
    },
  });

  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight">Sign in to Nimbus</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Use <span className="font-mono">admin@nimbus.dev</span> / <span className="font-mono">password</span> for a full tour.
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!email || !password) return toast.error("Enter your email and password");
          m.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <Button type="submit" disabled={m.isPending} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
          {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/register" className="text-foreground underline underline-offset-4">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center px-4 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-primary/20 blur-[140px]" />
      </div>
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-6">
          <NimbusWordmark />
        </Link>
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardContent className="p-8">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
