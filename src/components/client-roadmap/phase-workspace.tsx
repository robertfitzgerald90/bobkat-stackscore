"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import type { ClientRoadmapPhaseDetail } from "@/lib/client-roadmap/types";
import {
  RECOMMENDATION_LIFECYCLE_LABELS,
  RECOMMENDATION_STATUS_VALUES,
  ROADMAP_PHASE_STATUS_LABELS,
  ROADMAP_PHASE_STATUS_VALUES,
} from "@/lib/client-roadmap/labels";
import type { RecommendationStatus, RoadmapPhaseStatus } from "@/generated/prisma/client";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import { buttonClassName } from "@/components/ui/button";
import { RoadmapStatusBadge } from "./roadmap-status-badge";

const PHASE_STATUSES = ROADMAP_PHASE_STATUS_VALUES;
const INITIATIVE_STATUSES = RECOMMENDATION_STATUS_VALUES;

export function PhaseWorkspace({
  clientId,
  initialPhase,
}: {
  clientId: string;
  initialPhase: ClientRoadmapPhaseDetail;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState(initialPhase);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function updatePhaseStatus(status: RoadmapPhaseStatus) {
    setError(null);
    const response = await fetch(`/api/v1/clients/${clientId}/roadmap/phases/${phase.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const body = (await response.json()) as { phase?: ClientRoadmapPhaseDetail; error?: string };
    if (!response.ok || !body.phase) {
      setError(body.error ?? "Unable to update phase status");
      return;
    }
    setPhase(body.phase);
    startTransition(() => router.refresh());
  }

  async function updateInitiativeStatus(initiativeId: string, status: RecommendationStatus) {
    setError(null);
    const response = await fetch(
      `/api/v1/clients/${clientId}/roadmap/initiatives/${initiativeId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(body.error ?? "Unable to update initiative status");
      return;
    }
    startTransition(() => router.refresh());
    setPhase((current) => ({
      ...current,
      initiatives: current.initiatives.map((initiative) =>
        initiative.id === initiativeId
          ? {
              ...initiative,
              status,
              statusLabel: RECOMMENDATION_LIFECYCLE_LABELS[status],
              completedAt: status === "completed" ? new Date().toISOString() : null,
            }
          : initiative,
      ),
    }));
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#082f5b]">
              {phase.subtitle}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{phase.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{phase.timeline}</p>
          </div>
          <RoadmapStatusBadge status={phase.status} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetaCard label="Expected StackScore Improvement" value={`+${phase.expectedScoreImprovement} pts`} />
          <MetaCard
            label="One-Time Investment"
            value={formatCurrency(phase.oneTimeInvestment)}
          />
          <MetaCard
            label="Monthly Services"
            value={
              phase.monthlyRecurringInvestment > 0
                ? `${formatCurrency(phase.monthlyRecurringInvestment)}/mo`
                : "None"
            }
          />
          <MetaCard
            label="Completion Date"
            value={
              phase.actualCompletionDate
                ? new Date(phase.actualCompletionDate).toLocaleDateString()
                : phase.completionDate
                  ? new Date(phase.completionDate).toLocaleDateString()
                  : "—"
            }
          />
        </div>

        {phase.isConsultant ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium" htmlFor="phase-status">
              Phase status
            </label>
            <select
              id="phase-status"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={phase.status}
              disabled={pending}
              onChange={(event) => {
                void updatePhaseStatus(event.target.value as RoadmapPhaseStatus);
              }}
            >
              {PHASE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {ROADMAP_PHASE_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            {pending ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
          </div>
        ) : phase.canClientApprove ? (
          <div className="mt-5">
            <button
              type="button"
              className={buttonClassName({ variant: "default" })}
              disabled={pending}
              onClick={() => void updatePhaseStatus("approved")}
            >
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Approve this phase
            </button>
            <p className="mt-2 text-sm text-muted-foreground">
              Approving authorizes implementation for this phase only. Remaining phases can be
              approved separately.
            </p>
          </div>
        ) : null}

        {phase.approvedAt ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Approved {new Date(phase.approvedAt).toLocaleDateString()}
            {phase.approvedByName ? ` by ${phase.approvedByName}` : ""}
          </p>
        ) : null}

        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </header>

      <Section title="Executive Summary">
        <p className="text-sm leading-relaxed text-muted-foreground">{phase.executiveSummary}</p>
      </Section>

      {phase.businessOutcomes.length > 0 ? (
        <Section title="Business Outcomes">
          <OutcomeList
            items={phase.businessOutcomes.map(
              (outcome) => outcome.description || outcome.title,
            )}
          />
        </Section>
      ) : null}

      <Section title="Included Initiatives">
        <div className="space-y-3">
          {phase.initiatives.map((initiative) => (
            <article key={initiative.id} className="rounded-lg border bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{initiative.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{initiative.description}</p>
                  <p className="mt-2 text-sm">
                    <span className="font-medium">Business benefit:</span>{" "}
                    {initiative.businessImpact}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-emerald-700">
                    Estimated StackScore contribution: +{initiative.estimatedImpactPoints} points
                  </p>
                </div>
                {phase.isConsultant ? (
                  <select
                    className="rounded-md border bg-background px-2 py-1.5 text-sm"
                    value={initiative.status}
                    disabled={pending}
                    onChange={(event) => {
                      void updateInitiativeStatus(
                        initiative.id,
                        event.target.value as RecommendationStatus,
                      );
                    }}
                  >
                    {INITIATIVE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {RECOMMENDATION_LIFECYCLE_LABELS[status]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="rounded-full border bg-white px-2.5 py-0.5 text-xs font-semibold">
                    {initiative.statusLabel}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>

      {phase.status === "completed" ? (
        <Section title="Phase Complete">
          <p className="mb-3 text-sm text-muted-foreground">
            Upon completion of this phase your organization has achieved:
          </p>
          <OutcomeList
            items={
              phase.businessOutcomes.length > 0
                ? phase.businessOutcomes.map((outcome) => outcome.description || outcome.title)
                : phase.initiatives.map((initiative) => initiative.title)
            }
          />
        </Section>
      ) : null}

      {phase.events.length > 0 ? (
        <Section title="Status History">
          <ul className="space-y-2 text-sm">
            {phase.events.map((event) => (
              <li key={event.id} className="rounded-lg border px-3 py-2">
                <span className="font-medium">
                  {event.fromStatus
                    ? `${ROADMAP_PHASE_STATUS_LABELS[event.fromStatus]} → `
                    : ""}
                  {ROADMAP_PHASE_STATUS_LABELS[event.toStatus]}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  · {event.changedByName} ·{" "}
                  {new Date(event.createdAt).toLocaleString()}
                </span>
                {event.note ? (
                  <p className="mt-1 text-muted-foreground">{event.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#082f5b]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function OutcomeList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
