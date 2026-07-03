import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { readSession } from "@/lib/api/auth";
import { getProduct } from "@/lib/api/products";
import { ProductForm } from "@/components/nimbus/product-form";

export const Route = createFileRoute("/_app/app/products/$productId/edit")({
  beforeLoad: () => {
    const s = readSession();
    if (!s || s.role !== "ADMIN") throw redirect({ to: "/app/products" });
  },
  head: () => ({ meta: [{ title: "Edit product — Nimbus" }] }),
  component: EditProduct,
});

function EditProduct() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
  });

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/products/$productId" params={{ productId }}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Edit product</h1>
        {product && <p className="text-muted-foreground font-mono text-xs">{product.sku}</p>}
      </div>
      {isLoading || !product ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <ProductForm initial={product} onDone={(id) => navigate({ to: "/app/products/$productId", params: { productId: id } })} />
      )}
    </div>
  );
}
