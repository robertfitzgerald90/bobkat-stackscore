import { describe, expect, it } from "vitest";
import catalog from "../../data/RecommendationCatalogV2.json";
import { evaluateV2Triggers, type V2TriggeredResponse } from "@/lib/recommendations/v2-engine";
import { isStubRecommendationTemplate } from "@/lib/recommendations/stubs";
import {
  filterClientDeliverableRecommendations,
  hasUnpublishedStubTitle,
  presentRecommendationsForRole,
} from "@/lib/recommendations/visibility";
import { calculateProjectionImpacts } from "@/lib/recommendations/engine";
import { calculateProjectedScore } from "@/lib/scoring";

const CONTENT_BATCH_1_IDS = [
  ...Array.from({ length: 10 }, (_, i) => `REC-DK-${String(i + 1).padStart(3, "0")}`),
  ...Array.from({ length: 10 }, (_, i) => `REC-TS-${String(i + 1).padStart(3, "0")}`),
];

const PRIOR_APPROVED_IDS = [
  ...Array.from({ length: 10 }, (_, i) => `REC-IA-${String(i + 1).padStart(3, "0")}`),
  ...Array.from({ length: 10 }, (_, i) => `REC-SO-${String(i + 1).padStart(3, "0")}`),
];

const MARKERS = [
  "Finding:",
  "Recommended action:",
  "Expected outcome:",
  "Implementation considerations:",
];

describe("SS-CONTENT-002 Batch 1 publication (DK + TS)", () => {
  const batch = catalog.templates.filter((template) => CONTENT_BATCH_1_IDS.includes(template.id));
  const published = catalog.templates.filter((template) => !template.isStub);
  const stubs = catalog.templates.filter((template) => template.isStub);

  it("publishes exactly 20 DK/TS templates and keeps them approved after later batches", () => {
    expect(catalog.templates).toHaveLength(80);
    expect(batch).toHaveLength(20);
    // SS-CONTENT-006 completed the catalog (80/0); DK/TS remain approved.
    expect(published).toHaveLength(80);
    expect(stubs).toHaveLength(0);
    expect(batch.every((template) => template.isStub === false)).toBe(true);
    expect(CONTENT_BATCH_1_IDS.every((id) => !isStubRecommendationTemplate(id))).toBe(true);
  });

  it("preserves IDs, mappings, triggers, priority, and impact points structure", () => {
    for (const template of batch) {
      expect(template.questionId).toMatch(/^(DK|TS)-\d{3}$/);
      expect(["documentation_knowledge", "technology_strategy"]).toContain(template.pillarCode);
      expect(template.triggerAnswers).toEqual(["No", "Partially"]);
      expect(template.alsoTriggerOnPartial).toBe(true);
      expect(template.title.startsWith("Improve ")).toBe(false);
      expect(hasUnpublishedStubTitle(template.title)).toBe(false);
      expect(template.businessImpact.length).toBeGreaterThan(80);
      for (const marker of MARKERS) {
        expect(template.description).toContain(marker);
      }
    }

    expect(batch.find((row) => row.id === "REC-DK-003")?.priority).toBe("critical");
    expect(batch.find((row) => row.id === "REC-DK-003")?.estimatedImpactPoints).toBe(10);
    expect(batch.find((row) => row.id === "REC-TS-001")?.priority).toBe("critical");
    expect(batch.find((row) => row.id === "REC-TS-001")?.estimatedImpactPoints).toBe(10);
    expect(batch.find((row) => row.id === "REC-DK-001")?.suggestedService).toBe(
      "Documentation & Knowledge Improvement",
    );
    expect(batch.find((row) => row.id === "REC-TS-001")?.suggestedService).toBe(
      "Technology Strategy Improvement",
    );
  });

  it("does not alter previously approved IA/SO copy", () => {
    const ia001 = catalog.templates.find((template) => template.id === "REC-IA-001");
    expect(ia001?.isStub).toBe(false);
    expect(ia001?.title).toBe("Centralize workforce identity and authentication");
  });

  it("exposes published DK/TS to clients and keeps synthetic unfinished fixtures hidden", () => {
    const approvedRows = published.map((template) => ({
      id: template.id,
      title: template.title,
      templateCode: template.id,
    }));
    const stubRows = Array.from({ length: 5 }, (_, i) => ({
      id: `synthetic-${i + 1}`,
      title: `Improve Synthetic Gap ${i + 1}`,
      templateCode: `REC-TEST-STUB-00${i + 1}`,
    }));

    expect(presentRecommendationsForRole(approvedRows, "client")).toHaveLength(80);
    expect(presentRecommendationsForRole(stubRows, "client")).toHaveLength(0);
    expect(
      filterClientDeliverableRecommendations([...approvedRows, ...stubRows], "client"),
    ).toHaveLength(80);
    expect(
      filterClientDeliverableRecommendations([...approvedRows, ...stubRows], "admin"),
    ).toHaveLength(85);
  });

  it("triggers published DK/TS templates from No answers", () => {
    const responses: V2TriggeredResponse[] = batch.map((template) => ({
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
    expect(generated.every((row) => CONTENT_BATCH_1_IDS.includes(row.templateCode))).toBe(true);
  });

  it("supports ABC LLC-style projection math with expanded deliverable set", () => {
    // Regression fixture shape from SS-REL-013: only IA+SO previously → 39+20=59.
    // With DK/TS also deliverable, category-max can include those pillars when triggered.
    const iaSoOnly = catalog.templates
      .filter((template) => PRIOR_APPROVED_IDS.includes(template.id))
      .slice(0, 4)
      .map((template) => ({
        templateCode: template.id,
        consolidationGroupId: null,
        title: template.title,
        description: template.description,
        businessImpact: template.businessImpact,
        suggestedService: template.suggestedService,
        priority: template.priority,
        estimatedImpactPoints: template.estimatedImpactPoints,
        categoryName: template.pillarName,
        isConsolidated: false,
      }));

    const impact = calculateProjectionImpacts(iaSoOnly);
    expect(calculateProjectedScore(39, [impact])).toBeLessThanOrEqual(100);
    expect(impact).toBeGreaterThan(0);
  });
});
