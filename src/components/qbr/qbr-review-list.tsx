"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarRange, FileText, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { QbrSummary } from "@/lib/qbr/types";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { formatDisplayDate } from "@/lib/display";
import { toast } from "sonner";

type QbrReviewListProps = {
  clientId: string;
  clientName: string;
  initialReviews: QbrSummary[];
};

export function QbrReviewList({
  clientId,
  clientName,
  initialReviews,
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
    <div className="page-shell space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={clientTechnologyProfilePath(clientId)}
            className={buttonClassName({ variant: "ghost", size: "sm", className: "mb-2 -ml-2" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Technology Maturity Profile
          </Link>
          <h2 className="page-title">Quarterly Business Reviews</h2>
          <p className="page-description">{clientName}</p>
        </div>
        <Button type="button" onClick={startReview} disabled={creating}>
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              New Quarterly Review
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review History</CardTitle>
          <CardDescription>
            Generate executive-ready reviews summarizing technology progress each quarter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No quarterly reviews yet. Start a review for the current quarter to summarize
              completed projects, score movement, and next priorities.
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
