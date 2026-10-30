import { ClientSectionHeader } from "@/components/client-ui";
import { PillarTile } from "@/components/customer-portal/explore/pillar-tile";
import { CLIENT_EQUAL_CARD_GRID } from "@/lib/client-ui/tokens";
import type { CustomerOverviewPillar } from "@/lib/customer-portal/overview";

type OverviewPillarGridProps = {
  pillars: CustomerOverviewPillar[];
};

export function OverviewPillarGrid({ pillars }: OverviewPillarGridProps) {
  return (
    <section className="space-y-4" aria-labelledby="overview-pillars-heading">
      <ClientSectionHeader
        eyebrow="Technology Maturity"
        title="Eight technology pillars"
        description="Official pillar scores from your assessment. Select a pillar to open Explore."
      />
      <h2 id="overview-pillars-heading" className="sr-only">
        Eight technology pillars
      </h2>
      <div className={CLIENT_EQUAL_CARD_GRID}>
        {pillars.map((pillar) => (
          <PillarTile key={pillar.code} pillar={pillar} />
        ))}
      </div>
    </section>
  );
}
