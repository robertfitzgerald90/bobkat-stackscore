import type { Metadata } from "next";
import { AssessmentOfferLanding } from "@/components/assessment-offer/assessment-offer-landing";
import { readAssessmentOfferAttribution } from "@/lib/assessment-offer/attribution";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Technology Maturity Assessment | ${BRAND.companyName}`,
  description: `Purchase the full ${BRAND.reportTitle}. Know exactly where your technology stands with executive-ready deliverables from ${BRAND.productName}.`,
  alternates: {
    canonical: "/assessment-offer",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `Technology Maturity Assessment | ${BRAND.companyName}`,
    description: `Purchase the full ${BRAND.reportTitle}. Know exactly where your technology stands with executive-ready deliverables from ${BRAND.productName}.`,
    url: "/assessment-offer",
    type: "website",
  },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AssessmentOfferPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const attribution = readAssessmentOfferAttribution(params);

  return <AssessmentOfferLanding attribution={attribution} />;
}
