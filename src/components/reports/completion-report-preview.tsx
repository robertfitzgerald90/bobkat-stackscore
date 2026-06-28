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
  ReportPriorityBadge,
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
import type { CompletionReportData } from "@/lib/reports/completion/types";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";

type CompletionReportPreviewProps = {
  clientId: string;
  data: CompletionReportData;
};

export function CompletionReportPreview({ clientId, data }: CompletionReportPreviewProps) {
  return (
    <ReportShell>
      <ReportPrintActions
        clientName={data.clientName}
        title="Technology Completion Report"
        description={data.projectTitle}
        backHref={clientTechnologyProfilePath(clientId)}
        backLabel="Back to Technology Profile"
      />

      <ReportDocument>
        <ReportCover reportType="technology_completion" />

        <ReportBody>
          <ReportMetaGrid
            items={[
              { label: "Client", value: data.clientName },
              { label: "Completed Initiative", value: data.projectTitle },
              { label: "Completion Date", value: formatDisplayDate(data.completedAt) },
              {
                label: "Current StackScore",
                value: data.scoreAfter ?? "—",
                emphasis: true,
                valueClassName: getScoreTextColorClass(data.scoreAfter),
              },
            ]}
          />

          <ReportSection title="Executive Summary">
            <ReportExecutiveSummary value={data.executiveSummary} />
          </ReportSection>

          <ReportSection title="Business Impact Summary">
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              {data.businessImpactBullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </ReportSection>

          <ReportSection title="Technology Profile Comparison">
            <ReportMetricGrid>
              <ReportMetricCard label="StackScore Before" value={data.scoreBefore ?? "—"} />
              <ReportMetricCard
                label="StackScore After"
                value={data.scoreAfter ?? "—"}
                valueClassName={getScoreTextColorClass(data.scoreAfter)}
              />
              <ReportMetricCard label="Improvement" value={<ReportDelta value={data.scoreChange} />} />
              <ReportMetricCard
                label="Expected Impact"
                value={
                  data.estimatedImpactPoints !== null ? `+${data.estimatedImpactPoints} pts` : "—"
                }
              />
              <ReportMetricCard
                label="Actual Impact"
                value={
                  data.actualImpactPoints !== null ? `+${data.actualImpactPoints} pts` : "—"
                }
              />
            </ReportMetricGrid>
          </ReportSection>

          <ReportSection title="Completed Initiative">
            <ReportDataCard
              title={data.projectTitle}
              description={data.recommendationBusinessImpact}
              aside={<ReportPriorityBadge priority={data.priority} />}
              meta={
                <p>
                  Category: {data.categoryName} · Source recommendation: {data.recommendationTitle}
                </p>
              }
            />
          </ReportSection>

          <ReportSection title="Category Improvements">
            {data.categoryChanges.length === 0 ? (
              <ReportEmptyState>
                Category-level score history is not available for this project window.
              </ReportEmptyState>
            ) : (
              <ReportTable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Before</TableHead>
                    <TableHead>After</TableHead>
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

          <ReportSection title="Warranty & Support">
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              {data.warrantyNotes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
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
              Technology Journey phase: <strong>{data.journeyPhaseLabel}</strong>
            </p>
          </ReportSection>

          <ReportFooter confidentialFor={data.clientName} />
        </ReportBody>
      </ReportDocument>
    </ReportShell>
  );
}
