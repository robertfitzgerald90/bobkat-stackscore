/**
 * SS-UX-006 — Parse approved recommendation description sections.
 * SS-UX-007-FIX — Preserve unstructured paragraphs and text before the first label.
 * Does not invent, rewrite, or summarize copy.
 */

export type RecommendationContentSections = {
  finding: string | null;
  recommendedAction: string | null;
  expectedOutcome: string | null;
  implementationConsiderations: string | null;
  /** Stored text that appears before the first recognized section label. */
  leadingText: string | null;
  hasStructuredSections: boolean;
};

export type PresentedRecommendationContent = {
  sections: RecommendationContentSections;
  /** Full trimmed source when labels are absent or no section body survived. */
  unstructuredText: string | null;
  /** Paragraphs split on blank lines; single newlines stay inside a paragraph. */
  paragraphs: string[];
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
  keyof Omit<RecommendationContentSections, "hasStructuredSections" | "leadingText">
> = {
  Finding: "finding",
  "Recommended action": "recommendedAction",
  "Expected outcome": "expectedOutcome",
  "Implementation considerations": "implementationConsiderations",
};

const SECTION_SPLIT =
  /(?:^|\n\s*)(Finding|Recommended action|Expected outcome|Implementation considerations):[ \t]*/gi;

function emptySections(): RecommendationContentSections {
  return {
    finding: null,
    recommendedAction: null,
    expectedOutcome: null,
    implementationConsiderations: null,
    leadingText: null,
    hasStructuredSections: false,
  };
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n/g, "\n");
}

/** Trim ends only — internal line breaks stay so callers can render stored copy. */
function normalizeBody(value: string): string | null {
  const trimmed = normalizeNewlines(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Blank-line paragraphs. A single newline remains inside the paragraph.
 */
export function recommendationParagraphs(text: string): string[] {
  const normalized = normalizeNewlines(text).trim();
  if (!normalized) return [];
  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

/**
 * Extract labeled Finding / Recommended action / Expected outcome /
 * Implementation considerations from catalog-style description text.
 * Unrecognized descriptions return empty sections so the caller can show the source.
 */
export function parseRecommendationDescription(
  description: string | null | undefined,
): RecommendationContentSections {
  if (!description?.trim()) return emptySections();

  const normalized = normalizeNewlines(description);
  const parts = normalized.split(SECTION_SPLIT);
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
    const normalizedBody = normalizeBody(body);
    if (!normalizedBody) continue;
    result[key] = normalizedBody;
    result.hasStructuredSections = true;
  }

  if (!result.hasStructuredSections) {
    return emptySections();
  }

  result.leadingText = normalizeBody(parts[0] ?? "");
  return result;
}

/**
 * Structured sections when approved labels are present; otherwise the original
 * text as paragraphs. Never drops source copy when labels are missing or empty.
 */
export function presentRecommendationDescription(
  description: string | null | undefined,
): PresentedRecommendationContent {
  const sections = parseRecommendationDescription(description);
  if (sections.hasStructuredSections) {
    return { sections, unstructuredText: null, paragraphs: [] };
  }

  const raw = description ? normalizeNewlines(description).trim() : "";
  return {
    sections,
    unstructuredText: raw.length > 0 ? raw : null,
    paragraphs: recommendationParagraphs(raw),
  };
}
