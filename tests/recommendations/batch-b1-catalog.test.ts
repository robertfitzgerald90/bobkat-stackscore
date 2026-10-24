import { describe, expect, it } from "vitest";
import catalog from "../../data/RecommendationCatalogV2.json";
import { evaluateV2Triggers, type V2TriggeredResponse } from "@/lib/recommendations/v2-engine";
import { buildDedupeKey } from "@/lib/recommendations/dedupe";
import { isStubRecommendationTemplate } from "@/lib/recommendations/stubs";
import { presentRecommendationsForRole } from "@/lib/recommendations/visibility";

const B1_IDS = [
  ...Array.from({ length: 10 }, (_, index) => `REC-IA-${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 10 }, (_, index) => `REC-SO-${String(index + 1).padStart(3, "0")}`),
];

const REQUIRED_DESCRIPTION_MARKERS = [
  "Finding:",
  "Recommended action:",
  "Expected outcome:",
  "Implementation considerations:",
];

describe("SS-OPT-003B batch B1 catalog drafts", () => {
  const b1 = catalog.templates.filter((template) => B1_IDS.includes(template.id));
  const others = catalog.templates.filter((template) => !B1_IDS.includes(template.id));

  it("updates exactly the 20 B1 templates", () => {
    expect(catalog.templates).toHaveLength(80);
    expect(b1).toHaveLength(20);
    expect(new Set(b1.map((template) => template.id)).size).toBe(20);
  });

  it("preserves IDs, questions, pillars, triggers, points, and stub gate", () => {
    for (const template of b1) {
      expect(template.questionId).toMatch(/^(IA|SO)-\d{3}$/);
      expect(["identity_access", "security_operations"]).toContain(template.pillarCode);
      expect(template.triggerAnswers).toEqual(["No", "Partially"]);
      expect(template.alsoTriggerOnPartial).toBe(true);
      expect(template.isStub).toBe(true);
      expect(isStubRecommendationTemplate(template.id)).toBe(true);
      expect(template.title.startsWith("Improve ")).toBe(false);
      expect(template.businessImpact.length).toBeGreaterThan(80);
      for (const marker of REQUIRED_DESCRIPTION_MARKERS) {
        expect(template.description).toContain(marker);
      }
    }
  });

  it("does not rewrite non-B1 stub templates", () => {
    expect(others).toHaveLength(60);
    expect(others.every((template) => template.isStub)).toBe(true);
    expect(others.every((template) => template.title.startsWith("Improve "))).toBe(true);
  });

  it("still triggers and dedupes B1 templates from No answers", () => {
    const responses: V2TriggeredResponse[] = b1.map((template) => ({
      questionCode: template.questionId,
      answerText: "No",
      scoreValue: 0,
      weight: 5,
      templateCode: template.id,
      triggersCriticalFlag: template.priority === "critical",
      pillarCode: template.pillarCode,
    }));

    const generated = evaluateV2Triggers(responses);
    expect(generated).toHaveLength(20);
    expect(generated.map((row) => row.templateCode).sort()).toEqual([...B1_IDS].sort());
    expect(buildDedupeKey({ templateCode: "REC-IA-002" })).toBe("template:REC-IA-002");
  });

  it("keeps stub recommendations hidden from client presentation", () => {
    const rows = b1.map((template) => ({
      id: template.id,
      title: template.title,
      templateCode: template.id,
      latestTriggerReason: "test",
    }));
    expect(presentRecommendationsForRole(rows, "client")).toHaveLength(0);
    expect(presentRecommendationsForRole(rows, "admin")).toHaveLength(20);
  });
});
