"use client";

import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecommendationPillarHint } from "@/components/technology-maturity/recommendation-pillar-hint";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import { conciseFocusTitle } from "@/lib/client-workspace";
import { PRIORITY_LABELS } from "@/lib/display";
import { sortRecommendationsByPriority } from "@/lib/recommendations/sort";
import type { ClientRecommendationRow } from "@/lib/recommendations/client-list";

type CustomerRecommendationsViewProps = {
  recommendations: ClientRecommendationRow[];
};

function RecommendationCard({ recommendation }: { recommendation: ClientRecommendationRow }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg leading-snug">
            {conciseFocusTitle(recommendation.title)}
          </CardTitle>
          <Badge variant={PRIORITY_BADGE[recommendation.priority]}>
            {PRIORITY_LABELS[recommendation.priority]}
          </Badge>
        </div>
        <RecommendationPillarHint categoryCode={recommendation.categoryCode} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendation.description ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Business Explanation
            </p>
            <p className="mt-1 text-sm leading-relaxed">{recommendation.description}</p>
          </div>
        ) : null}

        {recommendation.businessImpact ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Business Impact
            </p>
            <p className="mt-1 text-sm leading-relaxed">{recommendation.businessImpact}</p>
          </div>
        ) : null}

        <div className="rounded-lg bg-muted/40 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Estimated Score Improvement
          </p>
          <p className="mt-0.5 text-sm font-semibold">
            +{recommendation.estimatedImpactPoints} StackScore points
          </p>
        </div>
      </CardContent>
    </Card>
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
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Recommendations</h1>
        <p className="max-w-2xl text-muted-foreground">
          Your highest-priority opportunities to strengthen technology maturity and reduce business
          risk.
        </p>
      </header>

      {visibleRecommendations.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center">
            <Lightbulb className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 font-medium">No recommendations yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete your assessment to receive personalized recommendations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleRecommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      )}

      <Card className="border-primary/20 bg-muted/30 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Your complete roadmap</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {totalOpportunities > 0
              ? `We identified ${totalOpportunities} opportunit${totalOpportunities === 1 ? "y" : "ies"}. Your executive report contains the complete roadmap, which we will review together during your strategy session.`
              : "Your executive report will contain the complete roadmap, which we will review together during your strategy session."}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
