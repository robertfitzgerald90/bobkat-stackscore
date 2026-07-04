"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
} from "lucide-react";
import { TechnologyProfileDetailView } from "@/components/technology-profile/technology-profile-detail";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TipRecommendationsStep } from "@/components/technology-improvement-plan/tip-recommendations-step";
import { TipReportPreview } from "@/components/technology-improvement-plan/tip-report-preview";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import {
  mergeRecommendationCatalog,
  validateTipSelection,
} from "@/lib/technology-improvement-plan/selection";
import {
  TIP_STEP_LABELS,
  TIP_WORKFLOW_STEPS,
  type TipPlanDetail,
  type TipWorkflowStep,
  type TipWizardState,
} from "@/lib/technology-improvement-plan/types";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TipWorkflowProps = {
  clientId: string;
  tipId: string;
  initialPlan: TipPlanDetail;
  isAdmin: boolean;
};

function visibleSteps(isAdmin: boolean): TipWorkflowStep[] {
  if (isAdmin) return TIP_WORKFLOW_STEPS;
  return TIP_WORKFLOW_STEPS.filter((step) => step !== "investment");
}

export function TipWorkflow({ clientId, tipId, initialPlan, isAdmin }: TipWorkflowProps) {
  const router = useRouter();
  const steps = useMemo(() => visibleSteps(isAdmin), [isAdmin]);
  const [plan, setPlan] = useState(initialPlan);
  const [activeStep, setActiveStep] = useState<TipWorkflowStep>(plan.currentStep);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!steps.includes(activeStep)) {
      setActiveStep(steps[0]);
    }
  }, [activeStep, steps]);

  const savePlan = async (patch: {
    currentStep?: TipWorkflowStep;
    wizardState?: Partial<TipWizardState> | TipWizardState;
    executiveSummary?: string;
  }) => {
    if (!plan.isEditable) return plan;
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/clients/${clientId}/tip/${tipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to save");
      }
      const body = (await response.json()) as { plan: TipPlanDetail };
      setPlan(body.plan);
      return body.plan;
    } finally {
      setSaving(false);
    }
  };

  const updateWizardState = (patch: Partial<TipWizardState>) => {
    setPlan((current) => ({
      ...current,
      wizardState: { ...current.wizardState, ...patch },
    }));
  };

  const goToStep = async (step: TipWorkflowStep) => {
    if (plan.isEditable) {
      await savePlan({ currentStep: step, wizardState: plan.wizardState });
    }
    setActiveStep(step);
  };

  const stepIndex = steps.indexOf(activeStep);
  const isFirst = stepIndex <= 0;
  const isLast = stepIndex >= steps.length - 1;

  const goNext = async () => {
    if (isLast) return;

    if (activeStep === "recommendations") {
      const seeds = mergeRecommendationCatalog(
        plan.recommendations,
        plan.excludedRecommendations,
        plan.deferredRecommendations,
      );
      const validationError = validateTipSelection(seeds, plan.wizardState);
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    await goToStep(steps[stepIndex + 1]);
  };

  const goBack = async () => {
    if (isFirst) return;
    await goToStep(steps[stepIndex - 1]);
  };

  const movePhase = (phaseId: string, direction: "up" | "down") => {
    const phases = [...plan.wizardState.roadmapPhases].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = phases.findIndex((phase) => phase.id === phaseId);
    if (index < 0) return;
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= phases.length) return;
    const reordered = [...phases];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    updateWizardState({
      roadmapPhases: reordered.map((phase, sortOrder) => ({ ...phase, sortOrder })),
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await savePlan({
        currentStep: "complete",
        wizardState: plan.wizardState,
        executiveSummary:
          plan.executiveSummary ??
          plan.wizardState.executiveSummary ??
          plan.wizardState.globalExecutiveNotes,
      });
      const response = await fetch(`/api/v1/clients/${clientId}/tip/${tipId}/generate`, {
        method: "POST",
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to generate plan");
      }
      const body = (await response.json()) as { plan: TipPlanDetail };
      setPlan(body.plan);
      setActiveStep("complete");
      toast.success("Technology Improvement Plan generated");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const downloadUrl = `/api/v1/clients/${clientId}/tip/${tipId}/pdf`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="page-title">{plan.title}</h2>
          <p className="page-description">
            {plan.clientName}
            {plan.assessmentName ? ` · ${plan.assessmentName}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={plan.status === "generated" ? "success" : "secondary"}>
              {plan.status === "generated" ? `Generated v${plan.version}` : "Draft"}
            </Badge>
            {saving ? (
              <Badge variant="outline">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Saving
              </Badge>
            ) : null}
          </div>
        </div>
        {plan.status === "generated" ? (
          <a href={downloadUrl} className={buttonClassName({ variant: "default" })}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </a>
        ) : null}
      </div>

      <nav className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <button
            key={step}
            type="button"
            onClick={() => goToStep(step)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              activeStep === step
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            {index + 1}. {TIP_STEP_LABELS[step]}
          </button>
        ))}
      </nav>

      {activeStep === "profile" && plan.profile ? (
        <TechnologyProfileDetailView detail={plan.profile} />
      ) : null}

      {activeStep === "recommendations" ? (
        <TipRecommendationsStep
          plan={plan}
          isEditable={plan.isEditable}
          onPlanChange={setPlan}
          onPersist={async (wizardState) => {
            const saved = await savePlan({ wizardState });
            if (saved) setPlan(saved);
          }}
        />
      ) : null}

      {activeStep === "playbooks" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {plan.playbooks.map((playbook) => (
            <Card key={playbook.id}>
              <CardHeader>
                <CardTitle>{playbook.name}</CardTitle>
                <CardDescription>{playbook.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Effort:</span> {playbook.effortLevel} (
                  {playbook.estimatedEffortWeeks} weeks)
                </p>
                <p>
                  <span className="font-medium">Estimated profile improvement:</span> +
                  {playbook.estimatedImpactPoints} points
                </p>
                <div>
                  <p className="font-medium">Suggested services</p>
                  <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                    {playbook.services.map((service) => (
                      <li key={service}>{service}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Suggested technologies</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {playbook.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {activeStep === "investment" && isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Investment Review</CardTitle>
            <CardDescription>
              Internal pricing detail — excluded from client-facing PDFs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["laborCents", "Labor ($)"],
                  ["hardwareCents", "Hardware ($)"],
                  ["servicesCents", "Services ($)"],
                  ["marginPercent", "Margin (%)"],
                ] as const
              ).map(([field, label]) => (
                <div key={field}>
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    className="mt-1"
                    disabled={!plan.isEditable}
                    value={
                      field === "marginPercent"
                        ? plan.wizardState.investment.marginPercent
                        : plan.wizardState.investment[field] / 100
                    }
                    onChange={(event) => {
                      const raw = Number(event.target.value);
                      updateWizardState({
                        investment: {
                          ...plan.wizardState.investment,
                          [field]:
                            field === "marginPercent"
                              ? raw
                              : Math.round(raw * 100),
                        },
                      });
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryTile label="Subtotal" value={formatCurrency(plan.investmentInternal.subtotal)} />
              <SummaryTile
                label="Internal margin"
                value={formatCurrency(plan.investmentInternal.marginAmount)}
              />
              <SummaryTile
                label="Client investment"
                value={formatCurrency(plan.investmentInternal.clientTotal)}
                highlight
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeStep === "roadmap" ? (
        <div className="space-y-4">
          {plan.roadmapPhases.map((phase, index) => (
            <Card key={phase.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>{phase.label}</CardTitle>
                  <CardDescription>
                    Projected StackScore:{" "}
                    <span className={getScoreTextColorClass(phase.projectedScore)}>
                      {phase.projectedScore}
                    </span>{" "}
                    (+{phase.scoreDelta})
                  </CardDescription>
                </div>
                {plan.isEditable ? (
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => movePhase(phase.id, "up")}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={index === plan.roadmapPhases.length - 1}
                      onClick={() => movePhase(phase.id, "down")}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {phase.recommendations.map((rec) => (
                    <li key={rec.id}>{rec.title}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {activeStep === "preview" ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Report Preview</h3>
            <p className="text-sm text-muted-foreground">
              Executive-ready layout matching the generated PDF deliverable.
            </p>
          </div>
          <TipReportPreview
            plan={plan}
            isAdmin={isAdmin}
            isEditable={plan.isEditable}
            executiveSummary={
              plan.wizardState.executiveSummary ||
              plan.wizardState.globalExecutiveNotes ||
              plan.executiveSummary ||
              ""
            }
            onExecutiveSummaryChange={(value) => updateWizardState({ executiveSummary: value })}
          />
        </div>
      ) : null}

      {activeStep === "complete" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Generate Technology Improvement Plan
            </CardTitle>
            <CardDescription>
              Finalize the plan, save it to client history, and download the PDF deliverable.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan.status === "generated" ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Generated on{" "}
                  {plan.generatedAt ? new Date(plan.generatedAt).toLocaleString() : "—"}. The
                  document is saved to this client&apos;s history.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href={downloadUrl} className={buttonClassName({ variant: "default" })}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </a>
                  <Link
                    href={`/clients/${clientId}/roadmap`}
                    className={buttonClassName({ variant: "outline" })}
                  >
                    View Plan History
                  </Link>
                </div>
              </>
            ) : (
              <Button type="button" onClick={handleGenerate} disabled={generating || saving}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Generate Technology Improvement Plan"
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={goBack} disabled={isFirst || saving}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        {!isLast ? (
          <Button
            type="button"
            onClick={async () => {
              if (plan.isEditable) {
                await savePlan({ currentStep: activeStep, wizardState: plan.wizardState });
              }
              await goNext();
            }}
            disabled={saving}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : plan.status !== "generated" ? (
          <Button type="button" onClick={handleGenerate} disabled={generating || saving}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate Plan"
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn("rounded-md border p-4", highlight && "border-primary bg-primary/5")}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
