import type { Metadata } from "next";
import { DemoOverviewExperience } from "@/components/public-demo/demo-overview-experience";
import { getPublicDemoOverview } from "@/lib/public-demo/provider";
import { PUBLIC_DEMO_COMPANY_NAME } from "@/lib/public-demo/constants";

export const metadata: Metadata = {
  title: `Overview | ${PUBLIC_DEMO_COMPANY_NAME} Demo`,
  description:
    "Sample StackScore Overview for Northstar Manufacturing — official score, pillars, and priority opportunities.",
  alternates: { canonical: "/demo/overview" },
  robots: { index: true, follow: true },
};

export default function PublicDemoOverviewPage() {
  const overview = getPublicDemoOverview();
  return <DemoOverviewExperience overview={overview} />;
}
