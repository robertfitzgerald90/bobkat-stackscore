import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClientEmptyState, ClientSectionHeader, ClientStatusBadge } from "@/components/client-ui";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import {
  CUSTOMER_TERM_IMPROVEMENT_OPPORTUNITIES,
} from "@/lib/assessments/customer-reporting";
import type { CustomerOverviewOpportunity } from "@/lib/customer-portal/overview";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type OverviewPriorityOpportunitiesProps = {
  priorities: CustomerOverviewOpportunity[];
  activeOpportunityCount: number;
  recommendationsHref: string;
};

export function OverviewPriorityOpportunities({
  priorities,
  activeOpportunityCount,
  recommendationsHref,
}: OverviewPriorityOpportunitiesProps) {
  return (
    <section className="space-y-4" aria-labelledby="overview-priorities-heading">
      <ClientSectionHeader
        eyebrow={CUSTOMER_TERM_IMPROVEMENT_OPPORTUNITIES}
        title="Priority opportunities"
        description="Highest-priority active recommendations from your assessment — not the full catalog."
        actions={
          activeOpportunityCount > 0 ? (
            <Link
              href={recommendationsHref}
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              View all
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : null
        }
      />
      <h2 id="overview-priorities-heading" className="sr-only">
        Priority opportunities
      </h2>

      {priorities.length === 0 ? (
        <ClientEmptyState
          icon={Lightbulb}
          title="No active improvement opportunities"
          description="When your assessment identifies actionable recommendations, the highest priorities will appear here."
          variant="default"
        />
      ) : (
        <ul className="space-y-2">
          {priorities.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  CLIENT_SURFACE_CARD,
                  "flex items-start gap-3 rounded-sm border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                )}
              >
                <Badge variant={PRIORITY_BADGE[item.priority]} className="mt-0.5 shrink-0">
                  {item.priorityLabel}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Open recommendation detail
                  </p>
                </div>
                <ClientStatusBadge tone="muted" className="hidden sm:inline-flex">
                  Active
                </ClientStatusBadge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
