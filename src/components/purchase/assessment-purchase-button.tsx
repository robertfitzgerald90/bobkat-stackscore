"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackAssessmentCheckoutStart } from "@/lib/analytics/marketing-events";
import type { AssessmentOfferAttribution } from "@/lib/assessment-offer/attribution";
import { toast } from "sonner";

export function AssessmentPurchaseButton({
  className,
  label = "Purchase Full Technology Assessment",
  source,
  attribution,
}: {
  className?: string;
  label?: string;
  source?: string;
  attribution?: AssessmentOfferAttribution;
}) {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: attribution?.source ?? source,
          prospectId: attribution?.prospectId,
          campaignId: attribution?.campaignId,
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Unable to start checkout");
        return;
      }

      trackAssessmentCheckoutStart({ source: attribution?.source ?? source });
      window.location.href = data.url;
    } catch {
      toast.error("Unable to start checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" className={className} onClick={startCheckout} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting to checkout…
        </>
      ) : (
        label
      )}
    </Button>
  );
}
