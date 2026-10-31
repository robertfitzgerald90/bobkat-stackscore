import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { RETIRED_PUBLIC_DEMO_REDIRECTS } from "@/lib/public-demo/legacy-routes";

export const metadata: Metadata = {
  title: "StackScore Interactive Demo",
  robots: { index: false, follow: true },
  alternates: { canonical: RETIRED_PUBLIC_DEMO_REDIRECTS["/demo/technology-improvement-plan"] },
};

/**
 * SS-WEB-003-R2 — Legacy TIP marketing demo retired.
 * Redirects to the customer-parity public demo Overview.
 */
export default function TechnologyImprovementPlanDemoRetiredPage() {
  permanentRedirect(RETIRED_PUBLIC_DEMO_REDIRECTS["/demo/technology-improvement-plan"]);
}
