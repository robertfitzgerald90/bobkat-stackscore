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

const statusFilters = ["active", "trialing", "past_due", "incomplete", "canceled", "paused"] as const;

function stripeSubscriptionUrl(subscriptionId: string) {
  const mode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "" : "test/";
  return `https://dashboard.stripe.com/${mode}subscriptions/${subscriptionId}`;
}

function stripeCustomerUrl(customerId: string) {
  const mode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "" : "test/";
  return `https://dashboard.stripe.com/${mode}customers/${customerId}`;
}

export default async function AdminBillingPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const { status } = await searchParams;
  const safeStatus = statusFilters.includes(status as (typeof statusFilters)[number])
    ? (status as (typeof statusFilters)[number])
    : undefined;

  const subscriptions = await prisma.subscription.findMany({
    where: safeStatus ? { status: safeStatus } : {},
    orderBy: { updatedAt: "desc" },
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
          primaryContactName: true,
          primaryContactEmail: true,
        },
      },
      vcioOnboarding: { select: { status: true } },
      invoices: { orderBy: { invoiceDate: "desc" }, take: 1 },
    },
  });

  const now = new Date();
  const active = subscriptions.filter((subscription) =>
    ["active", "trialing"].includes(subscription.status),
  );
  const pastDue = subscriptions.filter((subscription) => subscription.status === "past_due");
  const canceling = subscriptions.filter((subscription) => subscription.cancelAtPeriodEnd);
  const newThisMonth = subscriptions.filter(
    (subscription) =>
      subscription.createdAt.getMonth() === now.getMonth() &&
      subscription.createdAt.getFullYear() === now.getFullYear(),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Admin Billing</h1>
          <p className="page-description">
            Stripe subscription status, MRR, invoice state, and vCIO billing warnings.
          </p>
        </div>
        <Link href="/admin/vcio" className={buttonVariants({ variant: "outline" })}>
          Open vCIO Clients
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active vCIO</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{active.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">MRR</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${(active.reduce((sum, item) => sum + item.amountCents, 0) / 100).toFixed(0)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Past Due</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{pastDue.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Canceling</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{canceling.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">New This Month</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{newThisMonth.length}</p></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/billing" className={buttonVariants({ variant: !safeStatus ? "default" : "outline", size: "sm" })}>
          All
        </Link>
        {statusFilters.map((filter) => (
          <Link
            key={filter}
            href={`/admin/billing?status=${filter}`}
            className={buttonVariants({ variant: safeStatus === filter ? "default" : "outline", size: "sm" })}
          >
            {filter}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-4 font-medium">Client</th>
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">MRR</th>
                <th className="p-4 font-medium">Period End</th>
                <th className="p-4 font-medium">Last Payment</th>
                <th className="p-4 font-medium">Latest Invoice</th>
                <th className="p-4 font-medium">Onboarding</th>
                <th className="p-4 font-medium">Stripe</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="border-b border-border/60">
                  <td className="p-4">
                    <Link href={`/clients/${subscription.clientId}/billing`} className="font-medium text-primary hover:underline">
                      {subscription.client.companyName}
                    </Link>
                    <p className="text-muted-foreground">{subscription.client.primaryContactEmail}</p>
                  </td>
                  <td className="p-4">{subscription.serviceType}</td>
                  <td className="p-4">
                    <p>{subscription.status}</p>
                    {subscription.cancelAtPeriodEnd ? <p className="text-muted-foreground">canceling</p> : null}
                    {subscription.paymentActionRequiredAt ? <p className="text-muted-foreground">action required</p> : null}
                  </td>
                  <td className="p-4">${(subscription.amountCents / 100).toFixed(0)}</td>
                  <td className="p-4">{subscription.currentPeriodEnd ? formatDisplayDate(subscription.currentPeriodEnd) : "-"}</td>
                  <td className="p-4">{subscription.lastPaymentAt ? formatDisplayDate(subscription.lastPaymentAt) : "-"}</td>
                  <td className="p-4">
                    {subscription.invoices[0]?.number ?? subscription.latestInvoiceProviderId ?? "-"}
                  </td>
                  <td className="p-4">{subscription.vcioOnboarding?.status ?? "-"}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <a href={stripeCustomerUrl(subscription.providerCustomerId)} className="text-primary hover:underline">
                        Customer
                      </a>
                      <a href={stripeSubscriptionUrl(subscription.providerSubscriptionId)} className="text-primary hover:underline">
                        Subscription
                      </a>
                    </div>
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
