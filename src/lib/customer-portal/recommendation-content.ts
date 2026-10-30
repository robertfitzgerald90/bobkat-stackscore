/**
 * SS-UX-006 — Parse approved recommendation description sections.
 * Does not invent copy; returns null for missing labeled sections.
 */

export type RecommendationContentSections = {
  finding: string | null;
  recommendedAction: string | null;
  expectedOutcome: string | null;
  implementationConsiderations: string | null;
  hasStructuredSections: boolean;
};

const SECTION_LABELS = [
  "Finding",
  "Recommended action",
  "Expected outcome",
  "Implementation considerations",
] as const;

type SectionLabel = (typeof SECTION_LABELS)[number];

const LABEL_TO_KEY: Record<
  SectionLabel,
  keyof Omit<RecommendationContentSections, "hasStructuredSections">
> = {
  Finding: "finding",
  "Recommended action": "recommendedAction",
  "Expected outcome": "expectedOutcome",
  "Implementation considerations": "implementationConsiderations",
};

const SECTION_SPLIT =
  /(?:^|\n\s*)(Finding|Recommended action|Expected outcome|Implementation considerations):\s*/gi;

function emptySections(): RecommendationContentSections {
  return {
    finding: null,
    recommendedAction: null,
    expectedOutcome: null,
    implementationConsiderations: null,
    hasStructuredSections: false,
  };
}

function normalizeBody(value: string): string | null {
  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Extract labeled Finding / Recommended action / Expected outcome /
 * Implementation considerations from catalog-style description text.
 */
export function parseRecommendationDescription(
  description: string | null | undefined,
): RecommendationContentSections {
  if (!description?.trim()) return emptySections();

  const parts = description.split(SECTION_SPLIT);
  if (parts.length < 3) {
    return emptySections();
  }

  const result = emptySections();
  // split yields: [preamble, label1, body1, label2, body2, ...]
  for (let i = 1; i + 1 < parts.length; i += 2) {
    const labelRaw = parts[i]?.trim();
    const body = parts[i + 1] ?? "";
    if (!labelRaw) continue;
    const matched = SECTION_LABELS.find(
      (label) => label.toLowerCase() === labelRaw.toLowerCase(),
    );
    if (!matched) continue;
    const key = LABEL_TO_KEY[matched];
    result[key] = normalizeBody(body);
    result.hasStructuredSections = true;
  }

  return result;
}
