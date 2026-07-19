"use client";

import { useEffect } from "react";
import { trackProductOverviewViewed } from "@/lib/analytics/product-overview-events";

export function ProductOverviewViewTracker() {
  useEffect(() => {
    trackProductOverviewViewed();
  }, []);

  return null;
}
