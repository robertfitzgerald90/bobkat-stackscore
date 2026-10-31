import type { Metadata } from "next";
import { DemoOpportunitiesList } from "@/components/public-demo/demo-opportunities-list";
import { PUBLIC_DEMO_COMPANY_NAME } from "@/lib/public-demo/constants";
import { getPublicDemoOpportunities } from "@/lib/public-demo/provider";

export const metadata: Metadata = {
  title: `Opportunities | ${PUBLIC_DEMO_COMPANY_NAME} Demo`,
  description: "Sample improvement opportunities for the StackScore public demo.",
  alternates: { canonical: "/demo/opportunities" },
  robots: { index: true, follow: true },
};

export default function PublicDemoOpportunitiesPage() {
  return <DemoOpportunitiesList opportunities={getPublicDemoOpportunities()} />;
}
