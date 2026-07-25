"use client";

import { useEffect } from "react";
import { trackViewAssessmentOffer } from "@/lib/analytics/ga4-events";

export function AssessmentOfferViewTracker() {
  useEffect(() => {
    trackViewAssessmentOffer();
  }, []);

  return null;
}
