import { Suspense } from "react";
import type { Metadata } from "next";
import { CustomerExploreExperience } from "@/components/customer-portal/explore/customer-explore-experience";
import { ClientLoadingState, ClientPageShell } from "@/components/client-ui";
import { isTechnologyPillarCode } from "@/lib/customer-portal/pillar-detail-dto";
import { PUBLIC_DEMO_COMPANY_NAME } from "@/lib/public-demo/constants";
import { getPublicDemoExplore } from "@/lib/public-demo/provider";
import { PUBLIC_DEMO_OVERVIEW_PATH } from "@/lib/public-demo/routes";
import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";

export const metadata: Metadata = {
  title: `Explore | ${PUBLIC_DEMO_COMPANY_NAME} Demo`,
  description:
    "Sample Technology Intelligence Center — eight pillars with strengths, attention areas, and recommendations.",
  alternates: { canonical: "/demo/explore" },
  robots: { index: true, follow: true },
};

type ExplorePageProps = {
  searchParams: Promise<{ pillar?: string }>;
};

export default async function PublicDemoExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const selected: TechnologyPillarCode | null = isTechnologyPillarCode(params.pillar)
    ? params.pillar
    : "identity_access";
  const explore = getPublicDemoExplore(selected);

  return (
    <Suspense
      fallback={
        <ClientPageShell>
          <ClientLoadingState label="Loading Explore…" />
        </ClientPageShell>
      }
    >
      <CustomerExploreExperience explore={explore} overviewHref={PUBLIC_DEMO_OVERVIEW_PATH} />
    </Suspense>
  );
}
