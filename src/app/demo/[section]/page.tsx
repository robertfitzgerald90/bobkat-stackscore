import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { ProductOverviewExperience } from "@/components/product-overview/product-overview-experience";
import {
  DEMO_DEEP_LINK_SECTIONS,
  INTERACTIVE_DEMO_PATH,
  isDemoDeepLinkSection,
} from "@/lib/interactive-demo/routes";

type DemoSectionPageProps = {
  params: Promise<{ section: string }>;
};

export async function generateMetadata({ params }: DemoSectionPageProps): Promise<Metadata> {
  const { section } = await params;
  if (!isDemoDeepLinkSection(section)) {
    return { title: "StackScore Interactive Demo" };
  }
  const label = DEMO_DEEP_LINK_SECTIONS[section].label;
  return {
    title: `${label} | StackScore Interactive Demo`,
    alternates: { canonical: `${INTERACTIVE_DEMO_PATH}/${section}` },
  };
}

export default async function DemoDeepLinkPage({ params }: DemoSectionPageProps) {
  const { section } = await params;

  if (!isDemoDeepLinkSection(section)) {
    permanentRedirect(INTERACTIVE_DEMO_PATH);
  }

  return <ProductOverviewExperience initialSection={section} />;
}
