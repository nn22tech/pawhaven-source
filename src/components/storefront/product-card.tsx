"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingCart, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/lib/cart-store";
import type { ProductWithMedia } from "@/lib/types";
import { toast } from "sonner";

export function ProductCard({
  product,
  onOpen,
}: {
  product: ProductWithMedia;
  onOpen: () => void;
}) {
  const add = useCart((s) => s.add);
  const main = product.media.find((m) => m.isMain) || product.media[0];
  const isPet = product.type === "PET";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
    >
      <button
        onClick={onOpen}
        className="relative aspect-square overflow-hidden bg-muted"
        aria-label={`View ${product.name}`}
      >
        {main ? (
           
          <img
            src={main.url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <PawPrint className="h-12 w-12" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          {isPet ? (
            <Badge className="bg-primary/90 text-primary-foreground">Adopt</Badge>
          ) : (
            <Badge variant="secondary">Supply</Badge>
          )}
          {product.featured && <Badge variant="default" className="bg-amber-500 text-white">Featured</Badge>}
        </div>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <Badge className="absolute right-2 top-2 bg-red-500 text-white">
            -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
          </Badge>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <button onClick={onOpen} className="text-left">
          <h3 className="line-clamp-1 font-semibold leading-tight hover:text-primary">{product.name}</h3>
        </button>
        {isPet && product.breed && (
          <p className="text-xs text-muted-foreground">{product.breed}{product.age ? ` · ${product.age}` : ""}</p>
        )}
        {!isPet && product.brand && (
          <p className="text-xs text-muted-foreground">{product.brand}</p>
        )}
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</span>
            )}
          </div>
          <Button
            size="sm"
            variant={isPet ? "default" : "secondary"}
            className="gap-1"
            disabled={product.stock <= 0}
            onClick={() => {
              if (isPet) {
                onOpen();
              } else {
                add({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: main?.url,
                  type: product.type,
                  stock: product.stock,
                });
                toast.success(`${product.name} added to cart`);
              }
            }}
          >
            {isPet ? <Heart className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            {isPet ? "Adopt" : "Add"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
