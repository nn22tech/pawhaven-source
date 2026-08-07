"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ShoppingBag, Mail, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerLocation: string | null;
  items: string;
  total: number;
  status: string;
  notes: string | null;
  createdAt: string;
}

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"];

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated");
      setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    } catch {
      toast.error("Update failed");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading…</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-muted-foreground"><ShoppingBag className="h-10 w-10" /><p>No orders yet.</p></div>
        ) : (
          <div className="divide-y">
            {orders.map((o) => {
              const items = JSON.parse(o.items || "[]") as any[];
              const isOpen = expanded === o.id;
              return (
                <div key={o.id} className="p-4">
                  <button className="flex w-full items-center gap-3 text-left" onClick={() => setExpanded(isOpen ? null : o.id)}>
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{o.id.slice(-6).toUpperCase()}</span>
                        <Badge variant={o.status === "COMPLETED" ? "default" : o.status === "CANCELLED" ? "destructive" : "secondary"}>{o.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{o.customerName} · {o.customerEmail}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(o.total)}</div>
                      <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="mt-3 space-y-3 border-t pt-3 pl-7">
                      <div>
                        <h4 className="mb-1 text-xs font-semibold text-muted-foreground">Items</h4>
                        <ul className="space-y-1 text-sm">
                          {items.map((i, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>{i.qty}× {i.name}</span>
                              <span>{formatCurrency(i.qty * i.price)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        {o.customerPhone && <div><span className="text-muted-foreground">Phone:</span> {o.customerPhone}</div>}
                        {o.customerLocation && <div><span className="text-muted-foreground">Location:</span> {o.customerLocation}</div>}
                        {o.notes && <div className="sm:col-span-2"><span className="text-muted-foreground">Notes:</span> {o.notes}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={`mailto:${o.customerEmail}?subject=Order #${o.id.slice(-6).toUpperCase()}`}>
                          <Button size="sm" variant="outline" className="gap-2"><Mail className="h-4 w-4" /> Email Customer</Button>
                        </a>
                        <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                          <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
