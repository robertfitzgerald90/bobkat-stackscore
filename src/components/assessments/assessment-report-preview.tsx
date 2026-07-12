"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Calendar, Download, FileText, Lightbulb } from "lucide-react";
import { AssessmentReportHero } from "@/components/assessments/assessment-report-hero";
import { AssessmentReportToolbar } from "@/components/assessments/assessment-report-toolbar";
import {
  ReportBody,
  ReportDataCard,
  ReportDocument,
  ReportEmptyState,
  ReportFooter,
  ReportHighlightCard,
  ReportPrintLeadGroup,
  ReportPriorityBadge,
  ReportSection,
  ReportShell,
} from "@/components/reports";
import { RecommendationPillarHint } from "@/components/technology-maturity/recommendation-pillar-hint";
import { buildPillarInsights } from "@/lib/technology-maturity/pillars";
import { buildAssessmentReportSections } from "@/lib/reports/assessment-content";
import type { AssessmentReportData } from "@/lib/pdf/types";
import type { RecommendationSummary } from "@/lib/assessments/results-summary";
import { BookingButton } from "@/components/support/booking-button";
import { getBookingUrl } from "@/lib/support/config";
import { clientRecommendationsPath } from "@/lib/clients/paths";
import { buttonClassName } from "@/components/ui/button";
import { getReportScoreBarClass, getReportScoreTextClass } from "@/lib/reports/document-score-display";
import { getRating, RATING_LABELS } from "@/lib/scoring";
import { cn } from "@/lib/utils";

type AssessmentReportPreviewProps = {
  assessmentId: string;
  clientId: string;
  data: AssessmentReportData;
  isCustomerView?: boolean;
};

const DOCUMENT_THEME = true;

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
          emphasize && typeof value === "number" ? getReportScoreTextClass(value) : undefined,
        )}
      >
        {value}
      </p>
      {subtitle ? <p className="report-snapshot-subtitle">{subtitle}</p> : null}
    </div>
  );
}

function RecommendationCard({
  recommendation,
}: {
  recommendation: RecommendationSummary;
}) {
  return (
    <ReportDataCard
      documentTheme={DOCUMENT_THEME}
      className="report-recommendation-card"
      title={
        <div className="report-recommendation-title-row">
          <p className="report-recommendation-title">{recommendation.title}</p>
          <ReportPriorityBadge priority={recommendation.priority} documentTheme={DOCUMENT_THEME} />
        </div>
      }
      description={recommendation.description || recommendation.businessImpact}
      meta={
        <div className="space-y-2">
          {recommendation.businessImpact ? (
            <p className="report-prose-sm">{recommendation.businessImpact}</p>
          ) : null}
          <RecommendationPillarHint
            categoryCode={recommendation.categoryCode}
            documentTheme={DOCUMENT_THEME}
          />
          <p className="report-impact-line">
            +{recommendation.estimatedImpactPoints} StackScore points estimated improvement
          </p>
        </div>
      }
    />
  );
}

