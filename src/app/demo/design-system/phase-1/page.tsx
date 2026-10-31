import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { RETIRED_PUBLIC_DEMO_REDIRECTS } from "@/lib/public-demo/legacy-routes";

export const metadata: Metadata = {
  title: "StackScore Interactive Demo",
  robots: { index: false, follow: true },
};

/** SS-WEB-003-R2 — Public design-system preview retired. */
export default function DemoDesignSystemPhase1RetiredPage() {
  permanentRedirect(RETIRED_PUBLIC_DEMO_REDIRECTS["/demo/design-system/phase-1"]);
}
