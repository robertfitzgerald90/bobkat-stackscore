import type { Metadata } from "next";
import { CustomerExecutiveDashboard } from "@/components/customer-portal/customer-executive-dashboard";
import { PUBLIC_DEMO_COMPANY_NAME } from "@/lib/public-demo/constants";
import {
  PUBLIC_DEMO_RECOMMENDATIONS_HREF,
  getPublicDemoWorkspaceLinks,
} from "@/lib/public-demo/presentation";
import { getPublicDemoOverview } from "@/lib/public-demo/provider";

export const metadata: Metadata = {
  title: `Overview | ${PUBLIC_DEMO_COMPANY_NAME} Demo`,
  description:
    "Sample StackScore Overview for Northstar Manufacturing — official score, pillars, and priority opportunities.",
  alternates: { canonical: "/demo/overview" },
  robots: { index: true, follow: true },
};

/**
 * SS-WEB-003-R1 — Mounts the shared customer Overview composition.
 */
export default function PublicDemoOverviewPage() {
  const overview = getPublicDemoOverview();
  return (
    <CustomerExecutiveDashboard
      overview={overview}
      workspaceLinks={getPublicDemoWorkspaceLinks()}
      recommendationsHref={PUBLIC_DEMO_RECOMMENDATIONS_HREF}
      showBookingCta={false}
    />
  );
}
