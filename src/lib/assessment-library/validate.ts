import { QUESTION_LIBRARY_METADATA } from "@/lib/assessment-library/metadata";

const EXPECTED_QUESTION_COUNT = 50;

export type LibraryValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

/** Validates runtime question bank alignment with DOC-114 metadata catalog. */
export function validateQuestionLibrary(
  questions: Array<{
    code: string;
    v2QuestionId: string | null;
    capability: string | null;
    isActive: boolean;
  }>,
): LibraryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const activeQuestions = questions.filter((q) => q.isActive);
  if (activeQuestions.length !== EXPECTED_QUESTION_COUNT) {
    errors.push(
      `Expected ${EXPECTED_QUESTION_COUNT} active questions, found ${activeQuestions.length}`,
    );
  }

  const metadataByCode = new Map(QUESTION_LIBRARY_METADATA.map((m) => [m.code, m]));

  for (const question of activeQuestions) {
    const metadata = metadataByCode.get(question.code);
    if (!metadata) {
      errors.push(`Question ${question.code} has no DOC-114 metadata entry`);
      continue;
    }
    if (question.v2QuestionId !== metadata.v2QuestionId) {
      errors.push(
        `${question.code}: v2QuestionId mismatch (expected ${metadata.v2QuestionId}, got ${question.v2QuestionId ?? "null"})`,
      );
    }
    if (!question.capability) {
      warnings.push(`${question.code}: capability field is empty`);
    }
  }

  for (const metadata of QUESTION_LIBRARY_METADATA) {
    if (!activeQuestions.some((q) => q.code === metadata.code)) {
      errors.push(`DOC-114 metadata ${metadata.code} (${metadata.v2QuestionId}) missing from active bank`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
