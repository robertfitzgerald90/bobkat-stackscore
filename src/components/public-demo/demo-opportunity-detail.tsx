import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  ClientPageHeader,
  ClientPageShell,
  ClientSectionHeader,
  ClientStatusBadge,
} from "@/components/client-ui";
import { buttonClassName } from "@/components/ui/button";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import { CLIENT_SURFACE_CARD_INDUSTRIAL } from "@/lib/client-ui/tokens";
import { PRIORITY_LABELS } from "@/lib/display";
import type { DemoOpportunityFixture } from "@/lib/public-demo/fixtures";
import {
  PUBLIC_DEMO_OPPORTUNITIES_PATH,
  publicDemoExplorePillarPath,
} from "@/lib/public-demo/routes";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DemoOpportunityDetailProps = {
  opportunity: DemoOpportunityFixture;
};

export function DemoOpportunityDetail({ opportunity }: DemoOpportunityDetailProps) {
  const pillar = TECHNOLOGY_PILLARS.find((p) => p.code === opportunity.pillarCode);

  return (
    <ClientPageShell className="max-w-3xl space-y-8">
      <ClientPageHeader
        eyebrow="Improvement opportunity"
        title={opportunity.title}
        description="Sample recommendation from the fictional Northstar Manufacturing assessment."
        actions={
          <Link
            href={PUBLIC_DEMO_OPPORTUNITIES_PATH}
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            All opportunities
          </Link>
        }
      />

      <section
        className={cn(CLIENT_SURFACE_CARD_INDUSTRIAL, "space-y-5 p-5 sm:p-6")}
        aria-label="Opportunity overview"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={PRIORITY_BADGE[opportunity.priority]}>
            {PRIORITY_LABELS[opportunity.priority]}
          </Badge>
          <ClientStatusBadge tone="muted">{opportunity.status.replace(/_/g, " ")}</ClientStatusBadge>
          <ClientStatusBadge tone="default">{opportunity.complexity}</ClientStatusBadge>
          {pillar ? (
            <Link
              href={publicDemoExplorePillarPath(pillar.code)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {pillar.name}
            </Link>
          ) : null}
        </div>

        <Block title="Finding" body={opportunity.finding} />
        <Block title="Recommended action" body={opportunity.recommendedAction} />
        <Block title="Expected outcome" body={opportunity.expectedOutcome} />
        <Block title="Business impact" body={opportunity.businessImpact} />
      </section>
    </ClientPageShell>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <ClientSectionHeader title={title} />
      <p className="mt-2 text-sm leading-relaxed text-foreground/90">{body}</p>
    </div>
  );
}
