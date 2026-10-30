import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClientStatusBadge } from "@/components/client-ui";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import type { CustomerOpportunityItem } from "@/lib/customer-portal/opportunities-dto";
import { cn } from "@/lib/utils";

type OpportunityDetailProps = {
  opportunity: CustomerOpportunityItem;
  complexityFootnote: string;
};

function DetailBlock({
  title,
  body,
}: {
  title: string;
  body: string | null;
}) {
  if (!body) return null;
  return (
    <section className="space-y-1.5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">{title}</h4>
      <p className="text-sm leading-relaxed text-foreground/90">{body}</p>
    </section>
  );
}

export function OpportunityDetail({
  opportunity,
  complexityFootnote,
}: OpportunityDetailProps) {
  const { sections } = opportunity;

  return (
    <div className="space-y-5 border-t border-border/60 bg-muted/10 px-4 py-5 sm:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={PRIORITY_BADGE[opportunity.priority]}>
          {opportunity.priorityLabel}
        </Badge>
        <ClientStatusBadge tone={opportunity.isActive ? "default" : "muted"}>
          {opportunity.statusLabel}
        </ClientStatusBadge>
        <ClientStatusBadge tone="muted">{opportunity.complexity.displayLabel}</ClientStatusBadge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={cn(CLIENT_SURFACE_CARD, "rounded-sm border bg-card p-3")}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Technology pillar
          </p>
          <Link
            href={opportunity.pillarHref}
            className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {opportunity.pillarName}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <div className={cn(CLIENT_SURFACE_CARD, "rounded-sm border bg-card p-3")}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Complexity
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {opportunity.complexity.displayLabel}
          </p>
          {opportunity.suggestedService ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Related service: {opportunity.suggestedService}
            </p>
          ) : null}
        </div>
      </div>

      <DetailBlock title="Finding" body={sections.finding} />
      <DetailBlock title="Recommended action" body={sections.recommendedAction} />
      <DetailBlock title="Expected outcome" body={sections.expectedOutcome} />
      <DetailBlock
        title="Implementation considerations"
        body={sections.implementationConsiderations}
      />

      {!sections.hasStructuredSections && opportunity.businessImpact ? (
        <DetailBlock title="Why this matters" body={opportunity.businessImpact} />
      ) : null}

      {opportunity.businessImpact && sections.hasStructuredSections ? (
        <DetailBlock title="Business context" body={opportunity.businessImpact} />
      ) : null}

      {opportunity.roadmap ? (
        <section
          className={cn(CLIENT_SURFACE_CARD, "rounded-sm border border-primary/20 bg-card p-4")}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Roadmap relationship
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {opportunity.roadmap.initiativeTitle}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Phase: {opportunity.roadmap.phaseName}
          </p>
          <Link
            href={opportunity.roadmap.href}
            className={cn(buttonClassName({ variant: "outline", size: "sm" }), "mt-3")}
          >
            Open roadmap phase
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
          </Link>
        </section>
      ) : (
        <p className="text-xs text-muted-foreground">
          No linked roadmap initiative yet. Relationships appear after initiatives are promoted
          from your Technology Improvement Plan.
        </p>
      )}

      <p className="text-xs text-muted-foreground">{complexityFootnote}</p>
    </div>
  );
}
