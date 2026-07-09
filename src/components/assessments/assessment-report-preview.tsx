"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Calendar, Download, FileText } from "lucide-react";
import { AssessmentReportHero } from "@/components/assessments/assessment-report-hero";
import { AssessmentReportToolbar } from "@/components/assessments/assessment-report-toolbar";
import {
  ReportBody,
  ReportDataCard,
  ReportDocument,
  ReportEmptyState,
  ReportFooter,
  ReportHighlightCard,
  ReportPriorityBadge,
  ReportSection,
  ReportShell,
} from "@/components/reports";
import { RecommendationPillarHint } from "@/components/technology-maturity/recommendation-pillar-hint";
import { buildPillarInsights } from "@/lib/technology-maturity/pillars";
import { buildAssessmentReportSections } from "@/lib/reports/assessment-content";
import { takeTopRecommendations } from "@/lib/recommendations/sort";
import { getBookingUrl } from "@/lib/support/config";
import type { AssessmentReportData } from "@/lib/pdf/types";
import { buttonClassName } from "@/components/ui/button";
import { getScoreBarColorClass, getScoreTextColorClass } from "@/lib/scoring/score-display";
import { getRating, RATING_LABELS } from "@/lib/scoring";
import { cn } from "@/lib/utils";

type AssessmentReportPreviewProps = {
  assessmentId: string;
  clientId: string;
  data: AssessmentReportData;
  isCustomerView?: boolean;
};

function SnapshotCard({
  label,
  value,
  subtitle,
  emphasize = false,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  emphasize?: boolean;
}) {
  return (
    <div className="report-snapshot-card">
      <p className="report-snapshot-label">{label}</p>
      <p
        className={cn(
          "report-snapshot-value",
          emphasize && typeof value === "number" ? getScoreTextColorClass(value) : undefined,
        )}
      >
        {value}
      </p>
      {subtitle ? <p className="report-snapshot-subtitle">{subtitle}</p> : null}
    </div>
  );
}

