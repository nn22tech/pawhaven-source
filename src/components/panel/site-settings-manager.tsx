"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Upload, PawPrint, Palette, Type, Image as ImageIcon, Layout, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { SiteSettings } from "@prisma/client";

const FONTS = [
  { value: "geist", label: "Geist (Default)" },
  { value: "poppins", label: "Poppins" },
  { value: "playfair", label: "Playfair Display" },
  { value: "lora", label: "Lora" },
  { value: "inter", label: "Inter" },
  { value: "mono", label: "Mono" },
];

const RADII = [
  { value: "0.25rem", label: "Sharp" },
  { value: "0.5rem", label: "Subtle" },
  { value: "0.625rem", label: "Default" },
  { value: "0.75rem", label: "Rounded" },
  { value: "1rem", label: "Very Rounded" },
  { value: "1.5rem", label: "Pill-ish" },
];

export function SiteSettingsManager({ initial }: { initial: SiteSettings }) {
  const [form, setForm] = useState<any>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(initial); }, [initial]);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  async function upload(field: "logoUrl" | "faviconUrl" | "heroImageUrl", files: FileList | null) {
    if (!files || !files[0]) return;
    const fd = new FormData();
    fd.append("files", files[0]);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { files: up } = await res.json();
      set(field, up[0].url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved — changes are live!");
      // Force refresh so layout/metadata picks up new values
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Site Customization</h1>
        <Button className="ml-auto gap-2" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
        </Button>
      </div>

      <Tabs defaultValue="identity">
        <TabsList className="flex-wrap">
          <TabsTrigger value="identity" className="gap-1.5"><PawPrint className="h-4 w-4" /> Identity</TabsTrigger>
          <TabsTrigger value="theme" className="gap-1.5"><Palette className="h-4 w-4" /> Theme & Fonts</TabsTrigger>
          <TabsTrigger value="hero" className="gap-1.5"><ImageIcon className="h-4 w-4" /> Hero</TabsTrigger>
          <TabsTrigger value="footer" className="gap-1.5"><Layout className="h-4 w-4" /> Footer & Contact</TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5"><Share2 className="h-4 w-4" /> Social</TabsTrigger>
        </TabsList>

        {/* Identity */}
        <TabsContent value="identity" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Site Identity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Site Name"><Input value={form.siteName} onChange={(e) => set("siteName", e.target.value)} /></Field>
                <Field label="Tagline"><Input value={form.siteTagline} onChange={(e) => set("siteTagline", e.target.value)} /></Field>
              </div>
              <ImageField label="Logo" value={form.logoUrl} onUpload={(f) => upload("logoUrl", f)} onClear={() => set("logoUrl", "")} preview="contain" />
              <ImageField label="Favicon (taskbar icon)" value={form.faviconUrl} onUpload={(f) => upload("faviconUrl", f)} onClear={() => set("faviconUrl", "")} preview="contain" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme */}
        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Type className="h-4 w-4" /> Colors & Fonts</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Leave colors blank to use the default theme. Colors apply to the whole storefront.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Primary Color">
                  <div className="flex gap-2">
                    <Input value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} placeholder="e.g. #0ea5e9 or oklch(...)" />
                    <input type="color" value={form.primaryColor || "#000000"} onChange={(e) => set("primaryColor", e.target.value)} className="h-9 w-12 cursor-pointer rounded border" />
                  </div>
                </Field>
                <Field label="Accent Color">
                  <div className="flex gap-2">
                    <Input value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} placeholder="e.g. #f59e0b" />
                    <input type="color" value={form.accentColor || "#000000"} onChange={(e) => set("accentColor", e.target.value)} className="h-9 w-12 cursor-pointer rounded border" />
                  </div>
                </Field>
                <Field label="Heading Font">
                  <Select value={form.fontHeading} onValueChange={(v) => set("fontHeading", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FONTS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Body Font">
                  <Select value={form.fontBody} onValueChange={(v) => set("fontBody", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FONTS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Border Radius (corner roundness)">
                  <Select value={form.borderRadius} onValueChange={(v) => set("borderRadius", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{RADII.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <h4 className="mb-2 text-sm font-semibold">Live Preview</h4>
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-primary px-4 py-2 text-primary-foreground" style={{ fontFamily: "var(--font-heading)" }}>Heading text</span>
                  <span className="text-foreground" style={{ fontFamily: "var(--font-body)" }}>Body text sample</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Hero Title"><Input value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} /></Field>
              <Field label="Hero Subtitle"><Textarea rows={2} value={form.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} /></Field>
              <Field label="Hero CTA Button Text"><Input value={form.heroCtaText} onChange={(e) => set("heroCtaText", e.target.value)} /></Field>
              <ImageField label="Hero Image" value={form.heroImageUrl} onUpload={(f) => upload("heroImageUrl", f)} onClear={() => set("heroImageUrl", "")} preview="cover" aspect="4/3" />
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div><Label className="text-sm">Show Featured Section</Label><p className="text-xs text-muted-foreground">Display featured products on the homepage</p></div>
                <Switch checked={!!form.showFeatured} onCheckedChange={(v) => set("showFeatured", v)} />
              </div>
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div><Label className="text-sm">Show Categories</Label><p className="text-xs text-muted-foreground">Display category filter pills</p></div>
                <Switch checked={!!form.showCategories} onCheckedChange={(v) => set("showCategories", v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer & contact */}
        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Footer & Contact</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Footer Text"><Input value={form.footerText} onChange={(e) => set("footerText", e.target.value)} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Contact Email"><Input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} /></Field>
                <Field label="Order Email (receives orders)"><Input type="email" value={form.orderEmail} onChange={(e) => set("orderEmail", e.target.value)} /></Field>
                <Field label="Contact Phone"><Input value={form.contactPhone || ""} onChange={(e) => set("contactPhone", e.target.value)} /></Field>
                <Field label="Address"><Input value={form.address || ""} onChange={(e) => set("address", e.target.value)} /></Field>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Social Links</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Instagram URL"><Input value={form.socialInstagram || ""} onChange={(e) => set("socialInstagram", e.target.value)} /></Field>
                <Field label="Facebook URL"><Input value={form.socialFacebook || ""} onChange={(e) => set("socialFacebook", e.target.value)} /></Field>
                <Field label="Twitter / X URL"><Input value={form.socialTwitter || ""} onChange={(e) => set("socialTwitter", e.target.value)} /></Field>
                <Field label="YouTube URL"><Input value={form.socialYoutube || ""} onChange={(e) => set("socialYoutube", e.target.value)} /></Field>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function ImageField({ label, value, onUpload, onClear, preview, aspect }: {
  label: string; value: string | null; onUpload: (f: FileList | null) => void; onClear?: () => void;
  preview: "contain" | "cover"; aspect?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted" style={aspect ? { aspectRatio: aspect } : undefined}>
          {value ? (
             
            <img src={value} alt={label} className={`h-full w-full ${preview === "contain" ? "object-contain" : "object-cover"}`} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>
          )}
        </div>
        <label className="inline-flex cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files)} />
          <span className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
            <Upload className="h-4 w-4" /> Upload
          </span>
        </label>
        {value && onClear && (
          <Button size="sm" variant="ghost" onClick={onClear}>Clear</Button>
        )}
      </div>
    </div>
  );
}
