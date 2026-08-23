"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Shield, Check, PawPrint, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/lib/cart-store";
import type { ProductWithMedia } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  product: ProductWithMedia | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdopt: (product: ProductWithMedia) => void;
}

export function ProductDetailDialog({ product, open, onOpenChange, onAdopt }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const add = useCart((s) => s.add);

  if (!product) return null;
  const isPet = product.type === "PET";
  const media = product.media;
  const active = media[activeIdx] || media[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2">
          {/* Media gallery */}
          <div className="flex flex-col gap-3 border-b bg-muted/30 p-4 md:border-b-0 md:border-r">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              {active?.type === "VIDEO" ? (
                <video src={active.url} controls className="h-full w-full object-cover" />
              ) : active ? (
                 
                <img src={active.url} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <PawPrint className="h-16 w-16" />
                </div>
              )}
            </div>
            {media.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {media.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveIdx(i)}
                    className={cn(
                      "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted",
                      i === activeIdx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    {m.type === "VIDEO" ? (
                      <video src={m.url} className="h-full w-full object-cover" muted />
                    ) : (
                       
                      <img src={m.url} alt="" className="h-full w-full object-cover" />
                    )}
                    {m.type === "VIDEO" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs">▶</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <ScrollArea className="max-h-[80vh]">
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-center gap-2">
                {isPet ? (
                  <Badge className="bg-primary text-primary-foreground">Available for Adoption</Badge>
                ) : (
                  <Badge variant="secondary">Pet Supply</Badge>
                )}
                {product.featured && <Badge className="bg-amber-500 text-white">Featured</Badge>}
                {product.stock <= 0 && <Badge variant="destructive">Out of stock</Badge>}
              </div>

              <div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                  {product.name}
                </h2>
                {(product.breed || product.brand) && (
                  <p className="text-sm text-muted-foreground">{product.breed || product.brand}</p>
                )}
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">{formatCurrency(product.price)}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-lg text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</span>
                )}
              </div>

              <Separator />

              {/* Pet attributes */}
              {isPet && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {product.age && <Attr label="Age" value={product.age} />}
                  {product.color && <Attr label="Color" value={product.color} />}
                  {product.gender && <Attr label="Gender" value={product.gender} />}
                  {product.vaccinated !== null && (
                    <Attr label="Vaccinated" value={product.vaccinated ? "Yes" : "No"} icon={product.vaccinated ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-500" />} />
                  )}
                  {product.neutered !== null && (
                    <Attr label="Neutered" value={product.neutered ? "Yes" : "No"} icon={product.neutered ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-500" />} />
                  )}
                </div>
              )}

              <div>
                <h4 className="mb-2 text-sm font-semibold">Description</h4>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>

              <Separator />

              <div className="flex flex-col gap-2 sm:flex-row">
                {isPet ? (
                  <Button
                    size="lg"
                    className="flex-1 gap-2"
                    onClick={() => {
                      onOpenChange(false);
                      onAdopt(product);
                    }}
                  >
                    <Heart className="h-4 w-4" /> Apply to Adopt
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="flex-1 gap-2"
                    disabled={product.stock <= 0}
                    onClick={() => {
                      add({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: active?.url,
                        type: product.type,
                        stock: product.stock,
                      });
                      toast.success(`${product.name} added to cart`);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                  </Button>
                )}
              </div>
              {isPet && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" /> Adoption requires a quick application so we can ensure a great match.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Attr({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-center gap-1 font-medium">{icon}{value}</div>
    </div>
  );
}
