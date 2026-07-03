import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, LogOut, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-context";
import { getMe, logout, updateProfile } from "@/lib/api/auth";

export const Route = createFileRoute("/_app/app/profile")({
  head: () => ({ meta: [{ title: "My profile — Nimbus" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const session = useSession()!;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: user } = useQuery({
    queryKey: ["me", session.userId],
    queryFn: () => getMe(session.userId),
  });

  const [name, setName] = useState(session.name);
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const saveName = useMutation({
    mutationFn: () => updateProfile({ userId: session.userId, name }),
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => toast.error("Profile updates are not available when connected to the API."),
  });

  const savePw = useMutation({
    mutationFn: () => updateProfile({ userId: session.userId, password }),
    onSuccess: () => {
      toast.success("Password changed");
      setPassword("");
      setConfirmPw("");
    },
    onError: () => toast.error("Password updates are not available when connected to the API."),
  });

  const signOut = async () => {
    await logout();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My profile</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card className="border-border/60 bg-card/40">
        <CardContent className="p-6 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-gradient-brand text-primary-foreground text-lg">
              {session.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-xl font-semibold">{session.name}</div>
            <div className="text-sm text-muted-foreground">{session.email}</div>
            <Badge variant="outline" className="mt-1 border-primary/40 text-primary">
              {session.role === "ADMIN" ? <Shield className="h-3 w-3 mr-1" /> : <UserIcon className="h-3 w-3 mr-1" />}
              {session.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/40">
        <CardHeader><CardTitle className="text-base">Profile details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={session.email} disabled />
          </div>
          <div className="flex justify-end">
            <Button
              disabled={saveName.isPending || !name.trim() || name === user?.name}
              onClick={() => saveName.mutate()}
              className="bg-gradient-brand text-primary-foreground hover:opacity-90"
            >
              {saveName.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/40">
        <CardHeader><CardTitle className="text-base">Change password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pw">New password</Label>
            <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw2">Confirm password</Label>
            <Input id="pw2" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button
              disabled={savePw.isPending || password.length < 6 || password !== confirmPw}
              onClick={() => savePw.mutate()}
              variant="outline"
            >
              {savePw.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="font-semibold">Sign out</div>
            <div className="text-sm text-muted-foreground">End this session on this device.</div>
          </div>
          <Button variant="destructive" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-1" /> Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
