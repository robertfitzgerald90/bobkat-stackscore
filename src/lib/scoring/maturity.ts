import type { MaturityTier } from "@/generated/prisma/client";
import {
  getTechnologyMaturityLevel,
  getTechnologyMaturityLevelLabel,
  type TechnologyMaturityLevelCode,
} from "@/lib/scoring/v2/maturity-level";

/**
 * Prisma `MaturityTier` labels (DOC-113 storage enum).
 * Display of scored assessments should prefer DOC-119 labels via
 * `getMaturityTierLabel(score)` / `getTechnologyMaturityLevel`.
 */
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

/**
 * Maps DOC-119 maturity levels onto the Prisma MaturityTier enum for persistence.
 * Schema has no Managed / Basic / Initial values — bridged without migration (SS-OPT-002).
 */
export function mapDoc119LevelToProfileTier(
  level: TechnologyMaturityLevelCode,
): MaturityTier {
  switch (level) {
    case "optimized":
      return "optimized";
    case "mature":
      return "mature";
    case "managed":
      return "mature";
    case "developing":
      return "developing";
    case "basic":
      return "foundational";
    case "initial":
      return "nascent";
  }
}

/**
 * Profile-storage tier from a numeric score using DOC-119 bands, then enum bridge.
 * Does not rewrite historical rows — only used when writing/updating profiles.
 */
export function getMaturityTier(score: number): MaturityTier {
  return mapDoc119LevelToProfileTier(getTechnologyMaturityLevel(score).code);
}

/** Authoritative DOC-119 display label for a numeric StackScore. */
export function getMaturityTierLabel(score: number): string {
  return getTechnologyMaturityLevelLabel(score);
}
