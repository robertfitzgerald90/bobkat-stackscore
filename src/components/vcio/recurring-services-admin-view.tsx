import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDisplayDate } from "@/lib/display";
import type { RecurringServicesOverview } from "@/lib/vcio/recurring-services-overview";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = ["active", "trialing", "past_due", "canceled", "incomplete"] as const;

type RecurringServicesAdminViewProps = {
  overview: RecurringServicesOverview;
  role: string;
  activeStatusFilter?: string;
};

function PulseMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function RecurringServicesAdminView({
  overview,
  role,
  activeStatusFilter,
}: RecurringServicesAdminViewProps) {
  const isAdmin = role === "admin";
  const { pulse, vcioSubscriptions, recurringServices } = overview;

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Recurring Services</h1>
          <p className="page-description">
            Client service relationships, including StackScore vCIO subscriptions and other
            recurring-service records. Route remains{" "}
            <span className="font-mono text-xs">/admin/vcio</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/communications/testing"
            className={buttonVariants({ variant: "outline" })}
          >
            vCIO Onboarding Test
          </Link>
          {isAdmin ? (
            <Link href="/admin/billing" className={buttonVariants({ variant: "outline" })}>
              Open Admin Billing
            </Link>
          ) : null}
        </div>
      </div>

      <section aria-labelledby="recurring-pulse-heading" className="space-y-2">
        <h2 id="recurring-pulse-heading" className="text-sm font-semibold tracking-tight">
          Relationship overview
        </h2>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
          <PulseMetric label="Distinct active clients" value={pulse.distinctActiveClients} />
          <PulseMetric label="vCIO active / trialing" value={pulse.vcioActiveSubscriptions} />
          <PulseMetric label="vCIO past due" value={pulse.vcioPastDueSubscriptions} />
          <PulseMetric label="Recurring active" value={pulse.recurringActive} />
          <PulseMetric label="Pending activation" value={pulse.recurringPendingActivation} />
        </div>
        {isAdmin ? (
          <p className="text-sm text-muted-foreground">
            vCIO MRR (active/trialing):{" "}
            <span className="font-semibold tabular-nums text-foreground">
              ${(pulse.vcioMrrCents / 100).toFixed(0)}
            </span>
          </p>
        ) : null}
      </section>

      <section className="space-y-3" aria-labelledby="vcio-subscriptions-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="vcio-subscriptions-heading" className="text-sm font-semibold tracking-tight">
            StackScore vCIO subscriptions
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/vcio"
              className={buttonVariants({
                variant: !activeStatusFilter ? "default" : "outline",
                size: "sm",
              })}
            >
              All
            </Link>
            {STATUS_FILTERS.map((filter) => (
              <Link
                key={filter}
                href={`/admin/vcio?status=${filter}`}
                className={buttonVariants({
                  variant: activeStatusFilter === filter ? "default" : "outline",
                  size: "sm",
                })}
              >
                {filter}
              </Link>
            ))}
          </div>
        </div>

        <Card className="stat-card">
          <CardContent className="overflow-x-auto p-0">
            {vcioSubscriptions.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-medium">No vCIO subscriptions match this filter</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Clients with only RecurringService records appear in the section below.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[880px] text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-3 font-medium">Client</th>
                    <th className="p-3 font-medium">Service</th>
                    <th className="p-3 font-medium">Subscription</th>
                    <th className="p-3 font-medium">Onboarding</th>
                    <th className="p-3 font-medium">Next review</th>
                    <th className="p-3 font-medium">Workspace</th>
                  </tr>
                </thead>
                <tbody>
                  {vcioSubscriptions.map((row) => (
                    <tr key={row.id} className="border-b border-border/60">
                      <td className="p-3">
                        <p className="font-medium">{row.clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.primaryContactName ?? "—"}
                          {row.primaryContactEmail ? ` · ${row.primaryContactEmail}` : ""}
                        </p>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-[10px]">
                          StackScore vCIO
                        </Badge>
                        {row.stackScore != null ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            StackScore {row.stackScore}
                          </p>
                        ) : null}
                      </td>
                      <td className="p-3">
                        <p>{row.status}</p>
                        {row.cancelAtPeriodEnd ? (
                          <p className="text-xs text-muted-foreground">Cancel at period end</p>
                        ) : null}
                        {isAdmin ? (
                          <p className="text-xs text-muted-foreground">
                            ${(row.amountCents / 100).toFixed(0)} / period
                          </p>
                        ) : null}
                      </td>
                      <td className="p-3">
                        <p>{row.onboardingStatus ?? "Not started"}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.onboardingStep ?? "welcome"} · {row.completionPercentage ?? 0}%
                        </p>
                      </td>
                      <td className="p-3">
                        {row.nextReviewDate
                          ? formatDisplayDate(row.nextReviewDate)
                          : "Not scheduled"}
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/clients/${row.clientId}/vcio`}
                          className="text-primary hover:underline"
                        >
                          Open vCIO
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {row.activeProjectCount} active project
                          {row.activeProjectCount === 1 ? "" : "s"}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="recurring-records-heading">
        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle id="recurring-records-heading" className="text-base">
              Recurring service records
            </CardTitle>
            <CardDescription>
              Separate from vCIO subscriptions — same client may appear in both lists without
              double-counting in Distinct active clients
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {recurringServices.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-medium">No active or pending recurring-service records</p>
              </div>
            ) : (
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-3 font-medium">Client</th>
                    <th className="p-3 font-medium">Service</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Billing</th>
                    <th className="p-3 font-medium">Next / renewal</th>
                    <th className="p-3 font-medium">Workspace</th>
                  </tr>
                </thead>
                <tbody>
                  {recurringServices.map((row) => (
                    <tr key={row.id} className="border-b border-border/60">
                      <td className="p-3 font-medium">{row.clientName}</td>
                      <td className="p-3">{row.serviceName}</td>
                      <td className="p-3">
                        <Badge
                          variant={row.status === "pending_activation" ? "warning" : "secondary"}
                          className="text-[10px]"
                        >
                          {row.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{row.billingFrequency}</td>
                      <td className="p-3 text-muted-foreground">
                        {row.nextBillingDate
                          ? formatDisplayDate(row.nextBillingDate)
                          : "—"}
                        {row.renewalDate ? ` · renew ${formatDisplayDate(row.renewalDate)}` : ""}
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/clients/${row.clientId}/technology-profile`}
                          className={cn("text-primary hover:underline")}
                        >
                          Open client
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
