import { MATURITY_TIER_LABELS } from "@/lib/scoring/maturity";
import { getRating, RATING_LABELS } from "@/lib/scoring";
import type { PillarScoreSnapshot } from "@/lib/scoring/v2";
import type { CategoryScoreSummary } from "@/lib/assessments/results-summary";
import type { Priority } from "@/generated/prisma/client";

export type ResponseAnswerOption = {
  id: string;
  answerText: string;
  triggersCriticalFlag?: boolean;
  triggersRecommendation?: boolean;
};

export type ResponseRecord = {
  selectedAnswerOptionId: string;
  notes: string | null;
  evidence: string | null;
  updatedAt?: string;
  scoreEarned?: number;
};

export type ResponseQuestion = {
  id: string;
  code: string;
  v2QuestionId: string | null;
  questionText: string;
  helpText?: string | null;
  evidenceRequired?: string | null;
  answerOptions: ResponseAnswerOption[];
  response: ResponseRecord | null;
};

export type ResponseCategory = {
  id: string;
  code: string;
  name: string;
  businessQuestion?: string | null;
  questions: ResponseQuestion[];
};

export type ResponseSectionMeta = {
  answeredCount: number;
  totalCount: number;
  percentScore: number | null;
  maturityLabel: string | null;
  criticalCount: number;
  flaggedCount: number;
};

export type ResponseSummaryStats = {
  totalQuestions: number;
  answered: number;
  unanswered: number;
  flagged: number;
  sectionsCompleted: number;
  sectionCount: number;
};

export type ResponseFilterState = {
  search: string;
  sectionCode: string | "all";
  answerStatus: "all" | "answered" | "unanswered";
  severity: "all" | "critical" | "flagged";
  showUnansweredOnly: boolean;
  showFlaggedOnly: boolean;
};

export const DEFAULT_RESPONSE_FILTERS: ResponseFilterState = {
  search: "",
  sectionCode: "all",
  answerStatus: "all",
  severity: "all",
  showUnansweredOnly: false,
  showFlaggedOnly: false,
};

type ViewerContext = {
  isStaff: boolean;
  customerSelfAssessment: boolean;
};

export function sanitizeAssessmentQuestionCategories(
  categories: ResponseCategory[],
  viewer: ViewerContext,
): ResponseCategory[] {
  return categories.map((category) => ({
    ...category,
    questions: category.questions.map((question) => ({
      ...question,
      answerOptions: question.answerOptions.map((option) => ({
        id: option.id,
        answerText: option.answerText,
        ...(viewer.isStaff
          ? {
              triggersCriticalFlag: option.triggersCriticalFlag,
              triggersRecommendation: option.triggersRecommendation,
            }
          : {
              triggersCriticalFlag: option.triggersCriticalFlag,
            }),
      })),
      response: sanitizeResponseRecord(question.response, viewer),
    })),
  }));
}

function sanitizeResponseRecord(
  response: ResponseRecord | null,
  viewer: ViewerContext,
): ResponseRecord | null {
  if (!response) return null;

  if (viewer.isStaff) {
    return {
      selectedAnswerOptionId: response.selectedAnswerOptionId,
      notes: response.notes,
      evidence: response.evidence,
      updatedAt: response.updatedAt,
      scoreEarned: response.scoreEarned,
    };
  }

  const customerComment = viewer.customerSelfAssessment ? response.notes : response.notes;

  return {
    selectedAnswerOptionId: response.selectedAnswerOptionId,
    notes: customerComment,
    evidence: null,
    updatedAt: response.updatedAt,
  };
}

export function getSelectedAnswerOption(
  question: ResponseQuestion,
): ResponseAnswerOption | undefined {
  if (!question.response) return undefined;
  return question.answerOptions.find(
    (option) => option.id === question.response?.selectedAnswerOptionId,
  );
}

export function isQuestionFlagged(question: ResponseQuestion): boolean {
  const selected = getSelectedAnswerOption(question);
  return Boolean(selected?.triggersCriticalFlag || selected?.triggersRecommendation);
}

export function isQuestionCritical(question: ResponseQuestion): boolean {
  return Boolean(getSelectedAnswerOption(question)?.triggersCriticalFlag);
}

export function formatResponseAnswerLabel(answerText: string | null | undefined): string {
  if (!answerText) return "No response provided";
  const normalized = answerText.trim();
  if (!normalized) return "No response provided";

  const lower = normalized.toLowerCase();
  if (lower === "true") return "Yes";
  if (lower === "false") return "No";
  if (lower === "n/a" || lower === "na" || lower === "not applicable") return "Not Applicable";

  return normalized;
}

export type AnswerBadgeVariant = "success" | "warning" | "destructive" | "secondary" | "outline";

export function getAnswerBadgeVariant(answerText: string | null | undefined): AnswerBadgeVariant {
  const label = formatResponseAnswerLabel(answerText).toLowerCase();
  if (label === "yes") return "success";
  if (label === "no") return "destructive";
  if (label.includes("partial")) return "warning";
  if (label === "not applicable" || label === "no response provided") return "secondary";
  return "outline";
}

