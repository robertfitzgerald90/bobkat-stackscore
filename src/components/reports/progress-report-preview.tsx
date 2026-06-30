"use client";

import {
  ReportBody,
  ReportCover,
  ReportDataCard,
  ReportDelta,
  ReportDocument,
  ReportEmptyState,
  ReportExecutiveSummary,
  ReportFooter,
  ReportMetaGrid,
  ReportMetricCard,
  ReportMetricGrid,
  ReportPrintActions,
  ReportSection,
  ReportShell,
  ReportTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/reports";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { formatDisplayDate } from "@/lib/display";
import type { ProgressReportData } from "@/lib/reports/progress/types";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";

type ProgressReportPreviewProps = {
  clientId: string;
  data: ProgressReportData;
};

export function ProgressReportPreview({ clientId, data }: ProgressReportPreviewProps) {
  return (
    <ReportShell>
      <ReportPrintActions
        clientName={data.clientName}
        title="Technology Progress Report"
        description={data.reportPeriodLabel}
        backHref={clientTechnologyProfilePath(clientId)}
        backLabel="Back to Technology Maturity Profile"
      />

      <ReportDocument>
        <ReportCover reportType="technology_progress" />

        <ReportBody>
          <ReportMetaGrid
            items={[
              { label: "Client", value: data.clientName },
              { label: "Reporting Period", value: data.reportPeriodLabel },
              { label: "Generated", value: data.generatedDateLabel },
              {
                label: "Current StackScore",
                value: data.currentStackScore ?? "—",
                emphasis: true,
                valueClassName: getScoreTextColorClass(data.currentStackScore),
              },
            ]}
          />

          <ReportSection title="Executive Summary">
            <ReportExecutiveSummary value={data.executiveSummary} />
          </ReportSection>

          <ReportSection
            title="Technology Maturity Movement"
            subtitle={
              data.lastAssessmentName
                ? `Baseline from ${data.lastAssessmentName}${
                    data.lastAssessedAt ? ` · ${formatDisplayDate(data.lastAssessedAt)}` : ""
                  }`
                : undefined
            }
          >
            <ReportMetricGrid>
              <ReportMetricCard label="Previous StackScore" value={data.previousStackScore ?? "—"} />
              <ReportMetricCard
                label="Current StackScore"
                value={data.currentStackScore ?? "—"}
                valueClassName={getScoreTextColorClass(data.currentStackScore)}
              />
              <ReportMetricCard label="Change" value={<ReportDelta value={data.scoreChange} />} />
              <ReportMetricCard
                label="Active Projects"
                value={String(data.activeProjectCount)}
              />
            </ReportMetricGrid>
            {data.currentMaturityLabel ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Current maturity tier: <strong>{data.currentMaturityLabel}</strong>
              </p>
            ) : null}
          </ReportSection>

          <ReportSection title="Category Movement">
            {data.categoryChanges.length === 0 ? (
              <ReportEmptyState>No category score history is available yet.</ReportEmptyState>
            ) : (
              <ReportTable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Previous</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.categoryChanges.map((row) => (
                    <TableRow key={row.categoryName}>
                      <TableCell>{row.categoryName}</TableCell>
                      <TableCell>{row.previousScore ?? "—"}</TableCell>
                      <TableCell>{row.currentScore ?? "—"}</TableCell>
                      <TableCell>
                        <ReportDelta value={row.change} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </ReportTable>
            )}
          </ReportSection>

          <ReportSection title="Completed Work">
            {data.completedProjectsSinceAssessment.length === 0 ? (
              <ReportEmptyState>
                No completed projects were recorded during this reporting period.
              </ReportEmptyState>
            ) : (
              <div className="space-y-3">
                {data.completedProjectsSinceAssessment.map((project) => (
                  <ReportDataCard
                    key={project.id}
                    title={project.title}
                    description={project.recommendationTitle ?? undefined}
                    aside={
                      project.completedAt ? formatDisplayDate(project.completedAt) : undefined
                    }
                    meta={
                      <div className="flex flex-wrap gap-3">
                        {project.estimatedImpactPoints !== null ? (
                          <span>Expected: +{project.estimatedImpactPoints} pts</span>
                        ) : null}
                        {project.actualImpactPoints !== null ? (
                          <span className="font-medium text-foreground">
                            Actual: +{project.actualImpactPoints} pts
                          </span>
                        ) : null}
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </ReportSection>

          <ReportSection title="Recommended Next Steps">
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              {data.nextSteps.map((step) => (
                <li key={step} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Journey phase: <strong>{data.journeyPhaseLabel}</strong> ·{" "}
              {data.openRecommendationsCount} open recommendation
              {data.openRecommendationsCount === 1 ? "" : "s"}
            </p>
          </ReportSection>

          <ReportFooter confidentialFor={data.clientName} />
        </ReportBody>
      </ReportDocument>
    </ReportShell>
  );
}
