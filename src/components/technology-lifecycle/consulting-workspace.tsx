import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { ConsultingWorkspaceSummary } from "@/lib/technology-lifecycle/types";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RISK_STYLES = {
  healthy: "bg-emerald-50 text-emerald-800 border-emerald-200",
  watch: "bg-amber-50 text-amber-800 border-amber-200",
  at_risk: "bg-orange-50 text-orange-800 border-orange-200",
  critical: "bg-red-50 text-red-800 border-red-200",
} as const;

export function ConsultingWorkspaceView({
  summary,
}: {
  summary: ConsultingWorkspaceSummary;
}) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#082f5b]">
          Bobkat IT Consulting Workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Proactive technology lifecycle operations
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Portfolio view of StackScore health, proposal and implementation pipelines, upcoming
          QBRs, and managed service revenue.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Clients Requiring Attention"
          value={summary.clientsRequiringAttention.length}
        />
        <Stat label="Proposal Pipeline" value={summary.proposalPipeline.length} />
        <Stat label="Implementation Pipeline" value={summary.implementationPipeline.length} />
        <Stat
          label="Managed Service Revenue"
          value={`${formatCurrency(summary.managedServiceRevenueMonthly)}/mo`}
        />
      </div>

      {summary.technologyTrendAverageDelta !== null ? (
        <p className="text-sm text-muted-foreground">
          Average StackScore change across clients with history:{" "}
          <span className="font-semibold text-foreground">
            {summary.technologyTrendAverageDelta > 0 ? "+" : ""}
            {summary.technologyTrendAverageDelta} pts
          </span>
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Clients Requiring Attention">
          {summary.clientsRequiringAttention.length === 0 ? (
            <Empty>No clients currently flagged for attention.</Empty>
          ) : (
            <ul className="space-y-2">
              {summary.clientsRequiringAttention.slice(0, 10).map((client) => (
                <li key={client.clientId} className="rounded-lg border px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={`/clients/${client.clientId}/lifecycle`}
                      className="font-semibold hover:underline"
                    >
                      {client.clientName}
                    </Link>
                    <RiskBadge band={client.riskBand} />
                  </div>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    {client.attentionReasons.map((reason) => (
                      <li key={reason} className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Upcoming QBRs">
          {summary.upcomingQbrs.length === 0 ? (
            <Empty>No upcoming review dates on file.</Empty>
          ) : (
            <ul className="space-y-2">
              {summary.upcomingQbrs.map((item) => (
                <li key={item.clientId} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{item.clientName}</p>
                    <p className="text-muted-foreground">
                      {new Date(item.nextReviewDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/clients/${item.clientId}/quarterly-reviews`}
                    className={buttonClassName({ variant: "ghost", size: "sm" })}
                  >
                    Open
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Clients by StackScore">
          <ul className="space-y-2">
            {summary.clientsByStackScore.slice(0, 12).map((client) => (
              <li key={client.clientId} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
                <Link
                  href={`/clients/${client.clientId}/lifecycle`}
                  className="font-medium hover:underline"
                >
                  {client.clientName}
                </Link>
                <span className={cn("font-bold tabular-nums", getScoreTextColorClass(client.stackScore))}>
                  {client.stackScore ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Clients by Risk">
          <ul className="space-y-2">
            {summary.clientsByRisk.slice(0, 12).map((client) => (
              <li key={client.clientId} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
                <Link
                  href={`/clients/${client.clientId}/lifecycle`}
                  className="font-medium hover:underline"
                >
                  {client.clientName}
                </Link>
                <RiskBadge band={client.riskBand} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Proposal Pipeline">
          {summary.proposalPipeline.length === 0 ? (
            <Empty>No active phase proposals.</Empty>
          ) : (
            <ul className="space-y-2">
              {summary.proposalPipeline.map((item) => (
                <li key={`${item.clientId}-${item.proposalNumber}`} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{item.clientName}</p>
                  <p className="text-muted-foreground">
                    {item.proposalNumber} · {item.status.replaceAll("_", " ")} ·{" "}
                    {formatCurrency(item.oneTimeInvestment)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Implementation Pipeline">
          {summary.implementationPipeline.length === 0 ? (
            <Empty>No approved or in-progress phases.</Empty>
          ) : (
            <ul className="space-y-2">
              {summary.implementationPipeline.map((item) => (
                <li key={`${item.clientId}-${item.phaseName}`} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{item.clientName}</p>
                  <p className="text-muted-foreground">
                    {item.phaseName} · {item.status.replaceAll("_", " ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Upcoming Phase Opportunities">
        {summary.upcomingPhaseOpportunities.length === 0 ? (
          <Empty>No upcoming phase opportunities identified.</Empty>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {summary.upcomingPhaseOpportunities.map((item) => (
              <li key={`${item.clientId}-${item.phaseName}`} className="rounded-lg border px-3 py-2 text-sm">
                <Link
                  href={`/clients/${item.clientId}/roadmap`}
                  className="font-medium hover:underline"
                >
                  {item.clientName}
                </Link>
                <p className="mt-1 text-muted-foreground">{item.phaseName}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#082f5b]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function RiskBadge({ band }: { band: keyof typeof RISK_STYLES }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase",
        RISK_STYLES[band],
      )}
    >
      {band.replace("_", " ")}
    </span>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
