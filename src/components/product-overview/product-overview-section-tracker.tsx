"use client";

import { useEffect } from "react";
import { trackDemoSectionViewed } from "@/lib/analytics/interactive-demo-events";
import { trackProductOverviewSectionViewed } from "@/lib/analytics/product-overview-events";
import { PRODUCT_OVERVIEW_NAV_ITEMS } from "@/lib/product-overview/navigation";
import { PRESENTATION_SECTIONS } from "@/lib/product-overview/presentation-sections";

const TRACKED_SECTION_IDS = Array.from(
  new Set(
    [
      ...PRODUCT_OVERVIEW_NAV_ITEMS.map((item) => item.sectionId),
      ...PRESENTATION_SECTIONS.map((section) => section.sectionId),
      "product-overview-trust",
      "product-overview-final-cta",
      "product-overview-business-value",
      "product-overview-outcomes",
      "product-overview-continuous-improvement",
      "product-overview-collaboration",
      "product-overview-ai-insights",
      "product-overview-success-outcomes",
      "product-overview-why-clients",
      "product-overview-platform-map",
    ].filter((id): id is string => Boolean(id)),
  ),
);

export function ProductOverviewSectionTracker() {
  useEffect(() => {
    const viewed = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.2) continue;
          const sectionId = entry.target.id;
          if (!sectionId || viewed.has(sectionId)) continue;
          viewed.add(sectionId);
          trackProductOverviewSectionViewed(sectionId);
          trackDemoSectionViewed(sectionId);
        }
      },
      { threshold: [0.2, 0.35, 0.5] },
    );

    for (const sectionId of TRACKED_SECTION_IDS) {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
