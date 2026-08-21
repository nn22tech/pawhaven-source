"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PawPrint, Loader2, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/storefront/theme-toggle";
import { toast } from "sonner";

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setLoading(false);
        toast.error("Invalid credentials.");
        return;
      }

      toast.success("Welcome back! Redirecting…");

      // Fetch the session with retries — the cookie may take a moment
      // to be available, especially on mobile/slow connections.
      let role: string | undefined;
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 300));
        try {
          const r = await fetch("/api/auth/session", { cache: "no-store" });
          const data = await r.json();
          role = data?.user?.role;
          if (role) break;
        } catch {
          // retry
        }
      }

      // Hard redirect — more reliable than router.push on mobile
      const target =
        role === "ADMIN"
          ? "/admin"
          : role === "MODERATOR"
            ? "/moderator"
            : callbackUrl;
      window.location.href = target;
    } catch {
      setLoading(false);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <PawPrint className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">Staff Login</CardTitle>
        <CardDescription>
          Sign in to the admin or moderator panel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@pawhaven.com"
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Sign In
          </Button>
        </form>
        <div className="mt-6 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Demo credentials</p>
          <p className="mt-1">Admin: admin@pawhaven.com / Admin@1234</p>
          <p>Moderator: moderator@pawhaven.com / Moderator@1234</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Suspense
        fallback={<div className="text-muted-foreground">Loading…</div>}
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
