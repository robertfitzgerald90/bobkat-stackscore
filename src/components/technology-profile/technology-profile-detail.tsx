"use client";

import Link from "next/link";
import { TpActiveProjects } from "@/components/technology-profile/tp-active-projects";
import { TpBusinessSnapshot } from "@/components/technology-profile/tp-business-snapshot";
import { TpCategoryScores } from "@/components/technology-profile/tp-category-scores";
import { TpHeroSummary } from "@/components/technology-profile/tp-hero-summary";
import { TpOpenOpportunities } from "@/components/technology-profile/tp-open-opportunities";
import { TpRecentProgress } from "@/components/technology-profile/tp-recent-progress";
import { TpReportsDocuments } from "@/components/technology-profile/tp-reports-documents";
import { TpRoadmapPreview } from "@/components/technology-profile/tp-roadmap-preview";
import { TpScoreHistory } from "@/components/technology-profile/tp-score-history";
import { TpTechnologyJourney } from "@/components/technology-profile/tp-technology-journey";
import { buttonClassName } from "@/components/ui/button";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";

type TechnologyProfileDetailViewProps = {
  detail: TechnologyProfileDetail;
};

export function TechnologyProfileDetailView({ detail }: TechnologyProfileDetailViewProps) {
  const { profile, scoreTrend, sections, journey } = detail;

  return (
    <div className="space-y-6 sm:space-y-8">
      <TpHeroSummary detail={detail} />

      {sections.showBusinessSnapshot ? (
        <TpBusinessSnapshot
          clientId={profile.clientId}
          snapshot={detail.businessSnapshot}
          capabilities={detail.capabilities}
          limited={sections.showBusinessSnapshotLimited}
        />
      ) : null}

      <TpCategoryScores
        clientId={profile.clientId}
        insights={detail.categoryInsights}
        assessmentsCompleted={journey.assessmentsCompleted}
        showRecommendationCounts={sections.showRecommendationCounts}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TpTechnologyJourney
          clientId={profile.clientId}
          journey={journey}
          journeyScores={detail.journeyScores}
        />
        <TpScoreHistory
          clientId={profile.clientId}
          scoreTrend={scoreTrend}
          assessmentsCompleted={journey.assessmentsCompleted}
        />
      </div>

      {sections.showOpenOpportunities ? (
        <TpOpenOpportunities
          clientId={profile.clientId}
          recommendations={detail.openRecommendations}
          capabilities={detail.capabilities}
          assessmentsCompleted={journey.assessmentsCompleted}
        />
      ) : null}

      {sections.showRecentProgress || sections.showRoadmapPreview ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {sections.showRecentProgress ? (
            <TpRecentProgress projects={detail.completedProjects} />
          ) : null}
          {sections.showRoadmapPreview ? (
            <TpRoadmapPreview
              clientId={profile.clientId}
              phases={detail.roadmapPreview}
              activeTip={detail.activeTip}
              canEditImprovementPlan={detail.capabilities.canEditImprovementPlan}
            />
          ) : null}
        </div>
      ) : null}

      {sections.showActiveProjects ? (
        <TpActiveProjects projects={detail.activeProjects} />
      ) : null}

      <TpReportsDocuments
        clientId={profile.clientId}
        documents={detail.documents}
        activeTip={detail.activeTip}
        showRoadmapBuilderLink={sections.showRoadmapBuilderLink}
        assessmentsCompleted={journey.assessmentsCompleted}
        canEditImprovementPlan={detail.capabilities.canEditImprovementPlan}
      />

      {sections.showAssessmentResultsLink && profile.currentAssessmentId ? (
        <div className="flex justify-stretch sm:justify-end">
          <Link
            href={`/assessments/${profile.currentAssessmentId}/results`}
            className={buttonClassName({ variant: "outline", className: "w-full sm:w-auto" })}
          >
            View current assessment results
          </Link>
        </div>
      ) : null}
    </div>
  );
}
