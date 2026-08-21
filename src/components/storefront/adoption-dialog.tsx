"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ProductWithMedia } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  prefill?: ProductWithMedia | null;
}

export function AdoptionDialog({ open, onOpenChange, prefill }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    petType: "",
    petColor: "",
    petAge: "",
    amount: "",
    experience: "",
    message: "",
  });

  useEffect(() => {
    if (prefill) {
      setForm((f) => ({
        ...f,
        petType: prefill.breed || prefill.category?.name || "",
        petColor: prefill.color || "",
        petAge: prefill.age || "",
        amount: prefill.price ? String(prefill.price) : "",
      }));
    }
  }, [prefill]);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.location || !form.petType) {
      toast.error(
        "Please fill in your name, email, location and the pet type.",
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/adoption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productId: prefill?.id || null }),
      });
      if (!res.ok) throw new Error("Submission failed");
      const data = await res.json();
      if (data.emailSent) {
        toast.success(
          "Application submitted! We've been notified and will reach out soon.",
        );
      } else if (data.emailFallback) {
        window.location.href = data.emailFallback;
        toast.info("Opening your email app to complete the submission…");
      } else {
        toast.success("Application submitted! Our team will reach out soon.");
      }
      onOpenChange(false);
      setForm({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        petType: "",
        petColor: "",
        petAge: "",
        amount: "",
        experience: "",
        message: "",
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" /> Adoption Application
          </DialogTitle>
          <DialogDescription>
            Tell us about yourself and the pet you'd love to adopt. We'll review
            and get back to you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" required>
              <Input
                value={form.fullName}
                onChange={set("fullName")}
                placeholder="Jane Doe"
                required
              />
            </Field>
            <Field label="Email" required>
              <Input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="jane@example.com"
                required
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.phone}
                onChange={set("phone")}
                placeholder="+1 555 000 0000"
              />
            </Field>
            <Field label="Location" required>
              <Input
                value={form.location}
                onChange={set("location")}
                placeholder="City, Country"
                required
              />
            </Field>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <h4 className="mb-3 text-sm font-semibold">
              Pet you're interested in
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Pet Type / Breed" required>
                <Input
                  value={form.petType}
                  onChange={set("petType")}
                  placeholder="e.g. Golden Retriever"
                  required
                />
              </Field>
              <Field label="Preferred Color">
                <Input
                  value={form.petColor}
                  onChange={set("petColor")}
                  placeholder="e.g. Golden"
                />
              </Field>
              <Field label="Preferred Age">
                <Input
                  value={form.petAge}
                  onChange={set("petAge")}
                  placeholder="e.g. Puppy (under 1 yr)"
                />
              </Field>
              <Field label="Budget (USD)">
                <Input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={set("amount")}
                  placeholder="e.g. 400"
                />
              </Field>
            </div>
          </div>

          <Field label="Your experience with this species (if any)">
            <Textarea
              value={form.experience}
              onChange={set("experience")}
              placeholder="Have you owned this type of pet before? Tell us about your experience…"
              rows={3}
            />
          </Field>
          <Field label="Additional message">
            <Textarea
              value={form.message}
              onChange={set("message")}
              placeholder="Anything else you'd like us to know about your home, family, or living situation…"
              rows={3}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
              Submit Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}
