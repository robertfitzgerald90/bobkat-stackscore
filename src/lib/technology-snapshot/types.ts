import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";

export type SnapshotAnswerValue = "yes" | "partially" | "no" | "unsure";

export type SnapshotItManagementModel =
  | "in_house"
  | "outsourced"
  | "part_time_internal"
  | "none"
  | "unsure";

/** Legacy snap-1.0 classification keys (8-question / 0–24 engine). */
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

export type {
  SnapshotAnswersV2,
  SnapshotFindingsV2,
  SnapshotPostureBand,
} from "./engine/types";
