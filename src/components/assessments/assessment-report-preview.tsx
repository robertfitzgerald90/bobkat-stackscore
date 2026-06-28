"use client";

import Link from "next/link";
import { FileDown } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ReportBody,
  ReportCover,
  ReportDataCard,
  ReportDocument,
  ReportEmptyState,
  ReportExecutiveSummary,
  ReportFooter,
  ReportHeader,
  ReportHighlightCard,
  ReportMetaGrid,
  ReportMetricCard,
  ReportMetricGrid,
  ReportPrintActions,
  ReportPriorityBadge,
  ReportSection,
  ReportShell,
} from "@/components/reports";
import { formatAssessmentCompletionDate } from "@/lib/assessments/display";
import { buildAssessmentReportSections, getProjectedRatingLabel } from "@/lib/reports/assessment-content";
import type { AssessmentReportData } from "@/lib/pdf/types";
import { PRIORITY_LABELS } from "@/lib/display";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { RATING_LABELS } from "@/lib/scoring";
import { cn } from "@/lib/utils";

type AssessmentReportPreviewProps = {
  assessmentId: string;
  clientId: string;
  data: AssessmentReportData;
};

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <ReportEmptyState>No items to display.</ReportEmptyState>;
  }

  return (
    <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="text-primary">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function AssessmentReportPreview({
  assessmentId,
  clientId,
  data,
}: AssessmentReportPreviewProps) {
  const sections = buildAssessmentReportSections(data);
  const generatedDate = formatAssessmentCompletionDate(data.completedAt);

  return (
    <ReportShell>
      <ReportPrintActions
        clientName={data.clientName}
        title="Assessment Report"
        description={`${data.assessmentName} · ${sections.assessmentTypeLabel}`}
        printLabel="Print Report"
        backHref={`/assessments/${assessmentId}/results`}
        backLabel="Back to Results"
        extraActions={
          <a
            href={`/api/v1/assessments/${assessmentId}/export/pdf`}
            className={buttonClassName({ variant: "outline", className: "w-full sm:w-auto" })}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Download PDF
          </a>
        }
      />

      <ReportDocument>
        <ReportCover reportType="assessment" />

        <ReportBody>
          <ReportMetaGrid
            items={[
              { label: "Client", value: data.clientName },
              { label: "Assessment", value: data.assessmentName },
              { label: "Type", value: sections.assessmentTypeLabel },
              { label: "Assessment Date", value: data.assessmentDate },
            ]}
          />

          <ReportHeader
            reportTitle="Technology Maturity Assessment"
            clientName={data.clientName}
            dateLabel={generatedDate ?? data.assessmentDate}
          />

          <ReportSection
            title="Recommendation Summary"
            subtitle="Prioritized remediation opportunities and projected StackScore impact"
          >
            <ReportMetricGrid columns={2}>
              <ReportMetricCard
                label="Current StackScore"
                value={data.summary.overallScore}
                subtitle={data.summary.overallRatingLabel}
                valueClassName={getScoreTextColorClass(data.summary.overallScore)}
              />
              <ReportMetricCard
                label="Projected StackScore"
                value={data.summary.projectedScore}
                subtitle={getProjectedRatingLabel(data.summary.projectedScore)}
                valueClassName={getScoreTextColorClass(data.summary.projectedScore)}
                highlight
              />
            </ReportMetricGrid>

            <ReportMetricGrid columns={4} className="mt-4">
              <ReportMetricCard
                label="Total Recommendations"
                value={sections.clientRecommendations.length}
              />
              <ReportMetricCard
                label="Open Items"
                value={data.summary.openRecommendationsCount}
              />
              <ReportMetricCard label="Potential Points" value={`+${sections.totalImpact}`} />
              <ReportMetricCard
                label="Critical + High"
                value={sections.criticalCount + sections.highCount}
              />
            </ReportMetricGrid>
          </ReportSection>

          <ReportSection title="Executive Summary">
            <ReportExecutiveSummary
              value={data.executiveSummary ?? ""}
              fallback={sections.overviewBullets.join(" ")}
              className="text-foreground/90"
            />
          </ReportSection>

          <ReportSection title="Assessment Overview">
            <div className="grid gap-6 lg:grid-cols-2">
              <ReportHighlightCard>
                <p className="text-sm font-semibold text-primary">Overall Risk</p>
                <BulletList items={sections.overallRiskBullets} />
              </ReportHighlightCard>
              <ReportHighlightCard>
                <p className="text-sm font-semibold text-primary">Projected Improvement</p>
                <BulletList items={sections.improvementBullets} />
              </ReportHighlightCard>
              <ReportHighlightCard>
                <p className="text-sm font-semibold text-primary">Top Strengths</p>
                <BulletList items={sections.strengthBullets} />
              </ReportHighlightCard>
              <ReportHighlightCard>
                <p className="text-sm font-semibold text-primary">Top Risks</p>
                <BulletList items={sections.riskBullets} />
              </ReportHighlightCard>
              <ReportHighlightCard className="lg:col-span-2">
                <p className="text-sm font-semibold text-primary">Immediate Priorities</p>
                <BulletList items={sections.priorityBullets} />
              </ReportHighlightCard>
            </div>
          </ReportSection>

          <ReportSection
            title="Category Profile"
            subtitle="Technology maturity scores by assessment category"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {data.summary.categoryScores.map((category) => (
                <div key={category.categoryId} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{category.categoryName}</p>
                    <p
                      className={cn(
                        "text-lg font-bold",
                        getScoreTextColorClass(Math.round(category.percentScore)),
                      )}
                    >
                      {Math.round(category.percentScore)}%
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {RATING_LABELS[category.rating]}
                  </p>
                </div>
              ))}
            </div>
          </ReportSection>

          <ReportSection
            title="Prioritized Recommendations"
            subtitle="Sorted by priority and estimated StackScore impact"
          >
            {sections.sortedRecommendations.length === 0 ? (
              <ReportEmptyState>No recommendations were generated for this assessment.</ReportEmptyState>
            ) : (
              <div className="space-y-6">
                {sections.recommendationsByPriority.map((group) => (
                  <div key={group.priority} className="space-y-3">
                    <p className="text-sm font-semibold text-primary">
                      {PRIORITY_LABELS[group.priority]}
                    </p>
                    {group.items.map((recommendation) => (
                      <ReportDataCard
                        key={recommendation.id}
                        title={
                          <>
                            <p className="font-medium">{recommendation.title}</p>
                            <ReportPriorityBadge priority={recommendation.priority} />
                          </>
                        }
                        description={recommendation.businessImpact}
                        meta={`${recommendation.categoryName} · +${recommendation.estimatedImpactPoints} impact points`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </ReportSection>

          <ReportSection title="Improvement Roadmap" subtitle="Projected StackScore progression">
            <div className="space-y-3">
              {sections.roadmapMilestones.map((milestone) => (
                <div
                  key={milestone.label}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-4",
                    milestone.highlight && "border-primary bg-primary/5",
                    milestone.isTarget && "border-dashed",
                  )}
                >
                  <div>
                    <p className="font-medium">{milestone.label}</p>
                    {milestone.isTarget ? (
                      <Badge variant="outline" className="mt-1">
                        Target threshold
                      </Badge>
                    ) : null}
                  </div>
                  <p
                    className={cn(
                      "text-2xl font-bold tabular-nums",
                      getScoreTextColorClass(milestone.score),
                    )}
                  >
                    {milestone.score}
                  </p>
                </div>
              ))}
            </div>
          </ReportSection>

          <ReportSection title="Next Steps">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Review prioritized recommendations with your BobKat IT consultant to build a Technology
              Improvement Plan. Addressing critical and high-priority items first delivers the
              strongest risk reduction and StackScore gains.
            </p>
            <Link
              href={`/clients/${clientId}/technology-profile`}
              className={buttonClassName({
                variant: "outline",
                size: "sm",
                className: "report-no-print mt-4",
              })}
            >
              Open Technology Profile
            </Link>
          </ReportSection>

          <ReportFooter confidentialFor={data.clientName} />
        </ReportBody>
      </ReportDocument>
    </ReportShell>
  );
}
