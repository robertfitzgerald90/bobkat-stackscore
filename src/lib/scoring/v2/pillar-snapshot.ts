import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";
import type { PillarScoreResult } from "./types";

export type PillarScoreSnapshot = {
  pillarCode: TechnologyPillarCode;
  pillarName: string;
  businessQuestion: string;
  percentScore: number | null;
  maturityLevelCode: string | null;
  maturityLevelLabel: string | null;
  status: "complete" | "incomplete";
  questionsAnswered: number;
  questionsTotal: number;
};

export function toPillarScoreSnapshots(
  pillarScores: PillarScoreResult[],
): PillarScoreSnapshot[] {
  return TECHNOLOGY_PILLARS.map((pillar) => {
    const score = pillarScores.find((row) => row.pillarCode === pillar.code);
    return {
      pillarCode: pillar.code,
      pillarName: pillar.name,
      businessQuestion: pillar.businessQuestion,
      percentScore: score?.percentScore ?? null,
      maturityLevelCode: score?.maturityLevel?.code ?? null,
      maturityLevelLabel: score?.maturityLevel?.label ?? null,
      status: score?.status ?? "incomplete",
      questionsAnswered: score?.questionsAnswered ?? 0,
      questionsTotal: score?.questionsTotal ?? 0,
    };
  });
}
