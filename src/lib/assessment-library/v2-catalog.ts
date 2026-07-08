import questionLibrary from "../../../data/v2-question-library.json";

export const V2_QUESTION_LIBRARY = questionLibrary;

export const EXPECTED_V2_QUESTION_COUNT = questionLibrary.questions.length;

export const EXPECTED_V2_PILLAR_COUNT = questionLibrary.pillars.length;

export const V2_QUESTIONS_PER_PILLAR = questionLibrary.pillars[0]?.questionCount ?? 10;

export const V2_CATALOG_BY_ID = new Map(
  questionLibrary.questions.map((question) => [question.id, question]),
);

export const V2_PILLAR_CODES = questionLibrary.pillars.map((pillar) => pillar.code);