function InsightList({ items, emptyMessage }: { items: string[]; emptyMessage: string }) {
  if (items.length === 0) {
    return <ReportEmptyState documentTheme={DOCUMENT_THEME}>{emptyMessage}</ReportEmptyState>;
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

  const recommendationsByPriority = sections.recommendationsByPriority.filter(
    (group) => group.items.length > 0,
  );

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
  const backLabel = isCustomerView ? "Back to Assessment Dashboard" : "Back to Results";
  const bookingUrl = getBookingUrl();
  const hasRecommendations = data.summary.recommendations.length > 0;
  const recommendationsHref = clientRecommendationsPath(clientId);

  return (
    <ReportShell className="assessment-executive-report">
      <AssessmentReportToolbar
        backHref={backHref}
        backLabel={backLabel}
        downloadHref={`/api/v1/assessments/${assessmentId}/export/pdf`}
      />

      <ReportDocument className="report-document-executive" documentTheme={DOCUMENT_THEME}>
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
            documentTheme={DOCUMENT_THEME}
          >
            <div className="report-prose-stack">
              {executiveParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="report-prose">
                  {paragraph}
                </p>
              ))}
            </div>
            <ReportPrintLeadGroup>
              <div className="report-executive-grid">
                <ReportHighlightCard documentTheme={DOCUMENT_THEME}>
                  <p className="report-highlight-label">Overall maturity</p>
                  <p className="report-highlight-value">
                    {data.summary.overallScore} — {data.summary.overallRatingLabel}
                  </p>
                </ReportHighlightCard>
                <ReportHighlightCard documentTheme={DOCUMENT_THEME}>
                  <p className="report-highlight-label">Primary risks</p>
                  <InsightList
                    items={sections.riskBullets.slice(0, 3)}
                    emptyMessage="No significant risk areas were identified."
                  />
                </ReportHighlightCard>
                <ReportHighlightCard documentTheme={DOCUMENT_THEME}>
                  <p className="report-highlight-label">Top opportunities</p>
                  <InsightList
                    items={sections.priorityBullets.slice(0, 3)}
                    emptyMessage="Complete remediation planning during your strategy session."
                  />
                </ReportHighlightCard>
                <ReportHighlightCard documentTheme={DOCUMENT_THEME}>
                  <p className="report-highlight-label">Recommended next step</p>
                  <p className="report-prose-sm">
                    Review this report with BobKat IT to prioritize actions, align investment, and
                    build your technology roadmap.
                  </p>
                </ReportHighlightCard>
              </div>
            </ReportPrintLeadGroup>
          </ReportSection>

          <ReportSection title="Score Snapshot" subtitle="At-a-glance assessment metrics" documentTheme={DOCUMENT_THEME}>
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
            documentTheme={DOCUMENT_THEME}
          >
            <div className="report-pillar-grid">
              {pillarInsights.map((pillar, index) => {
                const score = pillar.percentScore !== null ? Math.round(pillar.percentScore) : null;
                const card = (
                  <div key={pillar.pillarCode} className="report-pillar-card">
                    <div className="report-pillar-header">
                      <p className="report-pillar-name">{pillar.pillarName}</p>
                      <p
                        className={cn(
                          "report-pillar-score",
                          score !== null ? getReportScoreTextClass(score) : undefined,
                        )}
                      >
                        {score ?? "—"}
                      </p>
                    </div>
                    <div className="report-pillar-bar-track">
                      <div
                        className={cn(
                          "report-pillar-bar-fill",
                          score !== null ? getReportScoreBarClass(score) : "report-score-bar-track",
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

                if (index === 0) {
                  return <ReportPrintLeadGroup key={pillar.pillarCode}>{card}</ReportPrintLeadGroup>;
                }
                return card;
              })}
            </div>
          </ReportSection>

          <div className="report-two-column">
            <ReportSection title="Top Strengths" subtitle="Areas performing well today" documentTheme={DOCUMENT_THEME}>
              {topStrengths.length === 0 ? (
                <ReportEmptyState documentTheme={DOCUMENT_THEME}>Strengths will appear after pillar scoring is complete.</ReportEmptyState>
              ) : (
                <div className="report-insight-cards">
                  {topStrengths.map((pillar, index) => {
                    const card = (
                      <div key={pillar.pillarCode} className="report-insight-card">
                        <p className="report-insight-title">{pillar.pillarName}</p>
                        <p className="report-insight-body">
                          Scoring {Math.round(pillar.percentScore ?? 0)}% —{" "}
                          {pillar.maturityTier ?? "strong relative performance"}.
                        </p>
                      </div>
                    );
                    if (index === 0) {
                      return <ReportPrintLeadGroup key={pillar.pillarCode}>{card}</ReportPrintLeadGroup>;
                    }
                    return card;
                  })}
                </div>
              )}
            </ReportSection>

            <ReportSection
              title="Top Risks"
              subtitle="Areas that may benefit from focused improvement"
              documentTheme={DOCUMENT_THEME}
            >
              {topRisks.length === 0 ? (
                <ReportEmptyState documentTheme={DOCUMENT_THEME}>No material risk areas were identified.</ReportEmptyState>
              ) : (
                <div className="report-insight-cards">
                  {topRisks.map((pillar, index) => {
                    const card = (
                      <div key={pillar.pillarCode} className="report-insight-card report-insight-card-risk">
                        <p className="report-insight-title">{pillar.pillarName}</p>
                        <p className="report-insight-body">
                          Scoring {Math.round(pillar.percentScore ?? 0)}% — an opportunity to reduce
                          operational and security exposure.
                        </p>
                      </div>
                    );
                    if (index === 0) {
                      return <ReportPrintLeadGroup key={pillar.pillarCode}>{card}</ReportPrintLeadGroup>;
                    }
                    return card;
                  })}
                </div>
              )}
            </ReportSection>
          </div>

          <ReportSection
            title="Detailed Recommendations"
            subtitle="Prioritized remediation guidance organized by priority"
            documentTheme={DOCUMENT_THEME}
          >
            {recommendationsByPriority.length === 0 ? (
              <ReportEmptyState documentTheme={DOCUMENT_THEME}>
                No recommendations were generated for this assessment.
              </ReportEmptyState>
            ) : (
              <div className="report-recommendation-list">
                {recommendationsByPriority.map((group) => {
                  const [first, ...rest] = group.items;
                  return (
                    <div key={group.priority} className="report-priority-group">
                      <ReportPrintLeadGroup>
                        <h5 className="report-priority-group-heading">
                          {group.label} ({group.items.length})
                        </h5>
                        {first ? <RecommendationCard recommendation={first} /> : null}
                      </ReportPrintLeadGroup>
                      {rest.length > 0 ? (
                        <div className="report-priority-group-cards">
                          {rest.map((recommendation) => (
                            <RecommendationCard
                              key={recommendation.id}
                              recommendation={recommendation}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </ReportSection>

          <ReportSection title="Next Steps" subtitle="How to turn insight into action" documentTheme={DOCUMENT_THEME}>
            <div className="report-next-steps">
              <ReportPrintLeadGroup>
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
              </ReportPrintLeadGroup>
              {bookingUrl ? (
                <div className="report-next-step">
                  <Calendar className="report-next-step-icon" />
                  <div>
                    <p className="report-next-step-title">Schedule a results review</p>
                    <p className="report-prose-sm">
                      Meet with BobKat IT to walk through findings and align on priorities.
                    </p>
                    <BookingButton
                      label="primary"
                      size="sm"
                      className="report-no-print mt-3"
                    />
                  </div>
                </div>
              ) : null}
              {isCustomerView && hasRecommendations ? (
                <div className="report-next-step">
                  <Lightbulb className="report-next-step-icon" />
                  <div>
                    <p className="report-next-step-title">Review your priorities</p>
                    <p className="report-prose-sm">
                      Explore the recommendations surfaced by your assessment and focus on what
                      matters most.
                    </p>
                    <Link
                      href={recommendationsHref}
                      className={buttonClassName({
                        variant: "outline",
                        size: "sm",
                        className: "report-no-print mt-3",
                      })}
                    >
                      View Recommendations
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </ReportSection>

          <ReportFooter confidentialFor={data.clientName} documentTheme={DOCUMENT_THEME} />
        </ReportBody>
      </ReportDocument>
    </ReportShell>
  );
}
