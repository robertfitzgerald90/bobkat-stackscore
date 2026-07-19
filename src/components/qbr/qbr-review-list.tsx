"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarRange, FileText, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { QbrSummary } from "@/lib/qbr/types";
import { clientWorkspaceExecutiveReportsPath } from "@/lib/clients/paths";
import { BACK_TO_EXECUTIVE_REPORTS } from "@/lib/technology-maturity/labels";
import { formatDisplayDate } from "@/lib/display";
import {
  BUSINESS_REVIEW_LABEL,
  BUSINESS_REVIEWS_LABEL,
} from "@/lib/customer-deliverable-labels";
import { toast } from "sonner";

type QbrReviewListProps = {
  clientId: string;
  clientName: string;
  initialReviews: QbrSummary[];
  canCreate?: boolean;
  readOnlyReason?: string | null;
};

export function QbrReviewList({
  clientId,
  clientName,
  initialReviews,
  canCreate = true,
  readOnlyReason = null,
}: QbrReviewListProps) {
  const router = useRouter();
  const [reviews] = useState(initialReviews);
  const [creating, setCreating] = useState(false);

  const startReview = async () => {
    setCreating(true);
    try {
      const response = await fetch(`/api/v1/clients/${clientId}/qbr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to create review");
      }
      const body = (await response.json()) as { review: QbrSummary };
      router.push(`/clients/${clientId}/quarterly-review/${body.review.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start review");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-shell min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <Link
            href={clientWorkspaceExecutiveReportsPath(clientId)}
            className={buttonClassName({ variant: "ghost", size: "sm", className: "mb-2 -ml-2 w-full sm:w-auto" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {BACK_TO_EXECUTIVE_REPORTS}
          </Link>
          <h2 className="page-title">{BUSINESS_REVIEWS_LABEL}</h2>
          <p className="page-description">{clientName}</p>
        </div>
        <Button type="button" onClick={startReview} disabled={creating || !canCreate}>
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              New Business Review
            </>
          )}
        </Button>
      </div>

      {!canCreate && readOnlyReason ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 text-sm text-muted-foreground">{readOnlyReason}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Review History</CardTitle>
          <CardDescription>
            Generate executive-ready reviews summarizing technology progress for each review period.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No business reviews yet. Start a review to summarize completed projects, score
              movement, and upcoming priorities.
            </p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <CalendarRange className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{review.title}</p>
                    <Badge variant={review.status === "generated" ? "success" : "outline"}>
                      {review.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {review.reviewPeriodLabel}
                    {review.generatedAt
                      ? ` · Generated ${formatDisplayDate(review.generatedAt)}`
                      : ` · Created ${formatDisplayDate(review.createdAt)}`}
                  </p>
                </div>
                <Link
                  href={`/clients/${clientId}/quarterly-review/${review.id}`}
                  className={buttonClassName({
                    variant: "outline",
                    size: "sm",
                    className: "w-full shrink-0 sm:w-auto",
                  })}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {review.status === "generated" ? "View Report" : "Continue Draft"}
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
