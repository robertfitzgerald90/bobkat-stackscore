"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type AnswerOption = {
  id: string;
  answerText: string;
  scoreValue: number;
};

type Question = {
  id: string;
  code: string;
  questionText: string;
  weight: number;
  answerOptions: AnswerOption[];
  response: { selectedAnswerOptionId: string } | null;
};

type Category = {
  id: string;
  name: string;
  questions: Question[];
};

export function AssessmentWizard({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewScore, setPreviewScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const loadQuestions = useCallback(async () => {
    const response = await fetch(`/api/v1/assessments/${assessmentId}/questions`);
    if (response.ok) {
      const data = await response.json();
      setCategories(data.categories);
    }
    setLoading(false);
  }, [assessmentId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const answeredCount = categories.reduce(
    (sum, category) =>
      sum + category.questions.filter((question) => question.response).length,
    0,
  );
  const totalCount = categories.reduce((sum, category) => sum + category.questions.length, 0);

  async function saveAnswer(questionId: string, answerOptionId: string) {
    const response = await fetch(
      `/api/v1/assessments/${assessmentId}/responses/${questionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedAnswerOptionId: answerOptionId }),
      },
    );

    if (response.ok) {
      const data = await response.json();
      if (data.preview?.overallScore !== undefined) {
        setPreviewScore(data.preview.overallScore);
      }
      await loadQuestions();
    }
  }

  async function completeAssessment() {
    setCompleting(true);
    const response = await fetch(`/api/v1/assessments/${assessmentId}/complete`, {
      method: "POST",
    });
    setCompleting(false);

    if (response.ok) {
      toast.success("Assessment completed");
      router.push(`/assessments/${assessmentId}/results`);
      router.refresh();
      return;
    }

    const error = await response.json();
    toast.error(error.error ?? "Failed to complete assessment");
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading assessment...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Assessment</h2>
          <p className="text-muted-foreground">
            {answeredCount} of {totalCount} questions answered
          </p>
        </div>
        <div className="flex items-center gap-3">
          {previewScore !== null ? (
            <Badge variant="secondary">Preview Score: {previewScore}</Badge>
          ) : null}
          <Button
            onClick={completeAssessment}
            disabled={completing || answeredCount < totalCount}
          >
            {completing ? "Completing..." : "Complete Assessment"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue={categories[0]?.id}>
        <TabsList className="flex h-auto flex-wrap justify-start">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            {category.questions.map((question) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {question.code}. {question.questionText}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {question.answerOptions.map((option) => (
                    <Button
                      key={option.id}
                      variant={
                        question.response?.selectedAnswerOptionId === option.id
                          ? "default"
                          : "outline"
                      }
                      onClick={() => saveAnswer(question.id, option.id)}
                    >
                      {option.answerText}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
