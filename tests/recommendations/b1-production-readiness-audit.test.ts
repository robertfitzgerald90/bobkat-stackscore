/**
 * SS-OPT-003B Batch B1 — production readiness audit tests.
 * Validation-only: asserts catalog / engine / sync / delivery contracts.
 * Does not mutate catalog content or scoring formulas.
 */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import catalog from "../../data/RecommendationCatalogV2.json";
import questionLibrary from "../../data/v2-question-library.json";
import { evaluateV2Triggers, type V2TriggeredResponse } from "@/lib/recommendations/v2-engine";
import { buildDedupeKey, resolveStatusOnRetrigger, shouldReopenDeclinedRecommendation } from "@/lib/recommendations/dedupe";
import { isStubRecommendationTemplate } from "@/lib/recommendations/stubs";
import {
  filterClientDeliverableRecommendations,
  hasUnpublishedStubTitle,
  isClientFacingRecommendationAudience,
  presentRecommendationsForRole,
} from "@/lib/recommendations/visibility";

const B1_IDS = [
  ...Array.from({ length: 10 }, (_, i) => `REC-IA-${String(i + 1).padStart(3, "0")}`),
  ...Array.from({ length: 10 }, (_, i) => `REC-SO-${String(i + 1).padStart(3, "0")}`),
];

const REQUIRED_KEYS = [
  "id",
  "questionId",
  "pillarCode",
  "pillarName",
  "title",
  "description",
  "businessImpact",
  "suggestedService",
  "priority",
  "estimatedImpactPoints",
  "triggerAnswers",
  "alsoTriggerOnPartial",
  "consolidationGroupId",
  "isStub",
] as const;

const DESCRIPTION_MARKERS = [
  "Finding:",
  "Recommended action:",
  "Expected outcome:",
  "Implementation considerations:",
];

const VALID_PRIORITIES = new Set(["critical", "high", "medium", "low"]);
const VALID_PILLARS = new Set(questionLibrary.pillars.map((pillar) => pillar.code));
const QUESTION_BY_ID = new Map(questionLibrary.questions.map((q) => [q.id, q]));

function responsesForAnswers(
  answerByTemplate: Map<string, { answerText: string; scoreValue: number }>,
): V2TriggeredResponse[] {
  return catalog.templates
    .filter((template) => answerByTemplate.has(template.id))
    .map((template) => {
      const answer = answerByTemplate.get(template.id)!;
      return {
        questionCode: template.questionId,
        answerText: answer.answerText,
        scoreValue: answer.scoreValue,
        weight: 5,
        templateCode: template.id,
        triggersCriticalFlag: template.priority === "critical",
        pillarCode: template.pillarCode,
      };
    });
}

describe("SS-OPT-003B Phase 1 — catalog integrity", () => {
  const templates = catalog.templates;
  const b1 = templates.filter((t) => B1_IDS.includes(t.id));
  const stubs = templates.filter((t) => t.isStub);
  const published = templates.filter((t) => !t.isStub);

  it("has exactly 80 unique templates with 20 published B1 and 60 stubs", () => {
    expect(templates).toHaveLength(80);
    expect(new Set(templates.map((t) => t.id)).size).toBe(80);
    expect(published).toHaveLength(20);
    expect(stubs).toHaveLength(60);
    expect(b1.every((t) => t.isStub === false)).toBe(true);
    expect(published.map((t) => t.id).sort()).toEqual([...B1_IDS].sort());
  });

  it("resolves every template to a valid pillar and question reference", () => {
    for (const template of templates) {
      expect(VALID_PILLARS.has(template.pillarCode)).toBe(true);
      const question = QUESTION_BY_ID.get(template.questionId);
      expect(question).toBeDefined();
      expect(question?.pillarCode).toBe(template.pillarCode);
      expect(template.id).toBe(`REC-${template.questionId}`);
    }
  });

  it("requires complete fields on published templates without placeholder language", () => {
    for (const template of published) {
      for (const key of REQUIRED_KEYS) {
        expect(template).toHaveProperty(key);
      }
      expect(VALID_PRIORITIES.has(template.priority)).toBe(true);
      expect(template.title.length).toBeGreaterThan(10);
      expect(template.title.startsWith("Improve ")).toBe(false);
      expect(template.businessImpact.length).toBeGreaterThan(80);
      expect(template.suggestedService.length).toBeGreaterThan(3);
      for (const marker of DESCRIPTION_MARKERS) {
        expect(template.description).toContain(marker);
      }
      expect(template.description.toLowerCase()).not.toContain("todo");
      expect(template.description.toLowerCase()).not.toContain("tbd");
      expect(template.description.toLowerCase()).not.toContain("lorem ipsum");
      expect(template.description).not.toMatch(/Address gaps identified/i);
    }
  });

  it("preserves approved editorial and priority adjustments", () => {
    expect(templates.find((t) => t.id === "REC-IA-001")?.title).toBe(
      "Centralize workforce identity and authentication",
    );
    expect(templates.find((t) => t.id === "REC-IA-003")?.title).toBe(
      "Replace shared employee credentials with individual accounts",
    );
    expect(templates.find((t) => t.id === "REC-IA-003")?.priority).toBe("high");
    expect(templates.find((t) => t.id === "REC-IA-008")?.priority).toBe("high");
    expect(templates.find((t) => t.id === "REC-SO-009")?.priority).toBe("medium");
    expect(
      templates
        .find((t) => t.id === "REC-SO-002")
        ?.businessImpact.startsWith(
          "Unpatched or misconfigured systems can expose organizations to preventable security incidents and operational disruptions.",
        ),
    ).toBe(true);
  });

  it("keeps remaining stubs as mechanical Improve titles", () => {
    expect(stubs.every((t) => t.title.startsWith("Improve "))).toBe(true);
    expect(stubs.every((t) => !B1_IDS.includes(t.id))).toBe(true);
  });
});

