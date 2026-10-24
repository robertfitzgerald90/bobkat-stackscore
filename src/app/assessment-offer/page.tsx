import type { Metadata } from "next";
import { AssessmentOfferLanding } from "@/components/assessment-offer/assessment-offer-landing";
import { readAssessmentOfferAttribution } from "@/lib/assessment-offer/attribution";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Learn About StackScore | Technology Maturity Assessment | ${BRAND.companyName}`,
  description: `Understand your technology. Know what to improve. Learn how ${BRAND.productName} assesses technology maturity, prioritizes recommendations, and delivers executive-ready results from ${BRAND.companyName}.`,
  alternates: {
    canonical: "/assessment-offer",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `Learn About StackScore | Technology Maturity Assessment | ${BRAND.companyName}`,
    description: `Understand your technology. Know what to improve. Learn how ${BRAND.productName} assesses technology maturity, prioritizes recommendations, and delivers executive-ready results from ${BRAND.companyName}.`,
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
