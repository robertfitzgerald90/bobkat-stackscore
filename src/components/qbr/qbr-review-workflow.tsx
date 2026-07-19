"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { QbrDetail } from "@/lib/qbr/service";
import { formatDisplayDate } from "@/lib/display";
import { QbrReportView } from "@/components/qbr/qbr-report-view";
import { BUSINESS_REVIEW_LABEL, BUSINESS_REVIEWS_LABEL } from "@/lib/customer-deliverable-labels";
import { toast } from "sonner";

type QbrReviewWorkflowProps = {
  clientId: string;
  initialReview: QbrDetail;
  canEdit?: boolean;
  readOnlyReason?: string | null;
};

export function QbrReviewWorkflow({
  clientId,
  initialReview,
  canEdit = true,
  readOnlyReason = null,
}: QbrReviewWorkflowProps) {
  const router = useRouter();
  const [review, setReview] = useState(initialReview);
  const [executiveSummary, setExecutiveSummary] = useState(
    initialReview.report.executiveSummary,
  );
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const saveExecutiveSummary = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/clients/${clientId}/qbr/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ executiveSummary }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to save summary");
      }
      const body = (await response.json()) as { review: QbrDetail };
      setReview(body.review);
      setExecutiveSummary(body.review.report.executiveSummary);
      toast.success("Executive summary saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save summary");
    } finally {
      setSaving(false);
    }
  };

  const generateReview = async () => {
    setGenerating(true);
    try {
      if (review.isEditable && executiveSummary !== review.report.executiveSummary) {
        const saveResponse = await fetch(`/api/v1/clients/${clientId}/qbr/${review.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ executiveSummary }),
        });
        if (!saveResponse.ok) {
          const body = (await saveResponse.json()) as { error?: string };
          throw new Error(body.error ?? "Failed to save summary");
        }
      }

      const response = await fetch(
        `/api/v1/clients/${clientId}/qbr/${review.id}/generate`,
        { method: "POST" },
      );
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to generate review");
      }
      const body = (await response.json()) as { review: QbrDetail };
      setReview(body.review);
      setExecutiveSummary(body.review.report.executiveSummary);
      toast.success(`${BUSINESS_REVIEW_LABEL} generated`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to generate review");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="page-shell min-w-0 space-y-6">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/clients/${clientId}/quarterly-review`}
            className={buttonClassName({ variant: "ghost", size: "sm", className: "mb-2 -ml-2" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            All {BUSINESS_REVIEWS_LABEL}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="page-title">{review.title}</h2>
            <Badge variant={review.status === "generated" ? "success" : "outline"}>
              {review.status}
            </Badge>
          </div>
          <p className="page-description">{review.reviewPeriodLabel}</p>
        </div>
        {review.isEditable && canEdit ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={saveExecutiveSummary}
              disabled={saving || generating}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Summary"
              )}
            </Button>
            <Button type="button" onClick={generateReview} disabled={generating || saving}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Review
                </>
              )}
            </Button>
          </div>
        ) : (
          <Link
            href={`/clients/${clientId}/quarterly-review`}
            className={buttonClassName({ variant: "ghost", size: "sm", className: "mb-2 -ml-2 report-no-print" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            All {BUSINESS_REVIEWS_LABEL}
          </Link>
        )}
      </div>

      {review.isEditable && !canEdit && readOnlyReason ? (
        <Card className="border-primary/20 bg-primary/5 print:hidden">
          <CardContent className="p-4 text-sm text-muted-foreground">{readOnlyReason}</CardContent>
        </Card>
      ) : null}

      {review.isEditable && canEdit ? (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Draft Review
            </CardTitle>
            <CardDescription>
              Preview the report, refine the executive summary, then generate to save it to client
              history.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Generated {formatDisplayDate(review.createdAt)}
          </CardContent>
        </Card>
      ) : null}

      <QbrReportView
        clientId={clientId}
        data={review.report}
        isEditable={review.isEditable && canEdit}
        executiveSummary={executiveSummary}
        onExecutiveSummaryChange={setExecutiveSummary}
        showActions={review.status === "generated"}
      />
    </div>
  );
}
