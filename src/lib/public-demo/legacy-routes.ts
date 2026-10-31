/**
 * SS-WEB-003-R2 — Legacy public demo surfaces retired in favor of the
 * customer-parity read-only workspace.
 */

import { PUBLIC_DEMO_OVERVIEW_PATH, PUBLIC_DEMO_OPPORTUNITIES_PATH } from "@/lib/public-demo/routes";

/** Static paths under `/demo` that previously rendered obsolete experiences. */
export const RETIRED_PUBLIC_DEMO_PATHS = [
  "/demo/technology-improvement-plan",
  "/demo/recommendations-workspace",
  "/demo/stackscore-case-study",
  "/demo/design-system/phase-1",
  "/demo/design-system/phase-2",
  "/demo/design-system/phase-3",
] as const;

export type RetiredPublicDemoPath = (typeof RETIRED_PUBLIC_DEMO_PATHS)[number];

/** Where each retired path should permanently redirect. */
export const RETIRED_PUBLIC_DEMO_REDIRECTS: Record<RetiredPublicDemoPath, string> = {
  "/demo/technology-improvement-plan": PUBLIC_DEMO_OVERVIEW_PATH,
  "/demo/recommendations-workspace": PUBLIC_DEMO_OPPORTUNITIES_PATH,
  "/demo/stackscore-case-study": PUBLIC_DEMO_OVERVIEW_PATH,
  "/demo/design-system/phase-1": PUBLIC_DEMO_OVERVIEW_PATH,
  "/demo/design-system/phase-2": PUBLIC_DEMO_OVERVIEW_PATH,
  "/demo/design-system/phase-3": PUBLIC_DEMO_OVERVIEW_PATH,
};

/** Obsolete marketing phrases that must not appear in public-demo payloads. */
export const PUBLIC_DEMO_FORBIDDEN_LEGACY_PHRASES = [
  "Strategy & Governance",
  "Projected final score",
  "Effective StackScore",
  "One-time implementation investment",
  "Monthly recurring investment",
  "Four-phase proposal",
  "proposal simulator",
] as const;

/** Currency / pricing markers that must not appear in public-demo payloads. */
export const PUBLIC_DEMO_FORBIDDEN_FINANCIAL_PATTERNS = [
  /\$\d/,
  /\bUSD\b/i,
  /\bROI\b/,
  /\bper month\b/i,
  /\b\/month\b/i,
  /\bmonthly recurring\b/i,
  /\bone-time implementation\b/i,
  /\bannual technology plan\b/i,
  /\bbudget utilization\b/i,
] as const;
