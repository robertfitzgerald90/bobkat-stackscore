import type { Metadata } from "next";
import { CustomerRoadmapExperience } from "@/components/customer-portal/roadmap/customer-roadmap-experience";
import { PUBLIC_DEMO_COMPANY_NAME, PUBLIC_DEMO_WORKSPACE_ID } from "@/lib/public-demo/constants";
import { getPublicDemoRoadmap } from "@/lib/public-demo/provider";
import { PUBLIC_DEMO_REPORTS_PATH } from "@/lib/public-demo/routes";

export const metadata: Metadata = {
  title: `Roadmap | ${PUBLIC_DEMO_COMPANY_NAME} Demo`,
  description:
    "Sample StackScore roadmap with phased initiatives for Northstar Manufacturing.",
  alternates: { canonical: "/demo/roadmap" },
  robots: { index: true, follow: true },
};

export default function PublicDemoRoadmapPage() {
  const experience = getPublicDemoRoadmap();
  return (
    <CustomerRoadmapExperience
      clientId={PUBLIC_DEMO_WORKSPACE_ID}
      experience={experience}
      reportsHref={PUBLIC_DEMO_REPORTS_PATH}
      showBookingCta={false}
    />
  );
}
