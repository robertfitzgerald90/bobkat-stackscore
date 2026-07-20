import type { ExecutiveRiskLevel } from "@/lib/pdf/types";
import type { TipRecommendationView } from "@/lib/technology-improvement-plan/types";

type CategoryContentContext = {
  categoryName: string;
  score: number;
  ratingLabel: string;
  riskLevel: ExecutiveRiskLevel;
  hasRecommendations: boolean;
  recommendations: TipRecommendationView[];
  businessQuestion?: string;
};

function normalizeCategoryName(name: string): string {
  return name.toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ").trim();
}

function categoryMatches(name: string, keywords: string[]): boolean {
  const normalized = normalizeCategoryName(name);
  return keywords.some((keyword) => normalized.includes(keyword));
}

export function describeCategoryCurrentState(context: CategoryContentContext): string {
  const { categoryName, score, ratingLabel, businessQuestion } = context;

  if (businessQuestion?.trim()) {
    if (score >= 80) {
      return `${categoryName} is performing well (${score}/100, ${ratingLabel}). ${businessQuestion} The assessment indicates established capability with refinement opportunities rather than foundational gaps.`;
    }
    if (score >= 70) {
      return `${categoryName} is functional but not fully optimized (${score}/100, ${ratingLabel}). ${businessQuestion} Baseline practices exist, though consistency and scalability may be limited.`;
    }
    if (score >= 60) {
      return `${categoryName} shows material gaps (${score}/100, ${ratingLabel}). ${businessQuestion} Current practices may not reliably support continuity, security, or growth expectations.`;
    }
    return `${categoryName} requires executive attention (${score}/100, ${ratingLabel}). ${businessQuestion} Observed maturity suggests elevated exposure that could affect operations or strategic planning.`;
  }

  if (score >= 80) {
    return `${categoryName} demonstrates strong maturity (${score}/100, ${ratingLabel}). Core capabilities appear established, with opportunities to optimize rather than rebuild.`;
  }
  if (score >= 70) {
    return `${categoryName} is functional but not yet optimized (${score}/100, ${ratingLabel}). The organization has baseline capability with gaps that may limit scalability or resilience.`;
  }
  if (score >= 60) {
    return `${categoryName} shows material gaps (${score}/100, ${ratingLabel}). Current practices may not consistently support business continuity or growth expectations.`;
  }
  return `${categoryName} requires executive attention (${score}/100, ${ratingLabel}). Observed maturity suggests elevated exposure that could affect operations, security, or strategic planning.`;
}

function impactFromRecommendations(recommendations: TipRecommendationView[]): string[] {
  return recommendations
    .slice(0, 2)
    .map((rec) => rec.businessImpact.trim())
    .filter(Boolean);
}

