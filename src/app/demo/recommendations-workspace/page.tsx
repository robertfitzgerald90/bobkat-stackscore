import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { RETIRED_PUBLIC_DEMO_REDIRECTS } from "@/lib/public-demo/legacy-routes";

export const metadata: Metadata = {
  title: "StackScore Interactive Demo",
  robots: { index: false, follow: true },
  alternates: { canonical: RETIRED_PUBLIC_DEMO_REDIRECTS["/demo/recommendations-workspace"] },
};

/**
 * SS-WEB-003-R2 — Legacy recommendations workspace marketing demo retired.
 */
export default function RecommendationsWorkspaceDemoRetiredPage() {
  permanentRedirect(RETIRED_PUBLIC_DEMO_REDIRECTS["/demo/recommendations-workspace"]);
}
