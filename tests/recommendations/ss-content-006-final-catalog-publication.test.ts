import { describe, expect, it } from "vitest";
import catalog from "../../data/RecommendationCatalogV2.json";
import { evaluateV2Triggers, type V2TriggeredResponse } from "@/lib/recommendations/v2-engine";
import {
  isStubRecommendationTemplate,
  SYNTHETIC_STUB_TEMPLATE_PREFIX,
} from "@/lib/recommendations/stubs";
import {
  filterClientDeliverableRecommendations,
  hasUnpublishedStubTitle,
  presentRecommendationsForRole,
} from "@/lib/recommendations/visibility";

const CONTENT_BATCH_3_IDS = [
  ...Array.from({ length: 10 }, (_, i) => `REC-NW-${String(i + 1).padStart(3, "0")}`),
  ...Array.from({ length: 10 }, (_, i) => `REC-PC-${String(i + 1).padStart(3, "0")}`),
];

const MARKERS = [
  "Finding:",
  "Recommended action:",
  "Expected outcome:",
  "Implementation considerations:",
];

const PILLARS = [
  "identity_access",
  "security_operations",
  "documentation_knowledge",
  "technology_strategy",
  "endpoint_management",
  "data_protection_recovery",
  "network_connectivity",
  "productivity_collaboration",
] as const;

describe("SS-CONTENT-006 final catalog publication (NW + PC)", () => {
  const batch = catalog.templates.filter((template) => CONTENT_BATCH_3_IDS.includes(template.id));
  const published = catalog.templates.filter((template) => !template.isStub);
  const stubs = catalog.templates.filter((template) => template.isStub);

  it("publishes NW/PC and completes the catalog at 80 approved / 0 stubs", () => {
    expect(catalog.templates).toHaveLength(80);
    expect(batch).toHaveLength(20);
    expect(published).toHaveLength(80);
    expect(stubs).toHaveLength(0);
    expect(batch.every((template) => template.isStub === false)).toBe(true);
    expect(CONTENT_BATCH_3_IDS.every((id) => !isStubRecommendationTemplate(id))).toBe(true);
    expect(new Set(catalog.templates.map((template) => template.id)).size).toBe(80);
    expect(new Set(published.map((template) => template.pillarCode)).size).toBe(8);
    for (const pillar of PILLARS) {
      expect(published.filter((template) => template.pillarCode === pillar)).toHaveLength(10);
    }
  });

  it("requires complete four-part structure and no Improve titles on published templates", () => {
    for (const template of published) {
      expect(template.title.startsWith("Improve ")).toBe(false);
      expect(hasUnpublishedStubTitle(template.title)).toBe(false);
      expect(template.businessImpact.length).toBeGreaterThan(80);
      expect(template.suggestedService.length).toBeGreaterThan(3);
      for (const marker of MARKERS) {
        expect(template.description).toContain(marker);
      }
      expect(template.questionId).toMatch(/^(IA|SO|DK|TS|EP|DP|NW|PC)-\d{3}$/);
      expect(template.id).toBe(`REC-${template.questionId}`);
    }
  });

  it("applies editorial refinements for REC-NW-001 and REC-PC-001", () => {
    const nw001 = batch.find((row) => row.id === "REC-NW-001");
    expect(nw001?.title).toBe(
      "Use networking equipment that meets business reliability and support needs",
    );
    expect(nw001?.description.toLowerCase()).toContain("not every consumer");
    expect(nw001?.description.toLowerCase()).toMatch(/reliab|manageab|supportab/);

    const pc001 = batch.find((row) => row.id === "REC-PC-001");
    expect(pc001?.title).toBe("Standardize centrally administered productivity capabilities");
    expect(pc001?.description.toLowerCase()).toContain("single vendor");
    expect(pc001?.description.toLowerCase()).toContain("centrally administered");
  });

  it("preserves previously approved IA/SO/DK/TS/EP/DP titles", () => {
    expect(catalog.templates.find((t) => t.id === "REC-IA-001")?.title).toBe(
      "Centralize workforce identity and authentication",
    );
    expect(catalog.templates.find((t) => t.id === "REC-DK-001")?.title).toBe(
      "Document the business network for support and recovery",
    );
    expect(catalog.templates.find((t) => t.id === "REC-EP-005")?.title).toBe(
      "Encrypt portable devices that store or cache business data",
    );
    expect(catalog.templates.find((t) => t.id === "REC-DP-007")?.isStub).toBe(false);
  });

  it("exposes the full approved set to clients and fail-closes synthetic unfinished fixtures", () => {
    const approvedRows = published.map((template) => ({
      id: template.id,
      title: template.title,
      templateCode: template.id,
    }));
    const syntheticRows = [
      {
        id: "syn-1",
        title: "Improve Synthetic Unfinished Gap",
        templateCode: `${SYNTHETIC_STUB_TEMPLATE_PREFIX}001`,
      },
      {
        id: "syn-2",
        title: "Malformed Without Code",
      },
    ];

    expect(presentRecommendationsForRole(approvedRows, "client")).toHaveLength(80);
    expect(presentRecommendationsForRole(syntheticRows, "client")).toHaveLength(0);
    expect(
      filterClientDeliverableRecommendations([...approvedRows, ...syntheticRows], "client"),
    ).toHaveLength(80);
    expect(
      filterClientDeliverableRecommendations([...approvedRows, ...syntheticRows], "admin"),
    ).toHaveLength(82);
    expect(isStubRecommendationTemplate(`${SYNTHETIC_STUB_TEMPLATE_PREFIX}001`)).toBe(true);
  });

  it("triggers published NW/PC templates from No answers without question stems or pricing claims", () => {
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
    expect(generated.every((row) => CONTENT_BATCH_3_IDS.includes(row.templateCode))).toBe(true);
    expect(generated.every((row) => !row.title.includes("?"))).toBe(true);
    expect(
      generated.every(
        (row) => !/\$\d|\bROI\b|guaranteed maturity|guaranteed improvement/i.test(row.description),
      ),
    ).toBe(true);
    expect(batch.find((row) => row.id === "REC-NW-001")?.suggestedService).toBe(
      "Network & Connectivity Improvement",
    );
    expect(batch.find((row) => row.id === "REC-PC-001")?.suggestedService).toBe(
      "Productivity & Collaboration Improvement",
    );
  });
});
