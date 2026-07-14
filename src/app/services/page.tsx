import type { Metadata } from "next";
import { ServicesLanding } from "@/components/services/services-landing";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Bobkat IT Services | ${BRAND.companyName}`,
  description:
    "Explore Bobkat IT services including $1,500 Technology Assessments, $300/month StackScore vCIO, managed IT starting at $15/device/month, backup and disaster recovery starting at $800/month, infrastructure projects, and residential IT support.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: `Bobkat IT Services | ${BRAND.companyName}`,
    description:
      "Technology services with transparent starting prices for assessments, vCIO advisory, managed IT, backup and disaster recovery, infrastructure, implementation, and support.",
    url: "/services",
    type: "website",
  },
};

export default function ServicesPage() {
  return <ServicesLanding />;
}
