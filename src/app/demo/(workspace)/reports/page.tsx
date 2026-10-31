import type { Metadata } from "next";
import { CustomerReportsExperience } from "@/components/customer-portal/reports/customer-reports-experience";
import { PUBLIC_DEMO_COMPANY_NAME } from "@/lib/public-demo/constants";
import { PUBLIC_DEMO_OVERVIEW_HREF } from "@/lib/public-demo/presentation";
import { getPublicDemoReports } from "@/lib/public-demo/provider";

export const metadata: Metadata = {
  title: `Reports | ${PUBLIC_DEMO_COMPANY_NAME} Demo`,
  description:
    "Sample StackScore reports hub with labeled fictional report metadata.",
  alternates: { canonical: "/demo/reports" },
  robots: { index: true, follow: true },
};

/**
 * SS-WEB-003-R1 — Mounts the shared customer Reports composition.
 */
export default function PublicDemoReportsPage() {
  return (
    <CustomerReportsExperience
      experience={getPublicDemoReports()}
      overviewHref={PUBLIC_DEMO_OVERVIEW_HREF}
      showBookingCta={false}
    />
  );
}
