"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { buttonClassName } from "@/components/ui/button";
import type { CustomerOverviewOpportunity } from "@/lib/customer-portal/overview-dto";
import { parseRecommendationDescription } from "@/lib/customer-portal/recommendation-content";
import {
  STATUSES,
  type PlannerTaskView,
  type PlannerTaskInput,
} from "@/lib/planner/model";

type Props = {
  priorities: CustomerOverviewOpportunity[];
  tasks: PlannerTaskView[];
  clientId: string;
  roadmapHref: string;
  recommendationsHref: string;
  readOnly?: boolean;
};
export function OverviewNextMoves({
  priorities,
  tasks,
  clientId,
  roadmapHref,
  recommendationsHref,
  readOnly = false,
}: Props) {
  const router = useRouter();
  const [active, setActive] = useState<CustomerOverviewOpportunity | null>(
    null,
  );
  const [saved, setSaved] = useState<Record<string, PlannerTaskView>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const taskFor = (id: string) =>
    saved[id] ?? tasks.find((t) => t.sourceRecommendationId === id);
  const activeTask = active ? taskFor(active.id) : undefined;
  const content = parseRecommendationDescription(active?.description);
  const moves = priorities
    .filter((p) => taskFor(p.id)?.status !== "complete")
    .slice(0, 3);
  function updateStatus(
    status: PlannerTaskInput["status"],
    openRoadmap = false,
  ) {
    if (!active || readOnly) return;
    const action = active;
    setError("");
    setNotice("");
    startTransition(async () => {
      try {
        let task = taskFor(action.id);
        const base = `/api/v1/clients/${clientId}/planner`;
        if (!task) {
          const sections = parseRecommendationDescription(action.description);
          const response = await fetch(base, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: action.title,
              description: sections.finding ?? action.description ?? "",
              steps: sections.recommendedAction ?? "",
              pillarCode: action.pillarCode ?? null,
              sourceRecommendationId: action.id,
              status,
            }),
          });
          const body = await response.json();
          if (!response.ok)
            throw new Error(body.error ?? "Unable to save action");
          task = body.task as PlannerTaskView;
        }
        if (task.status !== status) {
          const response = await fetch(`${base}/${task.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
          if (!response.ok) {
            const body = await response.json();
            throw new Error(body.error ?? "Unable to save action");
          }
        }
        setSaved((current) => ({
          ...current,
          [action.id]: { ...task!, status },
        }));
        setNotice("Action status saved to your planner.");
        if (openRoadmap) router.push(`${roadmapHref}#task-${task!.id}`);
        else router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to save action");
      }
    });
  }
  return (
    <section className="space-y-3" aria-labelledby="next-moves-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="next-moves-heading" className="text-lg font-semibold">
          Your next best moves
        </h2>
        <Link
          href={roadmapHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
        >
          Open roadmap
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {moves.length ? (
        <ol className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {moves.map((item, index) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-3 p-4 sm:gap-5"
            >
              <span className="text-sm tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.pillarName ?? "Assessment recommendation"}
                </p>
              </div>
              <span className="rounded border border-border bg-muted/30 px-2 py-1 text-[11px]">
                {item.priorityLabel} priority
              </span>
              <span className="text-xs text-muted-foreground">
                {STATUSES[taskFor(item.id)?.status ?? item.actionStatus ?? "planned"]}
              </span>
              <button
                onClick={() => {
                  setActive(item);
                  setError("");
                  setNotice("");
                }}
                className="inline-flex items-center gap-2 text-xs font-medium text-primary"
              >
                View action
                <ArrowRight className="h-3 w-3" />
                <span className="sr-only">: {item.title}</span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium">
            No pending assessment actions to show
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Review all recommendations or add a custom action in your planner.
          </p>
        </div>
      )}
      <Link
        href={recommendationsHref}
        className="inline-block text-xs text-muted-foreground underline underline-offset-4"
      >
        View all recommendations
      </Link>
      <Dialog
        open={Boolean(active)}
        onOpenChange={(open) => {
          if (!open && !pending) setActive(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-xl border-border bg-card text-foreground"
        >
          {active && (
            <>
              <DialogHeader className="relative border-border px-6 pb-4 pt-7">
                <p className="pr-8 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {active.pillarName ?? "Improvement action"}
                </p>
                <DialogTitle className="pr-8 text-xl text-foreground">
                  {active.title}
                </DialogTitle>
                <DialogDescription className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {content.finding ??
                    content.leadingText ??
                    (!content.hasStructuredSections
                      ? active.description
                      : null) ??
                    active.businessImpact ??
                    "Review this recommendation and record your next implementation step."}
                </DialogDescription>
                <DialogClose
                  disabled={pending}
                  className="absolute right-5 top-5 rounded p-1 text-muted-foreground"
                  aria-label="Close action"
                >
                  ✕
                </DialogClose>
              </DialogHeader>
              <div className="space-y-6 overflow-y-auto px-6 py-5">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-primary/10 px-2 py-1 text-primary">
                    {active.priorityLabel} priority
                  </span>
                  {activeTask?.horizon && (
                    <span className="rounded border border-border px-2 py-1 capitalize">
                      {activeTask.horizon}
                    </span>
                  )}
                  {activeTask?.dueDate && (
                    <span className="rounded border border-border px-2 py-1">
                      Due {activeTask.dueDate}
                    </span>
                  )}
                </div>
                {activeTask?.owner && (
                  <div>
                    <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Owner
                    </h3>
                    <p className="mt-2 text-sm">{activeTask.owner}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    What to do
                  </h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">
                    {activeTask?.steps ||
                      content.recommendedAction ||
                      "Open the full recommendation for implementation guidance. Add your own steps in the planner."}
                  </p>
                </div>
                {(content.expectedOutcome || active.businessImpact) && (
                  <div>
                    <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Expected outcome
                    </h3>
                    <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                      {content.expectedOutcome ?? active.businessImpact}
                    </p>
                  </div>
                )}
                {content.implementationConsiderations && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground">
                      Implementation considerations
                    </summary>
                    <p className="mt-2 whitespace-pre-line leading-relaxed">
                      {content.implementationConsiderations}
                    </p>
                  </details>
                )}
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <p role="status" className="text-xs text-muted-foreground">
                  {pending ? "Saving…" : notice}
                </p>
              </div>
              <div className="space-y-3 border-t border-border px-6 py-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <label className="space-y-1 text-xs">
                    <span className="block uppercase text-muted-foreground">
                      Action status
                    </span>
                    <select
                      aria-label="Action status"
                      disabled={pending || readOnly}
                      value={activeTask?.status ?? active.actionStatus ?? "planned"}
                      onChange={(e) =>
                        updateStatus(
                          e.target.value as PlannerTaskInput["status"],
                        )
                      }
                      className="min-w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      {Object.entries(STATUSES).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {readOnly ? (
                    <Link href={roadmapHref} className={buttonClassName({})}>
                      Open in roadmap
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <button
                      disabled={pending}
                      onClick={() =>
                        updateStatus(activeTask?.status ?? active.actionStatus ?? "planned", true)
                      }
                      className={buttonClassName({})}
                    >
                      Open in roadmap
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {readOnly
                    ? "Read-only preview."
                    : "Status is saved to your workspace. Official assessment scores change after reassessment."}
                </p>
                <Link
                  href={active.href}
                  className="text-xs text-primary underline underline-offset-4"
                >
                  Full recommendation
                </Link>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
