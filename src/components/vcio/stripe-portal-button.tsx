"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function StripePortalButton({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/clients/${clientId}/billing/portal`, { method: "POST" });
      const body = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !body.url) {
        toast.error(body.error ?? "Billing information is temporarily unavailable.");
        return;
      }
      window.location.href = body.url;
    } catch {
      toast.error("Billing information is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" onClick={openPortal} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
      Manage Billing in Stripe
    </Button>
  );
}
