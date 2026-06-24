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
import {
  formatAssessmentCompletionDate,
  formatAssessmentStatus,
  formatAssessmentType,
} from "@/lib/assessments/display";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
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
        <Link href={`/clients/${clientId}`} className={buttonClassName({ variant: "outline" })}>
          Back to Client
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
