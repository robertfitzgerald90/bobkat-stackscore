"use client";

import { useEffect } from "react";
import { isBobkatItReferrer } from "@/lib/analytics/ga4-config";
import { trackBobkatReferralLanding } from "@/lib/analytics/ga4-events";

/** Privacy-safe Bobkat IT referral signal for public pages (no customer identifiers). */
export function BobkatReferralTracker() {
  useEffect(() => {
    if (!isBobkatItReferrer(document.referrer)) return;
    trackBobkatReferralLanding();
  }, []);

  return null;
}
