"use client";

import { useEffect, useRef } from "react";
import {
  trackAssessmentPurchased,
  trackVerifiedPurchase,
} from "@/lib/analytics/ga4-events";
import { trackAssessmentPurchase } from "@/lib/analytics/marketing-events";

type Props = {
  verified: {
    transactionId: string;
    value: number;
    currency: string;
  } | null;
};

/**
 * Fires assessment conversion analytics only after server verification.
 * Dedupes by Checkout Session id across refreshes.
 */
export function AssessmentPurchaseConfirmedTracker({ verified }: Props) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!verified || trackedRef.current) return;

    const storageKey = `stackscore:assessment_purchased:${verified.transactionId}`;
    try {
      if (sessionStorage.getItem(storageKey) === "1") return;
    } catch {
      // continue
    }

    trackedRef.current = true;
    trackAssessmentPurchase();
    trackVerifiedPurchase({
      transactionId: verified.transactionId,
      value: verified.value,
      currency: verified.currency,
    });
    trackAssessmentPurchased({
      transactionId: verified.transactionId,
      value: verified.value,
      currency: verified.currency,
    });

    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // ignore
    }
  }, [verified]);

  return null;
}
