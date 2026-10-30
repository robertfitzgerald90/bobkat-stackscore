import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClientSectionHeader, ClientStatusBadge } from "@/components/client-ui";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import type { CustomerRoadmapInitiativeDto } from "@/lib/customer-portal/roadmap-dto";
import type { Priority } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type RoadmapInitiativesProps = {
  initiatives: CustomerRoadmapInitiativeDto[];
  opportunitiesHref: string;
};

function priorityVariant(priority: string) {
  if (priority in PRIORITY_BADGE) {
    return PRIORITY_BADGE[priority as Priority];
  }
  return "outline" as const;
}

export function RoadmapInitiatives({ initiatives, opportunitiesHref }: RoadmapInitiativesProps) {
  return (
    <section className="space-y-4" aria-labelledby="roadmap-initiatives-heading">
      <ClientSectionHeader
        eyebrow="Roadmap initiatives"
        title="Implementation initiatives"
        description="Initiatives inherit status from linked recommendations. Open an opportunity for approved finding detail."
        actions={
          <Link
            href={opportunitiesHref}
            className="text-sm font-medium text-primary hover:underline"
          >
            All opportunities
          </Link>
        }
      />
      <h2 id="roadmap-initiatives-heading" className="sr-only">
        Roadmap initiatives
      </h2>

      {initiatives.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          No customer-visible initiatives on this roadmap yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {initiatives.map((initiative) => (
            <li key={initiative.id}>
              <article
                className={cn(CLIENT_SURFACE_CARD, "rounded-sm border bg-card p-4 sm:p-5")}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={priorityVariant(initiative.priority)}>
                        {initiative.priorityLabel}
                      </Badge>
                      <ClientStatusBadge
                        tone={initiative.status === "completed" ? "success" : "muted"}
                      >
                        {initiative.statusLabel}
                      </ClientStatusBadge>
                      <span className="text-xs text-muted-foreground">{initiative.phaseName}</span>
                    </div>
                    <h3 className="font-medium leading-snug text-foreground">{initiative.title}</h3>
                    {initiative.pillarName ? (
                      <p className="text-xs text-muted-foreground">
                        Pillar:{" "}
                        {initiative.pillarHref ? (
                          <Link
                            href={initiative.pillarHref}
                            className="font-medium text-primary hover:underline"
                          >
                            {initiative.pillarName}
                          </Link>
                        ) : (
                          initiative.pillarName
                        )}
                      </p>
                    ) : null}
                    {initiative.implementationNotes ? (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {initiative.implementationNotes}
                      </p>
                    ) : initiative.businessImpact ? (
                      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {initiative.businessImpact}
                      </p>
                    ) : null}
                  </div>
                  <Link
                    href={initiative.recommendationHref}
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    View opportunity
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
