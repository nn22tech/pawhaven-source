"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@prisma/client";

export function Hero({ settings, onBrowse }: { settings: SiteSettings; onBrowse: () => void }) {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="container mx-auto grid items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Heart className="h-4 w-4" /> {settings.siteTagline}
          </span>
          <h1
            className="text-4xl font-bold leading-tight tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {settings.heroTitle}
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">{settings.heroSubtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={onBrowse} className="gap-2">
              {settings.heroCtaText} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Vaccinated & healthy</span>
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Fast delivery</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-xl"
        >
          {settings.heroImageUrl ? (
             
            <img src={settings.heroImageUrl} alt={settings.siteName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">Hero image</div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