function InsightList({ items, emptyMessage }: { items: string[]; emptyMessage: string }) {
  if (items.length === 0) {
    return <ReportEmptyState>{emptyMessage}</ReportEmptyState>;
  }
  return (
    <ul className="report-insight-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function AssessmentReportPreview({
  assessmentId,
  clientId,
  data,
  isCustomerView = false,
}: AssessmentReportPreviewProps) {
  const sections = buildAssessmentReportSections(data);
  const bookingUrl = getBookingUrl();

  const pillarInsights = useMemo(
    () =>
      buildPillarInsights({
        v1CategoryScores: data.summary.categoryScores.map((category) => ({
          categoryId: category.categoryId,
          categoryCode: category.categoryCode,
          categoryName: category.categoryName,
          pointsEarned: category.percentScore,
          pointsPossible: 100,
          percentScore: category.percentScore,
          rating: category.rating,
          weightedContribution: 0,
        })),
        openRecommendations: data.summary.recommendations.map((recommendation) => ({
          categoryCode: recommendation.categoryCode,
        })),
      }),
    [data.summary.categoryScores, data.summary.recommendations],
  );

  const topStrengths = [...pillarInsights]
    .filter((p) => p.percentScore !== null)
    .sort((a, b) => (b.percentScore ?? 0) - (a.percentScore ?? 0))
    .slice(0, 3);

  const topRisks = [...pillarInsights]
    .filter((p) => p.percentScore !== null)
    .sort((a, b) => (a.percentScore ?? 0) - (b.percentScore ?? 0))
    .slice(0, 3);

  const priorityRecommendations = takeTopRecommendations(sections.clientRecommendations, 5);

  const executiveParagraphs = data.executiveSummary?.trim()
    ? data.executiveSummary.trim().split(/\n\n+/).filter(Boolean)
    : sections.overviewBullets.length > 0
      ? sections.overviewBullets
      : [
          `${data.clientName} completed a technology maturity assessment to establish a baseline StackScore and identify prioritized improvement opportunities.`,
        ];

  const backHref = isCustomerView
    ? `/clients/${clientId}/technology-profile`
    : `/assessments/${assessmentId}/results`;
  const backLabel = isCustomerView ? "Back to Dashboard" : "Back to Results";

  return (
    <ReportShell className="assessment-executive-report">
      <AssessmentReportToolbar
        backHref={backHref}
        backLabel={backLabel}
        downloadHref={`/api/v1/assessments/${assessmentId}/export/pdf`}
      />

      <ReportDocument className="report-document-executive">
        <AssessmentReportHero
          clientName={data.clientName}
          assessmentDate={data.assessmentDate}
          overallScore={data.summary.overallScore}
          overallRatingLabel={data.summary.overallRatingLabel}
          projectedScore={data.summary.projectedScore}
        />

        <ReportBody className="report-body-executive">
          <ReportSection
            title="Executive Summary"
            subtitle="What this assessment means for your organization"
          >
            <div className="report-prose-stack">
              {executiveParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="report-prose">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="report-executive-grid">
              <ReportHighlightCard>
                <p className="report-highlight-label">Overall maturity</p>
                <p className="report-highlight-value">
                  {data.summary.overallScore} — {data.summary.overallRatingLabel}
                </p>
              </ReportHighlightCard>
              <ReportHighlightCard>
                <p className="report-highlight-label">Primary risks</p>
                <InsightList
                  items={sections.riskBullets.slice(0, 3)}
                  emptyMessage="No significant risk areas were identified."
                />
              </ReportHighlightCard>
              <ReportHighlightCard>
                <p className="report-highlight-label">Top opportunities</p>
                <InsightList
                  items={sections.priorityBullets.slice(0, 3)}
                  emptyMessage="Complete remediation planning during your strategy session."
                />
              </ReportHighlightCard>
              <ReportHighlightCard>
                <p className="report-highlight-label">Recommended next step</p>
                <p className="report-prose-sm">
                  Review this report with BobKat IT to prioritize actions, align investment, and
                  build your technology roadmap.
                </p>
              </ReportHighlightCard>
            </div>
          </ReportSection>

          <ReportSection title="Score Snapshot" subtitle="At-a-glance assessment metrics">
            <div className="report-snapshot-grid">
              <SnapshotCard
                label="Overall StackScore"
                value={data.summary.overallScore}
                subtitle={data.summary.overallRatingLabel}
                emphasize
              />
              <SnapshotCard
                label="Projected Improvement"
                value={data.summary.projectedScore}
                subtitle={`+${sections.estimatedImprovement} points potential`}
                emphasize
              />
              <SnapshotCard
                label="Critical Findings"
                value={data.summary.criticalFindingsCount}
                subtitle={
                  data.summary.hasCriticalExposure
                    ? "Items requiring immediate attention"
                    : "No critical exposure flagged"
                }
              />
              <SnapshotCard
                label="Open Recommendations"
                value={data.summary.openRecommendationsCount}
                subtitle="Active improvement opportunities"
              />
            </div>
          </ReportSection>

          <ReportSection
            title="Technology Pillar Breakdown"
            subtitle="How each area of your technology environment contributes to overall health"
          >
            <div className="report-pillar-grid">
              {pillarInsights.map((pillar) => {
                const score = pillar.percentScore !== null ? Math.round(pillar.percentScore) : null;
                return (
                  <div key={pillar.pillarCode} className="report-pillar-card">
                    <div className="report-pillar-header">
                      <p className="report-pillar-name">{pillar.pillarName}</p>
                      <p
                        className={cn(
                          "report-pillar-score",
                          score !== null ? getScoreTextColorClass(score) : undefined,
                        )}
                      >
                        {score ?? "—"}
                      </p>
                    </div>
                    <div className="report-pillar-bar-track">
                      <div
                        className={cn(
                          "report-pillar-bar-fill",
                          score !== null ? getScoreBarColorClass(score) : "bg-muted",
                        )}
                        style={{ width: `${score ?? 0}%` }}
                      />
                    </div>
                    <p className="report-pillar-note">
                      {score !== null
                        ? RATING_LABELS[getRating(score)]
                        : "Not assessed in this review"}
                    </p>
                  </div>
                );
              })}
            </div>
          </ReportSection>

          <div className="report-two-column">
            <ReportSection title="Top Strengths" subtitle="Areas performing well today">
              {topStrengths.length === 0 ? (
                <ReportEmptyState>Strengths will appear after pillar scoring is complete.</ReportEmptyState>
              ) : (
                <div className="report-insight-cards">
                  {topStrengths.map((pillar) => (
                    <div key={pillar.pillarCode} className="report-insight-card">
                      <p className="report-insight-title">{pillar.pillarName}</p>
                      <p className="report-insight-body">
                        Scoring {Math.round(pillar.percentScore ?? 0)}% —{" "}
                        {pillar.maturityTier ?? "strong relative performance"}.
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ReportSection>

            <ReportSection
              title="Top Risks"
              subtitle="Areas that may benefit from focused improvement"
            >
              {topRisks.length === 0 ? (
                <ReportEmptyState>No material risk areas were identified.</ReportEmptyState>
              ) : (
                <div className="report-insight-cards">
                  {topRisks.map((pillar) => (
                    <div key={pillar.pillarCode} className="report-insight-card report-insight-card-risk">
                      <p className="report-insight-title">{pillar.pillarName}</p>
                      <p className="report-insight-body">
                        Scoring {Math.round(pillar.percentScore ?? 0)}% — an opportunity to reduce
                        operational and security exposure.
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ReportSection>
          </div>

          <ReportSection
            title="Priority Recommendations"
            subtitle="Highest-impact opportunities identified in this assessment"
          >
            {priorityRecommendations.length === 0 ? (
              <ReportEmptyState>No recommendations were generated for this assessment.</ReportEmptyState>
            ) : (
              <div className="report-recommendation-list">
                {priorityRecommendations.map((recommendation) => (
                  <ReportDataCard
                    key={recommendation.id}
                    title={
                      <div className="report-recommendation-title-row">
                        <p className="report-recommendation-title">{recommendation.title}</p>
                        <ReportPriorityBadge priority={recommendation.priority} />
                      </div>
                    }
                    description={recommendation.description || recommendation.businessImpact}
                    meta={
                      <div className="space-y-2">
                        {recommendation.businessImpact ? (
                          <p className="report-prose-sm">{recommendation.businessImpact}</p>
                        ) : null}
                        <RecommendationPillarHint categoryCode={recommendation.categoryCode} />
                        <p className="report-impact-line">
                          +{recommendation.estimatedImpactPoints} StackScore points estimated
                          improvement
                        </p>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </ReportSection>

          <ReportSection title="Next Steps" subtitle="How to turn insight into action">
            <div className="report-next-steps">
              <div className="report-next-step">
                <FileText className="report-next-step-icon" />
                <div>
                  <p className="report-next-step-title">Download this report</p>
                  <p className="report-prose-sm">
                    Save a PDF copy for leadership review and internal planning.
                  </p>
                  <a
                    href={`/api/v1/assessments/${assessmentId}/export/pdf`}
                    className={buttonClassName({
                      variant: "outline",
                      size: "sm",
                      className: "report-no-print mt-3",
                    })}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </a>
                </div>
              </div>
              <div className="report-next-step">
                <Calendar className="report-next-step-icon" />
                <div>
                  <p className="report-next-step-title">Schedule a results review</p>
                  <p className="report-prose-sm">
                    Meet with BobKat IT to walk through findings and align on priorities.
                  </p>
                  {bookingUrl ? (
                    <a
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClassName({
                        size: "sm",
                        className: "report-no-print mt-3",
                      })}
                    >
                      Book Strategy Session
                    </a>
                  ) : (
                    <Link
                      href="/support"
                      className={buttonClassName({
                        size: "sm",
                        className: "report-no-print mt-3",
                      })}
                    >
                      Contact Support
                    </Link>
                  )}
                </div>
              </div>
              <div className="report-next-step">
                <p className="report-next-step-title">Review your roadmap with BobKat IT</p>
                <p className="report-prose-sm">
                  Your consultant will help translate recommendations into a phased implementation
                  plan tailored to your business goals and budget.
                </p>
              </div>
            </div>
          </ReportSection>

          <ReportFooter confidentialFor={data.clientName} />
        </ReportBody>
      </ReportDocument>
    </ReportShell>
  );
}
