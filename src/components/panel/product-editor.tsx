"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  rectSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, X, GripVertical, Star, Loader2, Image as ImageIcon, Video, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Category, ProductMedia } from "@prisma/client";

interface MediaItem {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  isNew?: boolean;
}

interface ProductEditorProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: Category[];
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    type: string;
    breed: string | null;
    age: string | null;
    color: string | null;
    gender: string | null;
    vaccinated: boolean | null;
    neutered: boolean | null;
    brand: string | null;
    stock: number;
    categoryId: string;
    featured: boolean;
    status: string;
    media: ProductMedia[];
  } | null;
  onSaved: () => void;
}

const empty = {
  name: "", description: "", price: 0, compareAtPrice: "" as string | number,
  type: "SUPPLY", breed: "", age: "", color: "", gender: "",
  vaccinated: false, neutered: false, brand: "", stock: 1,
  categoryId: "", featured: false, status: "ACTIVE",
};

export function ProductEditor({ open, onOpenChange, categories, product, onSaved }: ProductEditorProps) {
  const [form, setForm] = useState<any>(empty);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name, description: product.description, price: product.price,
        compareAtPrice: product.compareAtPrice ?? "", type: product.type,
        breed: product.breed ?? "", age: product.age ?? "", color: product.color ?? "",
        gender: product.gender ?? "", vaccinated: product.vaccinated ?? false,
        neutered: product.neutered ?? false, brand: product.brand ?? "",
        stock: product.stock, categoryId: product.categoryId ?? "",
        featured: product.featured, status: product.status,
      });
      setMedia(product.media.map((m) => ({ id: m.id, url: m.url, type: m.type as "IMAGE" | "VIDEO" })));
    } else {
      setForm({ ...empty, categoryId: categories[0]?.id || "" });
      setMedia([]);
    }
  }, [product, categories, open]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const isPet = form.type === "PET";

  const onUpload = useCallback(async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) fd.append("files", f);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Upload failed");
      }
      const { files: uploaded } = await res.json();
      setMedia((m) => [
        ...m,
        ...uploaded.map((f: any) => ({
          id: `new-${Date.now()}-${Math.random()}`,
          url: f.url,
          type: f.type as "IMAGE" | "VIDEO",
          isNew: true,
        })),
      ]);
      toast.success(`${uploaded.length} file(s) uploaded`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setMedia((items) => {
        const oldI = items.findIndex((i) => i.id === active.id);
        const newI = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldI, newI);
      });
    }
  }

  async function save() {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.categoryId) return toast.error("Category is required");
    if (form.price < 0) return toast.error("Price must be 0 or more");
    setSaving(true);
    try {
      const body = {
        ...form,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice === "" ? null : Number(form.compareAtPrice),
        stock: Number(form.stock),
        media: media.map((m) => ({ url: m.url, type: m.type })),
      };
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Save failed");
      }
      toast.success(product ? "Product updated" : "Product created");
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{product ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-5 p-6">
            {/* Media gallery */}
            <div>
              <Label className="mb-2 block">Photos & Videos</Label>
              <div className="rounded-lg border-2 border-dashed p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Drag to reorder. The first item is the main image shown on the card.
                  </p>
                  <label className="inline-flex cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => onUpload(e.target.files)}
                    />
                    <span className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90">
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Upload
                    </span>
                  </label>
                </div>
                {media.length === 0 ? (
                  <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                    No media yet. Upload photos or videos.
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={media.map((m) => m.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {media.map((m, i) => (
                          <SortableMedia
                            key={m.id}
                            item={m}
                            isMain={i === 0}
                            onRemove={() => setMedia((items) => items.filter((x) => x.id !== m.id))}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
              </Field>
              <Field label="Type">
                <Select value={form.type} onValueChange={(v) => set("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPPLY">Supply (food, toys, etc.)</SelectItem>
                    <SelectItem value="PET">Pet (for adoption)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Category" required>
                <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SOLD">Sold</SelectItem>
                    <SelectItem value="ADOPTED">Adopted</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Price (USD)" required>
                <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} />
              </Field>
              <Field label="Compare-at Price (optional)">
                <Input type="number" min="0" step="0.01" value={form.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} placeholder="Original price" />
              </Field>
              <Field label="Stock">
                <Input type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
              </Field>
              {!isPet && (
                <Field label="Brand">
                  <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} />
                </Field>
              )}
            </div>

            {isPet && (
              <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
                <Field label="Breed"><Input value={form.breed} onChange={(e) => set("breed", e.target.value)} /></Field>
                <Field label="Age"><Input value={form.age} onChange={(e) => set("age", e.target.value)} placeholder="e.g. 8 weeks" /></Field>
                <Field label="Color"><Input value={form.color} onChange={(e) => set("color", e.target.value)} /></Field>
                <Field label="Gender">
                  <Select value={form.gender || "_"} onValueChange={(v) => set("gender", v === "_" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_">—</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
                  <Label className="text-sm">Vaccinated</Label>
                  <Switch checked={!!form.vaccinated} onCheckedChange={(v) => set("vaccinated", v)} />
                </div>
                <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
                  <Label className="text-sm">Neutered / Spayed</Label>
                  <Switch checked={!!form.neutered} onCheckedChange={(v) => set("neutered", v)} />
                </div>
              </div>
            )}

            <Field label="Description">
              <Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <Label className="text-sm">Featured product</Label>
                <p className="text-xs text-muted-foreground">Shows in the featured section on the homepage</p>
              </div>
              <Switch checked={!!form.featured} onCheckedChange={(v) => set("featured", v)} />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {product ? "Save Changes" : "Create Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SortableMedia({ item, isMain, onRemove }: { item: MediaItem; isMain: boolean; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
      {item.type === "VIDEO" ? (
        <video src={item.url} className="h-full w-full object-cover" muted />
      ) : (
         
        <img src={item.url} alt="" className="h-full w-full object-cover" />
      )}
      <div className="absolute left-1 top-1 flex gap-1">
        {isMain && <Badge className="bg-amber-500 px-1 py-0 text-[10px] text-white"><Star className="mr-0.5 h-2.5 w-2.5" />Main</Badge>}
      </div>
      <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
        <button {...attributes} {...listeners} className="cursor-grab rounded bg-white/90 p-1 text-black" aria-label="Drag to reorder">
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button onClick={onRemove} className="rounded bg-red-500 p-1 text-white" aria-label="Remove">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <span className="absolute bottom-1 right-1 rounded bg-black/50 p-0.5 text-white">
        {item.type === "VIDEO" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
      </span>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
    </div>
  );
}
