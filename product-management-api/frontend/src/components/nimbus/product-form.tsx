import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  createProduct,
  updateProduct,
  type ProductInput,
} from "@/lib/api/products";
import { listCategories } from "@/lib/api/categories";
import type { Product } from "@/lib/mock/store";

interface Props {
  initial?: Product;
  onDone: (id: string) => void;
}

export function ProductForm({ initial, onDone }: Props) {
  const qc = useQueryClient();
  const { data: cats } = useQuery({ queryKey: ["categories"], queryFn: listCategories });

  const [f, setF] = useState<ProductInput>({
    sku: initial?.sku ?? "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? "",
    price: initial?.price ?? 0,
    stock: initial?.stock ?? 0,
    lowStockThreshold: initial?.lowStockThreshold ?? 10,
    tags: initial?.tags ?? [],
    supplier: initial?.supplier ?? "",
    warehouseLocation: initial?.warehouseLocation ?? "",
    imageUrl: initial?.imageUrl ?? "",
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (!f.categoryId && cats && cats.length) setF((p) => ({ ...p, categoryId: cats[0].id }));
  }, [cats, f.categoryId]);

  const m = useMutation({
    mutationFn: () => (initial ? updateProduct(initial.id, f) : createProduct(f)),
    onSuccess: (p) => {
      toast.success(initial ? "Product updated" : "Product created");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["product", p.id] });
      onDone(p.id);
    },
    onError: () => toast.error("Save failed"),
  });

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    if (!f.tags.includes(v)) setF({ ...f, tags: [...f.tags, v] });
    setTagInput("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) return toast.error("Name is required");
    if (!f.sku.trim()) return toast.error("SKU is required");
    if (!f.categoryId) return toast.error("Pick a category");
    if (f.price < 0) return toast.error("Price cannot be negative");
    if (f.stock < 0) return toast.error("Stock cannot be negative");
    m.mutate();
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card className="border-border/60 bg-card/40">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} className="font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={f.categoryId} onValueChange={(v) => setF({ ...f, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Pick a category" /></SelectTrigger>
                  <SelectContent>
                    {(cats ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="img">Image URL</Label>
                <Input id="img" placeholder="https://…" value={f.imageUrl ?? ""} onChange={(e) => setF({ ...f, imageUrl: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/40">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" type="number" step="0.01" value={f.price} onChange={(e) => setF({ ...f, price: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" value={f.stock} onChange={(e) => setF({ ...f, stock: parseInt(e.target.value, 10) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Low-stock at</Label>
                <Input id="threshold" type="number" value={f.lowStockThreshold} onChange={(e) => setF({ ...f, lowStockThreshold: parseInt(e.target.value, 10) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input id="supplier" value={f.supplier} onChange={(e) => setF({ ...f, supplier: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc">Warehouse location</Label>
                <Input id="loc" placeholder="e.g. SF-A-01" value={f.warehouseLocation} onChange={(e) => setF({ ...f, warehouseLocation: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="border-border/60 bg-card/40">
          <CardContent className="p-6 space-y-3">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag and press Enter"
              />
              <Button type="button" variant="outline" onClick={addTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {f.tags.map((t) => (
                <Badge key={t} variant="secondary" className="pr-1">
                  {t}
                  <button
                    type="button"
                    onClick={() => setF({ ...f, tags: f.tags.filter((x) => x !== t) })}
                    className="ml-1 rounded hover:bg-background/40 p-0.5"
                    aria-label={`Remove ${t}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {f.imageUrl && (
          <Card className="border-border/60 bg-card/40 overflow-hidden">
            <CardContent className="p-0">
              <img src={f.imageUrl} alt="Preview" className="w-full aspect-square object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
            </CardContent>
          </Card>
        )}

        <Button type="submit" disabled={m.isPending} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
          {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : initial ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
