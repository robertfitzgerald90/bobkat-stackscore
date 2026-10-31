import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { RETIRED_PUBLIC_DEMO_REDIRECTS } from "@/lib/public-demo/legacy-routes";

export const metadata: Metadata = {
  title: "StackScore Interactive Demo",
  robots: { index: false, follow: true },
  alternates: { canonical: RETIRED_PUBLIC_DEMO_REDIRECTS["/demo/stackscore-case-study"] },
};

/**
 * SS-WEB-003-R2 — Legacy case-study visual preview retired from public demo.
 */
export default function StackScoreCaseStudyDemoRetiredPage() {
  permanentRedirect(RETIRED_PUBLIC_DEMO_REDIRECTS["/demo/stackscore-case-study"]);
}
