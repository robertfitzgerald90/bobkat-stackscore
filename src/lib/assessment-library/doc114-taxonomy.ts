import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";
import { V2_CATEGORY_LABELS } from "@/lib/assessment-library/category-mapping";

/** Maps DOC-151 pillar codes to DOC-114 executive reporting categories. */
export const PILLAR_TO_DOC114_CATEGORY: Record<TechnologyPillarCode, keyof typeof V2_CATEGORY_LABELS> =
  {
    identity_access: "security",
    endpoint_management: "operations",
    network_connectivity: "infrastructure",
    data_protection_recovery: "business_continuity",
    productivity_collaboration: "productivity",
    security_operations: "security",
    documentation_knowledge: "documentation",
    technology_strategy: "strategic_it",
  };

/** Solution playbooks aligned to DOC-114 categories (from legacy metadata conventions). */
export const DOC114_PLAYBOOK_BY_CATEGORY: Record<keyof typeof V2_CATEGORY_LABELS, string> = {
  security: "Cybersecurity",
  business_continuity: "Business Continuity",
  infrastructure: "Infrastructure Modernization",
  operations: "Operations Excellence",
  documentation: "Operational Readiness",
  strategic_it: "Strategic IT Planning",
  productivity: "Productivity Enablement",
};

/** Standard evidence types from DOC-151 pillar library format. */
export const DOC114_STANDARD_EVIDENCE =
  "Interview, observation, documentation review, or technical validation.";

export function doc114CategoryLabelForPillar(pillarCode: string): string | null {
  const doc114Code = PILLAR_TO_DOC114_CATEGORY[pillarCode as TechnologyPillarCode];
  if (!doc114Code) return null;
  return V2_CATEGORY_LABELS[doc114Code] ?? null;
}

export function doc114PlaybookForPillar(pillarCode: string): string | null {
  const doc114Code = PILLAR_TO_DOC114_CATEGORY[pillarCode as TechnologyPillarCode];
  if (!doc114Code) return null;
  return DOC114_PLAYBOOK_BY_CATEGORY[doc114Code] ?? null;
}
