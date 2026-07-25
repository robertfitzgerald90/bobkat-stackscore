"use client";

import { useEffect, useRef } from "react";
import { trackVerifiedPurchase } from "@/lib/analytics/ga4-events";
import { trackAssessmentPurchase } from "@/lib/analytics/marketing-events";
import type { VerifiedAssessmentPurchaseAnalytics } from "@/lib/analytics/verify-assessment-purchase";

const PURCHASE_TRACKED_STORAGE_KEY = "stackscore:assessment_purchase_tracked";

type PurchaseSuccessTrackerProps = {
  /** Server-verified Stripe payment only. Null when unpaid/unverified. */
  verifiedPurchase: VerifiedAssessmentPurchaseAnalytics | null;
};

/**
 * Fires purchase analytics only after server-side Stripe verification.
 * Dedupes across remounts and refreshes via sessionStorage + GA4 once keys.
 */
export function PurchaseSuccessTracker({ verifiedPurchase }: PurchaseSuccessTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!verifiedPurchase || trackedRef.current) return;

    const storageKey = `${PURCHASE_TRACKED_STORAGE_KEY}:${verifiedPurchase.transactionId}`;
    try {
      if (sessionStorage.getItem(storageKey) === "1") return;
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // continue with in-component / GA4 once dedupe
    }

    trackedRef.current = true;
    trackAssessmentPurchase();
    trackVerifiedPurchase({
      transactionId: verifiedPurchase.transactionId,
      value: verifiedPurchase.value,
      currency: verifiedPurchase.currency,
    });
  }, [verifiedPurchase]);

  return null;
}
