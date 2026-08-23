"use client";

import { useState, Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PawPrint, Loader2, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/storefront/theme-toggle";
import { toast } from "sonner";

function LoginForm() {
  const params = useSearchParams();
  const error = params.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Show error toast if redirected back with an error
  useEffect(() => {
    if (error) {
      toast.error("Invalid credentials. Please try again.");
    }
  }, [error]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // NextAuth handles the redirect server-side (redirect: true is default).
    // callbackUrl is relative → NextAuth resolves it against NEXTAUTH_URL,
    // so it stays on the custom domain.
    // /auth-callback reads the session server-side and redirects to
    // /admin or /moderator based on role — one hop, no client fetch.
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/auth-callback",
    });
    // Code after this doesn't execute — browser is redirected by NextAuth
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <PawPrint className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">Staff Login</CardTitle>
        <CardDescription>Sign in to the admin or moderator panel</CardDescription>
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
              placeholder="you@example.com"
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-y-auto bg-muted/30 px-4 py-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
