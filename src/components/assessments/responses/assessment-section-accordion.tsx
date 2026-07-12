"use client";

import { ChevronDown } from "lucide-react";
import type { ResponseCategory } from "@/lib/assessments/response-view";
import { buildResponseSectionMeta } from "@/lib/assessments/response-view";
import type { CategoryScoreSummary } from "@/lib/assessments/results-summary";
import type { PillarScoreSnapshot } from "@/lib/scoring/v2";
import { AssessmentResponseItem } from "@/components/assessments/responses/assessment-response-item";
import { cn } from "@/lib/utils";

type AssessmentSectionAccordionProps = {
  category: ResponseCategory;
  open: boolean;
  onToggle: () => void;
  isStaff: boolean;
  customerSelfAssessment: boolean;
  pillarSnapshots: PillarScoreSnapshot[] | null;
  categoryScores: CategoryScoreSummary[];
  highlightQuestionId?: string | null;
};

export function AssessmentSectionAccordion({
  category,
  open,
  onToggle,
  isStaff,
  customerSelfAssessment,
  pillarSnapshots,
  categoryScores,
  highlightQuestionId,
}: AssessmentSectionAccordionProps) {
  const meta = buildResponseSectionMeta(category, pillarSnapshots, categoryScores);
  const panelId = `responses-panel-${category.id}`;
  const headerId = `responses-header-${category.id}`;

  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
      <button
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-muted/30"
      >
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">{category.name}</p>
          <p className="text-xs text-muted-foreground">
            {meta.answeredCount} of {meta.totalCount} answered
            {meta.percentScore !== null ? ` · ${meta.percentScore}%` : ""}
            {meta.maturityLabel ? ` · ${meta.maturityLabel}` : ""}
            {meta.flaggedCount > 0
              ? ` · ${meta.flaggedCount} finding${meta.flaggedCount === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className="border-t border-border/60 px-4"
        >
          {category.questions.map((question) => (
            <AssessmentResponseItem
              key={question.id}
              question={question}
              isStaff={isStaff}
              customerSelfAssessment={customerSelfAssessment}
              highlight={highlightQuestionId === question.id}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
