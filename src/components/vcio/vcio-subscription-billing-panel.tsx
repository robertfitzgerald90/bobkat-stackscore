import Link from "next/link";
import { AlertTriangle, CheckCircle2, WalletCards } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StripePortalButton } from "@/components/vcio/stripe-portal-button";
import { buttonVariants } from "@/components/ui/button";
import { formatBillingMoney } from "@/components/billing/billing-ui";
import { prisma } from "@/lib/db";
import { formatDisplayDate } from "@/lib/display";
import {
  formatVcioAccessState,
  getClientVcioEntitlement,
} from "@/lib/vcio/entitlements";

export async function VcioSubscriptionBillingPanel({ clientId }: { clientId: string }) {
  const [entitlement, subscription] = await Promise.all([
    getClientVcioEntitlement(clientId),
    prisma.subscription.findFirst({
      where: { clientId, serviceType: "stackscore_vcio" },
      orderBy: { updatedAt: "desc" },
      include: {
        invoices: {
          orderBy: { invoiceDate: "desc" },
          take: 12,
        },
      },
    }),
  ]);

  if (!subscription) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">No active StackScore vCIO subscription</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Subscribe to add ongoing advisory, quarterly reviews, and roadmap management.
            </p>
          </div>
          <Link href="/vcio-offer" className={buttonVariants({ variant: "default" })}>
            View vCIO Offer
          </Link>
        </CardContent>
      </Card>
    );
  }

  const Icon = entitlement.accessState === "FULL_ACCESS" ? CheckCircle2 : AlertTriangle;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <WalletCards className="h-4 w-4 text-primary" />
          Subscription & Billing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current Plan</p>
            <p className="mt-2 text-xl font-semibold">StackScore vCIO</p>
            <p className="text-sm text-muted-foreground">$500/month</p>
          </div>
          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payment Status</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
              <Icon className="h-4 w-4 text-primary" />
              {formatVcioAccessState(entitlement.accessState)}
            </p>
            <p className="text-sm text-muted-foreground">{subscription.status}</p>
          </div>
          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Next Renewal</p>
            <p className="mt-2 text-sm font-semibold">
              {subscription.currentPeriodEnd ? formatDisplayDate(subscription.currentPeriodEnd) : "Pending"}
            </p>
            <p className="text-sm text-muted-foreground">
              {subscription.cancelAtPeriodEnd ? "Canceling at period end" : "Renews monthly"}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account Access</p>
            <p className="mt-2 text-sm font-semibold">{formatVcioAccessState(entitlement.accessState)}</p>
            {entitlement.gracePeriodEndsAt ? (
              <p className="text-sm text-muted-foreground">
                Grace ends {formatDisplayDate(entitlement.gracePeriodEndsAt)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <StripePortalButton clientId={clientId} />
          <Link href={`/clients/${clientId}/vcio`} className={buttonVariants({ variant: "outline" })}>
            Open vCIO Dashboard
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Invoice</th>
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Amount</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 font-medium">Links</th>
              </tr>
            </thead>
            <tbody>
              {subscription.invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No subscription invoices have synchronized yet.
                  </td>
                </tr>
              ) : (
                subscription.invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-border/60">
                    <td className="py-3 pr-4 font-medium">{invoice.number ?? "Stripe invoice"}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {invoice.invoiceDate ? formatDisplayDate(invoice.invoiceDate) : "-"}
                    </td>
                    <td className="py-3 pr-4 tabular-nums">
                      {formatBillingMoney(invoice.amountPaidCents || invoice.amountDueCents)}
                    </td>
                    <td className="py-3 pr-4">{invoice.status}</td>
                    <td className="py-3">
                      <div className="flex gap-3">
                        {invoice.hostedInvoiceUrl ? (
                          <a href={invoice.hostedInvoiceUrl} className="text-primary hover:underline">
                            View
                          </a>
                        ) : null}
                        {invoice.invoicePdfUrl ? (
                          <a href={invoice.invoicePdfUrl} className="text-primary hover:underline">
                            Download
                          </a>
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
  );
}
