"use client";

import { ShoppingCart, Search, Menu, X, PawPrint } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import type { SiteSettings, Category } from "@prisma/client";
import { cn } from "@/lib/utils";

interface HeaderProps {
  settings: SiteSettings;
  categories: Category[];
  cartCount: number;
  onCartClick: () => void;
  search: string;
  onSearch: (v: string) => void;
  activeCategory: string | null;
  onCategory: (slug: string | null) => void;
}

export function Header({
  settings,
  categories,
  cartCount,
  onCartClick,
  search,
  onSearch,
  activeCategory,
  onCategory,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex items-center justify-between py-4">
              <span className="font-semibold">Categories</span>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Close">
                  <X className="h-5 w-5" />
                </Button>
              </SheetClose>
            </div>
            <nav className="flex flex-col gap-1">
              <button
                className={cn("rounded-md px-3 py-2 text-left text-sm hover:bg-accent", !activeCategory && "bg-accent font-medium")}
                onClick={() => { onCategory(null); setMobileOpen(false); }}
              >
                All Products
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  className={cn("rounded-md px-3 py-2 text-left text-sm hover:bg-accent", activeCategory === c.slug && "bg-accent font-medium")}
                  onClick={() => { onCategory(c.slug); setMobileOpen(false); }}
                >
                  {c.name}
                </button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo + site name */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          {settings.logoUrl ? (
             
            <img src={settings.logoUrl} alt={settings.siteName} className="h-8 w-8 rounded object-contain" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PawPrint className="h-5 w-5" />
            </span>
          )}
          <span className="hidden text-lg font-bold tracking-tight sm:inline" style={{ fontFamily: "var(--font-heading)" }}>
            {settings.siteName}
          </span>
        </a>

        {/* Desktop category nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <button
            className={cn("rounded-md px-3 py-1.5 text-sm hover:bg-accent", !activeCategory && "bg-accent font-medium")}
            onClick={() => onCategory(null)}
          >
            All
          </button>
          {categories.slice(0, 6).map((c) => (
            <button
              key={c.id}
              className={cn("rounded-md px-3 py-1.5 text-sm hover:bg-accent", activeCategory === c.slug && "bg-accent font-medium")}
              onClick={() => onCategory(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </nav>

        {/* Search */}
        <div className="relative ml-auto hidden items-center sm:flex">
          <Search className="pointer-events-none absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search pets & supplies…"
            className="h-9 w-40 pl-8 lg:w-56"
          />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:ml-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative" onClick={onCartClick} aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center px-1 text-[10px]">
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
