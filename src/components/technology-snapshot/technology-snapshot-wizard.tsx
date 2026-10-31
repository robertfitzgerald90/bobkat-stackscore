"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock, Shield } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SnapshotProgress } from "@/components/technology-snapshot/snapshot-progress";
import { SnapshotResultsDashboard } from "@/components/technology-snapshot/snapshot-results-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  trackCompleteTechnologySnapshot,
  trackStartTechnologySnapshot,
  trackViewTechnologySnapshot,
} from "@/lib/analytics/ga4-events";
import { trackSnapshotStart } from "@/lib/analytics/marketing-events";
import { BRAND } from "@/lib/branding";
import { MARKETING_PANEL } from "@/lib/marketing/tokens";
import {
  COMPANY_SIZE_OPTIONS,
  IT_MANAGEMENT_OPTIONS,
} from "@/lib/technology-snapshot/questions";
import {
  SNAPSHOT_ANSWER_OPTIONS_V2,
  SNAPSHOT_CATEGORIES_V2,
  SNAPSHOT_QUESTIONS_V2,
  SNAPSHOT_V2_ESTIMATED_MINUTES,
  getSnapshotCategoryV2,
} from "@/lib/technology-snapshot/catalog-v2";
import {
  IT_MANAGEMENT_LABELS,
  SNAPSHOT_OFFICIAL_DISCLAIMER,
} from "@/lib/technology-snapshot/display";
import {
  buildSnapshotFindingsV2,
  type SnapshotAnswersV2,
  type SnapshotFindingsV2,
} from "@/lib/technology-snapshot/engine";
import {
  clearSnapshotSession,
  createEmptySessionState,
  loadSnapshotSession,
  saveSnapshotSession,
  type SnapshotBusinessContext,
  type SnapshotSessionState,
} from "@/lib/technology-snapshot/session-state";
import type { SnapshotAnswerValue, SnapshotItManagementModel } from "@/lib/technology-snapshot/types";
import { cn } from "@/lib/utils";

type WizardPhase = SnapshotSessionState["phase"];

function StepActions({
  showBack = true,
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
}: {
  showBack?: boolean;
  onBack: () => void;
  onNext: () => void;
  nextLabel: React.ReactNode;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      {showBack ? (
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      ) : null}
      <Button
        type="button"
        className={cn("w-full sm:w-auto", !showBack && "sm:ml-auto")}
        onClick={onNext}
        disabled={nextDisabled}
      >
        {nextLabel}
      </Button>
    </div>
  );
}

