import type { Metadata } from "next";
import { ProductOverviewExperience } from "@/components/product-overview/product-overview-experience";
import { BRAND } from "@/lib/branding";
import { getBaseUrl } from "@/lib/url/base-url";

const title = "StackScore Product Overview | Strategic IT Consulting Platform";
const description =
  "Experience StackScore as an ongoing technology partnership — interactive assessments, recommendations, roadmaps, projects, quarterly reviews, executive reporting, and strategic planning in one platform.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "StackScore",
    "technology maturity assessment",
    "Strategic IT Consulting",
    "technology roadmap",
    "executive technology reporting",
    "vCIO platform",
    "technology strategy",
    "interactive product tour",
    "technology maturity framework",
  ],
  alternates: {
    canonical: "/product-overview",
  },
  openGraph: {
    title,
    description,
    url: "/product-overview",
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
  url: `${getBaseUrl()}/product-overview`,
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
      name: "Explore Interactive Product Tour",
      target: `${getBaseUrl()}/product-overview`,
    },
    {
      "@type": "ReserveAction",
      name: "Schedule Discovery Call",
      target: `${getBaseUrl()}/product-overview#product-overview-final-cta`,
    },
  ],
};

export default function ProductOverviewPage() {
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
