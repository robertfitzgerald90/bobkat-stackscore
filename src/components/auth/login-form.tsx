"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PUBLIC_CALLBACK_PREFIXES = [
  "/login",
  "/assessment-offer",
  "/assessment-invitation",
  "/technology-snapshot",
  "/purchase/success",
  "/forgot-password",
  "/reset-password",
  "/checkout",
  "/vcio-offer",
  "/demo",
  "/",
];

function getSafeCallbackUrl(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  if (PUBLIC_CALLBACK_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    return "/dashboard";
  }

  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!result?.ok || result?.error) {
        const message =
          result?.error === "Configuration"
            ? "Authentication is not configured. Contact your administrator."
            : result?.error === "CredentialsSignin"
              ? "Invalid email or password"
              : "Unable to sign in. Please try again.";
        setError(message);
        return;
      }

      const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setError("Unable to reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-md ring-border/60">
      <CardHeader className="text-center">
        <CardTitle className="text-brand">Sign in</CardTitle>
        <CardDescription>Access your client assessments and reports</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onValueChange={setEmail}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onValueChange={setPassword}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
