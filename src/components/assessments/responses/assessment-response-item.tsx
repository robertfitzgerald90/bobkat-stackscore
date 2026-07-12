import type { ResponseQuestion } from "@/lib/assessments/response-view";
import {
  formatAnsweredDate,
  getAssessorNotes,
  getCustomerFacingNotes,
  getEvidenceNotes,
  getFindingSeverity,
  getQuestionIdentifier,
  getSelectedAnswerOption,
} from "@/lib/assessments/response-view";
import { FindingSeverityBadge } from "@/components/assessments/responses/finding-severity-badge";
import { ResponseAnswerBadge } from "@/components/assessments/responses/response-answer-badge";
import { cn } from "@/lib/utils";

type AssessmentResponseItemProps = {
  question: ResponseQuestion;
  isStaff: boolean;
  customerSelfAssessment: boolean;
  highlight?: boolean;
};

export function AssessmentResponseItem({
  question,
  isStaff,
  customerSelfAssessment,
  highlight = false,
}: AssessmentResponseItemProps) {
  const selectedOption = getSelectedAnswerOption(question);
  const severity = getFindingSeverity(question);
  const customerComment = getCustomerFacingNotes(question, customerSelfAssessment);
  const assessorNotes = getAssessorNotes(question, customerSelfAssessment, isStaff);
  const evidence = getEvidenceNotes(question, customerSelfAssessment, isStaff);
  const answeredDate = formatAnsweredDate(question.response?.updatedAt);
  const identifier = getQuestionIdentifier(question);

  return (
    <article
      id={`response-${question.id}`}
      className={cn(
        "border-b border-border/60 py-4 last:border-b-0",
        highlight && "-mx-3 rounded-md bg-primary/[0.04] px-3",
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{identifier}</span>
            {severity ? <FindingSeverityBadge severity={severity} /> : null}
          </div>
          <h4 className="text-sm font-medium leading-snug text-foreground">{question.questionText}</h4>
        </div>

        <div className="w-full shrink-0 space-y-2 lg:w-52 lg:text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Customer Response
          </p>
          <div className="lg:flex lg:justify-end">
            <ResponseAnswerBadge answerText={selectedOption?.answerText} />
          </div>
          {answeredDate ? (
            <p className="text-xs text-muted-foreground">Answered {answeredDate}</p>
          ) : null}
        </div>
      </div>

      {customerComment ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Customer Comment
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{customerComment}</p>
        </div>
      ) : null}

      {isStaff && assessorNotes ? (
        <div className="mt-3 rounded-md border border-dashed border-border/60 bg-muted/20 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Assessor Note
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{assessorNotes}</p>
        </div>
      ) : null}

      {isStaff && evidence ? (
        <div className="mt-3 rounded-md border border-dashed border-border/60 bg-muted/20 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Evidence
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{evidence}</p>
        </div>
      ) : null}

      {question.evidenceRequired && isStaff ? (
        <p className="mt-2 text-xs text-muted-foreground">Evidence requested for this question.</p>
      ) : null}
    </article>
  );
}
