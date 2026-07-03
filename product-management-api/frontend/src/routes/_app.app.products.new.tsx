import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readSession } from "@/lib/api/auth";
import { ProductForm } from "@/components/nimbus/product-form";

export const Route = createFileRoute("/_app/app/products/new")({
  beforeLoad: () => {
    const s = readSession();
    if (!s || s.role !== "ADMIN") throw redirect({ to: "/app/products" });
  },
  head: () => ({ meta: [{ title: "New product — Nimbus" }] }),
  component: NewProduct,
});

function NewProduct() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/products"><ArrowLeft className="h-4 w-4 mr-1" /> All products</Link>
        </Button>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">New product</h1>
        <p className="text-muted-foreground">Add a new SKU to your catalog.</p>
      </div>
      <ProductForm onDone={(id) => navigate({ to: "/app/products/$productId", params: { productId: id } })} />
    </div>
  );
}
