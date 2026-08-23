"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, FileHeart, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

interface App {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  location: string;
  petType: string;
  petColor: string | null;
  petAge: string | null;
  amount: number | null;
  experience: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

const STATUSES = ["PENDING", "CONTACTED", "APPROVED", "REJECTED"];

export function ApplicationsManager() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/adoption");
      const data = await res.json();
      setApps(data.applications || []);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/adoption/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated");
      setApps((a) => a.map((x) => (x.id === id ? { ...x, status } : x)));
    } catch {
      toast.error("Update failed");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Adoption Applications</h1>
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading…</div>
        ) : apps.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-muted-foreground"><FileHeart className="h-10 w-10" /><p>No applications yet.</p></div>
        ) : (
          <div className="divide-y">
            {apps.map((a) => (
              <div key={a.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{a.fullName}</span>
                      <Badge variant={a.status === "APPROVED" ? "default" : a.status === "REJECTED" ? "destructive" : "secondary"}>{a.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{a.petType}</div>
                    {a.amount != null && <div className="text-sm text-muted-foreground">Budget: {formatCurrency(a.amount)}</div>}
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div><span className="text-muted-foreground">Email:</span> {a.email}</div>
                  {a.phone && <div><span className="text-muted-foreground">Phone:</span> {a.phone}</div>}
                  <div><span className="text-muted-foreground">Location:</span> {a.location}</div>
                  {a.petColor && <div><span className="text-muted-foreground">Color pref:</span> {a.petColor}</div>}
                  {a.petAge && <div><span className="text-muted-foreground">Age pref:</span> {a.petAge}</div>}
                  {a.experience && <div className="sm:col-span-2"><span className="text-muted-foreground">Experience:</span> {a.experience}</div>}
                  {a.message && <div className="sm:col-span-2"><span className="text-muted-foreground">Message:</span> {a.message}</div>}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <a href={`mailto:${a.email}?subject=Your adoption application`}>
                    <Button size="sm" variant="outline" className="gap-2"><Mail className="h-4 w-4" /> Contact</Button>
                  </a>
                  <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v)}>
                    <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
