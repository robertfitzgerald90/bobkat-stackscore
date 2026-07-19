import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import {
  ClientEmptyState,
  ClientPageHeader,
  ClientPageShell,
} from "@/components/client-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getSessionUserWithClient, requireClientWorkspaceAccess } from "@/lib/api/access";
import { CLIENT_INTERACTIVE_CARD, CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { prisma } from "@/lib/db";
import { formatDisplayDate } from "@/lib/display";
import { getClientVcioEntitlement } from "@/lib/vcio/entitlements";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

export default async function VcioQuarterlyReviewsPage({ params }: PageProps) {
  const { id: clientId } = await params;
  const user = await getSessionUserWithClient();
  if (!user) redirect("/login");
  const denied = await requireClientWorkspaceAccess(user, clientId);
  if (denied) redirect("/dashboard");

  const entitlement = await getClientVcioEntitlement(clientId);
  const reviews = await prisma.quarterlyBusinessReview.findMany({
    where: {
      clientId,
      ...(user.role === "client" ? { status: "generated" as const } : {}),
    },
    orderBy: [{ reviewPeriodStart: "desc" }, { createdAt: "desc" }],
  });

  return (
    <ClientPageShell className="max-w-5xl">
      <ClientPageHeader
        eyebrow="StackScore vCIO"
        title="Business Reviews"
        description="Completed and scheduled strategic technology reviews for this workspace."
        actions={
          <Link href={`/clients/${clientId}/vcio`} className={buttonVariants({ variant: "outline" })}>
            Back to vCIO Dashboard
          </Link>
        }
      />

      {!entitlement.hasSubscription ? (
        <ClientEmptyState
          icon={CalendarDays}
          title="vCIO not active yet"
          description="StackScore vCIO is not active for this workspace yet. Business reviews become available with an active subscription."
          nextStep="Contact Bobkat IT to activate ongoing advisory and business review cadence."
        />
      ) : null}

      {reviews.length === 0 ? (
        <ClientEmptyState
          icon={CalendarDays}
          title="No business reviews yet"
          description="Business reviews summarize score movement, completed initiatives, open risks, and upcoming priorities."
          nextStep="Completed reviews will appear here after Bobkat IT prepares and publishes them."
        />
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className={cn(CLIENT_INTERACTIVE_CARD, CLIENT_SURFACE_CARD)}>
              <CardHeader>
                <CardTitle className="text-base">{review.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Period: {formatDisplayDate(review.reviewPeriodStart)} to{" "}
                  {formatDisplayDate(review.reviewPeriodEnd)}
                </p>
                {review.executiveSummary ? <p>{review.executiveSummary}</p> : null}
                {review.generatedAt ? (
                  <p className="text-muted-foreground">
                    Generated: {formatDisplayDate(review.generatedAt)}
                  </p>
                ) : null}
                <Link
                  href={`/clients/${clientId}/quarterly-review/${review.id}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  {review.status === "generated" ? "View Review" : "Continue Draft"}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ClientPageShell>
  );
}
