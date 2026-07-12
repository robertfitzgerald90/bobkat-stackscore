"use client";

import { useEffect, useRef } from "react";
import { trackAssessmentPurchase } from "@/lib/analytics/marketing-events";

const PURCHASE_TRACKED_STORAGE_KEY = "stackscore:assessment_purchase_tracked";

export function PurchaseSuccessTracker({ hasCheckoutSession }: { hasCheckoutSession: boolean }) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!hasCheckoutSession || trackedRef.current) return;
    if (sessionStorage.getItem(PURCHASE_TRACKED_STORAGE_KEY) === "1") return;

    trackedRef.current = true;
    sessionStorage.setItem(PURCHASE_TRACKED_STORAGE_KEY, "1");
    trackAssessmentPurchase();
  }, [hasCheckoutSession]);

  return null;
}
