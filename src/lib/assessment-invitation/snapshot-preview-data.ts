import type { SnapshotResultCardData } from "@/components/snapshot/snapshot-result-card";

export const INVITATION_SNAPSHOT_PREVIEW_DATA: SnapshotResultCardData = {
  companyName: "Atlas — Project Management",
  score: 7,
  maxScore: 24,
  status: "Immediate Action Recommended",
  classification: "immediate_action",
  summary:
    "Critical technology weaknesses may be exposing your business. Prioritize remediation and expert guidance as soon as possible.",
  observations: [
    "IT knowledge may depend on a single person — business continuity is at risk if they are unavailable.",
    "Security alerts and vulnerabilities may not be actively reviewed — threats can go unnoticed.",
    "A documented technology roadmap or budget plan may be missing — investments can become reactive.",
  ],
};
