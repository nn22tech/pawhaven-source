"use client";

import { useEffect, useState } from "react";
import { Package, Heart, ShoppingBag, FileHeart, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export function Dashboard({ role }: { role: "ADMIN" | "MODERATOR" }) {
  const [stats, setStats] = useState({ products: 0, pets: 0, orders: 0, applications: 0, revenue: 0, pendingOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, oRes, aRes] = await Promise.all([
          fetch("/api/products/admin"),
          fetch("/api/orders"),
          fetch("/api/adoption"),
        ]);
        const pData = await pRes.json();
        const oData = await oRes.json();
        const aData = await aRes.json();
        const products = pData.products || [];
        const orders = oData.orders || [];
        setStats({
          products: products.length,
          pets: products.filter((p: any) => p.type === "PET" && p.status === "ACTIVE").length,
          orders: orders.length,
          applications: (aData.applications || []).length,
          revenue: orders.filter((o: any) => o.status !== "CANCELLED").reduce((n: number, o: any) => n + o.total, 0),
          pendingOrders: orders.filter((o: any) => o.status === "PENDING").length,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: "Total Products", value: stats.products, icon: Package, color: "text-blue-500" },
    { label: "Pets Available", value: stats.pets, icon: Heart, color: "text-rose-500" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingBag, color: "text-amber-500" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: TrendingUp, color: "text-orange-500" },
    { label: "Adoption Applications", value: stats.applications, icon: FileHeart, color: "text-purple-500" },
    { label: "Revenue (excl. cancelled)", value: formatCurrency(stats.revenue), icon: DollarSign, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the {role === "ADMIN" ? "admin" : "moderator"} panel.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <Icon className={`h-5 w-5 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "…" : c.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
