"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, PawPrint, Search } from "lucide-react";
import { Header } from "./header";
import { Hero } from "./hero";
import { Footer } from "./footer";
import { ProductCard } from "./product-card";
import { ProductDetailDialog } from "./product-detail-dialog";
import { AdoptionDialog } from "./adoption-dialog";
import { CartDrawer } from "./cart-drawer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import type { SiteSettings, Category } from "@prisma/client";
import type { ProductWithMedia } from "@/lib/types";

interface Props {
  settings: SiteSettings;
  categories: Category[];
  products: ProductWithMedia[];
}

export function StorefrontApp({ settings, categories, products }: Props) {
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState<ProductWithMedia | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [adoptOpen, setAdoptOpen] = useState(false);
  const [adoptTarget, setAdoptTarget] = useState<ProductWithMedia | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  const cartCount = useCart((s) => s.count());

  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory) {
      const cat = categories.find((c) => c.slug === activeCategory);
      if (cat) list = list.filter((p) => p.categoryId === cat.id);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.breed || "").toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, activeCategory, categories, search]);

  const featured = useMemo(
    () => products.filter((p) => p.featured).slice(0, 4),
    [products]
  );

  function scrollToGrid() {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openProduct(p: ProductWithMedia) {
    setSelected(p);
    setDetailOpen(true);
  }

  function startAdoption(p: ProductWithMedia) {
    setAdoptTarget(p);
    setAdoptOpen(true);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        settings={settings}
        categories={categories}
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        search={search}
        onSearch={setSearch}
        activeCategory={activeCategory}
        onCategory={setActiveCategory}
      />

      <main className="flex-1">
        <Hero settings={settings} onBrowse={scrollToGrid} />

        {/* Featured */}
        {settings.showFeatured && featured.length > 0 && (
          <section className="container mx-auto px-4 py-12">
            <div className="mb-6 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Featured</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} onOpen={() => openProduct(p)} />
              ))}
            </div>
          </section>
        )}

        {/* Category pills */}
        <div ref={gridRef} className="container mx-auto scroll-mt-20 px-4 py-4">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <h2 className="mr-2 text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Shop All</h2>
            <Button size="sm" variant={!activeCategory ? "default" : "outline"} onClick={() => setActiveCategory(null)}>All</Button>
            {categories.map((c) => (
              <Button key={c.id} size="sm" variant={activeCategory === c.slug ? "default" : "outline"} onClick={() => setActiveCategory(c.slug)}>
                {c.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <section className="container mx-auto px-4 pb-16">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
              <Search className="h-10 w-10" />
              <p>No products found. Try a different search or category.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onOpen={() => openProduct(p)} />
              ))}
            </motion.div>
          )}
        </section>

        {/* Adoption CTA */}
        <section className="border-t bg-muted/30">
          <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <PawPrint className="h-7 w-7" />
            </span>
            <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Looking for a specific pet?
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Tell us the type, color, age and your experience — we'll help match you with your perfect companion.
            </p>
            <Button size="lg" className="gap-2" onClick={() => { setAdoptTarget(null); setAdoptOpen(true); }}>
              <Heart className="h-4 w-4" /> Submit an Adoption Request
            </Button>
          </div>
        </section>
      </main>

      <Footer settings={settings} />

      <ProductDetailDialog
        product={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onAdopt={startAdoption}
      />
      <AdoptionDialog open={adoptOpen} onOpenChange={setAdoptOpen} prefill={adoptTarget} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}
