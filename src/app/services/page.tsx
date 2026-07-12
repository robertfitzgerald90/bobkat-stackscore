import type { Metadata } from "next";
import { ServicesLanding } from "@/components/services/services-landing";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Bobkat IT Services | ${BRAND.companyName}`,
  description:
    "Explore Bobkat IT services for technology maturity assessments, managed IT, network infrastructure, backup and disaster recovery, implementation projects, and residential IT support.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: `Bobkat IT Services | ${BRAND.companyName}`,
    description:
      "Technology services built for security, reliability, and long-term growth.",
    url: "/services",
    type: "website",
  },
};

export default function ServicesPage() {
  return <ServicesLanding />;
}
