import type { Metadata } from "next";
import { AssessmentOfferLanding } from "@/components/assessment-offer/assessment-offer-landing";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Technology Assessment | ${BRAND.companyName}`,
  description: `Purchase the full ${BRAND.reportTitle}. Know exactly where your technology stands with executive-ready deliverables from ${BRAND.productName}.`,
  alternates: {
    canonical: "/assessment-offer",
  },
  openGraph: {
    title: `Technology Assessment | ${BRAND.companyName}`,
    description: `Purchase the full ${BRAND.reportTitle}. Know exactly where your technology stands with executive-ready deliverables from ${BRAND.productName}.`,
    url: "/assessment-offer",
    type: "website",
  },
};

export default function AssessmentOfferPage() {
  return <AssessmentOfferLanding />;
}
