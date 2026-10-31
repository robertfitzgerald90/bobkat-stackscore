import type { SnapshotAnswerValue } from "../types";
import type { SnapshotAnswersV2, SnapshotCriticalRisk } from "./types";

/**
 * Explicit critical-risk rules (SS-SNAP-003).
 * These are advisory flags — they do NOT force overall posture to urgent_attention.
 * Each flag cites a question ID and answer for auditability.
 */
const CRITICAL_RISK_RULES: Array<{
  id: SnapshotCriticalRisk["id"];
  questionId: string;
  matches: SnapshotAnswerValue[];
  title: string;
  summary: string;
}> = [
  {
    id: "missing_mfa",
    questionId: "A1",
    matches: ["no"],
    title: "Multi-factor authentication appears missing",
    summary:
      "You indicated people do not use an extra login step for important systems. That can make account takeover easier if a password is guessed or leaked.",
  },
  {
    id: "missing_backups",
    questionId: "C1",
    matches: ["no"],
    title: "Automated backups appear missing",
    summary:
      "You indicated important company data is not backed up automatically. A device failure or ransomware event could put records at risk.",
  },
  {
    id: "untested_restore",
    questionId: "C2",
    matches: ["no"],
    title: "Backup restore has not been tested recently",
    summary:
      "You indicated a successful restore has not been completed in the last year. Untested backups often fail when they are needed most.",
  },
  {
    id: "missing_recovery_plan",
    questionId: "C3",
    matches: ["no"],
    title: "Recovery plan appears unclear",
    summary:
      "You indicated there is no clear plan if ransomware locked your files. Without a rehearsed path, downtime and data loss can escalate quickly.",
  },
];

export function buildCriticalRisks(answers: SnapshotAnswersV2): SnapshotCriticalRisk[] {
  const flags: SnapshotCriticalRisk[] = [];

  for (const rule of CRITICAL_RISK_RULES) {
    const answer = answers[rule.questionId];
    if (!answer || !rule.matches.includes(answer)) continue;
    flags.push({
      id: rule.id,
      title: rule.title,
      summary: rule.summary,
      questionId: rule.questionId,
      answer,
    });
  }

  return flags;
}
