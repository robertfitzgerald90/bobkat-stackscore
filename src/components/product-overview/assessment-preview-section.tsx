"use client";

import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { ProductOverviewAssessmentCta } from "@/components/product-overview/product-overview-assessment-cta";
import { Button } from "@/components/ui/button";
import { trackProductOverviewAssessmentPreviewCompleted } from "@/lib/analytics/product-overview-events";
import {
  ASSESSMENT_PREVIEW_QUESTIONS,
  calculatePreviewScore,
} from "@/lib/product-overview/assessment-preview-questions";
import { PO_INTERACTIVE_TILE, PO_METRIC_VALUE } from "@/lib/product-overview/polish-classes";

export function AssessmentPreviewSection() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState(false);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === ASSESSMENT_PREVIEW_QUESTIONS.length;
  const result = useMemo(() => calculatePreviewScore(answers), [answers]);

  function selectAnswer(questionId: string, score: number) {
    setAnswers((current) => ({ ...current, [questionId]: score }));
  }

  function completePreview() {
    setCompleted(true);
    trackProductOverviewAssessmentPreviewCompleted(result.score);
  }

  return (
    <section
      id="product-overview-assessment-preview"
      className="scroll-mt-[var(--demo-shell-height,9rem)] border-t border-border/70 bg-muted/10 px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-4xl">
        <OfferReveal>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Assessment Preview
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Sample your Technology Maturity Score
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Answer ten representative questions to preview how StackScore evaluates technology maturity.
            This is a simplified sample — not a complete assessment.
          </p>
        </OfferReveal>

        {!completed ? (
          <div className="mt-8 space-y-6">
            {ASSESSMENT_PREVIEW_QUESTIONS.map((question, index) => (
              <OfferReveal key={question.id} delayMs={index * 30}>
                <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {question.pillar}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{question.question}</h3>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {question.options.map((option) => {
                      const selected = answers[question.id] === option.score;
                      return (
                        <button
                          key={option.label}
                          type="button"
                          className={`${PO_INTERACTIVE_TILE} px-4 py-3 text-left text-sm ${
                            selected ? "border-primary bg-primary/5" : ""
                          }`}
                          onClick={() => selectAnswer(question.id, option.score)}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </OfferReveal>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {answeredCount} of {ASSESSMENT_PREVIEW_QUESTIONS.length} questions answered
              </p>
              <Button type="button" disabled={!allAnswered} onClick={completePreview}>
                Generate Sample Score
              </Button>
            </div>
          </div>
        ) : (
          <OfferReveal className="mt-8">
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-background p-8 text-center shadow-sm">
              <CheckCircle2 className="mx-auto h-10 w-10 text-primary" aria-hidden />
              <p className={`mt-4 text-5xl font-semibold text-foreground ${PO_METRIC_VALUE}`}>
                {result.score} / 100
              </p>
              <p className="mt-2 text-xl font-medium text-primary">{result.maturityLabel}</p>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                This is a sample preview based on ten representative questions. A complete Technology
                Maturity Assessment evaluates hundreds of data points across your organization with
                executive-ready deliverables.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <ProductOverviewAssessmentCta
                  label="Purchase Full Assessment"
                  placement="product_overview_assessment_preview"
                  variant="default"
                  className="h-11 px-8"
                />
                <Button type="button" variant="outline" onClick={() => { setCompleted(false); setAnswers({}); }}>
                  Retake Preview
                </Button>
              </div>
            </div>
          </OfferReveal>
        )}
      </div>
    </section>
  );
}
