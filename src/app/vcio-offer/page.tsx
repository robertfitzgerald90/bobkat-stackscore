import type { Metadata } from "next";
import { VcioOfferLanding } from "@/components/vcio/vcio-offer-landing";

const title = "StackScore vCIO | Strategic Technology Advisory";
const description =
  "Ongoing technology strategy, quarterly reviews, executive reporting, roadmap management, budget planning, and direct access to a strategic technology advisor for $300 per month.";
const url = "https://stackscore.bobkatit.com/vcio-offer";
const image = "https://stackscore.bobkatit.com/images/og/assessment-invitation.png";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/vcio-offer" },
  openGraph: {
    title,
    description,
    url,
    type: "website",
    images: [{ url: image, alt: "StackScore vCIO strategic technology advisory" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
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
      url,
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
