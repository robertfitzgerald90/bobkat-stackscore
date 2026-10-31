import type { Metadata } from "next";
import { DemoReportsExperience } from "@/components/public-demo/demo-reports-experience";
import { PUBLIC_DEMO_COMPANY_NAME } from "@/lib/public-demo/constants";
import { getPublicDemoReports } from "@/lib/public-demo/provider";

export const metadata: Metadata = {
  title: `Reports | ${PUBLIC_DEMO_COMPANY_NAME} Demo`,
  description:
    "Sample StackScore reports hub with labeled fictional report metadata.",
  alternates: { canonical: "/demo/reports" },
  robots: { index: true, follow: true },
};

export default function PublicDemoReportsPage() {
  return <DemoReportsExperience experience={getPublicDemoReports()} />;
}
