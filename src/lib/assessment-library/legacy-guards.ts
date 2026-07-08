import { isV1LibraryCategoryCode, isV1LibraryQuestion } from "@/lib/assessment-library/v1-library";

export const LEGACY_MODE_REQUIRED_MESSAGE =
  "Reactivating archived v1 library items requires legacy mode.";

export function requiresLegacyModeForCategoryActivation(
  categoryCode: string,
  nextIsActive: boolean,
): boolean {
  return nextIsActive && isV1LibraryCategoryCode(categoryCode);
}

export function requiresLegacyModeForQuestionActivation(
  categoryCode: string,
  questionCode: string,
  nextIsActive: boolean,
): boolean {
  return nextIsActive && isV1LibraryQuestion(categoryCode, questionCode);
}

export function isLegacyModeRequest(body: Record<string, unknown>): boolean {
  return body.legacyMode === true;
}
