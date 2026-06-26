"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { AssessmentScorePanel } from "@/components/assessments/assessment-score-panel";
import { AssessmentProgressBar } from "@/components/assessments/assessment-progress-bar";
import { formatAssessmentCompletionDate } from "@/lib/assessments/display";
import { toast } from "sonner";
import type { AssessmentPreview } from "@/types/assessment-preview";
import { cn } from "@/lib/utils";

type AnswerOption = {
  id: string;
  answerText: string;
  scoreValue: number;
  triggersCriticalFlag: boolean;
  triggersRecommendation: boolean;
};

type QuestionResponse = {
  selectedAnswerOptionId: string;
  notes: string | null;
  evidence: string | null;
};

type PreviousQuestionResponse = {
  selectedAnswerOptionId: string;
  answerText: string;
  scoreEarned: number;
  notes: string | null;
};

type Question = {
  id: string;
  code: string;
  v2QuestionId: string | null;
  capability: string | null;
  questionText: string;
  helpText: string | null;
  purpose: string | null;
  evidenceRequired: string | null;
  weight: number;
  answerOptions: AnswerOption[];
  response: QuestionResponse | null;
  previousResponse: PreviousQuestionResponse | null;
};

type Category = {
  id: string;
  code: string;
  name: string;
  maxPoints: number;
  questions: Question[];
};

type AssessmentWizardProps = {
  assessmentId: string;
  assessmentName: string;
  clientName: string;
};