function buildCategoryImpactSentences(context: CategoryContentContext): string[] {
  const { categoryName, score, riskLevel, hasRecommendations, recommendations } = context;
  const name = categoryName;

  if (categoryMatches(name, ["infrastructure"])) {
    const impacts: string[] = [];
    if (score < 75) impacts.push("Aging or unsupported systems may increase maintenance difficulty and reliability risk");
    if (score < 70 || riskLevel === "High" || riskLevel === "Critical") {
      impacts.push("Capacity or reliability constraints could constrain growth or create single points of failure");
    }
    if (hasRecommendations) impacts.push("Infrastructure gaps may prolong recovery after outages or hardware failures");
    return impacts;
  }

  if (categoryMatches(name, ["endpoint"])) {
    const impacts: string[] = [];
    if (score < 75) impacts.push("Inconsistent patching and device visibility can slow support and increase security exposure");
    if (score < 70) impacts.push("Endpoint configuration inconsistency may create avoidable support effort and user friction");
    if (riskLevel === "High" || riskLevel === "Critical") {
      impacts.push("Unmanaged endpoint risk increases the likelihood of malware spread or unauthorized access");
    }
    return impacts;
  }

  if (categoryMatches(name, ["security"])) {
    const impacts: string[] = [];
    if (score < 75) impacts.push("Missing or incomplete security controls increase exposure to unauthorized access and malware");
    if (riskLevel === "Critical" || riskLevel === "High") {
      impacts.push("Credential compromise or undetected incidents could disrupt operations or expose sensitive data");
    }
    if (hasRecommendations) impacts.push("Limited incident detection capability may delay response when threats materialize");
    return impacts;
  }

  if (categoryMatches(name, ["backup", "disaster recovery", "business continuity"])) {
    const impacts: string[] = [];
    if (score < 75) impacts.push("Recovery confidence may be limited if backups are not consistently validated or monitored");
    if (score < 70) impacts.push("Extended recovery time could interrupt revenue-generating operations during an outage");
    if (riskLevel === "Critical" || riskLevel === "High") {
      impacts.push("Data loss or unmonitored backup failures could create prolonged business interruption");
    }
    return impacts;
  }

  if (categoryMatches(name, ["identity", "access"])) {
    const impacts: string[] = [];
    if (score < 75) impacts.push("Weak account governance increases the risk of excessive access and poor offboarding");
    if (score < 70) impacts.push("Shared credentials or inconsistent access controls make unauthorized access more likely");
    if (hasRecommendations) impacts.push("Identity gaps can delay detection of account misuse or privilege escalation");
    return impacts;
  }

  if (categoryMatches(name, ["network", "connectivity"])) {
    const impacts: string[] = [];
    if (score < 75) impacts.push("Connectivity interruptions or performance bottlenecks can disrupt daily operations");
    if (score < 70) impacts.push("Single points of failure or limited segmentation reduce resilience during outages");
    if (hasRecommendations) impacts.push("Unreliable network access may reduce productivity for on-site and remote staff");
    return impacts;
  }

  if (categoryMatches(name, ["documentation", "knowledge"])) {
    const impacts: string[] = [];
    if (score < 75) impacts.push("Knowledge concentrated in individuals slows troubleshooting and increases vendor dependency");
    if (score < 70) impacts.push("Incomplete documentation can extend recovery time and complicate staff transitions");
    if (hasRecommendations) impacts.push("Onboarding and operational handoffs may take longer when systems are poorly documented");
    return impacts;
  }

  if (categoryMatches(name, ["strategic", "governance", "planning"])) {
    const impacts: string[] = [];
    if (score < 75) impacts.push("Reactive technology spending may continue without clear prioritization or budget visibility");
    if (score < 70) impacts.push("Technology projects may become disconnected from business goals and renewal cycles");
    if (hasRecommendations) impacts.push("Leadership may lack a consistent view of investment trade-offs across the roadmap");
    return impacts;
  }

  if (categoryMatches(name, ["cloud"])) {
    const impacts: string[] = [];
    if (score < 75) impacts.push("Cloud service sprawl and unclear ownership can create licensing inefficiency and access risk");
    if (score < 70) impacts.push("Data governance gaps may limit visibility into who can access business-critical cloud resources");
    if (hasRecommendations) impacts.push("Uncoordinated cloud adoption can increase cost and operational complexity over time");
    return impacts;
  }

  const recImpacts = impactFromRecommendations(recommendations);
  if (recImpacts.length > 0) {
    return recImpacts.slice(0, 2).map((impact) => {
      if (/risk|exposure|disrupt|loss|delay|cost|productiv/i.test(impact)) return impact;
      return `${impact.charAt(0).toUpperCase()}${impact.slice(1)}`;
    });
  }

  if (score >= 80 && riskLevel === "Low") {
    return ["Maintaining this domain supports operational stability and reduces avoidable surprises for leadership"];
  }

  if (score < 70 || riskLevel === "Critical" || riskLevel === "High") {
    return [`Gaps in ${name.toLowerCase()} increase the likelihood of operational disruption or elevated business exposure`];
  }

  if (score < 80 && hasRecommendations) {
    return [`Improvements in ${name.toLowerCase()} would strengthen reliability and reduce day-to-day operational friction`];
  }

  return [];
}

