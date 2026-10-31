import type { Metadata } from "next";
import { permanentRedirect, redirect } from "next/navigation";
import {
  INTERACTIVE_DEMO_PATH,
  isDemoDeepLinkSection,
} from "@/lib/interactive-demo/routes";
import { resolveLegacyDemoSectionRedirect } from "@/lib/public-demo/routes";

type DemoSectionPageProps = {
  params: Promise<{ section: string }>;
};

export async function generateMetadata({ params }: DemoSectionPageProps): Promise<Metadata> {
  const { section } = await params;
  const target = resolveLegacyDemoSectionRedirect(section);
  return {
    title: "StackScore Interactive Demo",
    alternates: target
      ? { canonical: target }
      : { canonical: INTERACTIVE_DEMO_PATH },
  };
}

/**
 * SS-WEB-003 — Legacy marketing deep links redirect into customer-parity demo routes.
 */
export default async function DemoDeepLinkPage({ params }: DemoSectionPageProps) {
  const { section } = await params;
  const target = resolveLegacyDemoSectionRedirect(section);
  if (target) {
    redirect(target);
  }

  if (isDemoDeepLinkSection(section)) {
    permanentRedirect(INTERACTIVE_DEMO_PATH);
  }

  permanentRedirect(INTERACTIVE_DEMO_PATH);
}
