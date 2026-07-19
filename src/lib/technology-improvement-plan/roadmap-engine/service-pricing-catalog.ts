import type { RecommendationCostType } from "./types";

export type ServicePricingRule = {
  costType: RecommendationCostType;
  /** When mixed, fraction of allocated dollars treated as recurring (0–1). */
  recurringShare?: number;
};

const EXACT_SERVICE_RULES: Record<string, ServicePricingRule> = {
  "Managed IT Services": { costType: "recurring", recurringShare: 1 },
  "Backup & Disaster Recovery": { costType: "mixed", recurringShare: 0.45 },
  "Microsoft 365 Protection": { costType: "mixed", recurringShare: 0.35 },
  "Managed Endpoint Security": { costType: "mixed", recurringShare: 0.4 },
  "Modern Workplace Services": { costType: "mixed", recurringShare: 0.35 },
  "vCIO Consulting": { costType: "recurring", recurringShare: 1 },
  "Documentation Services": { costType: "one_time" },
  "Documentation & Assessment Services": { costType: "one_time" },
  "Network Infrastructure & Deployment": { costType: "mixed", recurringShare: 0.2 },
  "Infrastructure Modernization": { costType: "mixed", recurringShare: 0.25 },
};

const SERVICE_PATTERN_RULES: Array<{ pattern: RegExp; rule: ServicePricingRule }> = [
  { pattern: /managed|monitoring|support|retainer|vcio/i, rule: { costType: "recurring", recurringShare: 1 } },
  { pattern: /backup|disaster recovery|continuity/i, rule: { costType: "mixed", recurringShare: 0.45 } },
  { pattern: /deployment|rollout|migration|modernization|hardening/i, rule: { costType: "mixed", recurringShare: 0.25 } },
  { pattern: /documentation|assessment|governance|planning/i, rule: { costType: "one_time" } },
];

const DEFAULT_SERVICE_RULE: ServicePricingRule = {
  costType: "mixed",
};

export function resolveServicePricingRule(suggestedService: string | null): ServicePricingRule {
  if (!suggestedService?.trim()) return DEFAULT_SERVICE_RULE;

  const exact = EXACT_SERVICE_RULES[suggestedService.trim()];
  if (exact) return exact;

  for (const entry of SERVICE_PATTERN_RULES) {
    if (entry.pattern.test(suggestedService)) return entry.rule;
  }

  return DEFAULT_SERVICE_RULE;
}
