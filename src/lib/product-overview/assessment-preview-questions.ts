import type { MaturityLabel } from "@/lib/product-overview/types";

export type AssessmentPreviewQuestion = {
  id: string;
  pillar: string;
  question: string;
  options: Array<{ label: string; score: number }>;
};

export const ASSESSMENT_PREVIEW_QUESTIONS: AssessmentPreviewQuestion[] = [
  {
    id: "backups",
    pillar: "Business Continuity",
    question: "How consistently are backups validated with documented recovery tests?",
    options: [
      { label: "Not validated", score: 1 },
      { label: "Occasionally tested", score: 2 },
      { label: "Regularly validated", score: 3 },
      { label: "Fully documented and tested", score: 4 },
    ],
  },
  {
    id: "cybersecurity",
    pillar: "Cybersecurity",
    question: "How mature are your identity protection and MFA controls?",
    options: [
      { label: "Minimal MFA coverage", score: 1 },
      { label: "Basic MFA for some users", score: 2 },
      { label: "MFA enforced for most users", score: 3 },
      { label: "Phishing-resistant MFA for privileged accounts", score: 4 },
    ],
  },
  {
    id: "network",
    pillar: "Infrastructure",
    question: "How reliable and modern is your core network infrastructure?",
    options: [
      { label: "Frequent issues / aging equipment", score: 1 },
      { label: "Stable but aging", score: 2 },
      { label: "Reliable with planned refresh", score: 3 },
      { label: "Modern and well-segmented", score: 4 },
    ],
  },
  {
    id: "cloud",
    pillar: "Applications & Data",
    question: "How effectively are cloud collaboration and data controls managed?",
    options: [
      { label: "Limited governance", score: 1 },
      { label: "Basic policies in place", score: 2 },
      { label: "Defined policies with monitoring", score: 3 },
      { label: "Mature governance and lifecycle controls", score: 4 },
    ],
  },
  {
    id: "documentation",
    pillar: "Operations & Support",
    question: "How well documented are your technology procedures and escalation paths?",
    options: [
      { label: "Mostly tribal knowledge", score: 1 },
      { label: "Partially documented", score: 2 },
      { label: "Documented with some gaps", score: 3 },
      { label: "Standardized and maintained", score: 4 },
    ],
  },
  {
    id: "lifecycle",
    pillar: "People & Process",
    question: "How standardized is your endpoint and device lifecycle management?",
    options: [
      { label: "Ad hoc replacements", score: 1 },
      { label: "Informal refresh cycles", score: 2 },
      { label: "Defined lifecycle policies", score: 3 },
      { label: "Automated lifecycle with compliance tracking", score: 4 },
    ],
  },
  {
    id: "policies",
    pillar: "Strategy & Governance",
    question: "How consistently are technology policies reviewed with executive oversight?",
    options: [
      { label: "Rarely reviewed", score: 1 },
      { label: "Reviewed reactively", score: 2 },
      { label: "Reviewed annually", score: 3 },
      { label: "Quarterly executive review cadence", score: 4 },
    ],
  },
  {
    id: "business-continuity",
    pillar: "Business Continuity",
    question: "How prepared is leadership to respond to a major technology outage?",
    options: [
      { label: "No formal plan", score: 1 },
      { label: "Informal plan exists", score: 2 },
      { label: "Documented plan with partial testing", score: 3 },
      { label: "Tested DR plan with executive ownership", score: 4 },
    ],
  },
  {
    id: "monitoring",
    pillar: "Cybersecurity",
    question: "How mature is security monitoring and incident response?",
    options: [
      { label: "Reactive only", score: 1 },
      { label: "Basic alerting", score: 2 },
      { label: "Centralized monitoring", score: 3 },
      { label: "24/7 monitoring with defined response playbooks", score: 4 },
    ],
  },
  {
    id: "reporting",
    pillar: "Digital Enablement",
    question: "How clearly does leadership see technology risk and investment priorities?",
    options: [
      { label: "Limited visibility", score: 1 },
      { label: "Periodic updates", score: 2 },
      { label: "Regular executive reporting", score: 3 },
      { label: "Live executive dashboard with measurable KPIs", score: 4 },
    ],
  },
];

export function calculatePreviewScore(answers: Record<string, number>) {
  const values = Object.values(answers);
  if (values.length === 0) return { score: 0, maturityLabel: "Initial" as MaturityLabel };

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const score = Math.round((average / 4) * 100);
  const maturityLabel = scoreToMaturity(score);
  return { score, maturityLabel };
}

function scoreToMaturity(score: number): MaturityLabel {
  if (score >= 85) return "Optimized";
  if (score >= 75) return "Managed";
  if (score >= 65) return "Defined";
  if (score >= 50) return "Developing";
  return "Initial";
}
