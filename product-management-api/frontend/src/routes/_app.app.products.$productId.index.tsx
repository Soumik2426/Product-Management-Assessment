import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Pencil, Trash2, Tag, MapPin, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { deleteProduct, getProduct } from "@/lib/api/products";
import { listCategories } from "@/lib/api/categories";
import { useSession } from "@/lib/auth-context";

export const Route = createFileRoute("/_app/app/products/$productId/")({
  head: () => ({ meta: [{ title: "Product — Nimbus" }] }),
  component: ProductDetail,
});

function ProductDetail() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const session = useSession()!;
  const isAdmin = session.role === "ADMIN";
  const [confirm, setConfirm] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
  });
  const { data: cats } = useQuery({ queryKey: ["categories"], queryFn: listCategories });

  const del = useMutation({
    mutationFn: () => deleteProduct(productId),
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      navigate({ to: "/app/products" });
    },
  });

  if (isLoading) {
    return <div className="mx-auto max-w-4xl p-6"><Skeleton className="h-96 w-full" /></div>;
  }
  if (!product) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-center">
        <Package className="h-10 w-10 mx-auto text-muted-foreground" />
        <h1 className="mt-3 text-xl font-semibold">Product not found</h1>
        <Button asChild className="mt-4"><Link to="/app/products">Back to products</Link></Button>
      </div>
    );
  }

  const category = cats?.find((c) => c.id === product.categoryId);
  const stockLabel = product.stock === 0 ? "Out of stock" : product.stock <= product.lowStockThreshold ? "Low stock" : "In stock";
  const stockTone = product.stock === 0 ? "destructive" : product.stock <= product.lowStockThreshold ? "warning" : "ok";

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/products"><ArrowLeft className="h-4 w-4 mr-1" /> All products</Link>
        </Button>
        {isAdmin && (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/app/products/$productId/edit" params={{ productId }}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/60 bg-card/40 overflow-hidden">
          <CardContent className="p-0">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full aspect-square object-cover" />
            ) : (
              <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-primary/10 to-brand-2/10">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              {category && <Badge variant="outline">{category.name}</Badge>}
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
                {stockLabel}
              </Badge>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{product.name}</h1>
            <div className="mt-1 font-mono text-xs text-muted-foreground">{product.sku}</div>
          </div>

          <div className="text-4xl font-semibold">${product.price.toFixed(2)}</div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <InfoRow label="Stock" value={`${product.stock} units`} />
            <InfoRow label="Low-stock alert" value={`≤ ${product.lowStockThreshold}`} />
            <InfoRow label="Supplier" value={product.supplier} icon={Truck} />
            <InfoRow label="Warehouse" value={product.warehouseLocation} icon={MapPin} />
          </div>

          {product.tags.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                <Tag className="inline h-3 w-3 mr-1" /> Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((t) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-4 border-t border-border/60">
            Updated {new Date(product.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {product.name}?</AlertDialogTitle>
            <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => del.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40 p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />} {value}
      </div>
    </div>
  );
}
