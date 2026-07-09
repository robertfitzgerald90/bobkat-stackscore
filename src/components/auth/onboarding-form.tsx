"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OnboardingClient = {
  id: string;
  companyName: string;
  primaryContactName: string;
  primaryContactEmail: string;
};

export function OnboardingForm() {
  const router = useRouter();
  const [client, setClient] = useState<OnboardingClient | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [primaryContactName, setPrimaryContactName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/v1/onboarding");
      if (!response.ok) {
        setError("Unable to load onboarding details.");
        setLoading(false);
        return;
      }

      const payload = await response.json();
      if (payload.complete) {
        router.replace("/assessment/start");
        return;
      }

      setClient(payload.client);
      setCompanyName(payload.client.companyName);
      setPrimaryContactName(payload.client.primaryContactName);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const response = await fetch("/api/v1/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, primaryContactName }),
    });

    setSaving(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Unable to save onboarding details.");
      return;
    }

    router.push("/assessment/start");
    router.refresh();
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading onboarding...</p>;
  }

  return (
    <Card className="w-full max-w-lg shadow-sm">
      <CardHeader>
        <CardTitle>Welcome to StackScore</CardTitle>
        <CardDescription>
          Confirm your company details, then start your Technology Assessment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              value={companyName}
              onValueChange={setCompanyName}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryContactName">Primary contact name</Label>
            <Input
              id="primaryContactName"
              value={primaryContactName}
              onValueChange={setPrimaryContactName}
              required
            />
          </div>
          {client ? (
            <p className="text-sm text-muted-foreground">
              Account email: {client.primaryContactEmail}
            </p>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Start Assessment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
