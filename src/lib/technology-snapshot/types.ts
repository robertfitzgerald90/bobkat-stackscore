import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";

export type SnapshotAnswerValue = "yes" | "partially" | "no" | "unsure";

export type SnapshotItManagementModel =
  | "in_house"
  | "outsourced"
  | "part_time_internal"
  | "none"
  | "unsure";

export type SnapshotClassification =
  | "healthy"
  | "needs_attention"
  | "elevated_risk"
  | "immediate_action";

export type SnapshotAnswers = Record<TechnologyPillarCode, SnapshotAnswerValue>;

export type SnapshotLowestPillar = {
  code: TechnologyPillarCode;
  name: string;
  score: number;
  answer: SnapshotAnswerValue;
};

export type SnapshotResult = {
  totalScore: number;
  classification: SnapshotClassification;
  lowestPillars: SnapshotLowestPillar[];
  observations: string[];
};
