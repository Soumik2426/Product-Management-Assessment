import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Tags,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getStats } from "@/lib/api/products";
import { useSession } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Nimbus" }] }),
  component: Dashboard,
});

const COLORS = [
  "oklch(0.65 0.20 275)",
  "oklch(0.80 0.15 210)",
  "oklch(0.72 0.17 160)",
  "oklch(0.80 0.16 75)",
  "oklch(0.68 0.20 340)",
  "oklch(0.75 0.15 30)",
  "oklch(0.70 0.18 130)",
  "oklch(0.62 0.20 300)",
];

function Dashboard() {
  const session = useSession()!;
  const isAdmin = session.role === "ADMIN";
  const { data, isLoading } = useQuery({ queryKey: ["stats"], queryFn: getStats });

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-3xl font-semibold tracking-tight">{session.name.split(" ")[0]}</h1>
          <p className="mt-1 text-muted-foreground">
            {isAdmin ? "Here's what's happening in your workspace." : "Here's your read-only view of the catalog."}
          </p>
        </div>
        {isAdmin && (
          <Button asChild className="bg-gradient-brand text-primary-foreground hover:opacity-90">
            <Link to="/app/products/new"><Plus className="h-4 w-4 mr-1" /> New product</Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total products" value={data?.total} icon={Package} loading={isLoading} />
        <StatCard label="Categories" value={data?.categories} icon={Tags} loading={isLoading} />
        <StatCard label="Low stock" value={data?.low} icon={AlertTriangle} loading={isLoading} tone="warning" />
        <StatCard
          label="Inventory value"
          value={data ? `$${data.inventoryValue.toLocaleString()}` : undefined}
          icon={DollarSign}
          loading={isLoading}
          tone="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/60 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-2" /> Recently updated
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/products">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {isLoading && (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              )}
              {data?.recent.map((p) => (
                <Link
                  key={p.id}
                  to="/app/products/$productId"
                  params={{ productId: p.id }}
                  className="flex items-center justify-between p-4 hover:bg-accent/30 transition-colors"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{p.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">${p.price.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{p.stock} in stock</div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/40">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-2" /> By category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data?.byCategory ?? []} dataKey="count" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                        {(data?.byCategory ?? []).map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "oklch(0.20 0.025 260)", border: "1px solid oklch(0.28 0.02 260)", borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  {(data?.byCategory ?? []).map((c, i) => (
                    <div key={c.id} className="flex items-center gap-1.5 min-w-0">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="truncate text-muted-foreground">{c.name}</span>
                      <span className="ml-auto font-mono">{c.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {isAdmin && data && (
        <Card className="border-border/60 bg-card/40">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Low-stock alerts
              <Badge variant="outline" className="ml-1">{data.low}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LowStockList />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LowStockList() {
  const { data, isLoading } = useQuery({
    queryKey: ["low-stock"],
    queryFn: async () => {
      const { listProducts } = await import("@/lib/api/products");
      const r = await listProducts({ pageSize: 100 });
      return r.items
        .filter((p) => p.stock <= p.lowStockThreshold)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 6);
    },
  });
  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (!data?.length) return <p className="text-sm text-muted-foreground">Everything is well-stocked. Nice.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {data.map((p) => (
        <Link
          key={p.id}
          to="/app/products/$productId"
          params={{ productId: p.id }}
          className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 p-3 hover:border-primary/40 transition-colors"
        >
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{p.name}</div>
            <div className="text-xs font-mono text-muted-foreground">{p.sku}</div>
          </div>
          <Badge variant={p.stock === 0 ? "destructive" : "outline"} className={p.stock === 0 ? "" : "border-warning/40 text-warning"}>
            {p.stock === 0 ? "Out" : `${p.stock} left`}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  tone,
}: {
  label: string;
  value?: string | number;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  tone?: "success" | "warning";
}) {
  return (
    <Card className="border-border/60 bg-card/40">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div
            className={`h-8 w-8 rounded-md flex items-center justify-center ${
              tone === "success"
                ? "bg-success/10 text-success"
                : tone === "warning"
                  ? "bg-warning/10 text-warning"
                  : "bg-primary/10 text-primary"
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 text-3xl font-semibold tracking-tight">
          {loading ? <Skeleton className="h-8 w-20" /> : value ?? "—"}
        </div>
      </CardContent>
    </Card>
  );
}
