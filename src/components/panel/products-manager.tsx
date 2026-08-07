"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/format";
import { ProductEditor } from "./product-editor";
import { toast } from "sonner";
import type { Category, ProductMedia } from "@prisma/client";

interface ProductRow {
  id: string;
  name: string;
  price: number;
  type: string;
  status: string;
  stock: number;
  featured: boolean;
  media: ProductMedia[];
  category?: Category | null;
}

export function ProductsManager({ categories }: { categories: Category[] }) {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Admin listing includes all statuses via dedicated fetch
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/admin");
      let data: any;
      if (res.ok) {
        data = await res.json();
      } else {
        // fallback: public list
        const r2 = await fetch("/api/products?search=" + encodeURIComponent(search));
        data = await r2.json();
      }
      setProducts(data.products || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/products/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Product deleted");
      setDeleteId(null);
      loadAll();
    } catch {
      toast.error("Delete failed");
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button className="ml-auto gap-2" onClick={() => { setEditing(null); setEditorOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="pl-8" />
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12 text-muted-foreground">
            <Package className="h-10 w-10" />
            <p>No products yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left">
                <tr>
                  <th className="p-3 font-medium">Product</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Category</th>
                  <th className="p-3 font-medium">Price</th>
                  <th className="p-3 font-medium">Stock</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const main = p.media.find((m) => m.isMain) || p.media[0];
                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                            {main && (
                               
                              <img src={main.url} alt="" className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="line-clamp-1 font-medium">{p.name}</div>
                            {p.featured && <Badge className="mt-0.5 bg-amber-500 text-[10px] text-white">Featured</Badge>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={p.type === "PET" ? "default" : "secondary"}>{p.type === "PET" ? "Pet" : "Supply"}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{p.category?.name || "—"}</td>
                      <td className="p-3 font-medium">{formatCurrency(p.price)}</td>
                      <td className="p-3">{p.stock}</td>
                      <td className="p-3">
                        <Badge variant={p.status === "ACTIVE" ? "default" : p.status === "ADOPTED" || p.status === "SOLD" ? "destructive" : "outline"}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setEditorOpen(true); }} aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteId(p.id)} aria-label="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ProductEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        categories={categories}
        product={editing}
        onSaved={loadAll}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The product and its media will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
