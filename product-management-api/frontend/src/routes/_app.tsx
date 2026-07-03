import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Tags,
  User as UserIcon,
  LogOut,
  Plus,
  Search,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { NimbusLogo } from "@/components/nimbus/logo";
import { readSession, logout } from "@/lib/api/auth";
import { useSession } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    if (!readSession()) {
      throw redirect({ to: "/login", search: { redirect: location.pathname } });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const session = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!session) return null;

  const isAdmin = session.role === "ADMIN";
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  const nav = [
    { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { to: "/app/products", label: "Products", icon: Package, show: true },
    { to: "/app/categories", label: "Categories", icon: Tags, show: isAdmin },
    { to: "/app/profile", label: "My profile", icon: UserIcon, show: true },
  ];

  const handleSignOut = async () => {
    await logout();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <NimbusLogo />
            <span className="font-semibold group-data-[collapsible=icon]:hidden">Nimbus</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.filter((n) => n.show).map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive(item.to)} tooltip={item.label}>
                      <Link to={item.to}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>Quick actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="New product">
                      <Link to="/app/products/new">
                        <Plus className="h-4 w-4" />
                        <span>New product</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Search">
                      <Link to="/app/products">
                        <Search className="h-4 w-4" />
                        <span>Search</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-brand text-primary-foreground text-xs">
                {session.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <div className="text-sm font-medium truncate">{session.name}</div>
              <div className="text-xs text-muted-foreground truncate">{session.email}</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="group-data-[collapsible=icon]:hidden"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 h-14 flex items-center gap-3 border-b border-border/60 bg-background/70 backdrop-blur px-4">
          <SidebarTrigger />
          <div className="flex-1" />
          <Badge variant="outline" className="uppercase tracking-wide text-[10px]">
            {session.role}
          </Badge>
        </header>
        <div className="flex-1">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
