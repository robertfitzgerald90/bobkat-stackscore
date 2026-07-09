"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ActivateAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setError("Activation link is missing or invalid.");
      return;
    }

    async function validate() {
      const response = await fetch(
        `/api/v1/public/activate-account?token=${encodeURIComponent(token)}`,
      );
      const payload = await response.json();
      setValidating(false);

      if (!payload.valid) {
        setError("This activation link is invalid or has expired.");
        return;
      }

      setEmail(payload.email);
      if (payload.name) setName(payload.name);
      if (payload.alreadyActive) {
        setError("This account is already active. Please sign in.");
      }
    }

    validate();
  }, [token]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (password.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/v1/public/activate-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, name: name.trim() || undefined }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Unable to activate account.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email: payload.email,
        password,
        redirect: false,
      });

      if (!signInResult?.ok) {
        router.push("/login?callbackUrl=/onboarding");
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Unable to activate account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (validating) {
    return (
      <Card className="w-full max-w-md shadow-md">
        <CardContent className="py-8 text-center text-muted-foreground">
          Validating activation link...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-md ring-border/60">
      <CardHeader className="text-center">
        <CardTitle className="text-brand">Activate your account</CardTitle>
        <CardDescription>
          {email ? `Set a password for ${email}` : "Complete your account setup"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" value={name} onValueChange={setName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onValueChange={setPassword}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading || Boolean(error && !email)}>
            {loading ? "Activating..." : "Activate account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
