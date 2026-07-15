import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";

const ANSWER_SCORES: Record<string, number> = {
  Yes: 100,
  Partially: 50,
  No: 0,
};

/** Distributes Yes / Partially / No answers to approximate a pillar percent score. */
export function distributeAnswersForTargetScore(
  targetScore: number,
  questionCount = 10,
): Array<"Yes" | "Partially" | "No"> {
  let bestDiff = Number.POSITIVE_INFINITY;
  let best = { yes: 0, partial: 0, no: questionCount };

  for (let yes = 0; yes <= questionCount; yes += 1) {
    for (let partial = 0; partial <= questionCount - yes; partial += 1) {
      const no = questionCount - yes - partial;
      const score = (yes * ANSWER_SCORES.Yes + partial * ANSWER_SCORES.Partially) / questionCount;
      const diff = Math.abs(score - targetScore);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = { yes, partial, no };
      }
    }
  }

  return [
    ...Array.from({ length: best.yes }, () => "Yes" as const),
    ...Array.from({ length: best.partial }, () => "Partially" as const),
    ...Array.from({ length: best.no }, () => "No" as const),
  ];
}

/** Baseline assessment targets — overall StackScore ~39. */
export const ACME_BASELINE_PILLAR_TARGETS: Record<TechnologyPillarCode, number> = {
  security_operations: 38,
  identity_access: 42,
  endpoint_management: 34,
  data_protection_recovery: 36,
  network_connectivity: 44,
  productivity_collaboration: 52,
  documentation_knowledge: 28,
  technology_strategy: 30,
};

/** Current assessment targets — overall StackScore ~56. */
export const ACME_CURRENT_PILLAR_TARGETS: Record<TechnologyPillarCode, number> = {
  security_operations: 54,
  identity_access: 58,
  endpoint_management: 48,
  data_protection_recovery: 52,
  network_connectivity: 60,
  productivity_collaboration: 65,
  documentation_knowledge: 50,
  technology_strategy: 55,
};

/** Per-question overrides reflecting Pinnacle Engineering's hybrid Microsoft 365 environment. */
export const ACME_CURRENT_ANSWER_OVERRIDES: Partial<
  Record<string, "Yes" | "Partially" | "No">
> = {
  "PC-001": "Yes",
  "PC-002": "Yes",
  "PC-003": "Partially",
  "IA-002": "Yes",
  "IA-003": "Partially",
  "IA-004": "Partially",
  "NW-001": "Yes",
  "NW-002": "Partially",
  "EP-001": "No",
  "EP-002": "Partially",
  "EP-003": "Partially",
  "DP-001": "Partially",
  "DP-002": "Partially",
  "SO-003": "No",
  "SO-004": "Partially",
  "DK-001": "Partially",
  "DK-002": "No",
  "TS-001": "Partially",
  "TS-002": "Partially",
};

export const ACME_BASELINE_ANSWER_OVERRIDES: Partial<
  Record<string, "Yes" | "Partially" | "No">
> = {
  "PC-001": "Partially",
  "PC-002": "Partially",
  "IA-002": "Partially",
  "EP-001": "No",
  "EP-002": "No",
  "DP-001": "No",
  "DP-002": "No",
  "SO-003": "No",
  "SO-004": "No",
  "DK-001": "No",
  "TS-001": "No",
};

export function buildAnswerPlan(input: {
  pillarTargets: Record<TechnologyPillarCode, number>;
  questionsByPillar: Map<TechnologyPillarCode, string[]>;
  overrides?: Partial<Record<string, "Yes" | "Partially" | "No">>;
}): Map<string, "Yes" | "Partially" | "No"> {
  const plan = new Map<string, "Yes" | "Partially" | "No">();

  for (const [pillarCode, questionCodes] of input.questionsByPillar.entries()) {
    const target = input.pillarTargets[pillarCode];
    const distribution = distributeAnswersForTargetScore(target, questionCodes.length);

    questionCodes.forEach((code, index) => {
      plan.set(code, input.overrides?.[code] ?? distribution[index] ?? "Partially");
    });
  }

  return plan;
}
