import { describe, expect, it } from "vitest";
import catalog from "../../data/RecommendationCatalogV2.json";
import { evaluateV2Triggers, type V2TriggeredResponse } from "@/lib/recommendations/v2-engine";
import { buildDedupeKey } from "@/lib/recommendations/dedupe";
import { isStubRecommendationTemplate } from "@/lib/recommendations/stubs";
import {
  filterClientDeliverableRecommendations,
  presentRecommendationsForRole,
} from "@/lib/recommendations/visibility";

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

describe("SS-OPT-003B batch B1 catalog finalization", () => {
  const b1 = catalog.templates.filter((template) => B1_IDS.includes(template.id));
  const others = catalog.templates.filter((template) => !B1_IDS.includes(template.id));

  it("publishes exactly the 20 B1 templates", () => {
    expect(catalog.templates).toHaveLength(80);
    expect(b1).toHaveLength(20);
    expect(new Set(b1.map((template) => template.id)).size).toBe(20);
    expect(b1.every((template) => template.isStub === false)).toBe(true);
    // SS-CONTENT-006 completed the catalog → 80 approved / 0 stubs overall.
    expect(catalog.templates.filter((template) => template.isStub)).toHaveLength(0);
    expect(catalog.templates.filter((template) => !template.isStub)).toHaveLength(80);
  });

  it("applies approved editorial and priority adjustments", () => {
    const ia001 = b1.find((template) => template.id === "REC-IA-001");
    const ia003 = b1.find((template) => template.id === "REC-IA-003");
    const ia008 = b1.find((template) => template.id === "REC-IA-008");
    const so002 = b1.find((template) => template.id === "REC-SO-002");
    const so009 = b1.find((template) => template.id === "REC-SO-009");

    expect(ia001?.title).toBe("Centralize workforce identity and authentication");
    expect(ia003?.title).toBe("Replace shared employee credentials with individual accounts");
    expect(ia003?.priority).toBe("high");
    expect(ia008?.priority).toBe("high");
    expect(so009?.priority).toBe("medium");
    expect(so002?.businessImpact.startsWith(
      "Unpatched or misconfigured systems can expose organizations to preventable security incidents and operational disruptions.",
    )).toBe(true);
  });

  it("preserves IDs, questions, pillars, triggers, and content structure", () => {
    for (const template of b1) {
      expect(template.questionId).toMatch(/^(IA|SO)-\d{3}$/);
      expect(["identity_access", "security_operations"]).toContain(template.pillarCode);
      expect(template.triggerAnswers).toEqual(["No", "Partially"]);
      expect(template.alsoTriggerOnPartial).toBe(true);
      expect(isStubRecommendationTemplate(template.id)).toBe(false);
      expect(template.title.startsWith("Improve ")).toBe(false);
      expect(template.businessImpact.length).toBeGreaterThan(80);
      for (const marker of REQUIRED_DESCRIPTION_MARKERS) {
        expect(template.description).toContain(marker);
      }
    }
  });

  it("publishes all non-B1 pillars with no remaining catalog stubs", () => {
    const unfinished = others.filter((template) => template.isStub);
    const laterPublished = others.filter((template) => !template.isStub);
    expect(others).toHaveLength(60);
    expect(unfinished).toHaveLength(0);
    expect(laterPublished).toHaveLength(60);
    expect(laterPublished.every((template) => !template.title.startsWith("Improve "))).toBe(true);
    expect(
      laterPublished.some((template) => template.id.startsWith("REC-NW-")) &&
        laterPublished.some((template) => template.id.startsWith("REC-PC-")),
    ).toBe(true);
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

  it("exposes approved B1 recommendations to clients while hiding remaining stubs", () => {
    const approvedRows = b1.map((template) => ({
      id: template.id,
      title: template.title,
      templateCode: template.id,
      latestTriggerReason: "test",
    }));
    // Synthetic unfinished fixtures — catalog no longer carries real stubs (SS-CONTENT-006).
    const stubRows = [
      {
        id: "synthetic-1",
        title: "Improve Synthetic Network Gap",
        templateCode: "REC-TEST-STUB-001",
        latestTriggerReason: "test",
      },
      {
        id: "synthetic-2",
        title: "Improve Synthetic Collaboration Gap",
        templateCode: "REC-TEST-STUB-002",
        latestTriggerReason: "test",
      },
      {
        id: "synthetic-3",
        title: "Improve Synthetic Documentation Gap",
        templateCode: "REC-TEST-STUB-003",
        latestTriggerReason: "test",
      },
    ];

    expect(presentRecommendationsForRole(approvedRows, "client")).toHaveLength(20);
    expect(presentRecommendationsForRole(stubRows, "client")).toHaveLength(0);
    expect(
      filterClientDeliverableRecommendations([...approvedRows, ...stubRows], "client"),
    ).toHaveLength(20);
    expect(
      filterClientDeliverableRecommendations([...approvedRows, ...stubRows], "admin"),
    ).toHaveLength(23);
  });
});
