import Link from "next/link";
import { Lightbulb } from "lucide-react";
import {
  ClientPageHeader,
  ClientPageShell,
  ClientStatusBadge,
} from "@/components/client-ui";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { PRIORITY_LABELS } from "@/lib/display";
import type { DemoOpportunityFixture } from "@/lib/public-demo/fixtures";
import { publicDemoOpportunityPath } from "@/lib/public-demo/routes";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";
import { cn } from "@/lib/utils";

type DemoOpportunitiesListProps = {
  opportunities: DemoOpportunityFixture[];
};

export function DemoOpportunitiesList({ opportunities }: DemoOpportunitiesListProps) {
  return (
    <ClientPageShell className="max-w-4xl space-y-8">
      <ClientPageHeader
        eyebrow="Improvement opportunities"
        title="Opportunities"
        description="Prioritized sample recommendations for Northstar Manufacturing. Read-only — no acceptance or assignment actions."
      />

      <ul className="space-y-2">
        {opportunities.map((item) => {
          const pillar = TECHNOLOGY_PILLARS.find((p) => p.code === item.pillarCode);
          return (
            <li key={item.id}>
              <Link
                href={publicDemoOpportunityPath(item.id)}
                className={cn(
                  CLIENT_SURFACE_CARD,
                  "flex items-start gap-3 rounded-sm border p-4 transition-colors hover:border-primary/40 hover:bg-card/80",
                )}
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={PRIORITY_BADGE[item.priority]}>
                      {PRIORITY_LABELS[item.priority]}
                    </Badge>
                    <ClientStatusBadge tone="muted">
                      {item.status.replace(/_/g, " ")}
                    </ClientStatusBadge>
                    {pillar ? (
                      <ClientStatusBadge tone="default">{pillar.name}</ClientStatusBadge>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </ClientPageShell>
  );
}
