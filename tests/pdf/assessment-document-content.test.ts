import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { generateAssessmentReportPdf } from "@/lib/pdf/generate";
import { assessmentDocumentFixture } from "./fixtures/assessment-document";
const hasPoppler = spawnSync("pdftotext", ["-v"]).status === 0;
const directory =
  process.env.SS_PDF_QA_DIR ??
  mkdtempSync(path.join(tmpdir(), "stackscore-report-"));

// Optional Poppler verification supplements renderer tests; no database or customer data.
describe.skipIf(!hasPoppler)("assessment executive document content", () => {
  it("preserves scores and approved recommendation sections without exposing internal projected maturity", async () => {
    const data = assessmentDocumentFixture();
    const file = path.join(directory, "assessment-new-style.pdf");
    writeFileSync(file, await generateAssessmentReportPdf(data));
    const text = execFileSync("pdftotext", [file, "-"], { encoding: "utf8" });
    expect(text).toContain("Technology Maturity Assessment");
    expect(text).toContain("67 / 100");
    for (const category of data.summary.categoryScores)
      expect(text).toContain(category.categoryName);
    for (let i = 1; i <= 3; i++) {
      expect(text).toContain(`EVIDENCE-${i}`);
      expect(text).toContain(`IMPACT-${i}`);
    }
    expect(text).not.toContain("Internal Planning Estimates");
    expect(text).not.toContain("Projected StackScore");
    expect(text).toMatch(/Page \d+ of \d+/);
    expect(text.split("\f").filter((p) => p.trim()).length).toBeLessThanOrEqual(
      4,
    );
  }, 60000);
  it("paginates lengthy recommendations without dropping their final actions or outcomes", async () => {
    const data = assessmentDocumentFixture(true);
    const file = path.join(directory, "assessment-long-content.pdf");
    writeFileSync(file, await generateAssessmentReportPdf(data));
    const text = execFileSync("pdftotext", [file, "-"], { encoding: "utf8" });
    for (let i = 1; i <= 12; i++) {
      expect(text).toContain(`CHECKPOINT-${i}-9`);
      expect(text).toContain(`EVIDENCE-${i}`);
      expect(text).toContain(`IMPACT-${i}`);
    }
    const pages = text.split("\f").filter((p) => p.trim());
    expect(pages.length).toBeGreaterThan(3);
    for (const page of pages) {
      expect(page).toContain("Northline Studio");
      expect(page).toMatch(/Page \d+ of \d+/);
    }
  }, 60000);
});
