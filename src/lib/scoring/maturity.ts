import type { MaturityTier } from "@/generated/prisma/client";

export const MATURITY_TIER_LABELS: Record<MaturityTier, string> = {
  nascent: "Nascent",
  foundational: "Foundational",
  developing: "Developing",
  mature: "Mature",
  optimized: "Optimized",
};

export const MATURITY_TIER_DESCRIPTIONS: Record<MaturityTier, string> = {
  nascent: "Technology capabilities are largely absent or ad hoc.",
  foundational: "Basic capabilities exist but are inconsistent.",
  developing: "Capabilities are emerging with notable gaps.",
  mature: "Capabilities are established and generally reliable.",
  optimized: "Capabilities are proactive, measured, and continuously improved.",
};

/** DOC-113 maturity tiers — distinct from StackScore Rating bands (DOC-111A). */
export function getMaturityTier(score: number): MaturityTier {
  if (score >= 81) return "optimized";
  if (score >= 61) return "mature";
  if (score >= 41) return "developing";
  if (score >= 21) return "foundational";
  return "nascent";
}

export function getMaturityTierLabel(score: number): string {
  return MATURITY_TIER_LABELS[getMaturityTier(score)];
}
