import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";
import type { SnapshotAnswerValue, SnapshotItManagementModel } from "./types";

export type SnapshotQuestion = {
  pillarCode: TechnologyPillarCode;
  pillarName: string;
  question: string;
};

export const SNAPSHOT_ANSWER_OPTIONS: Array<{
  value: SnapshotAnswerValue;
  label: string;
  points: number;
}> = [
  { value: "yes", label: "Yes", points: 3 },
  { value: "partially", label: "Partially", points: 2 },
  { value: "unsure", label: "Unsure", points: 1 },
  { value: "no", label: "No", points: 0 },
];

export const IT_MANAGEMENT_OPTIONS: Array<{
  value: SnapshotItManagementModel;
  label: string;
}> = [
  { value: "in_house", label: "In-house IT team" },
  { value: "outsourced", label: "Outsourced IT provider" },
  { value: "part_time_internal", label: "Internal employee handles IT part-time" },
  { value: "none", label: "No formal IT management" },
  { value: "unsure", label: "Unsure" },
];

export const COMPANY_SIZE_OPTIONS = [
  "1–10 employees",
  "11–25 employees",
  "26–50 employees",
  "51–100 employees",
  "101–250 employees",
  "251+ employees",
] as const;

export const SNAPSHOT_QUESTIONS: SnapshotQuestion[] = [
  {
    pillarCode: "identity_access",
    pillarName: "Identity & Access",
    question:
      "Do employees use multi-factor authentication when accessing company systems?",
  },
  {
    pillarCode: "endpoint_management",
    pillarName: "Endpoint Management",
    question: "Are company devices regularly patched, monitored, and protected?",
  },
  {
    pillarCode: "network_connectivity",
    pillarName: "Network & Connectivity",
    question: "Is your network equipment current, documented, and reliable?",
  },
  {
    pillarCode: "data_protection_recovery",
    pillarName: "Data Protection & Recovery",
    question:
      "When was the last time your business successfully tested restoring data from backup?",
  },
  {
    pillarCode: "productivity_collaboration",
    pillarName: "Productivity & Collaboration",
    question:
      "Are your email, file sharing, and collaboration tools organized and easy for employees to use?",
  },
  {
    pillarCode: "security_operations",
    pillarName: "Security Operations",
    question:
      "Does your business actively review alerts, vulnerabilities, or suspicious activity?",
  },
  {
    pillarCode: "documentation_knowledge",
    pillarName: "Documentation & Knowledge",
    question:
      "Could another trusted IT professional support your environment if your current IT contact was unavailable?",
  },
  {
    pillarCode: "technology_strategy",
    pillarName: "Technology Strategy",
    question: "Does your business have a documented technology roadmap or budget plan?",
  },
];

export const SNAPSHOT_TOTAL_STEPS =
  1 + 1 + SNAPSHOT_QUESTIONS.length; // intake + qualifier + pillar questions

export const SNAPSHOT_ESTIMATED_MINUTES = 5;
