import { describe, expect, it } from "vitest";
import catalog from "../../data/RecommendationCatalogV2.json";
import { evaluateV2Triggers, type V2TriggeredResponse } from "@/lib/recommendations/v2-engine";
import {
  filterClientDeliverableRecommendations,
  hasUnpublishedStubTitle,
} from "@/lib/recommendations/visibility";
import { isStubRecommendationTemplate } from "@/lib/recommendations/stubs";

const B1_IDS = [
  ...Array.from({ length: 10 }, (_, i) => `REC-IA-${String(i + 1).padStart(3, "0")}`),
  ...Array.from({ length: 10 }, (_, i) => `REC-SO-${String(i + 1).padStart(3, "0")}`),
];

const MARKERS = [
  "Finding:",
  "Recommended action:",
  "Expected outcome:",
  "Implementation considerations:",
];

describe("SS-OPT-003B B1 client deliverable quality (catalog + generation)", () => {
  const published = catalog.templates.filter((t) => B1_IDS.includes(t.id));

  it("published B1 narratives have complete client-ready structure", () => {
    expect(published).toHaveLength(20);
    for (const template of published) {
      expect(template.isStub).toBe(false);
      expect(hasUnpublishedStubTitle(template.title)).toBe(false);
      expect(template.title.length).toBeGreaterThan(20);
      expect(template.businessImpact.length).toBeGreaterThan(80);
      expect(template.suggestedService.length).toBeGreaterThan(3);
      for (const marker of MARKERS) {
        expect(template.description).toContain(marker);
      }
      expect(template.description.toLowerCase()).not.toMatch(/\b(todo|tbd|lorem ipsum|placeholder)\b/);
    }
  });

  it("low/moderate/mixed maturity client deliverables only include published B1 copy", () => {
    const modes = {
      low: "No" as const,
      moderate: "Partially" as const,
    };

    for (const [label, answerText] of Object.entries(modes)) {
      const scoreValue = answerText === "No" ? 0 : 50;
      const responses: V2TriggeredResponse[] = catalog.templates.map((template) => ({
        questionCode: template.questionId,
        answerText,
        scoreValue,
        weight: 5,
        templateCode: template.id,
        triggersCriticalFlag: template.priority === "critical",
        pillarCode: template.pillarCode,
      }));
      const generated = evaluateV2Triggers(responses);
      const forClient = filterClientDeliverableRecommendations(
        generated.map((row) => ({
          id: row.templateCode,
          title: row.title,
          description: row.description,
          businessImpact: row.businessImpact,
          priority: row.priority,
          templateCode: row.templateCode,
        })),
        "client",
      );

      expect(forClient.length, label).toBe(20);
      expect(forClient.every((row) => B1_IDS.includes(String(row.templateCode)))).toBe(true);
      expect(forClient.every((row) => !isStubRecommendationTemplate(String(row.templateCode)))).toBe(
        true,
      );
      expect(forClient.every((row) => !hasUnpublishedStubTitle(row.title))).toBe(true);
      expect(
        forClient.every((row) => MARKERS.every((marker) => String(row.description).includes(marker))),
      ).toBe(true);
    }
  });

  it("preserves approved editorial titles and priority elevations in generated client copy", () => {
    const responses: V2TriggeredResponse[] = ["REC-IA-001", "REC-IA-003", "REC-IA-008", "REC-SO-009"].map(
      (id) => {
        const template = catalog.templates.find((t) => t.id === id)!;
        return {
          questionCode: template.questionId,
          answerText: "No",
          scoreValue: 0,
          weight: 5,
          templateCode: template.id,
          triggersCriticalFlag: false,
          pillarCode: template.pillarCode,
        };
      },
    );
    const generated = evaluateV2Triggers(responses);
    const byCode = new Map(generated.map((row) => [row.templateCode, row]));
    expect(byCode.get("REC-IA-001")?.title).toBe(
      "Centralize workforce identity and authentication",
    );
    expect(byCode.get("REC-IA-003")?.title).toBe(
      "Replace shared employee credentials with individual accounts",
    );
    expect(byCode.get("REC-IA-003")?.priority).toBe("high");
    expect(byCode.get("REC-IA-008")?.priority).toBe("high");
    expect(byCode.get("REC-SO-009")?.priority).toBe("medium");
  });
});
