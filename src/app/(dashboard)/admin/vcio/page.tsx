import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDisplayDate } from "@/lib/display";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

const statusFilters = ["active", "trialing", "past_due", "canceled", "incomplete"] as const;

export default async function AdminVcioPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin" && session.user.role !== "technician") redirect("/dashboard");

  const { status } = await searchParams;
  const safeStatus = statusFilters.includes(status as (typeof statusFilters)[number])
    ? (status as (typeof statusFilters)[number])
    : undefined;

  const subscriptions = await prisma.subscription.findMany({
    where: {
      serviceType: "stackscore_vcio",
      ...(safeStatus ? { status: safeStatus } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
          primaryContactName: true,
          primaryContactEmail: true,
          technologyProfile: { select: { overallStackScore: true, criticalExposureCount: true } },
          projects: {
            where: { status: { in: ["approved", "scheduled", "in_progress"] } },
            select: { id: true },
          },
        },
      },
      vcioOnboarding: true,
      vcioQuarterlyReviews: {
        orderBy: [{ nextReviewDate: "asc" }, { createdAt: "desc" }],
        take: 1,
      },
    },
  });

  const active = subscriptions.filter((subscription) =>
    ["active", "trialing"].includes(subscription.status),
  );
  const pastDue = subscriptions.filter((subscription) => subscription.status === "past_due");
  const canceling = subscriptions.filter((subscription) => subscription.cancelAtPeriodEnd);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">vCIO Clients</h1>
          <p className="page-description">
            Subscription, onboarding, review, risk, and project visibility for StackScore vCIO.
          </p>
        </div>
        <Link href="/admin/billing" className={buttonVariants({ variant: "outline" })}>
          Open Admin Billing
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Active</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{active.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Past Due</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{pastDue.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Canceling</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{canceling.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">MRR</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${(active.reduce((sum, item) => sum + item.amountCents, 0) / 100).toFixed(0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/vcio" className={buttonVariants({ variant: !safeStatus ? "default" : "outline", size: "sm" })}>
          All
        </Link>
        {statusFilters.map((filter) => (
          <Link
            key={filter}
            href={`/admin/vcio?status=${filter}`}
            className={buttonVariants({ variant: safeStatus === filter ? "default" : "outline", size: "sm" })}
          >
            {filter}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-4 font-medium">Client</th>
                <th className="p-4 font-medium">Primary Contact</th>
                <th className="p-4 font-medium">Subscription</th>
                <th className="p-4 font-medium">Onboarding</th>
                <th className="p-4 font-medium">Score</th>
                <th className="p-4 font-medium">Risks</th>
                <th className="p-4 font-medium">Projects</th>
                <th className="p-4 font-medium">Next Review</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="border-b border-border/60">
                  <td className="p-4">
                    <Link href={`/clients/${subscription.clientId}/vcio`} className="font-medium text-primary hover:underline">
                      {subscription.client.companyName}
                    </Link>
                  </td>
                  <td className="p-4">
                    <p>{subscription.client.primaryContactName}</p>
                    <p className="text-muted-foreground">{subscription.client.primaryContactEmail}</p>
                  </td>
                  <td className="p-4">{subscription.status}</td>
                  <td className="p-4">{subscription.vcioOnboarding?.status ?? "not_started"}</td>
                  <td className="p-4">{subscription.client.technologyProfile?.overallStackScore?.toString() ?? "-"}</td>
                  <td className="p-4">{subscription.client.technologyProfile?.criticalExposureCount ?? 0}</td>
                  <td className="p-4">{subscription.client.projects.length}</td>
                  <td className="p-4">
                    {subscription.vcioQuarterlyReviews[0]?.nextReviewDate
                      ? formatDisplayDate(subscription.vcioQuarterlyReviews[0].nextReviewDate)
                      : "Not scheduled"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
