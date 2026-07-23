"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type VcioCheckoutResponse = {
  url?: string;
  error?: string;
  message?: string;
  alreadyActive?: boolean;
};

export function VcioCheckoutButton({
  label = "Start StackScore vCIO",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    try {
      const source =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("source") ?? undefined
          : undefined;

      const response = await fetch("/api/checkout/vcio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(source ? { source } : {}),
      });
      const data = (await response.json()) as VcioCheckoutResponse;

      if (!response.ok || !data.url) {
        toast.error(data.error ?? "We could not start Checkout. Please try again.");
        return;
      }

      if (data.alreadyActive && data.message) {
        toast.info(data.message);
      }

      window.location.href = data.url;
    } catch {
      toast.error("We could not start Checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" className={className} onClick={startCheckout} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting to checkout...
        </>
      ) : (
        label
      )}
    </Button>
  );
}
