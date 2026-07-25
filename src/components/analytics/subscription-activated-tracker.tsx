"use client";

import { useEffect, useRef } from "react";
import { trackSubscriptionActivated } from "@/lib/analytics/ga4-events";

type Props = {
  verified: {
    transactionId: string;
    value: number;
    currency: string;
    billingInterval: "month" | "year" | "other";
  } | null;
};

/**
 * Fires subscription_activated only after trustworthy verification.
 * Dedupes by Checkout Session id across refreshes.
 */
export function SubscriptionActivatedTracker({ verified }: Props) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!verified || trackedRef.current) return;

    const storageKey = `stackscore:subscription_activated:${verified.transactionId}`;
    try {
      if (sessionStorage.getItem(storageKey) === "1") return;
    } catch {
      // continue
    }

    trackedRef.current = true;
    trackSubscriptionActivated({
      transactionId: verified.transactionId,
      value: verified.value,
      currency: verified.currency,
      billingInterval: verified.billingInterval,
    });

    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // ignore
    }
  }, [verified]);

  return null;
}
