import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import {
  Plus,
  Search as SearchIcon,
  Trash2,
  Pencil,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteProducts, listProducts } from "@/lib/api/products";
import { listCategories } from "@/lib/api/categories";
import { useSession } from "@/lib/auth-context";

const searchSchema = z.object({
  page: z.number().int().positive().catch(1),
  q: z.string().catch(""),
  cat: z.string().catch(""),
  sort: z.enum(["name", "price", "stock", "updatedAt"]).catch("updatedAt"),
  order: z.enum(["asc", "desc"]).catch("desc"),
});

export const Route = createFileRoute("/_app/app/products/")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Products — Nimbus" }] }),
  component: ProductsList,
});

function ProductsList() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const qc = useQueryClient();
  const session = useSession()!;
  const isAdmin = session.role === "ADMIN";

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: cats } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const { data, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () =>
      listProducts({
        page: search.page,
        pageSize: 10,
        search: search.q,
        categoryId: search.cat || undefined,
        sort: search.sort,
        order: search.order,
      }),
  });

  const catMap = useMemo(() => Object.fromEntries((cats ?? []).map((c) => [c.id, c.name])), [cats]);

  const setSearch = (patch: Partial<typeof search>) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, ...patch }) });

  const bulkDelete = useMutation({
    mutationFn: () => deleteProducts(Array.from(selected)),
    onSuccess: () => {
      toast.success(`Deleted ${selected.size} product${selected.size === 1 ? "" : "s"}`);
      setSelected(new Set());
      setConfirmDelete(false);
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const items = data?.items ?? [];
  const allSelected = items.length > 0 && items.every((p) => selected.has(p.id));

  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) items.forEach((p) => next.delete(p.id));
    else items.forEach((p) => next.add(p.id));
    setSelected(next);
  };

  const exportCsv = () => {
    const rows = items.map((p) => [p.sku, p.name, catMap[p.categoryId] ?? "", p.price, p.stock, p.supplier, p.warehouseLocation]);
    const csv = [
      ["SKU", "Name", "Category", "Price", "Stock", "Supplier", "Location"].join(","),
      ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nimbus-products.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            {data ? `${data.total} products in catalog` : "Loading catalog…"}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
            <Button asChild className="bg-gradient-brand text-primary-foreground hover:opacity-90">
              <Link to="/app/products/new"><Plus className="h-4 w-4 mr-1" /> New product</Link>
            </Button>
          </div>
        )}
      </div>

      <Card className="border-border/60 bg-card/40">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search.q}
                onChange={(e) => setSearch({ q: e.target.value, page: 1 })}
                placeholder="Search by name, SKU, tag…"
                className="pl-9"
              />
            </div>
            <Select value={search.cat || "all"} onValueChange={(v) => setSearch({ cat: v === "all" ? "" : v, page: 1 })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {(cats ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={`${search.sort}:${search.order}`} onValueChange={(v) => {
              const [sort, order] = v.split(":") as ["name" | "price" | "stock" | "updatedAt", "asc" | "desc"];
              setSearch({ sort, order });
            }}>
              <SelectTrigger className="w-52">
                <ArrowUpDown className="h-4 w-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt:desc">Recently updated</SelectItem>
                <SelectItem value="name:asc">Name (A–Z)</SelectItem>
                <SelectItem value="name:desc">Name (Z–A)</SelectItem>
                <SelectItem value="price:asc">Price (low → high)</SelectItem>
                <SelectItem value="price:desc">Price (high → low)</SelectItem>
                <SelectItem value="stock:asc">Stock (low → high)</SelectItem>
                <SelectItem value="stock:desc">Stock (high → low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isAdmin && selected.size > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
              <span>{selected.size} selected</span>
              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
              <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete selected
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60">
              {isAdmin && (
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                </TableHead>
              )}
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="border-border/60">
                <TableCell colSpan={isAdmin ? 8 : 7}><Skeleton className="h-8 w-full" /></TableCell>
              </TableRow>
            ))}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-16">
                  <Package className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No products match those filters.</p>
                </TableCell>
              </TableRow>
            )}
            {items.map((p) => {
              const stockTone =
                p.stock === 0 ? "destructive" : p.stock <= p.lowStockThreshold ? "warning" : "ok";
              return (
                <TableRow key={p.id} className="border-border/60">
                  {isAdmin && (
                    <TableCell>
                      <Checkbox
                        checked={selected.has(p.id)}
                        onCheckedChange={() => {
                          const next = new Set(selected);
                          next.has(p.id) ? next.delete(p.id) : next.add(p.id);
                          setSelected(next);
                        }}
                        aria-label={`Select ${p.name}`}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Link to="/app/products/$productId" params={{ productId: p.id }} className="font-medium hover:text-primary">
                      {p.name}
                    </Link>
                    <div className="text-xs text-muted-foreground line-clamp-1">{p.description}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{catMap[p.categoryId] ?? "—"}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">${p.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={stockTone === "destructive" ? "destructive" : "outline"}
                      className={
                        stockTone === "warning"
                          ? "border-warning/40 text-warning"
                          : stockTone === "ok"
                            ? "border-success/40 text-success"
                            : ""
                      }
                    >
                      {p.stock === 0 ? "Out" : p.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.supplier}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label="View">
                        <Link to="/app/products/$productId" params={{ productId: p.id }}>
                          <SearchIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      {isAdmin && (
                        <Button asChild variant="ghost" size="icon" aria-label="Edit">
                          <Link to="/app/products/$productId/edit" params={{ productId: p.id }}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Page {data.page} of {data.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1}
                onClick={() => setSearch({ page: data.page - 1 })}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= data.totalPages}
                onClick={() => setSearch({ page: data.page + 1 })}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selected.size} product{selected.size === 1 ? "" : "s"}?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. The products will be permanently removed from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => bulkDelete.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
