/** Legacy v1 assessment category codes (DOC-111A / seed-data). Archived after v2 cutover. */
export const V1_CATEGORY_CODES = [
  "security",
  "backup",
  "infrastructure",
  "endpoint",
  "documentation",
  "bcdr",
  "strategic",
] as const;

export type V1CategoryCode = (typeof V1_CATEGORY_CODES)[number];

/** Immutable v1 question codes Q01–Q50. */
export const V1_QUESTION_CODES = Array.from(
  { length: 50 },
  (_, index) => `Q${String(index + 1).padStart(2, "0")}`,
);

export function isV1CategoryCode(code: string): code is V1CategoryCode {
  return (V1_CATEGORY_CODES as readonly string[]).includes(code);
}

export function isV1QuestionCode(code: string): boolean {
  return /^Q\d{2}$/.test(code);
}

export function isV1LibraryCategoryCode(code: string): boolean {
  return isV1CategoryCode(code);
}

export function isV1LibraryQuestion(categoryCode: string, questionCode: string): boolean {
  return isV1QuestionCode(questionCode) || isV1CategoryCode(categoryCode);
}
