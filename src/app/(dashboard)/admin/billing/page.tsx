import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { PaymentAttemptStatus, ServiceType, SubscriptionStatus } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDisplayDate } from "@/lib/display";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    paymentStatus?: string;
    from?: string;
    to?: string;
    clientId?: string;
    service?: string;
  }>;
};

const statusFilters = ["active", "trialing", "past_due", "incomplete", "canceled", "paused"] as const;
const paymentStatusFilters = [
  "succeeded",
  "failed",
  "requires_action",
  "processing",
  "retrying",
  "refunded",
  "voided",
] as const;

const paymentStatusLabels: Record<PaymentAttemptStatus, string> = {
  succeeded: "Succeeded",
  failed: "Failed",
  requires_action: "Requires Action",
  processing: "Processing",
  retrying: "Retrying",
  refunded: "Refunded",
  voided: "Voided",
};

const serviceLabels: Record<ServiceType, string> = {
  stackscore_vcio: "StackScore vCIO",
};

function stripeSubscriptionUrl(subscriptionId: string) {
  const mode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "" : "test/";
  return `https://dashboard.stripe.com/${mode}subscriptions/${subscriptionId}`;
}

function stripeCustomerUrl(customerId: string) {
  const mode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "" : "test/";
  return `https://dashboard.stripe.com/${mode}customers/${customerId}`;
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function parseDate(value: string | undefined, endOfDay = false): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function paymentMethodSummary(input: {
  paymentMethodBrand: string | null;
  paymentMethodLast4: string | null;
}) {
  if (!input.paymentMethodBrand && !input.paymentMethodLast4) return "-";
  const brand = input.paymentMethodBrand
    ? input.paymentMethodBrand.charAt(0).toUpperCase() + input.paymentMethodBrand.slice(1)
    : "Card";
  return input.paymentMethodLast4 ? `${brand} ending in ${input.paymentMethodLast4}` : brand;
}

function isMissingVcioSchemaError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Subscription") ||
    message.includes("SubscriptionInvoice") ||
    message.includes("SubscriptionPaymentAttempt") ||
    message.includes("PaymentAttemptStatus")
  );
}

