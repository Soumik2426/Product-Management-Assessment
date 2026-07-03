import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { readSession } from "@/lib/api/auth";
import { listProducts } from "@/lib/api/products";
import { createCategory, deleteCategory, listCategories, updateCategory } from "@/lib/api/categories";
import type { Category } from "@/lib/mock/store";

export const Route = createFileRoute("/_app/app/categories")({
  beforeLoad: () => {
    const s = readSession();
    if (!s || s.role !== "ADMIN") throw redirect({ to: "/app/dashboard" });
  },
  head: () => ({ meta: [{ title: "Categories — Nimbus" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const qc = useQueryClient();
  const { data: cats, isLoading } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const { data: allProducts } = useQuery({
    queryKey: ["products-all-counts"],
    queryFn: async () => (await listProducts({ pageSize: 1000 })).items,
  });

  const [editing, setEditing] = useState<Category | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const counts: Record<string, number> = {};
  (allProducts ?? []).forEach((p) => {
    counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;
  });

  const openNew = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setDialogOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setName(c.name);
    setDescription(c.description ?? "");
    setDialogOpen(true);
  };

  const save = useMutation({
    mutationFn: () =>
      editing
        ? updateCategory(editing.id, { name, description })
        : createCategory({ name, description }),
    onSuccess: () => {
      toast.success(editing ? "Category updated" : "Category created");
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      setDialogOpen(false);
    },
    onError: (err: Error & { code?: string }) => {
      if (err.code === "CATEGORY_NOT_SUPPORTED")
        toast.error("Category management is read-only when connected to the API.");
      else toast.error("Save failed");
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: Error & { code?: string }) => {
      if (err.code === "CATEGORY_IN_USE") toast.error("Reassign the products first — this category has SKUs in it.");
      else if (err.code === "CATEGORY_NOT_SUPPORTED")
        toast.error("Category management is read-only when connected to the API.");
      else toast.error("Delete failed");
    },
  });

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Organize your catalog by category.</p>
        </div>
        <Button onClick={openNew} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4 mr-1" /> New category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border/60 bg-card/40"><CardContent className="p-6 h-24" /></Card>
          ))}
        {(cats ?? []).map((c) => (
          <Card key={c.id} className="border-border/60 bg-card/40">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-brand-2" />
                    <span className="font-semibold">{c.name}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {c.description || "No description"}
                  </p>
                </div>
                <Badge variant="outline">{counts[c.id] ?? 0} SKUs</Badge>
              </div>
              <div className="mt-4 flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => del.mutate(c.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              disabled={save.isPending || !name.trim()}
              onClick={() => save.mutate()}
              className="bg-gradient-brand text-primary-foreground hover:opacity-90"
            >
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
