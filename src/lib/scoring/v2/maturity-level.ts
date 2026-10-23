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

export const TECHNOLOGY_MATURITY_LEVEL_DESCRIPTIONS: Record<
  TechnologyMaturityLevelCode,
  string
> = {
  optimized: "Capabilities are proactive, measured, and continuously improved.",
  mature: "Capabilities are established, governed, and generally reliable.",
  managed: "Capabilities are defined and consistently operated with measurable control.",
  developing: "Capabilities are emerging with notable gaps remaining.",
  basic: "Basic capabilities exist but are inconsistent or lightly governed.",
  initial: "Technology capabilities are largely absent, ad hoc, or reactive.",
};

export type TechnologyMaturityLevel = {
  code: TechnologyMaturityLevelCode;
  label: string;
};

/**
 * DOC-119 bands — authoritative maturity classification (SS-OPT-002).
 * Optimized 95–100 · Mature 85–94 · Managed 70–84 ·
 * Developing 55–69 · Basic 40–54 · Initial 0–39
 */
export function getTechnologyMaturityLevel(score: number): TechnologyMaturityLevel {
  if (score >= 95) return { code: "optimized", label: TECHNOLOGY_MATURITY_LEVEL_LABELS.optimized };
  if (score >= 85) return { code: "mature", label: TECHNOLOGY_MATURITY_LEVEL_LABELS.mature };
  if (score >= 70) return { code: "managed", label: TECHNOLOGY_MATURITY_LEVEL_LABELS.managed };
  if (score >= 55) return { code: "developing", label: TECHNOLOGY_MATURITY_LEVEL_LABELS.developing };
  if (score >= 40) return { code: "basic", label: TECHNOLOGY_MATURITY_LEVEL_LABELS.basic };
  return { code: "initial", label: TECHNOLOGY_MATURITY_LEVEL_LABELS.initial };
}

export function getTechnologyMaturityLevelLabel(score: number): string {
  return getTechnologyMaturityLevel(score).label;
}

export const ASSESSMENT_INCOMPLETE_LABEL = "Assessment Incomplete";