export default async function AdminBillingPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const { status, paymentStatus, from, to, clientId, service } = await searchParams;
  const safeStatus = statusFilters.includes(status as (typeof statusFilters)[number])
    ? (status as SubscriptionStatus)
    : undefined;
  const safePaymentStatus = paymentStatusFilters.includes(
    paymentStatus as (typeof paymentStatusFilters)[number],
  )
    ? (paymentStatus as PaymentAttemptStatus)
    : undefined;
  const safeService = service === "stackscore_vcio" ? (service as ServiceType) : undefined;
  const fromDate = parseDate(from);
  const toDate = parseDate(to, true);

  let data;
  try {
    data = await Promise.all([
      prisma.subscription.findMany({
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
      }),
      prisma.subscriptionPaymentAttempt.findMany({
        where: {
          ...(safePaymentStatus ? { status: safePaymentStatus } : {}),
          ...(clientId ? { clientId } : {}),
          ...(safeService ? { serviceType: safeService } : {}),
          ...((fromDate || toDate)
            ? {
                attemptDate: {
                  ...(fromDate ? { gte: fromDate } : {}),
                  ...(toDate ? { lte: toDate } : {}),
                },
              }
            : {}),
        },
        orderBy: { attemptDate: "desc" },
        take: 100,
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              primaryContactName: true,
              primaryContactEmail: true,
            },
          },
        },
      }),
      prisma.client.findMany({
        where: { subscriptionPaymentAttempts: { some: {} } },
        orderBy: { companyName: "asc" },
        select: { id: true, companyName: true },
      }),
      prisma.subscriptionPaymentAttempt.count({
        where: {
          status: "succeeded",
          attemptDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.subscriptionPaymentAttempt.count({
        where: {
          status: "failed",
          attemptDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.subscriptionInvoice.aggregate({
        where: { status: { notIn: ["paid", "void"] } },
        _sum: { amountDueCents: true },
      }),
      prisma.subscriptionPaymentAttempt.findMany({
        where: { status: "requires_action" },
        distinct: ["clientId"],
        select: { clientId: true },
      }),
      prisma.subscriptionPaymentAttempt.count({ where: { status: "retrying" } }),
    ]);
  } catch (error) {
    if (!isMissingVcioSchemaError(error)) throw error;
    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Admin Billing</h1>
          <p className="page-description">Stripe subscription and payment activity reporting.</p>
        </div>
        <Card className="border-primary/25 bg-primary/5">
          <CardContent className="p-6">
            <p className="font-semibold">vCIO billing tables are not available yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Deploy the Prisma migrations before opening vCIO billing or vCIO Clients in
              production. The code is deployed, but the database still needs the subscription and
              payment activity schema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [
    subscriptions,
    paymentAttempts,
    clientOptions,
    successfulThisMonth,
    failedThisMonth,
    outstandingRevenue,
    accountsRequiringAction,
    paymentsRetrying,
  ] = data;

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
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Successful payments this month</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{successfulThisMonth}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Failed attempts this month</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{failedThisMonth}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Outstanding revenue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatMoney(outstandingRevenue._sum.amountDueCents ?? 0, "usd")}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Accounts requiring action</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{accountsRequiringAction.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Payments currently retrying</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{paymentsRetrying}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-6" action="/admin/billing">
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Status</span>
              <select name="paymentStatus" defaultValue={safePaymentStatus ?? ""} className="h-9 rounded-lg border bg-background px-2">
                <option value="">All</option>
                {paymentStatusFilters.map((filter) => (
                  <option key={filter} value={filter}>{paymentStatusLabels[filter]}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">From</span>
              <input name="from" type="date" defaultValue={from ?? ""} className="h-9 rounded-lg border bg-background px-2" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">To</span>
              <input name="to" type="date" defaultValue={to ?? ""} className="h-9 rounded-lg border bg-background px-2" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Client</span>
              <select name="clientId" defaultValue={clientId ?? ""} className="h-9 rounded-lg border bg-background px-2">
                <option value="">All clients</option>
                {clientOptions.map((client) => (
                  <option key={client.id} value={client.id}>{client.companyName}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Service</span>
              <select name="service" defaultValue={safeService ?? ""} className="h-9 rounded-lg border bg-background px-2">
                <option value="">All services</option>
                <option value="stackscore_vcio">StackScore vCIO</option>
              </select>
            </label>
            <div className="flex items-end gap-2">
              <button type="submit" className={buttonVariants({ variant: "default", size: "sm" })}>
                Filter
              </button>
              <Link href="/admin/billing" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Reset
              </Link>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1500px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Client organization</th>
                  <th className="py-3 pr-4 font-medium">Contact</th>
                  <th className="py-3 pr-4 font-medium">Service</th>
                  <th className="py-3 pr-4 font-medium">Attempt date and time</th>
                  <th className="py-3 pr-4 font-medium">Invoice number</th>
                  <th className="py-3 pr-4 font-medium">Amount</th>
                  <th className="py-3 pr-4 font-medium">Currency</th>
                  <th className="py-3 pr-4 font-medium">Attempt status</th>
                  <th className="py-3 pr-4 font-medium">Failure reason</th>
                  <th className="py-3 pr-4 font-medium">Attempt count</th>
                  <th className="py-3 pr-4 font-medium">Next retry</th>
                  <th className="py-3 pr-4 font-medium">Payment method</th>
                  <th className="py-3 pr-4 font-medium">Stripe</th>
                </tr>
              </thead>
              <tbody>
                {paymentAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-8 text-center text-muted-foreground">
                      No payment activity matches the current filters.
                    </td>
                  </tr>
                ) : (
                  paymentAttempts.map((attempt) => (
                    <tr key={attempt.id} className="border-b border-border/60">
                      <td className="py-3 pr-4">
                        <Link href={`/clients/${attempt.clientId}/billing`} className="font-medium text-primary hover:underline">
                          {attempt.client.companyName}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        <p>{attempt.client.primaryContactName}</p>
                        <p className="text-muted-foreground">{attempt.client.primaryContactEmail}</p>
                      </td>
                      <td className="py-3 pr-4">{serviceLabels[attempt.serviceType]}</td>
                      <td className="py-3 pr-4">{attempt.attemptDate.toLocaleString()}</td>
                      <td className="py-3 pr-4">{attempt.invoiceNumber ?? attempt.providerInvoiceId}</td>
                      <td className="py-3 pr-4 tabular-nums">{formatMoney(attempt.amountCents, attempt.currency)}</td>
                      <td className="py-3 pr-4 uppercase">{attempt.currency}</td>
                      <td className="py-3 pr-4">{paymentStatusLabels[attempt.status]}</td>
                      <td className="max-w-[260px] py-3 pr-4 text-muted-foreground">
                        {attempt.failureMessage ?? attempt.failureDeclineCode ?? attempt.failureCode ?? "-"}
                      </td>
                      <td className="py-3 pr-4">{attempt.attemptCount}</td>
                      <td className="py-3 pr-4">
                        {attempt.nextPaymentAttemptAt ? formatDisplayDate(attempt.nextPaymentAttemptAt) : "-"}
                      </td>
                      <td className="py-3 pr-4">{paymentMethodSummary(attempt)}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-1">
                          {attempt.hostedInvoiceUrl ? (
                            <a href={attempt.hostedInvoiceUrl} className="text-primary hover:underline">Invoice</a>
                          ) : null}
                          {attempt.stripeCustomerId ? (
                            <a href={stripeCustomerUrl(attempt.stripeCustomerId)} className="text-primary hover:underline">Customer</a>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
