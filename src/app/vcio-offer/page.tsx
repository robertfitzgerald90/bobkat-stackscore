import { VcioOfferLanding } from "@/components/vcio/vcio-offer-landing";
import { buildSocialPageMetadata } from "@/lib/branding/social-og";
import { VCIO_OFFER_PATH } from "@/lib/marketing/stackscore-routes";
import { buildAppUrl } from "@/lib/url/base-url";

const title = "Strategic IT Consulting by Bobkat IT | StackScore Checkout";
const description =
  "Start Strategic IT Consulting by Bobkat IT at $500/month. StackScore is included as your technology planning portal with ongoing advisory, business reviews, and executive reporting.";

export const metadata = {
  ...buildSocialPageMetadata({
    title,
    description,
    path: VCIO_OFFER_PATH,
    image: "stackscoreDemo",
    robots: { index: false, follow: false },
  }),
};

export default function VcioOfferPage() {
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
      url: buildAppUrl(VCIO_OFFER_PATH),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <VcioOfferLanding returnPath={VCIO_OFFER_PATH} navActive="checkout" />
    </>
  );
}
