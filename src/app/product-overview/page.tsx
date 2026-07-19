import { permanentRedirect } from "next/navigation";

/** Permanent redirect: legacy /product-overview → /demo */
export default function ProductOverviewRedirectPage() {
  permanentRedirect("/demo");
}
