import { describe, expect, it, vi } from "vitest";
import catalog from "../../data/RecommendationCatalogV2.json";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  refreshUneditedStubRecommendationsFromCatalog,
  syncRecommendationTemplatesFromCatalog,
} from "@/lib/recommendations/sync-catalog-templates";

describe("SS-OPT-003B catalog template sync contract", () => {
  it("documents that AssessmentRecommendation content is not auto-overwritten on retrigger", () => {
    const source = readFileSync(join(process.cwd(), "src/lib/recommendations/sync.ts"), "utf8");
    expect(source).toContain("Preserve existing content + priority");
    expect(source).toContain("consultant edits");
    const activeBlock = source.slice(
      source.indexOf("if (active)"),
      source.indexOf("const declined"),
    );
    expect(activeBlock).not.toContain("...content");
    expect(activeBlock).toContain("latestTriggerReason");
  });

  it("keeps approved vs stub partition aligned with Batch B1 publication", () => {
    const approved = catalog.templates.filter((template) => !template.isStub);
    const stubs = catalog.templates.filter((template) => template.isStub);
    expect(approved).toHaveLength(20);
    expect(stubs).toHaveLength(60);
    expect(
      approved.every(
        (template) => template.id.startsWith("REC-IA-") || template.id.startsWith("REC-SO-"),
      ),
    ).toBe(true);
  });
});

describe("SS-OPT-003B transactional catalog sync (DEF-004)", () => {
  it("runs template upserts inside a transaction and reports structured success", async () => {
    const upsert = vi.fn().mockResolvedValue({});
    const prisma = {
      assessmentCategory: {
        findMany: vi.fn().mockResolvedValue([
          { id: "cat-ia", code: "identity_access" },
          { id: "cat-so", code: "security_operations" },
        ]),
      },
      recommendationTemplate: { upsert },
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn({ recommendationTemplate: { upsert } }),
      ),
    };

    const result = await syncRecommendationTemplatesFromCatalog(prisma as never);
    expect(result.ok).toBe(true);
    expect(result.approvedCodes).toHaveLength(20);
    expect(result.skippedMissingCategory.length).toBeGreaterThan(0);
    expect(result.upserted).toBe(20); // only IA+SO categories present
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledTimes(20);
  });

  it("rolls back template sync when an upsert fails mid-transaction", async () => {
    const upsert = vi
      .fn()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error("simulated upsert failure"));

    const prisma = {
      assessmentCategory: {
        findMany: vi.fn().mockResolvedValue([{ id: "cat-ia", code: "identity_access" }]),
      },
      recommendationTemplate: { upsert },
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => {
        // Mimic Prisma: throw from callback aborts the transaction.
        return fn({ recommendationTemplate: { upsert } });
      }),
    };

    await expect(syncRecommendationTemplatesFromCatalog(prisma as never)).rejects.toThrow(
      /rolled back/,
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("refresh only updates Improve-title rows and skips edited titles", async () => {
    const update = vi.fn().mockResolvedValue({});
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
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn({ assessmentRecommendation: { update } }),
      ),
    };

    const result = await refreshUneditedStubRecommendationsFromCatalog(prisma as never, [
      "REC-IA-001",
    ]);

    expect(result.ok).toBe(true);
    expect(result.updated).toBe(1);
    expect(result.skippedNonStubTitle).toBe(1);
    expect(result.updatedIds).toEqual(["row-stub"]);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0]?.[0]?.where?.id).toBe("row-stub");
  });

  it("rolls back refresh updates when a mid-run update fails", async () => {
    const update = vi.fn().mockRejectedValue(new Error("simulated update failure"));
    const prisma = {
      recommendationTemplate: {
        findMany: vi.fn().mockResolvedValue([{ id: "tpl-1", code: "REC-IA-001" }]),
      },
      assessmentRecommendation: {
        findMany: vi.fn().mockResolvedValue([
          { id: "row-a", title: "Improve Identity Access" },
          { id: "row-b", title: "Improve Identity Access Controls" },
        ]),
        update,
      },
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn({ assessmentRecommendation: { update } }),
      ),
    };

    await expect(
      refreshUneditedStubRecommendationsFromCatalog(prisma as never, ["REC-IA-001"]),
    ).rejects.toThrow(/rolled back/);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("source uses prisma.$transaction for sync and refresh", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/recommendations/sync-catalog-templates.ts"),
      "utf8",
    );
    expect(source.match(/\$transaction/g)?.length).toBeGreaterThanOrEqual(2);
    expect(source).toContain("rolled back");
  });
});
