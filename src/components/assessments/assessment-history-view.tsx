import Link from "next/link";
import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AssessmentHistoryEntry } from "@/lib/assessments/reassessment";
import { clientWorkspaceAssessmentsPath } from "@/lib/clients/paths";
import {
  BACK_TO_ASSESSMENTS,
} from "@/lib/technology-maturity/labels";
import {
  formatAssessmentCompletionDate,
  formatAssessmentStatus,
  formatAssessmentType,
} from "@/lib/assessments/display";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { MobileDataCard, MobileDataRow } from "@/components/ui/mobile-data-card";
import { cn } from "@/lib/utils";

type AssessmentHistoryViewProps = {
  clientId: string;
  clientName: string;
  history: AssessmentHistoryEntry[];
};

export function AssessmentHistoryView({
  clientId,
  clientName,
  history,
}: AssessmentHistoryViewProps) {
  return (
    <div className="page-shell">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="page-header">
          <p className="text-sm text-muted-foreground">{clientName}</p>
          <h2 className="page-title">Assessment History</h2>
          <p className="page-description">
            Immutable snapshots of every assessment. Reassessments create new records without
            modifying prior results.
          </p>
        </div>
        <Link
          href={clientWorkspaceAssessmentsPath(clientId)}
          className={buttonClassName({ variant: "outline", className: "w-full sm:w-auto" })}
        >
          {BACK_TO_ASSESSMENTS}
        </Link>
      </div>

      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-brand" />
            All Assessments
          </CardTitle>
          <CardDescription>{history.length} assessment{history.length === 1 ? "" : "s"} on record</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assessments yet for this client.</p>
          ) : (
            <>
              <div className="table-mobile">
                {history.map((entry) => (
                  <MobileDataCard key={entry.id}>
                    <div className="space-y-1">
                      <p className="font-medium">{entry.assessmentName}</p>
                      {entry.isReassessment && entry.sourceAssessmentName ? (
                        <p className="text-xs text-muted-foreground">
                          Reassessment of {entry.sourceAssessmentName}
                        </p>
                      ) : null}
                    </div>
                    <MobileDataRow label="Type">
                      {formatAssessmentType(entry.assessmentType)}
                    </MobileDataRow>
                    <MobileDataRow label="Status">
                      <span className="flex flex-wrap justify-end gap-1">
                        <Badge variant="outline">{formatAssessmentStatus(entry.status)}</Badge>
                        {entry.isReassessment ? (
                          <Badge variant="secondary" className="text-xs">
                            Reassessment
                          </Badge>
                        ) : null}
                      </span>
                    </MobileDataRow>
                    <MobileDataRow label="Score">
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          getScoreTextColorClass(entry.overallScore),
                        )}
                      >
                        {entry.overallScore !== null ? entry.overallScore : "—"}
                      </span>
                    </MobileDataRow>
                    <MobileDataRow label="Completed">
                      {formatAssessmentCompletionDate(entry.completedAt)}
                    </MobileDataRow>
                    <MobileDataRow label="Assessor">{entry.assessorName}</MobileDataRow>
                    <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                      {entry.status === "completed" ? (
                        <>
                          <Link
                            href={`/assessments/${entry.id}/results`}
                            className={buttonClassName({ variant: "outline", size: "sm", className: "w-full" })}
                          >
                            Results
                          </Link>
                          {entry.isReassessment ? (
                            <Link
                              href={`/assessments/${entry.id}/improvement`}
                              className={buttonClassName({ variant: "outline", size: "sm", className: "w-full" })}
                            >
                              Improvement
                            </Link>
                          ) : null}
                        </>
                      ) : (
                        <Link
                          href={`/assessments/${entry.id}`}
                          className={buttonClassName({ variant: "default", size: "sm", className: "w-full" })}
                        >
                          Continue
                        </Link>
                      )}
                    </div>
                  </MobileDataCard>
                ))}
              </div>

              <div className="table-desktop">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Assessor</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{entry.assessmentName}</p>
                        {entry.isReassessment && entry.sourceAssessmentName ? (
                          <p className="text-xs text-muted-foreground">
                            Reassessment of {entry.sourceAssessmentName}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{formatAssessmentType(entry.assessmentType)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatAssessmentStatus(entry.status)}
                      </Badge>
                      {entry.isReassessment ? (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Reassessment
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          getScoreTextColorClass(entry.overallScore),
                        )}
                      >
                        {entry.overallScore !== null ? entry.overallScore : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatAssessmentCompletionDate(entry.completedAt)}
                    </TableCell>
                    <TableCell>{entry.assessorName}</TableCell>
                    <TableCell className="text-right">
                      {entry.status === "completed" ? (
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/assessments/${entry.id}/results`}
                            className={buttonClassName({ variant: "link", className: "h-auto p-0" })}
                          >
                            Results
                          </Link>
                          {entry.isReassessment ? (
                            <Link
                              href={`/assessments/${entry.id}/improvement`}
                              className={buttonClassName({ variant: "link", className: "h-auto p-0" })}
                            >
                              Improvement
                            </Link>
                          ) : null}
                        </div>
                      ) : (
                        <Link
                          href={`/assessments/${entry.id}`}
                          className={buttonClassName({ variant: "link", className: "h-auto p-0" })}
                        >
                          Continue
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
