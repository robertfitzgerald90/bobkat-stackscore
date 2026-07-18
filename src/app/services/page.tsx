import type { Metadata } from "next";
import { ServicesLanding } from "@/components/services/services-landing";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Bobkat IT Services | ${BRAND.companyName}`,
  description:
    "Explore Bobkat IT services including managed IT, strategic consulting, digital presence, StackScore Technology Advisory, technology assessments, infrastructure, backup, and implementation.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: `Bobkat IT Services | ${BRAND.companyName}`,
    description:
      "Technology services for managed IT, strategic consulting, digital presence, StackScore Technology Advisory, assessments, infrastructure, and business continuity.",
    url: "/services",
    type: "website",
  },
};

export default function ServicesPage() {
  return <ServicesLanding />;
}
