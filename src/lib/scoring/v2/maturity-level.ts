/** DOC-119 Technology Maturity Levels */

export type TechnologyMaturityLevelCode =
  | "optimized"
  | "mature"
  | "managed"
  | "developing"
  | "basic"
  | "initial";

export const TECHNOLOGY_MATURITY_LEVEL_LABELS: Record<TechnologyMaturityLevelCode, string> = {
  optimized: "Optimized",
  mature: "Mature",
  managed: "Managed",
  developing: "Developing",
  basic: "Basic",
  initial: "Initial",
};

export type TechnologyMaturityLevel = {
  code: TechnologyMaturityLevelCode;
  label: string;
};

/** DOC-119 bands — score is source of truth; label derived at read or snapshot time. */
export function getTechnologyMaturityLevel(score: number): TechnologyMaturityLevel {
  if (score >= 95) return { code: "optimized", label: TECHNOLOGY_MATURITY_LEVEL_LABELS.optimized };
  if (score >= 85) return { code: "mature", label: TECHNOLOGY_MATURITY_LEVEL_LABELS.mature };
  if (score >= 70) return { code: "managed", label: TECHNOLOGY_MATURITY_LEVEL_LABELS.managed };
  if (score >= 55) return { code: "developing", label: TECHNOLOGY_MATURITY_LEVEL_LABELS.developing };
  if (score >= 40) return { code: "basic", label: TECHNOLOGY_MATURITY_LEVEL_LABELS.basic };
  return { code: "initial", label: TECHNOLOGY_MATURITY_LEVEL_LABELS.initial };
}

export const ASSESSMENT_INCOMPLETE_LABEL = "Assessment Incomplete";
