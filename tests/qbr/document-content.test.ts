import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { generateQbrReportPdf } from "@/lib/pdf/generate";
import { businessReviewFixture } from "./fixtures/business-review";
const canExtract = spawnSync("pdftotext", ["-v"]).status === 0;
const output =
  process.env.SS_QBR_QA_DIR ??
  mkdtempSync(path.join(tmpdir(), "business-review-"));

describe.skipIf(!canExtract)("Business Review executive document", () => {
  it("preserves review content and metrics in a compact report", async () => {
    const data = businessReviewFixture();
    const file = path.join(output, "business-review.pdf");
    writeFileSync(file, await generateQbrReportPdf(data));
    const text = execFileSync("pdftotext", [file, "-"], { encoding: "utf8" });
    expect(text).toContain("Business Review");
    expect(text).toContain(data.reviewPeriodLabel);
    expect(text).toContain("72 / 100");
    for (const project of data.completedProjects)
      expect(text).toContain(project.title);
    for (const item of [
      ...data.resolvedRecommendations,
      ...data.remainingOpportunities,
    ])
      expect(text).toContain(item.title);
    for (const risk of data.technologyRisks) expect(text).toContain(risk);
    for (const priority of data.nextQuarterPriorities)
      expect(text).toContain(priority);
    expect(text).toContain("Technology Investment Summary");
    expect(text).toContain("Business Alignment");
    const pages = text.split("\f").filter((p) => p.trim());
    expect(pages.length).toBeLessThanOrEqual(5);
    for (const page of pages) expect(page).toMatch(/Page \d+ of \d+/);
  }, 60000);
  it("handles missing review history and investment data without inventing zeros", async () => {
    const data = businessReviewFixture({
      scoreAtPeriodStart: null,
      scoreAtPeriodEnd: null,
      currentStackScore: null,
      scoreChange: null,
      budgetForecast: null,
      completedProjects: [],
      resolvedRecommendations: [],
      categoryImprovements: [],
      roadmapPhases: [],
      executiveSummary: "",
      technologyRisks: [],
      nextQuarterPriorities: [],
    });
    const file = path.join(output, "business-review-empty.pdf");
    writeFileSync(file, await generateQbrReportPdf(data));
    const text = execFileSync("pdftotext", [file, "-"], { encoding: "utf8" });
    expect(text).toContain("Not assessed");
    expect(text).toContain("Investment quotations not included");
    expect(text).toContain("Executive summary unavailable");
    expect(text).not.toContain("0 / 100");
  }, 60000);
});