export function getFindingSeverity(question: ResponseQuestion): Priority | null {
  if (isQuestionCritical(question)) return "critical";
  if (getSelectedAnswerOption(question)?.triggersRecommendation) return "high";
  return null;
}

export function getCustomerFacingNotes(
  question: ResponseQuestion,
  customerSelfAssessment: boolean,
): string | null {
  if (!customerSelfAssessment || !question.response?.notes?.trim()) return null;
  return question.response.notes.trim();
}

export function getAssessorNotes(
  question: ResponseQuestion,
  customerSelfAssessment: boolean,
  isStaff: boolean,
): string | null {
  if (!isStaff || !question.response) return null;
  const value = customerSelfAssessment ? question.response.evidence : question.response.notes;
  return value?.trim() ? value.trim() : null;
}

export function getEvidenceNotes(
  question: ResponseQuestion,
  customerSelfAssessment: boolean,
  isStaff: boolean,
): string | null {
  if (!isStaff || customerSelfAssessment || !question.response?.evidence?.trim()) return null;
  return question.response.evidence.trim();
}

export function buildResponseSectionMeta(
  category: ResponseCategory,
  pillarSnapshots: PillarScoreSnapshot[] | null,
  categoryScores: CategoryScoreSummary[],
): ResponseSectionMeta {
  const totalCount = category.questions.length;
  const answeredQuestions = category.questions.filter((question) => question.response);
  const answeredCount = answeredQuestions.length;
  const criticalCount = category.questions.filter((question) => isQuestionCritical(question)).length;
  const flaggedCount = category.questions.filter((question) => isQuestionFlagged(question)).length;

  const pillar = pillarSnapshots?.find((snapshot) => snapshot.pillarCode === category.code);
  const categoryScore = categoryScores.find((score) => score.categoryCode === category.code);

  const percentScore =
    pillar?.percentScore ?? (categoryScore ? Math.round(categoryScore.percentScore) : null);

  let maturityLabel: string | null = null;
  if (pillar?.maturityLevelLabel) {
    maturityLabel = pillar.maturityLevelLabel;
  } else if (percentScore !== null) {
    maturityLabel = RATING_LABELS[getRating(percentScore)];
  }

  return {
    answeredCount,
    totalCount,
    percentScore,
    maturityLabel,
    criticalCount,
    flaggedCount,
  };
}

export function buildResponseSummaryStats(categories: ResponseCategory[]): ResponseSummaryStats {
  const totalQuestions = categories.reduce((count, category) => count + category.questions.length, 0);
  const answered = categories.reduce(
    (count, category) => count + category.questions.filter((question) => question.response).length,
    0,
  );
  const flagged = categories.reduce(
    (count, category) => count + category.questions.filter((question) => isQuestionFlagged(question)).length,
    0,
  );
  const sectionsCompleted = categories.filter((category) =>
    category.questions.every((question) => question.response),
  ).length;

  return {
    totalQuestions,
    answered,
    unanswered: totalQuestions - answered,
    flagged,
    sectionsCompleted,
    sectionCount: categories.length,
  };
}

function matchesSearch(question: ResponseQuestion, search: string): boolean {
  if (!search.trim()) return true;
  const needle = search.trim().toLowerCase();
  const answer = formatResponseAnswerLabel(
    getSelectedAnswerOption(question)?.answerText,
  ).toLowerCase();

  return (
    question.questionText.toLowerCase().includes(needle) ||
    question.code.toLowerCase().includes(needle) ||
    (question.v2QuestionId?.toLowerCase().includes(needle) ?? false) ||
    answer.includes(needle) ||
    (question.response?.notes?.toLowerCase().includes(needle) ?? false)
  );
}

export function filterResponseCategories(
  categories: ResponseCategory[],
  filters: ResponseFilterState,
): ResponseCategory[] {
  return categories
    .filter((category) => filters.sectionCode === "all" || category.code === filters.sectionCode)
    .map((category) => ({
      ...category,
      questions: category.questions.filter((question) => {
        const answered = Boolean(question.response);
        if (filters.showUnansweredOnly && answered) return false;
        if (filters.answerStatus === "answered" && !answered) return false;
        if (filters.answerStatus === "unanswered" && answered) return false;
        if (filters.showFlaggedOnly && !isQuestionFlagged(question)) return false;
        if (filters.severity === "critical" && !isQuestionCritical(question)) return false;
        if (filters.severity === "flagged" && !isQuestionFlagged(question)) return false;
        return matchesSearch(question, filters.search);
      }),
    }))
    .filter((category) => category.questions.length > 0);
}

export function formatAnsweredDate(updatedAt: string | undefined): string | null {
  if (!updatedAt) return null;
  return new Date(updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getQuestionIdentifier(question: ResponseQuestion): string {
  return question.v2QuestionId ?? question.code;
}

export { MATURITY_TIER_LABELS, RATING_LABELS };