export function describeCategoryBusinessImpact(context: CategoryContentContext): string {
  const sentences = buildCategoryImpactSentences(context);
  if (sentences.length === 0) {
    return "Maintaining this domain at its current level supports operational stability. Targeted improvements can still strengthen resilience and executive visibility.";
  }
  return sentences.slice(0, 3).join(". ") + ".";
}

export function generateCategoryOpportunity(context: CategoryContentContext): string {
  const name = context.categoryName;

  if (categoryMatches(name, ["infrastructure"])) {
    return "Create a more reliable and scalable technology foundation that supports growth without increasing maintenance burden";
  }
  if (categoryMatches(name, ["endpoint"])) {
    return "Improve endpoint visibility and consistency to reduce support effort and strengthen security posture";
  }
  if (categoryMatches(name, ["security"])) {
    return "Strengthen protective controls and detection capability to reduce cybersecurity exposure";
  }
  if (categoryMatches(name, ["backup", "disaster recovery", "business continuity"])) {
    return "Improve recovery preparedness and confidence that critical data can be restored within acceptable timeframes";
  }
  if (categoryMatches(name, ["identity", "access"])) {
    return "Establish stronger account governance that limits unauthorized access and supports clean onboarding and offboarding";
  }
  if (categoryMatches(name, ["network", "connectivity"])) {
    return "Improve network reliability and performance so employees can access systems consistently";
  }
  if (categoryMatches(name, ["documentation", "knowledge"])) {
    return "Reduce dependence on individual knowledge by improving operational documentation and transferability";
  }
  if (categoryMatches(name, ["strategic", "governance", "planning"])) {
    return "Align technology spending with business priorities through clearer planning and executive visibility";
  }
  if (categoryMatches(name, ["cloud"])) {
    return "Improve cloud cost control, access governance, and ownership clarity across business services";
  }

  return `Strengthen ${name.toLowerCase()} to improve operational reliability and reduce business friction`;
}

export function generateRiskFromRecommendation(rec: TipRecommendationView): string {
  const impact = rec.businessImpact.trim();
  if (/risk|exposure|disrupt|loss|delay|breach|outage|fail|vulner|unauthor|downtime|compromise/i.test(impact)) {
    return impact.endsWith(".") ? impact : `${impact}.`;
  }

  const category = rec.categoryName.toLowerCase();
  if (/backup|recovery|continuity/.test(category)) {
    return `Without addressing ${rec.title.toLowerCase()}, the organization faces increased risk of extended downtime or data loss during a disruption.`;
  }
  if (/security|identity|access/.test(category)) {
    return `Without addressing ${rec.title.toLowerCase()}, the organization remains exposed to unauthorized access and preventable security incidents.`;
  }
  if (/endpoint|infrastructure|network/.test(category)) {
    return `Without addressing ${rec.title.toLowerCase()}, operational reliability and support efficiency may continue to degrade.`;
  }

  return `Unresolved gaps related to ${rec.title.toLowerCase()} increase the likelihood of business disruption, elevated support burden, or compliance exposure.`;
}

export function generateOpportunityFromRecommendation(rec: TipRecommendationView): string {
  const note = rec.executiveNote.trim();
  if (note && !/risk|exposure|without|fail|loss|disrupt/i.test(note)) {
    return note.endsWith(".") ? note : `${note}.`;
  }

  const title = rec.title.toLowerCase();
  if (/backup|recovery|continuity/.test(title + rec.categoryName.toLowerCase())) {
    return "Strengthen recovery preparedness and leadership confidence that critical operations can be restored quickly";
  }
  if (/mfa|identity|access|password|sso/.test(title)) {
    return "Reduce account takeover risk while improving workforce access reliability";
  }
  if (/document|knowledge|runbook/.test(title)) {
    return "Improve operational visibility and reduce dependence on individual staff knowledge";
  }
  if (/monitor|visibility|report|dashboard/.test(title)) {
    return "Increase executive and operational visibility into technology performance and spending";
  }

  return `Enable measurable improvement in ${rec.categoryName.toLowerCase()} that supports reliability, productivity, and leadership decision-making`;
}