describe("SS-OPT-003B Phase 2 — recommendation engine lifecycle", () => {
  it("triggers all B1 templates for No answers and none for Yes", () => {
    const noAnswers = new Map(
      B1_IDS.map((id) => [id, { answerText: "No", scoreValue: 0 }] as const),
    );
    const yesAnswers = new Map(
      B1_IDS.map((id) => [id, { answerText: "Yes", scoreValue: 100 }] as const),
    );
    expect(evaluateV2Triggers(responsesForAnswers(noAnswers)).map((r) => r.templateCode).sort()).toEqual(
      [...B1_IDS].sort(),
    );
    expect(evaluateV2Triggers(responsesForAnswers(yesAnswers))).toHaveLength(0);
  });

  it("triggers on Partially via alsoTriggerOnPartial", () => {
    const partial = new Map([
      ["REC-IA-001", { answerText: "Partially", scoreValue: 50 }],
      ["REC-SO-001", { answerText: "Partially", scoreValue: 50 }],
    ]);
    const generated = evaluateV2Triggers(responsesForAnswers(partial));
    expect(generated.map((r) => r.templateCode).sort()).toEqual(["REC-IA-001", "REC-SO-001"]);
  });

  it("assigns approved catalog priorities on generation", () => {
    const answers = new Map([
      ["REC-IA-003", { answerText: "No", scoreValue: 0 }],
      ["REC-IA-008", { answerText: "No", scoreValue: 0 }],
      ["REC-SO-009", { answerText: "No", scoreValue: 0 }],
    ]);
    const generated = evaluateV2Triggers(responsesForAnswers(answers));
    expect(generated.find((r) => r.templateCode === "REC-IA-003")?.priority).toBe("high");
    expect(generated.find((r) => r.templateCode === "REC-IA-008")?.priority).toBe("high");
    expect(generated.find((r) => r.templateCode === "REC-SO-009")?.priority).toBe("medium");
  });

  it("dedupes by template code and preserves workflow statuses on retrigger", () => {
    expect(buildDedupeKey({ templateCode: "REC-IA-001" })).toBe("template:REC-IA-001");
    expect(resolveStatusOnRetrigger("accepted")).toBe("accepted");
    expect(resolveStatusOnRetrigger("in_progress")).toBe("in_progress");
    expect(resolveStatusOnRetrigger("deferred")).toBe("deferred");
    expect(resolveStatusOnRetrigger("open")).toBe("open");
    expect(shouldReopenDeclinedRecommendation("high")).toBe(true);
    expect(shouldReopenDeclinedRecommendation("medium")).toBe(false);
  });

  it("ignores malformed or missing template references during evaluation", () => {
    const responses: V2TriggeredResponse[] = [
      {
        questionCode: "IA-001",
        answerText: "No",
        scoreValue: 0,
        weight: 5,
        templateCode: "NOT-A-REAL-TEMPLATE",
        triggersCriticalFlag: true,
        pillarCode: "identity_access",
      },
      {
        questionCode: "IA-002",
        answerText: "No",
        scoreValue: 0,
        weight: 5,
        templateCode: "REC-IA-002",
        triggersCriticalFlag: true,
        pillarCode: "identity_access",
      },
    ];
    const generated = evaluateV2Triggers(responses);
    expect(generated).toHaveLength(1);
    expect(generated[0]?.templateCode).toBe("REC-IA-002");
  });

  it("documents that assessment sync preserves content and priority on retrigger", () => {
    const source = readFileSync(join(process.cwd(), "src/lib/recommendations/sync.ts"), "utf8");
    expect(source).toContain("Preserve existing content + priority");
    const activeBlock = source.slice(source.indexOf("if (active)"), source.indexOf("const declined"));
    expect(activeBlock).not.toContain("title:");
    expect(activeBlock).not.toContain("description:");
    expect(activeBlock).not.toContain("businessImpact:");
    expect(activeBlock).not.toContain("priority:");
    expect(activeBlock).not.toContain("estimatedImpactPoints:");
  });
});

