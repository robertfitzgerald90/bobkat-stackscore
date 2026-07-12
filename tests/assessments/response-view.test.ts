import { describe, expect, it } from "vitest";
import {
  buildResponseSectionMeta,
  buildResponseSummaryStats,
  filterResponseCategories,
  formatResponseAnswerLabel,
  getAnswerBadgeVariant,
  isQuestionCritical,
  isQuestionFlagged,
  sanitizeAssessmentQuestionCategories,
  type ResponseCategory,
} from "@/lib/assessments/response-view";

const sampleCategories: ResponseCategory[] = [
  {
    id: "cat-1",
    code: "identity_access",
    name: "Identity & Access",
    questions: [
      {
        id: "q-1",
        code: "Q01",
        v2QuestionId: "IAM-01",
        questionText: "Is MFA enforced?",
        answerOptions: [
          { id: "a-1", answerText: "Partially", triggersCriticalFlag: false, triggersRecommendation: true },
          { id: "a-2", answerText: "Yes", triggersCriticalFlag: false },
        ],
        response: {
          selectedAnswerOptionId: "a-1",
          notes: "Admins only",
          evidence: "Internal note",
          updatedAt: "2026-07-12T00:00:00.000Z",
        },
      },
      {
        id: "q-2",
        code: "Q02",
        v2QuestionId: "IAM-02",
        questionText: "Are shared accounts prohibited?",
        answerOptions: [{ id: "a-3", answerText: "No", triggersCriticalFlag: true }],
        response: null,
      },
    ],
  },
];

describe("response-view helpers", () => {
  it("formats boolean and empty answers for display", () => {
    expect(formatResponseAnswerLabel("true")).toBe("Yes");
    expect(formatResponseAnswerLabel("false")).toBe("No");
    expect(formatResponseAnswerLabel(null)).toBe("No response provided");
    expect(getAnswerBadgeVariant("Partially")).toBe("warning");
  });

  it("builds summary stats across categories", () => {
    const stats = buildResponseSummaryStats(sampleCategories);
    expect(stats.totalQuestions).toBe(2);
    expect(stats.answered).toBe(1);
    expect(stats.unanswered).toBe(1);
    expect(stats.flagged).toBe(1);
  });

  it("filters unanswered and flagged questions", () => {
    const unansweredOnly = filterResponseCategories(sampleCategories, {
      search: "",
      sectionCode: "all",
      answerStatus: "unanswered",
      severity: "all",
      showUnansweredOnly: true,
      showFlaggedOnly: false,
    });
    expect(unansweredOnly[0]?.questions).toHaveLength(1);
    expect(unansweredOnly[0]?.questions[0]?.id).toBe("q-2");

    const flaggedOnly = filterResponseCategories(sampleCategories, {
      search: "",
      sectionCode: "all",
      answerStatus: "all",
      severity: "flagged",
      showUnansweredOnly: false,
      showFlaggedOnly: true,
    });
    expect(flaggedOnly[0]?.questions).toHaveLength(1);
    expect(isQuestionFlagged(flaggedOnly[0]!.questions[0]!)).toBe(true);
  });

  it("detects critical answers", () => {
    const unanswered = sampleCategories[0]!.questions[1]!;
    expect(isQuestionCritical(unanswered)).toBe(false);
  });

  it("sanitizes internal fields for client viewers", () => {
    const sanitized = sanitizeAssessmentQuestionCategories(sampleCategories, {
      isStaff: false,
      customerSelfAssessment: false,
    });
    expect(sanitized[0]?.questions[0]?.response?.evidence).toBeNull();
    expect(sanitized[0]?.questions[0]?.answerOptions[0]?.triggersRecommendation).toBeUndefined();
  });

  it("builds section metadata with counts", () => {
    const meta = buildResponseSectionMeta(sampleCategories[0]!, null, []);
    expect(meta.answeredCount).toBe(1);
    expect(meta.totalCount).toBe(2);
    expect(meta.flaggedCount).toBe(1);
  });
});