export function AssessmentWizard({
  assessmentId,
  assessmentName,
  clientName,
}: AssessmentWizardProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [preview, setPreview] = useState<AssessmentPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [reassessmentInfo, setReassessmentInfo] = useState<{
    sourceAssessmentName: string | null;
    sourceCompletedAt: string | null;
  } | null>(null);
  const notesTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const loadQuestions = useCallback(async () => {
    const response = await fetch(`/api/v1/assessments/${assessmentId}/questions`);
    if (response.ok) {
      const data = await response.json();
      setCategories(data.categories);
      setPreview(data.preview);
      setReassessmentInfo(data.reassessment ?? null);
      setActiveCategoryId((current) => current || data.categories[0]?.id || "");
    }
    setLoading(false);
  }, [assessmentId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    const timers = notesTimers.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
    };
  }, []);

  const activeCategory = categories.find((category) => category.id === activeCategoryId);
  const answeredCount = preview?.answeredCount ?? 0;
  const totalCount = preview?.totalCount ?? 0;

  const flatQuestions = useMemo(
    () =>
      categories.flatMap((category) =>
        category.questions.map((question) => ({ category, question })),
      ),
    [categories],
  );

  const currentFlatIndex = useMemo(() => {
    if (!activeCategory) return 0;
    const categoryStart = categories.findIndex((c) => c.id === activeCategoryId);
    let index = 0;
    for (let i = 0; i < categoryStart; i++) {
      index += categories[i]?.questions.length ?? 0;
    }
    return index + activeQuestionIndex;
  }, [activeCategory, activeCategoryId, activeQuestionIndex, categories]);

  function navigateToFlatIndex(targetIndex: number) {
    if (targetIndex < 0 || targetIndex >= flatQuestions.length) return;
    const entry = flatQuestions[targetIndex];
    setActiveCategoryId(entry.category.id);
    const questionIndex = entry.category.questions.findIndex((q) => q.id === entry.question.id);
    setActiveQuestionIndex(Math.max(0, questionIndex));
  }

  function handleCategorySelect(categoryId: string) {
    setActiveCategoryId(categoryId);
    setActiveQuestionIndex(0);
  }

  function updateQuestionResponse(
    questionId: string,
    categoryId: string,
    response: QuestionResponse,
  ) {
    setCategories((prev) =>
      prev.map((category) =>
        category.id !== categoryId
          ? category
          : {
              ...category,
              questions: category.questions.map((question) =>
                question.id === questionId ? { ...question, response } : question,
              ),
            },
      ),
    );
  }

  async function saveAnswer(
    questionId: string,
    categoryId: string,
    answerOptionId: string,
    existingNotes?: string | null,
  ) {
    setSaving(true);
    setSavingQuestionId(questionId);
    updateQuestionResponse(questionId, categoryId, {
      selectedAnswerOptionId: answerOptionId,
      notes: existingNotes ?? null,
      evidence: null,
    });

    const response = await fetch(
      `/api/v1/assessments/${assessmentId}/responses/${questionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedAnswerOptionId: answerOptionId,
          notes: existingNotes ?? undefined,
        }),
      },
    );

    setSaving(false);
    setSavingQuestionId(null);

    if (response.ok) {
      const data = await response.json();
      if (data.preview) setPreview(data.preview);
      updateQuestionResponse(questionId, categoryId, {
        selectedAnswerOptionId: data.selectedAnswerOptionId,
        notes: data.notes,
        evidence: data.evidence,
      });
      return;
    }

    toast.error("Failed to save answer");
    await loadQuestions();
  }

  function handleNotesChange(questionId: string, categoryId: string, notes: string) {
    setCategories((prev) =>
      prev.map((category) =>
        category.id !== categoryId
          ? category
          : {
              ...category,
              questions: category.questions.map((question) =>
                question.id === questionId && question.response
                  ? { ...question, response: { ...question.response, notes } }
                  : question,
              ),
            },
      ),
    );

    const existingTimer = notesTimers.current.get(questionId);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(async () => {
      notesTimers.current.delete(questionId);
      setSaving(true);

      const response = await fetch(
        `/api/v1/assessments/${assessmentId}/responses/${questionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        },
      );

      setSaving(false);

      if (!response.ok) {
        toast.error("Failed to save notes");
      }
    }, 600);

    notesTimers.current.set(questionId, timer);
  }

  function handleEvidenceChange(questionId: string, categoryId: string, evidence: string) {
    setCategories((prev) =>
      prev.map((category) =>
        category.id !== categoryId
          ? category
          : {
              ...category,
              questions: category.questions.map((question) =>
                question.id === questionId && question.response
                  ? { ...question, response: { ...question.response, evidence } }
                  : question,
              ),
            },
      ),
    );

    const existingTimer = notesTimers.current.get(`evidence-${questionId}`);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(async () => {
      notesTimers.current.delete(`evidence-${questionId}`);
      setSaving(true);

      const response = await fetch(
        `/api/v1/assessments/${assessmentId}/responses/${questionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ evidence }),
        },
      );

      setSaving(false);
      if (!response.ok) toast.error("Failed to save evidence");
    }, 600);

    notesTimers.current.set(`evidence-${questionId}`, timer);
  }

  async function completeAssessment() {
    setCompleting(true);
    const response = await fetch(`/api/v1/assessments/${assessmentId}/complete`, {
      method: "POST",
    });
    setCompleting(false);

    if (response.ok) {
      const result = (await response.json()) as { recommendationCount?: number };
      const count = result.recommendationCount ?? 0;
      toast.success(
        count > 0
          ? `Assessment completed — ${count} recommendation${count === 1 ? "" : "s"} generated`
          : "Assessment completed",
      );
      router.push(
        reassessmentInfo
          ? `/assessments/${assessmentId}/improvement`
          : `/assessments/${assessmentId}/results`,
      );
      router.refresh();
      return;
    }

    const error = await response.json();
    toast.error(error.error ?? "Failed to complete assessment");
  }

  function getCategoryProgress(category: Category) {
    const answered = category.questions.filter((q) => q.response).length;
    return { answered, total: category.questions.length };
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading assessment...</p>
      </div>
    );
  }

  const activeQuestion = activeCategory?.questions[activeQuestionIndex];

  return (
    <div className="space-y-6">
      <AssessmentProgressBar answeredCount={answeredCount} totalCount={totalCount} />
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{clientName}</p>
          <h2 className="page-title">{assessmentName}</h2>
          {reassessmentInfo ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Reassessment · baseline: {reassessmentInfo.sourceAssessmentName}
              {reassessmentInfo.sourceCompletedAt
                ? ` (${formatAssessmentCompletionDate(reassessmentInfo.sourceCompletedAt)})`
                : ""}
            </p>
          ) : null}
          <p className="mt-1 text-muted-foreground">
            {answeredCount} of {totalCount} questions answered
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            In progress — auto-saves after each answer. Close and return anytime to resume.
          </p>
        </div>
        <Button
          onClick={completeAssessment}
          disabled={completing || answeredCount < totalCount}
          size="lg"
          className="w-full sm:w-auto"
        >
          {completing ? "Completing..." : "Complete Assessment"}
        </Button>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="order-2 min-w-0 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:order-1">
          <div className="lg:hidden">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Category
            </p>
            <div className="-mx-1 overflow-x-auto pb-1">
              <div className="flex gap-2 px-1">
                {categories.map((category) => {
                  const progress = getCategoryProgress(category);
                  const isActive = category.id === activeCategoryId;
                  const isComplete = progress.answered === progress.total;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategorySelect(category.id)}
                      className={cn(
                        "flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-left text-sm transition-colors",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:bg-muted",
                      )}
                    >
                      {isComplete ? (
                        <CheckCircle2
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-primary-foreground" : "text-primary",
                          )}
                        />
                      ) : (
                        <Circle
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-primary-foreground/70" : "text-muted-foreground",
                          )}
                        />
                      )}
                      <span className="max-w-[140px] truncate">{category.name}</span>
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          isActive ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {progress.answered}/{progress.total}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <Card className="hidden h-fit lg:sticky lg:top-6 lg:block">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-2 pt-0">
              {categories.map((category) => {
                const progress = getCategoryProgress(category);
                const isActive = category.id === activeCategoryId;
                const isComplete = progress.answered === progress.total;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategorySelect(category.id)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle2
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          isActive ? "text-primary-foreground" : "text-primary",
                        )}
                      />
                    ) : (
                      <Circle
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          isActive ? "text-primary-foreground/70" : "text-muted-foreground",
                        )}
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block leading-snug">{category.name}</span>
                      <span
                        className={cn(
                          "text-xs",
                          isActive ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {progress.answered}/{progress.total}
                      </span>
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <div className="min-w-0 space-y-4">
            {activeCategory && activeQuestion ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">{activeCategory.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Question {currentFlatIndex + 1} of {flatQuestions.length} ·{" "}
                      {activeCategory.maxPoints} max category points
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentFlatIndex === 0}
                      onClick={() => navigateToFlatIndex(currentFlatIndex - 1)}
                      aria-label="Previous question"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentFlatIndex >= flatQuestions.length - 1}
                      onClick={() => navigateToFlatIndex(currentFlatIndex + 1)}
                      aria-label="Next question"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Card
                  key={activeQuestion.id}
                  className={cn(
                    activeQuestion.response && "border-primary/30",
                    savingQuestionId === activeQuestion.id && "opacity-80",
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {activeQuestion.code}
                      </Badge>
                      {activeQuestion.v2QuestionId ? (
                        <Badge variant="secondary" className="font-mono text-xs">
                          {activeQuestion.v2QuestionId}
                        </Badge>
                      ) : null}
                      {activeQuestion.capability ? (
                        <Badge variant="secondary" className="text-xs">
                          {activeQuestion.capability}
                        </Badge>
                      ) : null}
                      <Badge variant="outline" className="ml-auto shrink-0">
                        {activeQuestion.weight} pts
                      </Badge>
                    </div>
                    <CardTitle className="text-base leading-snug pt-2">
                      {activeQuestion.questionText}
                    </CardTitle>
                    {activeQuestion.helpText ? (
                      <CardDescription>{activeQuestion.helpText}</CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeQuestion.previousResponse ? (
                      <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Previous Answer
                        </p>
                        <p className="mt-1">{activeQuestion.previousResponse.answerText}</p>
                        {activeQuestion.response &&
                        activeQuestion.response.selectedAnswerOptionId !==
                          activeQuestion.previousResponse.selectedAnswerOptionId ? (
                          <Badge variant="warning" className="mt-2 text-xs">
                            Changed from previous
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            Unchanged from previous
                          </Badge>
                        )}
                      </div>
                    ) : null}
                    <div className="flex flex-col gap-2">
                      {activeQuestion.answerOptions.map((option) => {
                        const selected =
                          activeQuestion.response?.selectedAnswerOptionId === option.id;
                        return (
                          <Button
                            key={option.id}
                            variant={selected ? "default" : "outline"}
                            className={cn(
                              "h-auto justify-start whitespace-normal px-4 py-3 text-left",
                              option.triggersCriticalFlag &&
                                !selected &&
                                "border-destructive/40",
                              option.triggersRecommendation &&
                                !selected &&
                                "border-amber-500/40",
                            )}
                            onClick={() =>
                              saveAnswer(
                                activeQuestion.id,
                                activeCategory.id,
                                option.id,
                                activeQuestion.response?.notes,
                              )
                            }
                            disabled={savingQuestionId === activeQuestion.id}
                          >
                            <span className="flex w-full items-center justify-between gap-2">
                              <span>{option.answerText}</span>
                              <span className="flex shrink-0 gap-1">
                                {option.triggersRecommendation ? (
                                  <Badge variant="secondary" className="text-xs">
                                    Rec
                                  </Badge>
                                ) : null}
                                {option.triggersCriticalFlag ? (
                                  <Badge variant="destructive" className="text-xs">
                                    Critical
                                  </Badge>
                                ) : null}
                              </span>
                            </span>
                          </Button>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`notes-${activeQuestion.id}`}>Assessor Notes</Label>
                      <textarea
                        id={`notes-${activeQuestion.id}`}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={
                          activeQuestion.response
                            ? "Add observations, context, or discussion points..."
                            : "Select an answer first to add notes"
                        }
                        value={activeQuestion.response?.notes ?? ""}
                        disabled={!activeQuestion.response}
                        onChange={(event) =>
                          handleNotesChange(
                            activeQuestion.id,
                            activeCategory.id,
                            event.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`evidence-${activeQuestion.id}`}>
                        Evidence
                        {activeQuestion.evidenceRequired ? (
                          <span className="ml-1 font-normal text-muted-foreground">
                            — {activeQuestion.evidenceRequired}
                          </span>
                        ) : null}
                      </Label>
                      <textarea
                        id={`evidence-${activeQuestion.id}`}
                        className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={
                          activeQuestion.response
                            ? "Document verification source, screenshot reference, or system report..."
                            : "Select an answer first to add evidence"
                        }
                        value={activeQuestion.response?.evidence ?? ""}
                        disabled={!activeQuestion.response}
                        onChange={(event) =>
                          handleEvidenceChange(
                            activeQuestion.id,
                            activeCategory.id,
                            event.target.value,
                          )
                        }
                      />
                    </div>

                    {activeQuestion.response ? (
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentFlatIndex >= flatQuestions.length - 1}
                          onClick={() => navigateToFlatIndex(currentFlatIndex + 1)}
                        >
                          Next Question
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </>
            ) : (
              <p className="text-muted-foreground">Select a category to begin.</p>
            )}
          </div>
        </div>

        <aside className="order-1 min-w-0 xl:order-2">
          <AssessmentScorePanel preview={preview} saving={saving} />
        </aside>
      </div>
    </div>
  );
}
