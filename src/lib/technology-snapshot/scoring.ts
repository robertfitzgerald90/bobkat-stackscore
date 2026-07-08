import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";
import { SNAPSHOT_ANSWER_OPTIONS, SNAPSHOT_QUESTIONS } from "./questions";
import type {
  SnapshotAnswerValue,
  SnapshotAnswers,
  SnapshotClassification,
  SnapshotLowestPillar,
  SnapshotResult,
} from "./types";

const ANSWER_POINTS = Object.fromEntries(
  SNAPSHOT_ANSWER_OPTIONS.map((option) => [option.value, option.points]),
) as Record<SnapshotAnswerValue, number>;

export function getAnswerPoints(answer: SnapshotAnswerValue): number {
  return ANSWER_POINTS[answer];
}

export function calculateTotalScore(answers: SnapshotAnswers): number {
  return SNAPSHOT_QUESTIONS.reduce(
    (total, question) => total + getAnswerPoints(answers[question.pillarCode]),
    0,
  );
}

export function classifySnapshotScore(totalScore: number): SnapshotClassification {
  if (totalScore >= 21) return "healthy";
  if (totalScore >= 15) return "needs_attention";
  if (totalScore >= 8) return "elevated_risk";
  return "immediate_action";
}

const CLASSIFICATION_LABELS: Record<SnapshotClassification, string> = {
  healthy: "Healthy",
  needs_attention: "Needs Attention",
  elevated_risk: "Elevated Risk",
  immediate_action: "Immediate Action Recommended",
};

const CLASSIFICATION_SUMMARIES: Record<SnapshotClassification, string> = {
  healthy:
    "Your responses suggest a solid technology foundation. A full assessment can still uncover optimization opportunities and help you plan ahead.",
  needs_attention:
    "Several areas may benefit from structured review. Addressing gaps now can prevent downtime, security incidents, and productivity friction.",
  elevated_risk:
    "Important technology gaps appear present. Without focused improvement, your business may face higher security, recovery, or operational risk.",
  immediate_action:
    "Critical technology weaknesses may be exposing your business. Prioritize remediation and expert guidance as soon as possible.",
};

export function getClassificationLabel(classification: SnapshotClassification): string {
  return CLASSIFICATION_LABELS[classification];
}

export function getClassificationSummary(classification: SnapshotClassification): string {
  return CLASSIFICATION_SUMMARIES[classification];
}

const PILLAR_OBSERVATIONS: Record<
  TechnologyPillarCode,
  Record<SnapshotAnswerValue, string>
> = {
  identity_access: {
    no: "Multi-factor authentication does not appear consistently enforced — unauthorized access risk may be elevated.",
    unsure:
      "Access controls may be unclear — verify that only authorized people can reach sensitive systems.",
    partially:
      "MFA adoption looks incomplete — some users or systems may still rely on passwords alone.",
    yes: "",
  },
  endpoint_management: {
    no: "Device patching and protection may be inconsistent — endpoints are a common entry point for attacks.",
    unsure:
      "Endpoint management practices may need review to confirm devices stay patched and monitored.",
    partially:
      "Some devices may lack consistent patching or monitoring — standardization could reduce risk.",
    yes: "",
  },
  network_connectivity: {
    no: "Network infrastructure may be outdated or undocumented — reliability and security gaps are possible.",
    unsure:
      "Network documentation and currency are uncertain — undocumented networks are harder to secure and support.",
    partially:
      "Network equipment or documentation may be incomplete — reliability issues can disrupt operations.",
    yes: "",
  },
  data_protection_recovery: {
    no: "Backup recovery has not been recently validated — data loss or ransomware recovery may fail when needed.",
    unsure:
      "Backup and recovery readiness is unclear — untested backups often fail during real incidents.",
    partially:
      "Recovery testing may be infrequent — confirm backups restore successfully on a regular schedule.",
    yes: "",
  },
  productivity_collaboration: {
    no: "Collaboration tools may be disorganized — employees could be losing time or sharing data insecurely.",
    unsure:
      "File sharing and collaboration practices may lack structure — clarity improves security and efficiency.",
    partially:
      "Some collaboration workflows may be inconsistent — standardization can improve productivity.",
    yes: "",
  },
  security_operations: {
    no: "Security alerts and vulnerabilities may not be actively reviewed — threats can go unnoticed.",
    unsure:
      "Security monitoring practices are unclear — without active review, incidents may escalate.",
    partially:
      "Security review may be occasional rather than systematic — consistent monitoring reduces risk.",
    yes: "",
  },
  documentation_knowledge: {
    no: "IT knowledge may depend on a single person — business continuity is at risk if they are unavailable.",
    unsure:
      "Documentation and knowledge transfer are uncertain — another provider may struggle to support you.",
    partially:
      "Some environment knowledge may not be documented — improve runbooks and access records.",
    yes: "",
  },
  technology_strategy: {
    no: "A documented technology roadmap or budget plan may be missing — investments can become reactive.",
    unsure:
      "Technology planning appears informal — a roadmap aligns spending with business priorities.",
    partially:
      "Technology planning may exist but lack detail — a structured roadmap clarifies priorities.",
    yes: "",
  },
};

export function getLowestScoringPillars(
  answers: SnapshotAnswers,
  limit = 3,
): SnapshotLowestPillar[] {
  const scored = SNAPSHOT_QUESTIONS.map((question) => ({
    code: question.pillarCode,
    name: question.pillarName,
    score: getAnswerPoints(answers[question.pillarCode]),
    answer: answers[question.pillarCode],
  }));

  return scored
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function buildSnapshotObservations(lowestPillars: SnapshotLowestPillar[]): string[] {
  return lowestPillars
    .map((pillar) => PILLAR_OBSERVATIONS[pillar.code][pillar.answer])
    .filter((text) => text.length > 0)
    .slice(0, 3);
}

export function buildSnapshotResult(answers: SnapshotAnswers): SnapshotResult {
  const totalScore = calculateTotalScore(answers);
  const classification = classifySnapshotScore(totalScore);
  const lowestPillars = getLowestScoringPillars(answers, 3);
  const observations = buildSnapshotObservations(lowestPillars);

  return {
    totalScore,
    classification,
    lowestPillars,
    observations,
  };
}
