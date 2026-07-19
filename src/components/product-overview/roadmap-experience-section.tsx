"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { trackProductOverviewRoadmapViewChanged } from "@/lib/analytics/product-overview-events";
import type { DemoRoadmapInitiative, RoadmapViewMode } from "@/lib/product-overview/types";
import { cn } from "@/lib/utils";

const VIEW_MODES: { id: RoadmapViewMode; label: string }[] = [
  { id: "quarter", label: "Quarter View" },
  { id: "timeline", label: "Timeline View" },
  { id: "priority", label: "Priority View" },
];

const PRIORITY_ORDER = ["Critical", "High", "Medium", "Low"] as const;

function groupByQuarter(initiatives: DemoRoadmapInitiative[]) {
  const groups = new Map<string, DemoRoadmapInitiative[]>();
  for (const initiative of initiatives) {
    const existing = groups.get(initiative.quarter) ?? [];
    existing.push(initiative);
    groups.set(initiative.quarter, existing);
  }
  return Array.from(groups.entries());
}

function RoadmapInitiativeButton({
  initiative,
  highlighted,
  onClick,
}: {
  initiative: DemoRoadmapInitiative;
  highlighted: boolean;
  onClick: (anchor: HTMLElement) => void;
}) {
  return (
    <button
      type="button"
      data-demo-feature={`roadmapInitiative:${initiative.id}`}
      onClick={(event) => onClick(event.currentTarget)}
      className={cn(
        "w-full rounded-lg border border-border/70 bg-background p-4 text-left transition-all hover:border-primary/30 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        highlighted && "ring-2 ring-primary ring-offset-2",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={initiative.priority === "Critical" ? "destructive" : "outline"}>
              {initiative.priority}
            </Badge>
            <Badge variant="outline">{initiative.status}</Badge>
          </div>
          <p className="mt-2 font-medium text-foreground">{initiative.title}</p>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Completion</span>
          <span>{initiative.completionPercent}%</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${initiative.completionPercent}%` }}
          />
        </div>
      </div>
    </button>
  );
}

export function RoadmapExperienceSection() {
  const [viewMode, setViewMode] = useState<RoadmapViewMode>("quarter");
  const { demoProfile, openConnectedRoadmapInitiative, isHighlighted } = useProductOverview();
  const initiatives = demoProfile.roadmapInitiatives;

  const quarterGroups = useMemo(() => groupByQuarter(initiatives), [initiatives]);
  const priorityGroups = useMemo(() => {
    return PRIORITY_ORDER.map((priority) => ({
      priority,
      initiatives: initiatives.filter((item) => item.priority === priority),
    })).filter((group) => group.initiatives.length > 0);
  }, [initiatives]);

  const handleInitiativeClick = (
    initiative: DemoRoadmapInitiative,
    anchor: HTMLElement,
  ) => {
    openConnectedRoadmapInitiative(initiative.id, "roadmap_experience", anchor);
  };

  return (
    <section
      id="product-overview-roadmap"
      className="scroll-mt-36 border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Strategic Roadmap
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Multi-quarter planning aligned with business priorities
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Recommendations become roadmap initiatives with budget, timing, and expected business
              outcomes — so leadership can see the plan, not just the punch list.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Roadmap view mode">
          {VIEW_MODES.map((mode) => (
            <Button
              key={mode.id}
              type="button"
              size="sm"
              variant={viewMode === mode.id ? "default" : "outline"}
              onClick={() => {
                setViewMode(mode.id);
                trackProductOverviewRoadmapViewChanged(mode.id);
              }}
              aria-pressed={viewMode === mode.id}
            >
              {mode.label}
            </Button>
          ))}
        </div>

        {viewMode === "quarter" ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {quarterGroups.map(([quarter, initiatives], index) => (
              <OfferReveal key={quarter} delayMs={index * 60}>
                <Card className="border-border/70 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{quarter}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {initiatives.map((initiative) => (
                      <RoadmapInitiativeButton
                        key={initiative.id}
                        initiative={initiative}
                        highlighted={isHighlighted({ roadmapInitiativeId: initiative.id })}
                        onClick={(anchor) => handleInitiativeClick(initiative, anchor)}
                      />
                    ))}
                  </CardContent>
                </Card>
              </OfferReveal>
            ))}
          </div>
        ) : null}

        {viewMode === "timeline" ? (
          <div className="mt-6 space-y-4">
            {initiatives.map((initiative, index) => (
              <OfferReveal key={initiative.id} delayMs={index * 40}>
                <div className="grid gap-4 md:grid-cols-[120px_1fr]">
                  <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                    {initiative.quarter}
                  </div>
                  <RoadmapInitiativeButton
                    initiative={initiative}
                    highlighted={isHighlighted({ roadmapInitiativeId: initiative.id })}
                    onClick={(anchor) => handleInitiativeClick(initiative, anchor)}
                  />
                </div>
              </OfferReveal>
            ))}
          </div>
        ) : null}

        {viewMode === "priority" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {priorityGroups.map((group, index) => (
              <OfferReveal key={group.priority} delayMs={index * 60}>
                <Card className="border-border/70 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{group.priority} Priority</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {group.initiatives.map((initiative) => (
                      <RoadmapInitiativeButton
                        key={initiative.id}
                        initiative={initiative}
                        highlighted={isHighlighted({ roadmapInitiativeId: initiative.id })}
                        onClick={(anchor) => handleInitiativeClick(initiative, anchor)}
                      />
                    ))}
                  </CardContent>
                </Card>
              </OfferReveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
