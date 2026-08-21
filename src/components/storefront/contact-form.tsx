"use client";

import { useState } from "react";
import { Mail, Phone, Send, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { SiteSettings } from "@prisma/client";

export function ContactForm({ settings }: { settings: SiteSettings }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email and message.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Message sent! We'll get back to you soon.");
        setForm({ name: "", email: "", phone: "", message: "" });
      } else if (data.mailto) {
        window.location.href = data.mailto;
        toast.info("Opening your email app to send the message…");
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        throw new Error(data.message || "Failed to send");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageSquare className="h-5 w-5" />
          </span>
          <h3
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Get in Touch
          </h3>
        </div>
        <p className="text-muted-foreground">
          Have a question about a pet, an order, or anything else? Send us a
          message and we'll get back to you as soon as possible.
        </p>
        <div className="space-y-2 text-sm">
          {settings.contactEmail && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <a
                href={`mailto:${settings.contactEmail}`}
                className="hover:text-primary"
              >
                {settings.contactEmail}
              </a>
            </div>
          )}
          {settings.contactPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <a
                href={`tel:${settings.contactPhone}`}
                className="hover:text-primary"
              >
                {settings.contactPhone}
              </a>
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={submit}
        className="space-y-3 rounded-xl border bg-card p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Phone (optional)</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1 555 000 0000"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Message *</Label>
          <Textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="How can we help you?"
            rows={4}
            required
          />
        </div>
        <Button type="submit" className="w-full gap-2" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send Message
        </Button>
      </form>
    </div>
  );
}
