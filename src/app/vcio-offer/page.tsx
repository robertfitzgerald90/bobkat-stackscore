import type { Metadata } from "next";
import { VcioOfferLanding } from "@/components/vcio/vcio-offer-landing";
import { buildAppUrl } from "@/lib/url/base-url";

const title = "StackScore vCIO | Strategic Technology Advisory";
const description =
  "Ongoing technology strategy, quarterly reviews, executive reporting, roadmap management, budget planning, and direct access to a strategic technology advisor for $300 per month.";
const pagePath = "/vcio-offer";
const ogImagePath = "/images/og/assessment-invitation.png";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pagePath },
  openGraph: {
    title,
    description,
    url: pagePath,
    type: "website",
    images: [{ url: ogImagePath, alt: "StackScore vCIO strategic technology advisory" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImagePath],
  },
};

export default function VcioOfferPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "StackScore vCIO",
    description,
    provider: {
      "@type": "Organization",
      name: "Bobkat IT",
      url: "https://www.bobkatit.com",
    },
    offers: {
      "@type": "Offer",
      price: "300",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: buildAppUrl(pagePath),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <VcioOfferLanding />
    </>
  );
}
