import Link from "next/link";
import { Download, ExternalLink, FileText, Map, Route } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { formatDisplayDate } from "@/lib/display";
import type { ProfileDocumentSummary, ProfileTipSummary } from "@/lib/technology-profile/types";
import type { DocumentType } from "@/generated/prisma/client";

type TpReportsDocumentsProps = {
  clientId: string;
  documents: ProfileDocumentSummary[];
  activeTip: ProfileTipSummary | null;
  showRoadmapBuilderLink?: boolean;
  assessmentsCompleted?: number;
  canEditImprovementPlan?: boolean;
};

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  report: "Assessment Report",
  technology_improvement_plan: "Improvement Plan",
  quarterly_business_review: "Quarterly Business Review",
  proposal: "Proposal",
  diagram: "Diagram",
  contract: "Contract",
  evidence: "Evidence",
  other: "Document",
};

function DocumentIcon({ type }: { type: DocumentType }) {
  if (type === "technology_improvement_plan") return <Route className="h-4 w-4" />;
  if (type === "quarterly_business_review") return <FileText className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

export function TpReportsDocuments({
  clientId,
  documents,
  activeTip,
  showRoadmapBuilderLink = true,
  assessmentsCompleted = 0,
  canEditImprovementPlan = false,
}: TpReportsDocumentsProps) {
  const hasContent = documents.length > 0 || (activeTip && showRoadmapBuilderLink);

  return (
    <Card className="stat-card">
      <CardHeader>
        <CardTitle>Reports & Documents</CardTitle>
        <CardDescription>Client-facing deliverables and assessment exports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasContent ? (
          <TpEmptyState
            icon={FileText}
            title="No documents yet"
            message={
              assessmentsCompleted === 0
                ? "Complete an assessment to export a report, then generate an Improvement Plan PDF when ready."
                : "Export the latest assessment report or generate an Improvement Plan PDF from the plan wizard."
            }
            actionLabel={canEditImprovementPlan ? "Open Improvement Plan" : undefined}
            actionHref={
              canEditImprovementPlan ? `/clients/${clientId}/improvement-plan` : undefined
            }
          />
        ) : (
          <>
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex flex-col gap-3 rounded-lg border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 shrink-0 rounded-md bg-muted p-2 text-muted-foreground">
                    <DocumentIcon type={document.documentType} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{document.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {DOCUMENT_TYPE_LABELS[document.documentType]} ·{" "}
                      {formatDisplayDate(document.createdAt)}
                    </p>
                  </div>
                </div>
                {document.downloadHref ? (
                  document.documentType === "quarterly_business_review" ? (
                    <Link
                      href={document.downloadHref}
                      className={buttonClassName({
                        variant: "outline",
                        size: "sm",
                        className: "w-full shrink-0 sm:w-auto",
                      })}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Report
                    </Link>
                  ) : (
                    <a
                      href={document.downloadHref}
                      className={buttonClassName({
                        variant: "outline",
                        size: "sm",
                        className: "w-full shrink-0 sm:w-auto",
                      })}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  )
                ) : (
                  <span className="text-xs text-muted-foreground">No file available</span>
                )}
              </div>
            ))}

            {activeTip && showRoadmapBuilderLink ? (
              <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 rounded-md bg-muted p-2 text-muted-foreground">
                    <Map className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Roadmap Builder</p>
                    <p className="text-xs text-muted-foreground">
                      Continue the active Improvement Plan roadmap
                    </p>
                  </div>
                </div>
                <Link
                  href={`/clients/${clientId}/improvement-plan/${activeTip.id}`}
                  className={buttonClassName({
                    variant: "outline",
                    size: "sm",
                    className: "w-full shrink-0 sm:w-auto",
                  })}
                >
                  Open Roadmap
                </Link>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
