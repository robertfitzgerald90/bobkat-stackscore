import { describe, expect, it } from "vitest";
import {
  SNAPSHOT_QUESTIONS_V2,
  SNAPSHOT_V2_MAX_SCORE,
} from "@/lib/technology-snapshot/catalog-v2";
import {
  buildSnapshotFindingsV2,
  classifyPosturePoints,
  getAnswerPointsV2,
  type SnapshotAnswersV2,
} from "@/lib/technology-snapshot/engine";
import type { SnapshotAnswerValue } from "@/lib/technology-snapshot/types";

function allAnswers(value: SnapshotAnswerValue): SnapshotAnswersV2 {
  return Object.fromEntries(
    SNAPSHOT_QUESTIONS_V2.map((q) => [q.id, value]),
  ) as SnapshotAnswersV2;
}

describe("snapshot 2.0 engine", () => {
  it("maps answer points 3/2/1/0", () => {
    expect(getAnswerPointsV2("yes")).toBe(3);
    expect(getAnswerPointsV2("partially")).toBe(2);
    expect(getAnswerPointsV2("unsure")).toBe(1);
    expect(getAnswerPointsV2("no")).toBe(0);
  });

  it("uses max score 42", () => {
    expect(SNAPSHOT_V2_MAX_SCORE).toBe(42);
    expect(buildSnapshotFindingsV2(allAnswers("yes")).overall.points).toBe(42);
  });

  it("classifies overall posture bands by normalized percent", () => {
    // ≥87% strong · ≥62% mixed · ≥33% notable · else urgent
    expect(classifyPosturePoints(42, 42)).toBe("strong_foundation");
    expect(classifyPosturePoints(37, 42)).toBe("strong_foundation"); // 88.1%
    expect(classifyPosturePoints(36, 42)).toBe("mixed_signals"); // 85.7%
    expect(classifyPosturePoints(27, 42)).toBe("mixed_signals"); // 64.3%
    expect(classifyPosturePoints(26, 42)).toBe("notable_gaps"); // 61.9%
    expect(classifyPosturePoints(14, 42)).toBe("notable_gaps"); // 33.3%
    expect(classifyPosturePoints(13, 42)).toBe("urgent_attention"); // 31.0%
    expect(classifyPosturePoints(0, 42)).toBe("urgent_attention");
  });

  it("strong profile: all yes", () => {
    const findings = buildSnapshotFindingsV2(allAnswers("yes"));
    expect(findings.overall.band).toBe("strong_foundation");
    expect(findings.overall.classificationLabel).toBe("Strong Foundation");
    expect(findings.criticalRisks).toHaveLength(0);
    expect(findings.categories).toHaveLength(4);
    expect(findings.keyFindings.opportunities).toHaveLength(0);
  });

  it("all unsure yields notable gaps without critical-risk flags", () => {
    const findings = buildSnapshotFindingsV2(allAnswers("unsure"));
    // 14×1 = 14/42 ≈ 33.3% → Notable Gaps (not forced urgent by flags)
    expect(findings.overall.band).toBe("notable_gaps");
    // Critical flags only fire on explicit "no" for documented rules
    expect(findings.criticalRisks).toHaveLength(0);
  });

  it("all no produces urgent posture and critical risk flags", () => {
    const findings = buildSnapshotFindingsV2(allAnswers("no"));
    expect(findings.overall.band).toBe("urgent_attention");
    expect(findings.criticalRisks.map((r) => r.id).sort()).toEqual([
      "missing_backups",
      "missing_mfa",
      "missing_recovery_plan",
      "untested_restore",
    ]);
    expect(findings.keyFindings.opportunities).toHaveLength(3);
    for (const opp of findings.keyFindings.opportunities) {
      expect(opp.questionId).toBeTruthy();
      expect(opp.answer).toBe("no");
    }
  });

  it("keeps a critical MFA flag visible on otherwise strong posture", () => {
    const answers = allAnswers("yes");
    answers.A1 = "no"; // −3 pts → 39/42 ≈ 92.9% still Strong Foundation
    const findings = buildSnapshotFindingsV2(answers);
    expect(findings.overall.band).toBe("strong_foundation");
    expect(findings.criticalRisks).toEqual([
      expect.objectContaining({
        id: "missing_mfa",
        questionId: "A1",
        answer: "no",
      }),
    ]);
  });

  it("keeps backup critical flags without forcing overall urgent solely from one gap", () => {
    const answers = allAnswers("yes");
    answers.C1 = "no";
    const findings = buildSnapshotFindingsV2(answers);
    expect(findings.overall.band).toBe("strong_foundation");
    expect(findings.criticalRisks.map((r) => r.id)).toEqual(["missing_backups"]);
  });

  it("uses normalized percents when comparing uneven category sizes", () => {
    const answers = allAnswers("yes");
    // Drop data protection (3Q) to zero while keeping others full
    answers.C1 = "no";
    answers.C2 = "no";
    answers.C3 = "no";
    const findings = buildSnapshotFindingsV2(answers);
    const data = findings.categories.find((c) => c.id === "data_protection")!;
    const security = findings.categories.find((c) => c.id === "security_access")!;
    expect(data.percent).toBe(0);
    expect(security.percent).toBe(100);
    expect(findings.keyFindings.highestRiskCategoryId).toBe("data_protection");
  });

  it("is deterministic for identical answers", () => {
    const answers = allAnswers("partially");
    answers.A1 = "no";
    const a = buildSnapshotFindingsV2(answers, new Date("2026-10-31T12:00:00.000Z"));
    const b = buildSnapshotFindingsV2(answers, new Date("2026-10-31T12:00:00.000Z"));
    expect(a).toEqual(b);
  });
});
