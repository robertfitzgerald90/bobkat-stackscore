import type { Metadata } from "next";
import { ServicesLanding } from "@/components/services/services-landing";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Bobkat IT Services | ${BRAND.companyName}`,
  description:
    "Understand, operate, plan, and grow with Bobkat IT. Technology Maturity Assessment, Managed IT Services, Strategic IT Consulting, Digital Presence, and Residential IT Support.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: `Bobkat IT Services | ${BRAND.companyName}`,
    description:
      "Strategic technology partnership: assess your environment, operate securely, plan with confidence, and grow your digital presence.",
    url: "/services",
    type: "website",
  },
};

export default function ServicesPage() {
  return <ServicesLanding />;
}