export function TechnologySnapshotWizard() {
  const searchParams = useSearchParams();
  const prospectId = searchParams.get("prospectId") ?? undefined;
  const campaignId = searchParams.get("campaignId") ?? undefined;
  const invitationFlow = Boolean(prospectId || campaignId);

  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<WizardPhase>("welcome");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [context, setContext] = useState<SnapshotBusinessContext>({
    companyName: "",
    industry: "",
    companySize: "",
    itManagementModel: "",
  });
  const [answers, setAnswers] = useState<Partial<SnapshotAnswersV2>>({});
  const [findings, setFindings] = useState<SnapshotFindingsV2 | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    trackViewTechnologySnapshot("/technology-snapshot");
    const saved = loadSnapshotSession();
    if (saved) {
      setPhase(saved.phase === "results" ? "questions" : saved.phase);
      // Do not auto-restore into results without recomputing from answers.
      setQuestionIndex(saved.questionIndex);
      setContext(saved.context);
      setAnswers(saved.answers);
      if (saved.phase === "results" && Object.keys(saved.answers).length === SNAPSHOT_QUESTIONS_V2.length) {
        try {
          const rebuilt = buildSnapshotFindingsV2(saved.answers as SnapshotAnswersV2);
          setFindings(rebuilt);
          setPhase("results");
        } catch {
          setPhase("questions");
        }
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSnapshotSession({
      version: 2,
      phase,
      questionIndex,
      context,
      answers,
      completedAt: findings?.scoredAt,
    });
  }, [hydrated, phase, questionIndex, context, answers, findings]);

  const totalQuestionSteps = SNAPSHOT_QUESTIONS_V2.length;
  const progressStep = useMemo(() => {
    if (phase === "welcome") return 0;
    if (phase === "context") return 1;
    if (phase === "questions") return 2 + questionIndex;
    return 2 + totalQuestionSteps;
  }, [phase, questionIndex, totalQuestionSteps]);
  const progressTotal = 2 + totalQuestionSteps;

  const activeQuestion = phase === "questions" ? SNAPSHOT_QUESTIONS_V2[questionIndex] : null;
  const activeCategory = activeQuestion
    ? getSnapshotCategoryV2(activeQuestion.categoryId)
    : null;
  const activeAnswer = activeQuestion ? answers[activeQuestion.id] : undefined;

  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackStartTechnologySnapshot({ startMethod: "start_button" });
    trackSnapshotStart({
      trigger: "wizard_begin",
      placement: "technology_snapshot_welcome",
      hasInvitationFlow: invitationFlow,
    });
  }

  function restart() {
    clearSnapshotSession();
    setPhase("welcome");
    setQuestionIndex(0);
    setContext(createEmptySessionState().context);
    setAnswers({});
    setFindings(null);
    startedRef.current = false;
  }

  function finishQuestionnaire() {
    const complete = SNAPSHOT_QUESTIONS_V2.every((q) => answers[q.id]);
    if (!complete) return;
    const result = buildSnapshotFindingsV2(answers as SnapshotAnswersV2);
    setFindings(result);
    setPhase("results");
    trackCompleteTechnologySnapshot("/technology-snapshot");
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-muted-foreground">
        Loading Snapshot…
      </div>
    );
  }

  if (phase === "results" && findings) {
    return (
      <div className="px-4 py-10 sm:px-6 sm:py-14">
        <SnapshotResultsDashboard
          findings={findings}
          context={context}
          answers={answers as SnapshotAnswersV2}
          prospectId={prospectId}
          campaignId={campaignId}
          invitationFlow={invitationFlow}
          onRestart={restart}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex flex-col items-center text-center">
        <BrandLogo size={40} variant="stacked" placement="auth" className="mb-4" />
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Free Technology Snapshot
        </p>
      </div>

      {phase !== "welcome" ? (
        <SnapshotProgress
          currentStep={Math.max(1, progressStep)}
          totalSteps={progressTotal}
          className="mb-6"
        />
      ) : null}

      <div className={cn(MARKETING_PANEL, "p-5 sm:p-8")}>
        {phase === "welcome" ? (
          <div className="space-y-5">
            <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              See where your technology stands — in about {SNAPSHOT_V2_ESTIMATED_MINUTES} minutes
            </h1>
            <p className="text-pretty text-muted-foreground">
              Answer {SNAPSHOT_QUESTIONS_V2.length} practical questions about security, devices,
              backups, and planning. You’ll get an indicative posture dashboard immediately — no
              email, phone, or account required.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                About {SNAPSHOT_V2_ESTIMATED_MINUTES} minutes · one question at a time
              </li>
              <li className="flex gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                Anonymous until you choose to save or request follow-up
              </li>
            </ul>
            <div className="rounded-lg border border-border/60 bg-background/40 p-3 text-xs text-muted-foreground">
              {SNAPSHOT_OFFICIAL_DISCLAIMER} The full {BRAND.productName} assessment is a separate,
              deeper evaluation.
            </div>
            <div className="rounded-lg border border-border/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Categories covered
              </p>
              <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                {SNAPSHOT_CATEGORIES_V2.map((c) => (
                  <li key={c.id}>{c.name}</li>
                ))}
              </ul>
            </div>
            <StepActions
              showBack={false}
              onBack={() => undefined}
              onNext={() => {
                markStarted();
                setPhase("context");
              }}
              nextLabel={
                <>
                  Start Free Snapshot
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              }
            />
          </div>
        ) : null}

        {phase === "context" ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold">Business context</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Optional details help frame your results. Nothing here identifies you personally.
              </p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ctx-company">Company name (optional)</Label>
                <Input
                  id="ctx-company"
                  value={context.companyName}
                  onChange={(e) => setContext((c) => ({ ...c, companyName: e.target.value }))}
                  autoComplete="organization"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ctx-industry">Industry (optional)</Label>
                <Input
                  id="ctx-industry"
                  value={context.industry}
                  onChange={(e) => setContext((c) => ({ ...c, industry: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ctx-size">Approximate company size (optional)</Label>
                <Select
                  value={context.companySize || undefined}
                  items={Object.fromEntries(COMPANY_SIZE_OPTIONS.map((size) => [size, size]))}
                  onValueChange={(value) =>
                    setContext((c) => ({ ...c, companySize: value ?? "" }))
                  }
                >
                  <SelectTrigger id="ctx-size" className="h-10 w-full min-w-0">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger className="min-w-(--anchor-width)">
                    {COMPANY_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ctx-it">How is IT managed? (optional)</Label>
                <Select
                  value={context.itManagementModel || undefined}
                  items={IT_MANAGEMENT_LABELS}
                  onValueChange={(value) =>
                    setContext((c) => ({
                      ...c,
                      itManagementModel: (value ?? "") as SnapshotItManagementModel | "",
                    }))
                  }
                >
                  <SelectTrigger
                    id="ctx-it"
                    className="h-auto min-h-10 w-full min-w-0 py-2.5 whitespace-normal"
                  >
                    <SelectValue placeholder="Select how IT is managed" />
                  </SelectTrigger>
                  <SelectContent
                    align="start"
                    alignItemWithTrigger
                    className="min-w-(--anchor-width) max-w-[min(100vw-2rem,28rem)]"
                  >
                    {IT_MANAGEMENT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} multiline>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <StepActions
              onBack={() => setPhase("welcome")}
              onNext={() => {
                setQuestionIndex(0);
                setPhase("questions");
              }}
              nextLabel={
                <>
                  Continue to questions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              }
            />
          </div>
        ) : null}

        {phase === "questions" && activeQuestion && activeCategory ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {activeCategory.name}
                </p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  Question {questionIndex + 1} of {totalQuestionSteps}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{activeCategory.description}</p>
              <h2 className="text-balance text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
                {activeQuestion.question}
              </h2>
              {activeQuestion.helpText ? (
                <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {activeQuestion.helpText}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2.5" role="radiogroup" aria-label="Answer">
              {SNAPSHOT_ANSWER_OPTIONS_V2.map((option) => {
                const selected = activeAnswer === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition",
                      selected
                        ? "border-primary bg-primary/20 text-foreground shadow-[inset_0_0_0_1px_rgba(168,85,247,0.35)]"
                        : "border-border/70 bg-background/40 text-muted-foreground hover:border-primary/45 hover:bg-primary/5 hover:text-foreground",
                    )}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [activeQuestion.id]: option.value as SnapshotAnswerValue,
                      }))
                    }
                  >
                    <span>{option.label}</span>
                    {selected ? (
                      <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    ) : (
                      <span
                        className="h-4 w-4 shrink-0 rounded-full border border-border/80"
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <StepActions
              onBack={() => {
                if (questionIndex === 0) {
                  setPhase("context");
                  return;
                }
                setQuestionIndex((i) => i - 1);
              }}
              onNext={() => {
                if (!activeAnswer) return;
                if (questionIndex >= totalQuestionSteps - 1) {
                  finishQuestionnaire();
                  return;
                }
                setQuestionIndex((i) => i + 1);
              }}
              nextDisabled={!activeAnswer}
              nextLabel={
                questionIndex >= totalQuestionSteps - 1 ? (
                  <>
                    See my results
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
