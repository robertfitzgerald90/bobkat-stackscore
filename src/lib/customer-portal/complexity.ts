/**
 * SS-UX-005 — Customer opportunity complexity from service playbook effort bands.
 * Does not infer from recommendation urgency or impact points. Does not invent estimates.
 */

import catalog from "../../../data/SolutionPlaybookCatalog.json";
import { getPlaybookById } from "@/lib/technology-improvement-plan/playbooks";

export type CustomerComplexityLabel = "Easy" | "Moderate" | "Complex";

export type CustomerOpportunityComplexity = {
  label: CustomerComplexityLabel | null;
  displayLabel: string;
  playbookId: string | null;
  playbookName: string | null;
  effortLevel: "low" | "medium" | "high" | null;
  footnote: string;
};

export const COMPLEXITY_FOOTNOTE =
  "Classifications reflect BobKat service playbook effort bands, not a custom implementation estimate for your environment.";

const NOT_CLASSIFIED = "Not classified";

const EFFORT_TO_LABEL: Record<"low" | "medium" | "high", CustomerComplexityLabel> = {
  low: "Easy",
  medium: "Moderate",
  high: "Complex",
};

/**
 * Resolve playbook id only when `suggestedService` has an explicit catalog mapping.
 * Unlike TIP `resolvePlaybookIdForService`, this does NOT default to strategic_it.
 */
export function resolveMappedPlaybookIdForService(
  suggestedService: string | null | undefined,
): string | null {
  if (!suggestedService?.trim()) return null;
  const mapped = catalog.serviceMappings[suggestedService as keyof typeof catalog.serviceMappings];
  return mapped ?? null;
}

export function resolveCustomerOpportunityComplexity(
  suggestedService: string | null | undefined,
): CustomerOpportunityComplexity {
  const playbookId = resolveMappedPlaybookIdForService(suggestedService);
  if (!playbookId) {
    return {
      label: null,
      displayLabel: NOT_CLASSIFIED,
      playbookId: null,
      playbookName: null,
      effortLevel: null,
      footnote: COMPLEXITY_FOOTNOTE,
    };
  }

  const playbook = getPlaybookById(playbookId);
  const effort = playbook?.effortLevel;
  if (effort !== "low" && effort !== "medium" && effort !== "high") {
    return {
      label: null,
      displayLabel: NOT_CLASSIFIED,
      playbookId,
      playbookName: playbook?.name ?? null,
      effortLevel: null,
      footnote: COMPLEXITY_FOOTNOTE,
    };
  }

  return {
    label: EFFORT_TO_LABEL[effort],
    displayLabel: EFFORT_TO_LABEL[effort],
    playbookId,
    playbookName: playbook?.name ?? null,
    effortLevel: effort,
    footnote: COMPLEXITY_FOOTNOTE,
  };
}
