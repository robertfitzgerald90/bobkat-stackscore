"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRAND } from "@/lib/branding";
import {
  COMPANY_SIZE_OPTIONS,
  IT_MANAGEMENT_OPTIONS,
  SNAPSHOT_ANSWER_OPTIONS,
  SNAPSHOT_ESTIMATED_MINUTES,
  SNAPSHOT_QUESTIONS,
} from "@/lib/technology-snapshot/questions";
import type { SnapshotAnswerValue, SnapshotAnswers, SnapshotItManagementModel } from "@/lib/technology-snapshot/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SnapshotProgress } from "./snapshot-progress";
import {
  SnapshotResultsView,
  type SnapshotResultsPayload,
} from "./snapshot-results-view";

type IntakeForm = {
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  industry: string;
  companySize: string;
};

const EMPTY_INTAKE: IntakeForm = {
  contactName: "",
  companyName: "",
  email: "",
  phone: "",
  industry: "",
  companySize: "",
};

type WizardPhase = "intro" | "intake" | "qualifier" | "pillar" | "results";

export function TechnologySnapshotWizard() {
  const searchParams = useSearchParams();
  const prospectId = searchParams.get("prospectId") ?? undefined;
  const campaignId = searchParams.get("campaignId") ?? undefined;
  const invitationFlow = Boolean(prospectId || campaignId);

  const [phase, setPhase] = useState<WizardPhase>("intro");
  const [pillarIndex, setPillarIndex] = useState(0);
  const [intake, setIntake] = useState<IntakeForm>(EMPTY_INTAKE);
  const [itManagementModel, setItManagementModel] = useState<SnapshotItManagementModel | "">("");
  const [answers, setAnswers] = useState<Partial<SnapshotAnswers>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SnapshotResultsPayload | null>(null);

  const totalSteps = 1 + 1 + SNAPSHOT_QUESTIONS.length;
  const currentStep = useMemo(() => {
    if (phase === "intro") return 0;
    if (phase === "intake") return 1;
    if (phase === "qualifier") return 2;
    if (phase === "pillar") return 3 + pillarIndex;
    return totalSteps;
  }, [phase, pillarIndex, totalSteps]);

  const activeQuestion = phase === "pillar" ? SNAPSHOT_QUESTIONS[pillarIndex] : null;
  const activeAnswer = activeQuestion ? answers[activeQuestion.pillarCode] : undefined;

  function restart() {
    setPhase("intro");
    setPillarIndex(0);
    setIntake(EMPTY_INTAKE);
    setItManagementModel("");
    setAnswers({});
    setResult(null);
  }

  function validateIntake(): boolean {
    if (!intake.contactName.trim()) {
      toast.error("Contact name is required");
      return false;
    }
    if (!intake.companyName.trim()) {
      toast.error("Company name is required");
      return false;
    }
    if (!intake.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!intake.industry.trim()) {
      toast.error("Industry is required");
      return false;
    }
    return true;
  }

  async function submitSnapshot(finalAnswers: SnapshotAnswers) {
    setSubmitting(true);
    try {
      const response = await fetch("/api/v1/public/technology-snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...intake,
          phone: intake.phone || undefined,
          companySize: intake.companySize || undefined,
          itManagementModel,
          answers: finalAnswers,
          prospectId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Unable to submit snapshot");
        return;
      }

      setResult(data as SnapshotResultsPayload);
      setPhase("results");
    } catch {
      toast.error("Unable to submit snapshot");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (phase === "intro") {
      setPhase("intake");
      return;
    }

    if (phase === "intake") {
      if (!validateIntake()) return;
      setPhase("qualifier");
      return;
    }

    if (phase === "qualifier") {
      if (!itManagementModel) {
        toast.error("Please select how technology is managed");
        return;
      }
      setPillarIndex(0);
      setPhase("pillar");
      return;
    }

    if (phase === "pillar" && activeQuestion) {
      if (!activeAnswer) {
        toast.error("Please select an answer");
        return;
      }

      if (pillarIndex < SNAPSHOT_QUESTIONS.length - 1) {
        setPillarIndex((index) => index + 1);
        return;
      }

      void submitSnapshot(answers as SnapshotAnswers);
    }
  }

  function handleBack() {
    if (phase === "intake") {
      setPhase("intro");
      return;
    }
    if (phase === "qualifier") {
      setPhase("intake");
      return;
    }
    if (phase === "pillar") {
      if (pillarIndex > 0) {
        setPillarIndex((index) => index - 1);
      } else {
        setPhase("qualifier");
      }
    }
  }

  function selectAnswer(value: SnapshotAnswerValue) {
    if (!activeQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.pillarCode]: value,
    }));
  }

  const showProgress = phase !== "intro" && phase !== "results";
  const showNav = phase !== "results";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col items-center gap-3 text-center">
        <BrandLogo size={48} />
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Technology Snapshot
          </h1>
          <p className="text-sm text-muted-foreground">
            A quick health check from {BRAND.companyName}
          </p>
        </div>
      </header>

      {showProgress ? (
        <SnapshotProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
          className="mb-6"
        />
      ) : null}

      <div className="min-w-0 flex-1">
        {phase === "intro" ? (
          <Card className="shadow-sm">
            <CardHeader className="text-center">
              <CardTitle>See where your technology stands</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Answer a few guided questions across eight technology pillars and receive an
                immediate snapshot of your business technology health.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Estimated completion: under {SNAPSHOT_ESTIMATED_MINUTES} minutes</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• One focused question at a time</li>
                <li>• No login required</li>
                <li>• Instant results with next-step guidance</li>
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {phase === "intake" ? (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Tell us about your business</CardTitle>
              <CardDescription>
                We&apos;ll use this information to follow up with your snapshot results.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact name</Label>
                <Input
                  id="contactName"
                  required
                  autoComplete="name"
                  value={intake.contactName}
                  onChange={(event) =>
                    setIntake((prev) => ({ ...prev, contactName: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  required
                  autoComplete="organization"
                  value={intake.companyName}
                  onChange={(event) =>
                    setIntake((prev) => ({ ...prev, companyName: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={intake.email}
                    onChange={(event) =>
                      setIntake((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={intake.phone}
                    onChange={(event) =>
                      setIntake((prev) => ({ ...prev, phone: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    required
                    value={intake.industry}
                    onChange={(event) =>
                      setIntake((prev) => ({ ...prev, industry: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company size (optional)</Label>
                  <Select
                    value={intake.companySize || null}
                    onValueChange={(value) =>
                      setIntake((prev) => ({ ...prev, companySize: value ?? "" }))
                    }
                  >
                    <SelectTrigger id="companySize" className="!w-full min-w-0">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {phase === "qualifier" ? (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>How is technology managed?</CardTitle>
              <CardDescription>
                How is technology currently managed for your business?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {IT_MANAGEMENT_OPTIONS.map((option) => {
                const selected = itManagementModel === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    className="h-auto justify-start whitespace-normal px-4 py-3 text-left"
                    onClick={() => setItManagementModel(option.value)}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        ) : null}

        {phase === "pillar" && activeQuestion ? (
          <Card className="shadow-sm">
            <CardHeader className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                {activeQuestion.pillarName}
              </p>
              <CardTitle className="break-words text-lg leading-snug sm:text-xl">
                {activeQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {SNAPSHOT_ANSWER_OPTIONS.map((option) => {
                const selected = activeAnswer === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    className={cn(
                      "h-auto justify-start whitespace-normal px-4 py-3 text-left",
                      submitting && "pointer-events-none opacity-60",
                    )}
                    onClick={() => selectAnswer(option.value)}
                    disabled={submitting}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        ) : null}

        {phase === "results" && result ? (
          <SnapshotResultsView
            companyName={intake.companyName}
            result={result}
            onRestart={restart}
            invitationFlow={invitationFlow}
          />
        ) : null}
      </div>

      {showNav ? (
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {phase !== "intro" ? (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleBack}
              disabled={submitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div className="hidden sm:block" />
          )}
          <Button
            type="button"
            className="w-full sm:ml-auto sm:w-auto"
            onClick={handleNext}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating results…
              </>
            ) : phase === "intro" ? (
              <>
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : phase === "pillar" && pillarIndex === SNAPSHOT_QUESTIONS.length - 1 ? (
              "View my results"
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      ) : null}

      <footer className="mt-8 text-center text-xs text-muted-foreground">
        Powered by {BRAND.companyName} · {BRAND.productName}
      </footer>
    </div>
  );
}
