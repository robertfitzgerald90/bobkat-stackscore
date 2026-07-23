import type { Metadata } from "next";
import { VcioOfferLanding } from "@/components/vcio/vcio-offer-landing";
import { STRATEGIC_IT_CONSULTING_CHECKOUT_PATH } from "@/lib/marketing/stackscore-routes";
import { buildAppUrl } from "@/lib/url/base-url";

const title = "Strategic IT Consulting by Bobkat IT | StackScore Checkout";
const description =
  "Start Strategic IT Consulting by Bobkat IT at $500/month. StackScore is included as your technology planning portal with ongoing advisory, business reviews, and executive reporting.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  alternates: { canonical: STRATEGIC_IT_CONSULTING_CHECKOUT_PATH },
  openGraph: {
    title,
    description,
    url: STRATEGIC_IT_CONSULTING_CHECKOUT_PATH,
    type: "website",
  },
};

export default function StrategicItConsultingCheckoutPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Strategic IT Consulting by Bobkat IT",
    description,
    provider: {
      "@type": "Organization",
      name: "Bobkat IT",
      url: "https://bobkatit.com",
    },
    offers: {
      "@type": "Offer",
      price: "500",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: buildAppUrl(STRATEGIC_IT_CONSULTING_CHECKOUT_PATH),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <VcioOfferLanding returnPath={STRATEGIC_IT_CONSULTING_CHECKOUT_PATH} navActive="checkout" />
    </>
  );
}