describe("SS-OPT-003B Phase 3 — database synchronization contracts", () => {
  it("template sync upserts without touching AssessmentRecommendation content", async () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/recommendations/sync-catalog-templates.ts"),
      "utf8",
    );
    expect(source).toContain("recommendationTemplate.upsert");
    expect(source).toContain("Does **not** modify `AssessmentRecommendation`");
    expect(source).toContain("skippedMissingCategory");
    expect(source).toContain("title.startsWith(\"Improve \")");
  });

  it("refresh heuristic only updates Improve-title rows and skips edited titles", async () => {
    const { refreshUneditedStubRecommendationsFromCatalog } = await import(
      "@/lib/recommendations/sync-catalog-templates"
    );

    const update = vi.fn();
    const prisma = {
      recommendationTemplate: {
        findMany: vi.fn().mockResolvedValue([{ id: "tpl-1", code: "REC-IA-001" }]),
      },
      assessmentRecommendation: {
        findMany: vi.fn().mockResolvedValue([
          { id: "row-stub", title: "Improve Identity Access" },
          { id: "row-edited", title: "Consultant customized identity plan" },
        ]),
        update,
      },
    };

    const result = await refreshUneditedStubRecommendationsFromCatalog(prisma as never, [
      "REC-IA-001",
    ]);

    expect(result.updated).toBe(1);
    expect(result.skippedNonStubTitle).toBe(1);
    expect(result.updatedIds).toEqual(["row-stub"]);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0]?.[0]?.where?.id).toBe("row-stub");
  });

  it("template sync reports missing categories and does not upsert those rows", async () => {
    const { syncRecommendationTemplatesFromCatalog } = await import(
      "@/lib/recommendations/sync-catalog-templates"
    );

    const upsert = vi.fn();
    const prisma = {
      assessmentCategory: {
        findMany: vi.fn().mockResolvedValue([{ id: "cat-ia", code: "identity_access" }]),
      },
      recommendationTemplate: { upsert },
    };

    const result = await syncRecommendationTemplatesFromCatalog(prisma as never);
    expect(result.skippedMissingCategory.length).toBeGreaterThan(0);
    expect(result.skippedMissingCategory).toContain("REC-SO-001");
    expect(result.approvedCodes).toHaveLength(20);
    expect(upsert.mock.calls.every((call) => call[0].where.code.startsWith("REC-IA-"))).toBe(true);
  });

  it("notes sync loops are not wrapped in a single transaction (audit observation)", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/recommendations/sync-catalog-templates.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/\$transaction/);
  });
});

describe("SS-OPT-003B Phase 4 — client delivery safeguards", () => {
  const publishedRow = {
    id: "p1",
    title: "Centralize workforce identity and authentication",
    templateCode: "REC-IA-001",
  };
  const stubRow = {
    id: "s1",
    title: "Improve Endpoint Management",
    templateCode: "REC-EP-001",
  };
  const stalePublishedRow = {
    id: "stale",
    title: "Improve Identity Access",
    templateCode: "REC-IA-001",
  };
  const missingCodeRow = {
    id: "missing",
    title: "Custom consultant note",
  };

  it("withholds stubs, Improve titles, and missing codes from clients; keeps them for staff", () => {
    const rows = [publishedRow, stubRow, stalePublishedRow, missingCodeRow];
    expect(filterClientDeliverableRecommendations(rows, "client")).toEqual([publishedRow]);
    expect(filterClientDeliverableRecommendations(rows, "admin")).toEqual(rows);
    expect(presentRecommendationsForRole([stubRow], "client")).toHaveLength(0);
    expect(isClientFacingRecommendationAudience("client")).toBe(true);
    expect(isStubRecommendationTemplate("REC-EP-001")).toBe(true);
    expect(hasUnpublishedStubTitle("Improve Endpoint Management")).toBe(true);
  });

  it("assessment PDF route filters deliverables and suffixes internal filenames", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/api/v1/assessments/[id]/export/pdf/route.ts"),
      "utf8",
    );
    expect(source).toContain("filterClientDeliverableRecommendations");
    expect(source).toContain("-internal");
  });

  it("client roadmap and email workflows apply stub/title gates", () => {
    const roadmap = readFileSync(join(process.cwd(), "src/lib/client-roadmap/service.ts"), "utf8");
    const email = readFileSync(
      join(process.cwd(), "src/lib/communications/workflows/triggers.ts"),
      "utf8",
    );
    expect(roadmap).toContain("hasUnpublishedStubTitle");
    expect(roadmap).toContain("isStubRecommendationTemplate");
    expect(email).toContain("hasUnpublishedStubTitle");
    expect(email).toContain("isStubRecommendationTemplate");
  });

  it("documents gap: TIP proposal assembly loads recommendations without stub filter", () => {
    const tipService = readFileSync(
      join(process.cwd(), "src/lib/technology-improvement-plan/service.ts"),
      "utf8",
    );
    expect(tipService).toContain("loadAssessmentRecommendations");
    expect(tipService).not.toContain("isStubRecommendationTemplate");
    expect(tipService).not.toContain("filterClientDeliverableRecommendations");
    expect(tipService).not.toContain("hasUnpublishedStubTitle");
  });

  it("documents gap: email filter does not fail-closed on missing template codes", () => {
    const email = readFileSync(
      join(process.cwd(), "src/lib/communications/workflows/triggers.ts"),
      "utf8",
    );
    // Current behavior: only stub check + Improve title; missing codes still pass.
    expect(email).toContain("!isStubRecommendationTemplate(rec.recommendationTemplate?.code)");
    expect(email).not.toContain("if (!rec.recommendationTemplate?.code)");
  });
});

