import type { Metadata } from "next";
import { ProductOverviewExperience } from "@/components/product-overview/product-overview-experience";
import { BRAND } from "@/lib/branding";
import { getBaseUrl } from "@/lib/url/base-url";

const title = "StackScore Interactive Demo";
const description =
  "Explore the StackScore Interactive Demo — a guided walkthrough of assessments, phased technology roadmaps, phase proposals, implementation progress, and measurable StackScore improvement. No login required.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "StackScore",
    "StackScore Interactive Demo",
    "technology maturity assessment",
    "Strategic IT Consulting",
    "technology roadmap",
    "executive technology reporting",
    "vCIO platform",
    "technology strategy",
    "interactive product demo",
    "Bobkat IT",
    "personalized technology demo",
  ],
  alternates: {
    canonical: "/demo",
  },
  openGraph: {
    title,
    description,
    url: "/demo",
    type: "website",
    siteName: BRAND.productName,
    images: [
      {
        url: "/images/vcio/technology-maturity-overview.png",
        width: 1200,
        height: 630,
        alt: "StackScore technology maturity overview dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/vcio/technology-maturity-overview.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: title,
  description,
  url: `${getBaseUrl()}/demo`,
  isPartOf: {
    "@type": "WebSite",
    name: BRAND.productName,
    url: getBaseUrl(),
  },
  about: {
    "@type": "SoftwareApplication",
    name: BRAND.productName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      name: "Technology Maturity Assessment",
      url: `${getBaseUrl()}/assessment-offer`,
    },
  },
  potentialAction: [
    {
      "@type": "ViewAction",
      name: "Explore StackScore Interactive Demo",
      target: `${getBaseUrl()}/demo`,
    },
    {
      "@type": "ReserveAction",
      name: "Schedule Discovery Call",
      target: `${getBaseUrl()}/demo#product-overview-final-cta`,
    },
  ],
};

export default function InteractiveDemoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ProductOverviewExperience />
    </>
  );
}
