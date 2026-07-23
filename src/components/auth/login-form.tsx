"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-brand sm:text-[1.75rem]">
          Sign In
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onValueChange={setEmail}
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onValueChange={setPassword}
            required
            className="h-11"
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <nav
        aria-label="Account help"
        className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
      >
        <Link
          href="/forgot-password"
          className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Forgot Password
        </Link>
        <Link
          href="/activate-account"
          className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Activate Account
        </Link>
      </nav>
    </div>
  );
}