describe("SS-OPT-003B Phase 5 — end-to-end maturity scenarios (automated)", () => {
  function scenarioAnswers(mode: "low" | "moderate" | "high" | "mixed") {
    const map = new Map<string, { answerText: string; scoreValue: number }>();
    for (const template of catalog.templates) {
      const isIaSo =
        template.pillarCode === "identity_access" || template.pillarCode === "security_operations";
      const isInfra =
        template.pillarCode === "endpoint_management" ||
        template.pillarCode === "network_connectivity" ||
        template.pillarCode === "backup_recovery";

      if (mode === "low") {
        map.set(template.id, { answerText: "No", scoreValue: 0 });
      } else if (mode === "high") {
        map.set(template.id, { answerText: "Yes", scoreValue: 100 });
      } else if (mode === "moderate") {
        map.set(template.id, { answerText: "Partially", scoreValue: 50 });
      } else {
        // Mixed: strong infra, weak IA/SO
        if (isIaSo) map.set(template.id, { answerText: "No", scoreValue: 0 });
        else if (isInfra) map.set(template.id, { answerText: "Yes", scoreValue: 100 });
        else map.set(template.id, { answerText: "Partially", scoreValue: 50 });
      }
    }
    return map;
  }

  function assertClientVisibility(generated: ReturnType<typeof evaluateV2Triggers>) {
    const rows = generated.map((row) => ({
      id: row.templateCode,
      title: row.title,
      templateCode: row.templateCode,
    }));
    const forClient = filterClientDeliverableRecommendations(rows, "client");
    const forStaff = filterClientDeliverableRecommendations(rows, "admin");
    expect(forStaff).toHaveLength(rows.length);
    expect(forClient.every((row) => !isStubRecommendationTemplate(row.templateCode))).toBe(true);
    expect(forClient.every((row) => !hasUnpublishedStubTitle(row.title))).toBe(true);
    expect(forClient.every((row) => B1_IDS.includes(row.templateCode))).toBe(true);
    return { forClient, forStaff };
  }

  it("Scenario A — low maturity triggers broadly; clients only see published B1", () => {
    const generated = evaluateV2Triggers(responsesForAnswers(scenarioAnswers("low")));
    expect(generated.length).toBe(80);
    const { forClient } = assertClientVisibility(generated);
    expect(forClient).toHaveLength(20);
  });

  it("Scenario B — moderate maturity triggers partials; clients only see published B1", () => {
    const generated = evaluateV2Triggers(responsesForAnswers(scenarioAnswers("moderate")));
    expect(generated.length).toBe(80);
    const { forClient } = assertClientVisibility(generated);
    expect(forClient).toHaveLength(20);
  });

  it("Scenario C — high maturity generates no recommendations", () => {
    const generated = evaluateV2Triggers(responsesForAnswers(scenarioAnswers("high")));
    expect(generated).toHaveLength(0);
    expect(filterClientDeliverableRecommendations([], "client")).toHaveLength(0);
  });

  it("Scenario D — mixed maturity surfaces IA/SO gaps; clients only see B1 from those pillars", () => {
    const generated = evaluateV2Triggers(responsesForAnswers(scenarioAnswers("mixed")));
    expect(generated.length).toBeGreaterThan(20);
    const { forClient } = assertClientVisibility(generated);
    expect(forClient).toHaveLength(20);
    expect(
      forClient.every(
        (row) => row.templateCode.startsWith("REC-IA-") || row.templateCode.startsWith("REC-SO-"),
      ),
    ).toBe(true);
  });
});
