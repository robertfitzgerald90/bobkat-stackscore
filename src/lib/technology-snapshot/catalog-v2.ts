import type { SnapshotAnswerValue } from "./types";

/** Catalog version persisted on TechnologySnapshotLead for SNAP-003+. */
export const SNAPSHOT_CATALOG_VERSION_V2 = "snap-2.0" as const;
export const SNAPSHOT_CATALOG_VERSION_V1 = "snap-1.0" as const;

export type SnapshotCategoryId =
  | "security_access"
  | "devices_infrastructure"
  | "data_protection"
  | "technology_planning";

export type SnapshotQuestionV2 = {
  id: string;
  categoryId: SnapshotCategoryId;
  question: string;
  /** Short label used in strength/concern citations */
  shortLabel: string;
};

export type SnapshotCategoryDef = {
  id: SnapshotCategoryId;
  name: string;
  description: string;
};

export const SNAPSHOT_CATEGORIES_V2: SnapshotCategoryDef[] = [
  {
    id: "security_access",
    name: "Security & Access",
    description: "How people sign in and how security issues are watched.",
  },
  {
    id: "devices_infrastructure",
    name: "Devices & Infrastructure",
    description: "Computers, networks, and day-to-day tools employees rely on.",
  },
  {
    id: "data_protection",
    name: "Data Protection & Recovery",
    description: "Backups, restore readiness, and recovery planning.",
  },
  {
    id: "technology_planning",
    name: "Technology Planning",
    description: "Priorities, documentation, and how technology keeps up with the business.",
  },
];

export const SNAPSHOT_QUESTIONS_V2: SnapshotQuestionV2[] = [
  {
    id: "A1",
    categoryId: "security_access",
    shortLabel: "Multi-factor authentication",
    question:
      "Do people use an extra login step (like a code on their phone) when signing into important company systems?",
  },
  {
    id: "A2",
    categoryId: "security_access",
    shortLabel: "Offboarding access",
    question: "When someone leaves the company, are their system logins turned off promptly?",
  },
  {
    id: "A3",
    categoryId: "security_access",
    shortLabel: "Security alert review",
    question:
      "Does anyone regularly look at security alerts or “something looks wrong” notices for your systems?",
  },
  {
    id: "A4",
    categoryId: "security_access",
    shortLabel: "Shared password control",
    question:
      "Are shared passwords (shared inboxes, Wi‑Fi, vendor portals) avoided or carefully controlled?",
  },
  {
    id: "B1",
    categoryId: "devices_infrastructure",
    shortLabel: "Device updates",
    question: "Are company computers and phones kept up to date with security updates?",
  },
  {
    id: "B2",
    categoryId: "devices_infrastructure",
    shortLabel: "Reliable connectivity",
    question:
      "Can employees work reliably (internet, VPN, office Wi‑Fi) without frequent outages?",
  },
  {
    id: "B3",
    categoryId: "devices_infrastructure",
    shortLabel: "Collaboration tools",
    question: "Are email, files, and chat tools organized so people know where work belongs?",
  },
  {
    id: "B4",
    categoryId: "devices_infrastructure",
    shortLabel: "Support ownership",
    question:
      "Do you know who is responsible day-to-day when a computer or network issue happens?",
  },
  {
    id: "C1",
    categoryId: "data_protection",
    shortLabel: "Automated backups",
    question:
      "Is important company data backed up automatically (not only on someone’s laptop)?",
  },
  {
    id: "C2",
    categoryId: "data_protection",
    shortLabel: "Restore testing",
    question:
      "Has your business successfully restored files from backup in the last year (a real test, not just “we think it works”)?",
  },
  {
    id: "C3",
    categoryId: "data_protection",
    shortLabel: "Recovery plan",
    question:
      "If ransomware locked your files tomorrow, do you have a clear plan for how you’d recover?",
  },
  {
    id: "D1",
    categoryId: "technology_planning",
    shortLabel: "Technology priorities",
    question:
      "Does leadership have a simple written plan for technology priorities and spend this year?",
  },
  {
    id: "D2",
    categoryId: "technology_planning",
    shortLabel: "Support handoff readiness",
    question:
      "Could another trusted IT person take over support using your notes, passwords, and docs if your usual contact disappeared?",
  },
  {
    id: "D3",
    categoryId: "technology_planning",
    shortLabel: "Change-driven review",
    question:
      "Do you review technology needs when the business changes (new location, new software, growth)?",
  },
];

export const SNAPSHOT_ANSWER_OPTIONS_V2: Array<{
  value: SnapshotAnswerValue;
  label: string;
  points: number;
}> = [
  { value: "yes", label: "Yes", points: 3 },
  { value: "partially", label: "Somewhat / In Some Areas", points: 2 },
  { value: "unsure", label: "I'm Not Sure", points: 1 },
  { value: "no", label: "No", points: 0 },
];

export const SNAPSHOT_V2_QUESTION_COUNT = SNAPSHOT_QUESTIONS_V2.length;
export const SNAPSHOT_V2_MAX_SCORE = SNAPSHOT_V2_QUESTION_COUNT * 3; // 42
export const SNAPSHOT_V2_ESTIMATED_MINUTES = 5;

export const SNAPSHOT_QUESTION_IDS_V2 = SNAPSHOT_QUESTIONS_V2.map((q) => q.id) as [
  string,
  ...string[],
];

export function getSnapshotQuestionV2(id: string): SnapshotQuestionV2 | undefined {
  return SNAPSHOT_QUESTIONS_V2.find((q) => q.id === id);
}

export function getSnapshotCategoryV2(id: SnapshotCategoryId): SnapshotCategoryDef {
  const found = SNAPSHOT_CATEGORIES_V2.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown snapshot category: ${id}`);
  return found;
}

export function questionsForCategory(categoryId: SnapshotCategoryId): SnapshotQuestionV2[] {
  return SNAPSHOT_QUESTIONS_V2.filter((q) => q.categoryId === categoryId);
}
