"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  DollarSign,
  Layers,
  Plus,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatPriority } from "@/lib/display";
import {
  applyWizardStateToPlan,
  deferRecommendation,
  excludeRecommendation,
  includeRecommendation,
  mergeRecommendationCatalog,
  moveRecommendationInOrder,
  shouldConfirmExclusion,
  validateTipSelection,
} from "@/lib/technology-improvement-plan/selection";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import type { TipPlanDetail, TipRecommendationView, TipWizardState } from "@/lib/technology-improvement-plan/types";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TipRecommendationsStepProps = {
  plan: TipPlanDetail;
  isEditable: boolean;
  onPlanChange: (plan: TipPlanDetail) => void;
  onPersist: (wizardState: TipWizardState) => Promise<void>;
};

const STATUS_BADGE = {
  included: { label: "Included", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  excluded: { label: "Excluded", className: "bg-slate-100 text-slate-600 border-slate-200" },
  deferred: { label: "Deferred", className: "bg-amber-50 text-amber-800 border-amber-200" },
} as const;

export function TipRecommendationsStep({
  plan,
  isEditable,
  onPlanChange,
  onPersist,
}: TipRecommendationsStepProps) {
  const [pending, setPending] = useState(false);
  const summary = plan.selectionSummary;

  const seeds = () =>
    mergeRecommendationCatalog(
      plan.recommendations,
      plan.excludedRecommendations,
      plan.deferredRecommendations,
    );

  const applyChange = async (nextState: TipWizardState) => {
    const validationError = validateTipSelection(seeds(), nextState);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const nextPlan = applyWizardStateToPlan(plan, nextState);
    onPlanChange(nextPlan);
    setPending(true);
    try {
      await onPersist(nextPlan.wizardState);
    } finally {
      setPending(false);
    }
  };

  const patchNotes = (patch: Partial<TipWizardState>) => {
    const nextPlan = applyWizardStateToPlan(plan, { ...plan.wizardState, ...patch });
    onPlanChange(nextPlan);
  };

  const persistNotes = async (wizardState: TipWizardState) => {
    setPending(true);
    try {
      await onPersist(wizardState);
    } finally {
      setPending(false);
    }
  };

  const handleExclude = async (rec: TipRecommendationView) => {
    if (!isEditable) return;

    if (shouldConfirmExclusion(rec.priority)) {
      const label = rec.priority === "critical" ? "critical" : "high-priority";
      const confirmed = window.confirm(
        `Exclude this ${label} recommendation from the plan?\n\n"${rec.title}"\n\nIt will remain open on the Technology Maturity Profile but will not appear in this TIP, investment, or projected score.`,
      );
      if (!confirmed) return;
    }

    if (rec.priority === "critical") {
      let stateWithNote = plan.wizardState;
      const existingNote = plan.wizardState.consultantNotesByRecId[rec.id]?.trim();
      if (!existingNote) {
        const note = window.prompt(
          `Consultant note required — explain why "${rec.title}" is excluded from this plan:`,
          "",
        );
        if (!note?.trim()) {
          toast.error("A consultant note is required when excluding critical recommendations.");
          return;
        }
        stateWithNote = {
          ...plan.wizardState,
          consultantNotesByRecId: {
            ...plan.wizardState.consultantNotesByRecId,
            [rec.id]: note.trim(),
          },
        };
        onPlanChange(applyWizardStateToPlan(plan, stateWithNote));
      }
      await applyChange(excludeRecommendation(seeds(), stateWithNote, rec.id));
      return;
    }

    await applyChange(excludeRecommendation(seeds(), plan.wizardState, rec.id));
  };

  const handleDefer = async (rec: TipRecommendationView) => {
    if (!isEditable) return;
    await applyChange(deferRecommendation(seeds(), plan.wizardState, rec.id));
  };

  const handleInclude = async (rec: TipRecommendationView) => {
    if (!isEditable) return;
    await applyChange(includeRecommendation(seeds(), plan.wizardState, rec.id));
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    if (!isEditable) return;
    const nextState = moveRecommendationInOrder(plan.wizardState, id, direction);
    await applyChange(nextState);
  };

  return (
    <div className="space-y-6">
      <SelectionSummaryPanel plan={plan} summary={summary} pending={pending} />

      <Card>
        <CardHeader>
          <CardTitle>Plan Notes</CardTitle>
          <CardDescription>Executive-facing and internal consultant context for this plan.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="global-executive-notes">Executive notes (plan-wide)</Label>
            <textarea
              id="global-executive-notes"
              className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={plan.wizardState.globalExecutiveNotes}
              disabled={!isEditable}
              onChange={(event) => patchNotes({ globalExecutiveNotes: event.target.value })}
              onBlur={() => void persistNotes(plan.wizardState)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="global-consultant-notes">Consultant notes (internal)</Label>
            <textarea
              id="global-consultant-notes"
              className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={plan.wizardState.globalConsultantNotes}
              disabled={!isEditable}
              onChange={(event) => patchNotes({ globalConsultantNotes: event.target.value })}
              onBlur={() => void persistNotes(plan.wizardState)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Included Recommendations</CardTitle>
          <CardDescription>
            These initiatives are part of the client&apos;s selected improvement plan. Reorder to set
            presentation priority.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recommendations are currently included. Restore items from the excluded or deferred
              sections below.
            </p>
          ) : (
            plan.recommendations.map((rec, index) => (
              <RecommendationCard
                key={rec.id}
                rec={rec}
                status="included"
                isEditable={isEditable}
                isFirst={index === 0}
                isLast={index === plan.recommendations.length - 1}
                consultantNote={plan.wizardState.consultantNotesByRecId[rec.id] ?? ""}
                executiveNote={plan.wizardState.executiveNotesByRecId[rec.id] ?? ""}
                onConsultantNoteChange={(value) =>
                  patchNotes({
                    consultantNotesByRecId: {
                      ...plan.wizardState.consultantNotesByRecId,
                      [rec.id]: value,
                    },
                  })
                }
                onExecutiveNoteChange={(value) =>
                  patchNotes({
                    executiveNotesByRecId: {
                      ...plan.wizardState.executiveNotesByRecId,
                      [rec.id]: value,
                    },
                  })
                }
                onNotesBlur={() => void persistNotes(plan.wizardState)}
                onMoveUp={() => void handleMove(rec.id, "up")}
                onMoveDown={() => void handleMove(rec.id, "down")}
                onExclude={() => void handleExclude(rec)}
                onDefer={() => void handleDefer(rec)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {plan.deferredRecommendations.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Deferred Recommendations</CardTitle>
            <CardDescription>
              Deferred items are not part of this plan phase but remain open on the Technology
              Profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.deferredRecommendations.map((rec) => (
              <ExcludedRow
                key={rec.id}
                rec={rec}
                status="deferred"
                isEditable={isEditable}
                onInclude={() => void handleInclude(rec)}
              />
            ))}
          </CardContent>
        </Card>
      ) : null}

      {plan.excludedRecommendations.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Excluded Recommendations</CardTitle>
            <CardDescription>
              Excluded items are omitted from the TIP, investment, roadmap, and projected score.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.excludedRecommendations.map((rec) => (
              <ExcludedRow
                key={rec.id}
                rec={rec}
                status="excluded"
                isEditable={isEditable}
                onInclude={() => void handleInclude(rec)}
              />
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function SelectionSummaryPanel({
  plan,
  summary,
  pending,
}: {
  plan: TipPlanDetail;
  summary: TipPlanDetail["selectionSummary"];
  pending: boolean;
}) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Live Plan Summary</CardTitle>
        <CardDescription>
          Updates automatically as you include, exclude, defer, or reorder recommendations.
          {pending ? " Saving…" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryStat
            icon={Layers}
            label="Included"
            value={String(summary.includedCount)}
          />
          <SummaryStat
            icon={X}
            label="Excluded"
            value={String(summary.excludedCount)}
          />
          <SummaryStat
            icon={Clock}
            label="Deferred"
            value={String(summary.deferredCount)}
          />
          <SummaryStat
            icon={DollarSign}
            label="Client investment"
            value={formatCurrency(summary.clientInvestmentTotal)}
          />
          <SummaryStat
            icon={Target}
            label="Projected score"
            value={
              <span>
                {plan.currentScore}{" "}
                <span className="text-muted-foreground">→</span>{" "}
                <span className={getScoreTextColorClass(plan.projectedScore)}>
                  {plan.projectedScore}
                </span>
              </span>
            }
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />+{summary.projectedScoreImprovement} projected points
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Est. timeline: {summary.estimatedTimeline}
          </span>
          {plan.isAdmin ? (
            <span>
              Internal: Labor {formatCurrency(summary.laborTotal)} · Hardware{" "}
              {formatCurrency(summary.hardwareTotal)} · Services{" "}
              {formatCurrency(summary.servicesTotal)}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function RecommendationCard({
  rec,
  status,
  isEditable,
  isFirst,
  isLast,
  consultantNote,
  executiveNote,
  onConsultantNoteChange,
  onExecutiveNoteChange,
  onNotesBlur,
  onMoveUp,
  onMoveDown,
  onExclude,
  onDefer,
}: {
  rec: TipRecommendationView;
  status: keyof typeof STATUS_BADGE;
  isEditable: boolean;
  isFirst: boolean;
  isLast: boolean;
  consultantNote: string;
  executiveNote: string;
  onConsultantNoteChange: (value: string) => void;
  onExecutiveNoteChange: (value: string) => void;
  onNotesBlur: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onExclude: () => void;
  onDefer: () => void;
}) {
  const badge = STATUS_BADGE[status];

  return (
    <div className="rounded-lg border border-t-4 border-t-primary bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-primary">{rec.title}</p>
            <Badge variant="outline">{formatPriority(rec.priority)}</Badge>
            <span className={cn("rounded border px-2 py-0.5 text-[10px] font-bold uppercase", badge.className)}>
              {badge.label}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{rec.businessImpact}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            +{rec.estimatedImpactPoints} pts · {rec.categoryName}
            {rec.suggestedService ? ` · ${rec.suggestedService}` : ""}
          </p>
        </div>
        {isEditable ? (
          <div className="flex flex-wrap gap-1">
            <Button type="button" variant="outline" size="icon" disabled={isFirst} onClick={onMoveUp}>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="icon" disabled={isLast} onClick={onMoveDown}>
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onDefer}>
              Defer
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onExclude}>
              <X className="mr-1 h-3.5 w-3.5" />
              Exclude
            </Button>
          </div>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div>
          <Label>Executive note</Label>
          <textarea
            className="mt-1 min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={executiveNote}
            disabled={!isEditable}
            onChange={(event) => onExecutiveNoteChange(event.target.value)}
            onBlur={onNotesBlur}
          />
        </div>
        <div>
          <Label>
            Consultant note
            {rec.priority === "critical" ? " (required if excluding)" : ""}
          </Label>
          <textarea
            className="mt-1 min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={consultantNote}
            disabled={!isEditable}
            onChange={(event) => onConsultantNoteChange(event.target.value)}
            onBlur={onNotesBlur}
          />
        </div>
      </div>
    </div>
  );
}

function ExcludedRow({
  rec,
  status,
  isEditable,
  onInclude,
}: {
  rec: TipRecommendationView;
  status: "excluded" | "deferred";
  isEditable: boolean;
  onInclude: () => void;
}) {
  const badge = STATUS_BADGE[status];

  return (
    <div className="flex flex-col gap-3 rounded-md border bg-muted/20 p-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="min-w-0 break-words font-medium">{rec.title}</p>
          <Badge variant="outline">{formatPriority(rec.priority)}</Badge>
          <span className={cn("rounded border px-2 py-0.5 text-[10px] font-bold uppercase", badge.className)}>
            {badge.label}
          </span>
        </div>
        <p className="mt-1 break-words text-sm text-muted-foreground">{rec.businessImpact}</p>
      </div>
      {isEditable ? (
        <Button type="button" variant="default" size="sm" className="w-full lg:w-auto" onClick={onInclude}>
          <Plus className="mr-1 h-4 w-4" />
          Include in plan
        </Button>
      ) : null}
    </div>
  );
}
