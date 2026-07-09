"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { isConsultantMode } from "@/lib/navigation/portal-mode";
import { cn } from "@/lib/utils";

type ReviewQuestion = {
  id: string;
  code: string;
  v2QuestionId: string | null;
  questionText: string;
  answerOptions: Array<{ id: string; answerText: string }>;
  response: {
    selectedAnswerOptionId: string;
    notes: string | null;
    evidence: string | null;
  } | null;
};

type ReviewCategory = {
  id: string;
  name: string;
  questions: ReviewQuestion[];
};

type AssessmentConsultantReviewProps = {
  assessmentId: string;
  userRole: string;
  customerSelfAssessment: boolean;
};

function QuestionReviewCard({
  question,
  customerSelfAssessment,
}: {
  question: ReviewQuestion;
  customerSelfAssessment: boolean;
}) {
  const [open, setOpen] = useState(false);
  const response = question.response;
  if (!response) return null;

  const answerText =
    question.answerOptions.find((o) => o.id === response.selectedAnswerOptionId)?.answerText ??
    "—";

  const customerNotes = customerSelfAssessment ? response.notes : null;
  const consultantNotes = customerSelfAssessment ? response.evidence : response.notes;
  const evidence = customerSelfAssessment ? null : response.evidence;

  return (
    <div className="rounded-lg border border-border/60">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-muted/30"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {question.v2QuestionId ?? question.code}
            </Badge>
          </div>
          <p className="mt-1 text-sm font-medium leading-snug">{question.questionText}</p>
        </div>
        {open ? (
          <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open ? (
        <div className="space-y-4 border-t border-border/60 px-4 py-4">
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Customer Response
            </Label>
            <p className="mt-1 text-sm">{answerText}</p>
          </div>

          {customerNotes ? (
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Customer Notes
              </Label>
              <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted/30 px-3 py-2 text-sm">
                {customerNotes}
              </p>
            </div>
          ) : null}

          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Consultant Notes
            </Label>
            <p
              className={cn(
                "mt-1 whitespace-pre-wrap rounded-md px-3 py-2 text-sm",
                consultantNotes ? "bg-muted/30" : "text-muted-foreground italic",
              )}
            >
              {consultantNotes ?? "None recorded"}
            </p>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Evidence
            </Label>
            <p
              className={cn(
                "mt-1 whitespace-pre-wrap rounded-md px-3 py-2 text-sm",
                evidence ? "bg-muted/30" : "text-muted-foreground italic",
              )}
            >
              {evidence ?? "None recorded"}
            </p>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Attachments
            </Label>
            <p className="mt-1 text-sm italic text-muted-foreground">No attachments uploaded</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-dashed border-border/60 px-3 py-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Recommendation Override
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Manage in the Recommendations section below.
              </p>
            </div>
            <div className="rounded-md border border-dashed border-border/60 px-3 py-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Risk Override
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Risk overrides are recorded during consultant review workflows.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AssessmentConsultantReview({
  assessmentId,
  userRole,
  customerSelfAssessment,
}: AssessmentConsultantReviewProps) {
  const [categories, setCategories] = useState<ReviewCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch(`/api/v1/assessments/${assessmentId}/questions`);
    if (response.ok) {
      const data = await response.json();
      setCategories(data.categories);
    }
    setLoading(false);
  }, [assessmentId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!isConsultantMode(userRole)) return null;

  const answeredCount = categories.reduce(
    (count, category) => count + category.questions.filter((q) => q.response).length,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Consultant Response Review</CardTitle>
        <CardDescription>
          Customer answers, notes, and consultant evidence for {answeredCount} responded
          questions. Internal fields are not visible to customers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading responses...
          </div>
        ) : answeredCount === 0 ? (
          <p className="text-sm text-muted-foreground">No responses recorded for this assessment.</p>
        ) : (
          categories.map((category) => {
            const answered = category.questions.filter((q) => q.response);
            if (answered.length === 0) return null;
            return (
              <div key={category.id} className="space-y-2">
                <p className="text-sm font-semibold">{category.name}</p>
                {answered.map((question) => (
                  <QuestionReviewCard
                    key={question.id}
                    question={question}
                    customerSelfAssessment={customerSelfAssessment}
                  />
                ))}
              </div>
            );
          })
        )}
        <p className="text-xs text-muted-foreground">
          Recommendation and risk overrides are managed from the{" "}
          <Link href="#assessment-recommendations" className="text-primary hover:underline">
            recommendations section
          </Link>{" "}
          on this page.
        </p>
      </CardContent>
    </Card>
  );
}
