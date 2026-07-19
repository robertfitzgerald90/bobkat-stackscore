"use client";

import { Lightbulb } from "lucide-react";
import {
  ClientEmptyState,
  ClientPageHeader,
  ClientPageShell,
} from "@/components/client-ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import { CLIENT_INTERACTIVE_CARD, CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { conciseFocusTitle } from "@/lib/client-workspace";
import { PRIORITY_LABELS } from "@/lib/display";
import { sortRecommendationsByPriority } from "@/lib/recommendations/sort";
import { getPillarDisplayForCategoryCode } from "@/lib/technology-maturity/pillars";
import type { ClientRecommendationRow } from "@/lib/recommendations/client-list";
import type { Priority } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type CustomerRecommendationsViewProps = {
  recommendations: ClientRecommendationRow[];
};

const PRIORITY_ACCENT: Record<Priority, string> = {
  critical: "border-l-destructive bg-destructive/[0.04]",
  high: "border-l-amber-500 bg-amber-500/[0.05]",
  medium: "border-l-primary/60 bg-primary/[0.03]",
  low: "border-l-border bg-muted/20",
};

function RecommendationCard({ recommendation }: { recommendation: ClientRecommendationRow }) {
  const pillar = getPillarDisplayForCategoryCode(recommendation.categoryCode);

  return (
    <article
      className={cn(
        CLIENT_INTERACTIVE_CARD,
        "overflow-hidden border-l-4 shadow-sm",
        PRIORITY_ACCENT[recommendation.priority],
      )}
    >
      <div className="space-y-6 p-5 sm:p-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="min-w-0 flex-1 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              {conciseFocusTitle(recommendation.title)}
            </h2>
            <Badge
              variant={PRIORITY_BADGE[recommendation.priority]}
              className="shrink-0 text-xs uppercase tracking-wide"
            >
              {PRIORITY_LABELS[recommendation.priority]}
            </Badge>
          </div>

          {pillar ? (
            <div className="space-y-1.5 rounded-lg border border-border/50 bg-background/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Technology Pillar
              </p>
              <p className="text-sm font-medium">{pillar.pillarName}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {pillar.businessQuestion}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 rounded-lg border border-border/50 bg-background/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Technology Pillar
              </p>
              <p className="text-sm font-medium">{recommendation.categoryName}</p>
            </div>
          )}
        </header>

        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Why this matters
          </p>
          {recommendation.businessImpact ? (
            <p className="text-base leading-relaxed text-foreground/90">
              {recommendation.businessImpact}
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Addressing this area will strengthen your technology environment and reduce
              operational risk.
            </p>
          )}
        </section>

        <footer className="border-t border-border/60 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Estimated StackScore improvement
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-primary">
            +{recommendation.estimatedImpactPoints} points
          </p>
        </footer>
      </div>
    </article>
  );
}

export function CustomerRecommendationsView({
  recommendations,
}: CustomerRecommendationsViewProps) {
  const visibleRecommendations = sortRecommendationsByPriority(
    recommendations.filter(
      (r) => r.status === "open" || r.status === "accepted" || r.status === "in_progress",
    ),
  );

  const totalOpportunities = visibleRecommendations.length;

  return (
    <ClientPageShell className="max-w-3xl space-y-10">
      <ClientPageHeader
        eyebrow="Improvement Priorities"
        title="Recommendations"
        description="What to improve, why it matters for your business, and how much maturity improvement you can expect from each priority."
      />

      {visibleRecommendations.length === 0 ? (
        <ClientEmptyState
          icon={Lightbulb}
          title="No recommendations yet"
          description="Recommendations appear after your technology assessment identifies the highest-impact improvements for your environment."
          nextStep="Complete or resume your assessment to receive personalized priorities."
        />
      ) : (
        <div className="space-y-6">
          {visibleRecommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      )}

      <Card className={cn(CLIENT_SURFACE_CARD, "border-primary/20 bg-muted/30")}>
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">Your complete roadmap</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {totalOpportunities > 0
              ? `We identified ${totalOpportunities} opportunit${totalOpportunities === 1 ? "y" : "ies"}. Your executive report contains the complete roadmap, which we will review together during your strategy session.`
              : "Your executive report will contain the complete roadmap, which we will review together during your strategy session."}
          </CardDescription>
        </CardHeader>
      </Card>
    </ClientPageShell>
  );
}
