import {
  EXPECTED_V2_PILLAR_COUNT,
  EXPECTED_V2_QUESTION_COUNT,
  V2_CATALOG_BY_ID,
  V2_PILLAR_CODES,
  V2_QUESTIONS_PER_PILLAR,
} from "@/lib/assessment-library/v2-catalog";

export type LibraryValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type LibraryQuestionInput = {
  code: string;
  v2QuestionId: string | null;
  categoryCode?: string;
  capability: string | null;
  isActive: boolean;
};

/** Validates the active DOC-151 pillar question bank (80 questions, 8 pillars). */
export function validateQuestionLibrary(
  questions: LibraryQuestionInput[],
): LibraryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const activeQuestions = questions.filter((question) => question.isActive);

  if (activeQuestions.length !== EXPECTED_V2_QUESTION_COUNT) {
    errors.push(
      `Expected ${EXPECTED_V2_QUESTION_COUNT} active pillar questions, found ${activeQuestions.length}`,
    );
  }

  const activeByCode = new Map(activeQuestions.map((question) => [question.code, question]));
  const activeByPillar = new Map<string, number>();

  for (const pillarCode of V2_PILLAR_CODES) {
    activeByPillar.set(pillarCode, 0);
  }

  for (const question of activeQuestions) {
    const catalogEntry = V2_CATALOG_BY_ID.get(question.code);

    if (!catalogEntry) {
      errors.push(`Question ${question.code} is not in the DOC-151 pillar catalog`);
      continue;
    }

    if (question.v2QuestionId !== catalogEntry.id) {
      errors.push(
        `${question.code}: question id mismatch (expected ${catalogEntry.id}, got ${question.v2QuestionId ?? "null"})`,
      );
    }

    if (question.categoryCode && question.categoryCode !== catalogEntry.pillarCode) {
      errors.push(
        `${question.code}: pillar mismatch (expected ${catalogEntry.pillarCode}, got ${question.categoryCode})`,
      );
    }

    if (!question.capability) {
      warnings.push(`${question.code}: capability field is empty`);
    }

    activeByPillar.set(
      catalogEntry.pillarCode,
      (activeByPillar.get(catalogEntry.pillarCode) ?? 0) + 1,
    );
  }

  for (const catalogEntry of V2_CATALOG_BY_ID.values()) {
    if (!activeByCode.has(catalogEntry.id)) {
      errors.push(
        `DOC-151 question ${catalogEntry.id} (${catalogEntry.pillarName}) missing from active bank`,
      );
    }
  }

  for (const pillarCode of V2_PILLAR_CODES) {
    const count = activeByPillar.get(pillarCode) ?? 0;
    if (count !== V2_QUESTIONS_PER_PILLAR) {
      errors.push(
        `Pillar ${pillarCode}: expected ${V2_QUESTIONS_PER_PILLAR} active questions, found ${count}`,
      );
    }
  }

  if (V2_PILLAR_CODES.length !== EXPECTED_V2_PILLAR_COUNT) {
    errors.push(
      `Expected ${EXPECTED_V2_PILLAR_COUNT} pillars in catalog, found ${V2_PILLAR_CODES.length}`,
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}
