"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Package, FolderTree, Users, Settings, ShoppingBag,
  FileHeart, PawPrint, Menu, LogOut, ExternalLink, Moon, Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Nav definitions live in the client component so icon components
// (functions) are never serialized across the server→client boundary.
const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/applications", label: "Adoption Applications", icon: FileHeart },
  { href: "/admin/users", label: "Users & Staff", icon: Users },
  { href: "/admin/settings", label: "Site Customization", icon: Settings },
];

const MOD_NAV: NavItem[] = [
  { href: "/moderator", label: "Dashboard", icon: LayoutDashboard },
  { href: "/moderator/products", label: "Products", icon: Package },
  { href: "/moderator/categories", label: "Categories", icon: FolderTree },
  { href: "/moderator/orders", label: "Orders", icon: ShoppingBag },
  { href: "/moderator/applications", label: "Adoption Applications", icon: FileHeart },
];

interface PanelShellProps {
  role: "ADMIN" | "MODERATOR";
  userName?: string | null;
  userEmail: string;
  siteName: string;
  children: React.ReactNode;
}

export function PanelShell({ role, userName, userEmail, siteName, children }: PanelShellProps) {
  const nav = role === "ADMIN" ? ADMIN_NAV : MOD_NAV;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <PawPrint className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-bold">{siteName}</div>
          <div className="text-[11px] text-muted-foreground">{role === "ADMIN" ? "Admin Panel" : "Moderator Panel"}</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">Signed in as</span>
          <Badge variant={role === "ADMIN" ? "default" : "secondary"}>{role}</Badge>
        </div>
        <div className="mb-2 truncate px-1 text-sm font-medium">{userName || userEmail}</div>
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          {SidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/" target="_blank">
                <ExternalLink className="h-4 w-4" /> View Site
              </Link>
            </Button>
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
