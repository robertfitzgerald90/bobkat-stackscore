import { describe, expect, it } from "vitest";
import catalog from "../../data/RecommendationCatalogV2.json";
import { evaluateV2Triggers, type V2TriggeredResponse } from "@/lib/recommendations/v2-engine";
import { isStubRecommendationTemplate } from "@/lib/recommendations/stubs";
import {
  filterClientDeliverableRecommendations,
  hasUnpublishedStubTitle,
  presentRecommendationsForRole,
} from "@/lib/recommendations/visibility";

const CONTENT_BATCH_2_IDS = [
  ...Array.from({ length: 10 }, (_, i) => `REC-EP-${String(i + 1).padStart(3, "0")}`),
  ...Array.from({ length: 10 }, (_, i) => `REC-DP-${String(i + 1).padStart(3, "0")}`),
];

const MARKERS = [
  "Finding:",
  "Recommended action:",
  "Expected outcome:",
  "Implementation considerations:",
];

describe("SS-CONTENT-004 Batch 2 publication (EP + DP)", () => {
  const batch = catalog.templates.filter((template) => CONTENT_BATCH_2_IDS.includes(template.id));
  const published = catalog.templates.filter((template) => !template.isStub);
  const stubs = catalog.templates.filter((template) => template.isStub);

  it("publishes exactly 20 EP/DP templates and keeps them approved after later batches", () => {
    expect(catalog.templates).toHaveLength(80);
    expect(batch).toHaveLength(20);
    // SS-CONTENT-006 completed the catalog (80/0); EP/DP remain approved.
    expect(published).toHaveLength(80);
    expect(stubs).toHaveLength(0);
    expect(batch.every((template) => template.isStub === false)).toBe(true);
    expect(CONTENT_BATCH_2_IDS.every((id) => !isStubRecommendationTemplate(id))).toBe(true);
  });

  it("preserves IDs, mappings, triggers, priority, and impact points structure", () => {
    for (const template of batch) {
      expect(template.questionId).toMatch(/^(EP|DP)-\d{3}$/);
      expect(["endpoint_management", "data_protection_recovery"]).toContain(template.pillarCode);
      expect(template.triggerAnswers).toEqual(["No", "Partially"]);
      expect(template.alsoTriggerOnPartial).toBe(true);
      expect(template.title.startsWith("Improve ")).toBe(false);
      expect(hasUnpublishedStubTitle(template.title)).toBe(false);
      expect(template.businessImpact.length).toBeGreaterThan(80);
      for (const marker of MARKERS) {
        expect(template.description).toContain(marker);
      }
    }

    expect(batch.find((row) => row.id === "REC-EP-003")?.priority).toBe("critical");
    expect(batch.find((row) => row.id === "REC-EP-003")?.estimatedImpactPoints).toBe(10);
    expect(batch.find((row) => row.id === "REC-DP-001")?.priority).toBe("critical");
    expect(batch.find((row) => row.id === "REC-DP-001")?.estimatedImpactPoints).toBe(10);
    expect(batch.find((row) => row.id === "REC-EP-001")?.suggestedService).toBe(
      "Endpoint Management Improvement",
    );
    expect(batch.find((row) => row.id === "REC-DP-001")?.suggestedService).toBe(
      "Data Protection & Recovery Improvement",
    );
  });

  it("applies editorial refinements for REC-EP-005 and REC-DP-007", () => {
    const ep005 = batch.find((row) => row.id === "REC-EP-005");
    expect(ep005?.title).toBe("Encrypt portable devices that store or cache business data");
    expect(ep005?.description.toLowerCase()).toContain("store or cache business data");

    const dp007 = batch.find((row) => row.id === "REC-DP-007");
    expect(dp007?.description).toContain(
      "Separate backup administrative credentials from ordinary production administrative access",
    );
  });

  it("does not alter previously approved IA/SO/DK/TS copy", () => {
    expect(catalog.templates.find((t) => t.id === "REC-IA-001")?.title).toBe(
      "Centralize workforce identity and authentication",
    );
    expect(catalog.templates.find((t) => t.id === "REC-DK-001")?.title).toBe(
      "Document the business network for support and recovery",
    );
    expect(catalog.templates.find((t) => t.id === "REC-TS-001")?.isStub).toBe(false);
  });

  it("exposes published EP/DP to clients and keeps synthetic unfinished fixtures hidden", () => {
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

  it("triggers published EP/DP templates from No answers without question-stem titles", () => {
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
    expect(generated.every((row) => CONTENT_BATCH_2_IDS.includes(row.templateCode))).toBe(true);
    expect(generated.every((row) => !row.title.includes("?"))).toBe(true);
    expect(generated.every((row) => !/\$|ROI|guaranteed/i.test(row.description))).toBe(true);
  });
});
