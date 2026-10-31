/**
 * SS-WEB-003 — Demo score presentation helpers.
 * Uses production maturity classification; does not modify scoring engines.
 */

import { getCustomerMaturityLabel } from "@/lib/assessments/customer-reporting";
import { formatMaturityScore } from "@/lib/scoring/score-display";
import {
  TECHNOLOGY_PILLARS,
  type TechnologyPillarCode,
} from "@/lib/technology-maturity/pillars";

/**
 * Deterministic fictional pillar scores for Northstar Manufacturing.
 * Scenario: strong endpoints, inconsistent identity, moderate network,
 * improving backup, documentation gaps, developing strategy.
 */
export const PUBLIC_DEMO_PILLAR_SCORES: Record<TechnologyPillarCode, number> = {
  identity_access: 52,
  endpoint_management: 78,
  network_connectivity: 64,
  data_protection_recovery: 61,
  productivity_collaboration: 74,
  security_operations: 48,
  documentation_knowledge: 45,
  technology_strategy: 58,
};

/** Equal-weight mean of the eight pillars, rounded half-up (presentation fixture). */
export function computePublicDemoOverallScore(
  scores: Record<TechnologyPillarCode, number> = PUBLIC_DEMO_PILLAR_SCORES,
): number {
  const total = TECHNOLOGY_PILLARS.reduce((sum, pillar) => sum + scores[pillar.code], 0);
  return Math.round(total / TECHNOLOGY_PILLARS.length);
}

export function publicDemoMaturityLabel(score: number): string {
  return getCustomerMaturityLabel(score);
}

export function publicDemoScoreDisplay(score: number | null): string {
  return formatMaturityScore(score);
}

export function maturityExplanationForScore(score: number, label: string): string {
  if (score >= 85) {
    return `${label} maturity means technology practices are largely consistent and supporting the business with manageable risk.`;
  }
  if (score >= 70) {
    return `${label} maturity means core practices are in place, with clear opportunities to strengthen consistency and resilience.`;
  }
  if (score >= 55) {
    return `${label} maturity means foundational capabilities exist, but important gaps still create operational or security exposure.`;
  }
  if (score >= 40) {
    return `${label} maturity means several foundational controls are incomplete — prioritizing remediation will reduce business risk.`;
  }
  return `${label} maturity means technology readiness is early-stage. Focused improvement opportunities can raise resilience after reassessment confirms progress.`;
}

export function assertDemoScoresUseOfficialLabels(
  scores: Record<TechnologyPillarCode, number> = PUBLIC_DEMO_PILLAR_SCORES,
): void {
  for (const pillar of TECHNOLOGY_PILLARS) {
    const score = scores[pillar.code];
    const label = getCustomerMaturityLabel(score);
    if (!label) {
      throw new Error(`Missing maturity label for ${pillar.code}`);
    }
  }
  getCustomerMaturityLabel(computePublicDemoOverallScore(scores));
}
