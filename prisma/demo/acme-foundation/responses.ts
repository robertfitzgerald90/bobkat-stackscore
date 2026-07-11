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

export const ACME_BASELINE_PILLAR_TARGETS: Record<TechnologyPillarCode, number> = {
  security_operations: 45,
  identity_access: 50,
  endpoint_management: 38,
  data_protection_recovery: 42,
  network_connectivity: 52,
  productivity_collaboration: 62,
  documentation_knowledge: 35,
  technology_strategy: 28,
};

export const ACME_CURRENT_PILLAR_TARGETS: Record<TechnologyPillarCode, number> = {
  security_operations: 66,
  identity_access: 72,
  endpoint_management: 58,
  data_protection_recovery: 61,
  network_connectivity: 68,
  productivity_collaboration: 78,
  documentation_knowledge: 54,
  technology_strategy: 48,
};

/** Per-question overrides to reflect Acme's narrative (M365 in use, MFA mostly on, etc.). */
export const ACME_CURRENT_ANSWER_OVERRIDES: Partial<
  Record<string, "Yes" | "Partially" | "No">
> = {
  "PC-001": "Yes",
  "PC-002": "Yes",
  "PC-003": "Partially",
  "IA-002": "Yes",
  "IA-003": "Yes",
  "IA-004": "Partially",
  "NW-001": "Yes",
  "NW-002": "Partially",
  "EP-001": "No",
  "EP-002": "No",
  "EP-003": "Partially",
  "DP-001": "Partially",
  "DP-002": "Partially",
  "SO-003": "No",
  "SO-004": "No",
  "DK-001": "Partially",
  "DK-002": "No",
  "TS-001": "Partially",
  "TS-002": "No",
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
