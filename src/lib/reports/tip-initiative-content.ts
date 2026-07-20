import type { ExecutiveRiskLevel } from "@/lib/pdf/types";
import type { TipRecommendationView } from "@/lib/technology-improvement-plan/types";
import {
  areTipTextsIdentical,
  isHighTipTextOverlap,
} from "@/lib/reports/tip-text-normalize";

type InitiativeContentInput = {
  title: string;
  categoryName: string;
  executiveNote: string;
  businessImpact: string;
  description: string;
  riskLevel: ExecutiveRiskLevel;
};

function normalizeCategory(categoryName: string): string {
  return categoryName.toLowerCase();
}

export function generateBusinessObjective(input: InitiativeContentInput): string {
  const note = input.executiveNote.trim();
  if (note && /establish|improve|enable|create|strengthen|deliver|achieve|provide|ensure|reduce|increase/i.test(note)) {
    return note.endsWith(".") ? note : `${note}.`;
  }

  const title = input.title.toLowerCase();
  const category = normalizeCategory(input.categoryName);

  if (/backup|recovery|continuity/.test(title + category)) {
    return "Establish validated recovery capability so leadership can trust that critical operations can be restored within acceptable timeframes.";
  }
  if (/mfa|multi-factor|identity|access|sso/.test(title + category)) {
    return "Establish consistent identity controls that protect business accounts and support reliable workforce access.";
  }
  if (/patch|endpoint|device/.test(title + category)) {
    return "Establish a consistent process for keeping business systems current, supported, and protected.";
  }
  if (/document|knowledge|runbook/.test(title + category)) {
    return "Create dependable operational documentation that supports faster troubleshooting, onboarding, and recovery.";
  }
  if (/network|connectivity|firewall|wifi/.test(title + category)) {
    return "Deliver a reliable network foundation that supports daily operations without recurring connectivity disruption.";
  }
  if (/governance|strategy|planning|roadmap/.test(title + category)) {
    return "Align technology investment decisions with business priorities through clearer planning and executive oversight.";
  }

  return `Achieve a stronger ${input.categoryName.toLowerCase()} capability that supports reliable operations and leadership visibility.`;
}

export function generateWhyItMatters(input: InitiativeContentInput): string {
  const impact = input.businessImpact.trim();
  if (
    impact &&
    /current|today|without|leave|increase|expose|limit|delay|prevent|remain|lack|weak|inconsistent|unresolved|elevated/i.test(
      impact,
    )
  ) {
    return impact.endsWith(".") ? impact : `${impact}.`;
  }

  const title = input.title.toLowerCase();
  const category = normalizeCategory(input.categoryName);

  if (/patch|endpoint|device/.test(title + category)) {
    return "Inconsistent patching and device management leave known vulnerabilities unresolved and increase the likelihood of preventable outages or security incidents.";
  }
  if (/backup|recovery|continuity/.test(title + category)) {
    return "Limited recovery validation means the organization may discover backup gaps only during an actual disruption, extending downtime and revenue impact.";
  }
  if (/mfa|identity|access/.test(title + category)) {
    return "Weak identity controls increase the likelihood of unauthorized access, account takeover, and delayed offboarding when staff changes occur.";
  }
  if (/document|knowledge/.test(title + category)) {
    return "Operational knowledge concentrated in individuals slows troubleshooting, extends recovery time, and creates vendor or staff dependency.";
  }
  if (/network|connectivity/.test(title + category)) {
    return "Unreliable connectivity and limited network visibility can interrupt daily work and delay identification of performance or security issues.";
  }
  if (/security|threat|malware|email/.test(title + category)) {
    return "Incomplete protective controls leave the organization exposed to preventable security incidents that can disrupt operations and damage trust.";
  }

  if (input.riskLevel === "Critical" || input.riskLevel === "High") {
    return `Current gaps in ${input.categoryName.toLowerCase()} create material business exposure that could disrupt operations if left unaddressed.`;
  }

  return `Existing limitations in ${input.categoryName.toLowerCase()} create unnecessary operational friction and limit the organization's ability to scale reliably.`;
}

export function generateExpectedBenefits(rec: TipRecommendationView): string[] {
  const benefits = new Set<string>();
  const corpus = `${rec.businessImpact} ${rec.executiveNote} ${rec.title} ${rec.categoryName}`.toLowerCase();

  if (/downtime|continuity|recover|outage|backup|restore/.test(corpus)) {
    benefits.add("Reduced downtime and improved recovery confidence");
  }
  if (/security|cyber|threat|breach|protect|malware|identity|access|mfa/.test(corpus)) {
    benefits.add("Improved security posture and reduced exposure");
  }
  if (/visibility|report|executive|insight|dashboard|monitor/.test(corpus)) {
    benefits.add("Better operational visibility for leadership");
  }
  if (/productiv|efficien|onboard|employee|workflow|support/.test(corpus)) {
    benefits.add("Improved employee productivity and support efficiency");
  }
  if (/cost|budget|spend|savings|license/.test(corpus)) {
    benefits.add("Lower long-term technology operating costs");
  }
  if (/scale|growth|reliable|resilien/.test(corpus)) {
    benefits.add("More scalable and reliable technology operations");
  }

  if (benefits.size === 0) {
    benefits.add("Stronger alignment between technology capability and business priorities");
    benefits.add("Reduced operational friction for employees and leadership");
  }

  return Array.from(benefits).slice(0, 4);
}

export function resolveInitiativeFields(
  rec: TipRecommendationView,
  riskLevel: ExecutiveRiskLevel,
): { businessObjective: string; whyItMatters: string; expectedBenefits: string[] } {
  const input: InitiativeContentInput = {
    title: rec.title,
    categoryName: rec.categoryName,
    executiveNote: rec.executiveNote,
    businessImpact: rec.businessImpact,
    description: rec.description,
    riskLevel,
  };

  let businessObjective = generateBusinessObjective(input);
  let whyItMatters = generateWhyItMatters(input);

  const note = rec.executiveNote.trim();
  const impact = rec.businessImpact.trim();

  if (note && !areTipTextsIdentical(note, impact) && !isHighTipTextOverlap(note, impact)) {
    if (/establish|improve|enable|create|strengthen|achieve|deliver|provide|ensure|reduce|increase|leadership|visibility|confidence/i.test(note)) {
      businessObjective = note.endsWith(".") ? note : `${note}.`;
    }
    if (/risk|exposure|without|leave|increase|expose|limit|delay|remain|lack|weak|inconsistent|unresolved|prevent|current/i.test(impact)) {
      whyItMatters = impact.endsWith(".") ? impact : `${impact}.`;
    }
  }

  if (areTipTextsIdentical(businessObjective, whyItMatters) || isHighTipTextOverlap(businessObjective, whyItMatters)) {
    businessObjective = generateBusinessObjective(input);
    whyItMatters = generateWhyItMatters(input);
  }

  if (areTipTextsIdentical(businessObjective, whyItMatters)) {
    whyItMatters = generateWhyItMatters({
      ...input,
      businessImpact: "",
      executiveNote: "",
    });
  }

  return {
    businessObjective,
    whyItMatters,
    expectedBenefits: generateExpectedBenefits(rec),
  };
}
