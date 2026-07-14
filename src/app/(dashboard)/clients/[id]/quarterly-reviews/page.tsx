import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { prisma } from "@/lib/db";
import { formatDisplayDate } from "@/lib/display";
import { getClientVcioEntitlement } from "@/lib/vcio/entitlements";

type PageProps = { params: Promise<{ id: string }> };

export default async function VcioQuarterlyReviewsPage({ params }: PageProps) {
  const { id: clientId } = await params;
  const user = await getSessionUserWithClient();
  if (!user) redirect("/login");
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) redirect("/dashboard");

  const entitlement = await getClientVcioEntitlement(clientId);
  const reviews = await prisma.vcioQuarterlyReview.findMany({
    where: {
      clientId,
      ...(user.role === "client" ? { status: "completed" as const } : {}),
    },
    orderBy: [{ reviewDate: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">StackScore vCIO</p>
          <h1 className="page-title">Quarterly Reviews</h1>
          <p className="page-description">
            Completed and scheduled strategic technology reviews for this workspace.
          </p>
        </div>
        <Link href={`/clients/${clientId}/vcio`} className={buttonVariants({ variant: "outline" })}>
          Back to vCIO Dashboard
        </Link>
      </div>

      {!entitlement.hasSubscription ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-sm text-muted-foreground">
            StackScore vCIO is not active for this workspace yet.
          </CardContent>
        </Card>
      ) : null}

      {reviews.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex items-start gap-3 p-6">
            <CalendarDays className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">No quarterly reviews yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Completed reviews will appear here after Bobkat IT prepares and publishes them.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {review.reviewDate
                    ? `Review ${formatDisplayDate(review.reviewDate)}`
                    : `${review.status} review`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Period: {formatDisplayDate(review.reviewPeriodStart)} to{" "}
                  {formatDisplayDate(review.reviewPeriodEnd)}
                </p>
                {review.executiveSummary ? <p>{review.executiveSummary}</p> : null}
                {review.nextReviewDate ? (
                  <p className="text-muted-foreground">
                    Next review: {formatDisplayDate(review.nextReviewDate)}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
