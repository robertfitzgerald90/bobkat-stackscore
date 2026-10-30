import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { RecurringServicesAdminView } from "@/components/vcio/recurring-services-admin-view";
import { auth } from "@/lib/auth";
import { getRecurringServicesOverview } from "@/lib/vcio/recurring-services-overview";
import type { SubscriptionStatus } from "@/generated/prisma/client";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

const statusFilters = ["active", "trialing", "past_due", "canceled", "incomplete"] as const;

function isMissingVcioSchemaError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Subscription") ||
    message.includes("VcioOnboarding") ||
    message.includes("VcioQuarterlyReview") ||
    message.includes("RecurringService")
  );
}

export default async function AdminVcioPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin" && session.user.role !== "technician") {
    redirect("/dashboard");
  }

  const { status } = await searchParams;
  const safeStatus = statusFilters.includes(status as (typeof statusFilters)[number])
    ? (status as SubscriptionStatus)
    : undefined;

  try {
    const overview = await getRecurringServicesOverview({
      subscriptionStatus: safeStatus,
    });

    return (
      <RecurringServicesAdminView
        overview={overview}
        role={session.user.role}
        activeStatusFilter={safeStatus}
      />
    );
  } catch (error) {
    if (!isMissingVcioSchemaError(error)) throw error;
    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Recurring Services</h1>
          <p className="page-description">
            Subscription and recurring-service visibility for StackScore relationships.
          </p>
        </div>
        <Card className="border-primary/25 bg-primary/5">
          <CardContent className="p-6">
            <p className="font-semibold">Database migration required</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Recurring Services tables are not available yet. Deploy the Prisma migrations, then
              reopen this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}
