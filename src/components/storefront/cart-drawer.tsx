"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingCart, Mail, Loader2, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const clear = useCart((s) => s.clear);
  const total = useCart((s) => s.total());

  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [submitting, setSubmitting] = useState(false);
  const [cust, setCust] = useState({ name: "", email: "", phone: "", location: "", notes: "" });

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!cust.name || !cust.email) {
      toast.error("Please provide your name and email.");
      return;
    }
    if (!items.length) {
      toast.error("Your cart is empty.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: cust, items }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const data = await res.json();

      if (data.emailSent) {
        toast.success("Order placed! We've received your order and will contact you shortly.");
      } else if (data.mailto) {
        window.location.href = data.mailto;
        toast.success("Order placed! Your email app should now open with the order details.");
      } else {
        toast.success("Order placed!");
      }
      clear();
      setStep("cart");
      onOpenChange(false);
    } catch {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {step === "cart" ? "Your Cart" : "Checkout"}
          </SheetTitle>
          <SheetDescription>
            {step === "cart"
              ? `${items.length} item${items.length !== 1 ? "s" : ""} in your cart`
              : "Enter your details to place the order via email."}
          </SheetDescription>
        </SheetHeader>

        {step === "cart" ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((i) => (
                    <li key={i.id} className="flex gap-3 rounded-lg border p-2">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                        {i.image && (
                           
                          <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <span className="line-clamp-2 text-sm font-medium">{i.name}</span>
                          <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatCurrency(i.price)}</span>
                        <div className="mt-auto flex items-center gap-2">
                          <div className="flex items-center rounded-md border">
                            <button className="p-1" onClick={() => setQty(i.id, i.qty - 1)} aria-label="Decrease">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm">{i.qty}</span>
                            <button className="p-1" onClick={() => setQty(i.id, i.qty + 1)} aria-label="Increase">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="ml-auto text-sm font-semibold">{formatCurrency(i.price * i.qty)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <SheetFooter className="border-t">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-bold">{formatCurrency(total)}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clear} disabled={!items.length}>Clear Cart</Button>
                <Button className="flex-1 gap-2" disabled={!items.length} onClick={() => setStep("checkout")}>
                  <Mail className="h-4 w-4" /> Checkout
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <form onSubmit={placeOrder} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <button type="button" onClick={() => setStep("cart")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to cart
              </button>
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <div className="mb-1 flex justify-between"><span className="text-muted-foreground">Items</span><span>{items.length}</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>
              <Field label="Full Name" required>
                <Input value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} required />
              </Field>
              <Field label="Email" required>
                <Input type="email" value={cust.email} onChange={(e) => setCust({ ...cust, email: e.target.value })} required />
              </Field>
              <Field label="Phone">
                <Input value={cust.phone} onChange={(e) => setCust({ ...cust, phone: e.target.value })} />
              </Field>
              <Field label="Location">
                <Input value={cust.location} onChange={(e) => setCust({ ...cust, location: e.target.value })} placeholder="City, Country" />
              </Field>
              <Field label="Order notes">
                <Textarea value={cust.notes} onChange={(e) => setCust({ ...cust, notes: e.target.value })} rows={2} />
              </Field>
              <p className="rounded-md bg-primary/5 p-3 text-xs text-muted-foreground">
                <Mail className="mr-1 inline h-3 w-3" />
                Clicking <strong>Place Order</strong> will open your email app with a pre-written order message addressed to our store. Just hit send!
              </p>
            </div>
            <SheetFooter className="border-t">
              <Button type="submit" className="gap-2" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Place Order via Email
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
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
