import type { SnapshotCategoryId } from "../catalog-v2";
import type { SnapshotAnswerValue } from "../types";

export type SnapshotPostureBand =
  | "strong_foundation"
  | "mixed_signals"
  | "notable_gaps"
  | "urgent_attention";

export type SnapshotAnswersV2 = Record<string, SnapshotAnswerValue>;

export type SnapshotFindingCitation = {
  questionId: string;
  answer: SnapshotAnswerValue;
  points: number;
  text: string;
};

export type SnapshotCriticalRiskId =
  | "missing_mfa"
  | "missing_backups"
  | "untested_restore"
  | "missing_recovery_plan";

export type SnapshotCriticalRisk = {
  id: SnapshotCriticalRiskId;
  title: string;
  summary: string;
  questionId: string;
  answer: SnapshotAnswerValue;
};

export type SnapshotCategoryFinding = {
  id: SnapshotCategoryId;
  name: string;
  points: number;
  max: number;
  /** 0–100 normalized for radar / comparison */
  percent: number;
  band: SnapshotPostureBand;
  classificationLabel: string;
  summary: string;
  strength: SnapshotFindingCitation | null;
  concern: SnapshotFindingCitation | null;
  nextStep: string;
};

export type SnapshotOpportunity = {
  questionId: string;
  title: string;
  why: string;
  answer: SnapshotAnswerValue;
  points: number;
};

export type SnapshotFindingsV2 = {
  catalogVersion: "snap-2.0";
  scoredAt: string;
  overall: {
    points: number;
    max: number;
    band: SnapshotPostureBand;
    classificationLabel: string;
    summary: string;
  };
  categories: SnapshotCategoryFinding[];
  keyFindings: {
    strongestCategoryId: SnapshotCategoryId;
    highestRiskCategoryId: SnapshotCategoryId;
    opportunities: SnapshotOpportunity[];
  };
  criticalRisks: SnapshotCriticalRisk[];
};
