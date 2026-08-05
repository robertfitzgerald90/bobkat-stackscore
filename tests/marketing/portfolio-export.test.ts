import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { portfolioPreviewData } from "../../marketing/portfolio-export-stackscore/data/preview-data";

const EXPORT_ROOT = join(process.cwd(), "marketing", "portfolio-export-stackscore");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|md)$/.test(entry)) out.push(full);
  }
  return out;
}

function listExportSourceFiles(root: string): string[] {
  return walk(root).filter((file) => /\.(ts|tsx)$/.test(file));
}

function buildImportGraphFlags(files: string[]) {
  let hasSrcImport = false;
  let hasFetch = false;
  let hasPrisma = false;
  let hasAuth = false;
  let hasProcessEnv = false;
  let hasEmDash = false;

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    if (/from\s+["']@\//.test(source) || /from\s+["']\.\.\/\.\.\/src\//.test(source)) {
      hasSrcImport = true;
    }
    if (/\bfetch\s*\(/.test(source)) hasFetch = true;
    if (/prisma|@prisma\/client/i.test(source)) hasPrisma = true;
    if (/next-auth|getSession|auth\(/.test(source)) hasAuth = true;
    if (/process\.env/.test(source)) hasProcessEnv = true;
    if (source.includes("\u2014") || source.includes("\u2013")) hasEmDash = true;
  }

  return { hasSrcImport, hasFetch, hasPrisma, hasAuth, hasProcessEnv, hasEmDash };
}

describe("portfolio export package", () => {
  it("contains only fictional organization names and scores", () => {
    expect(portfolioPreviewData.executiveDashboard.organizationName).toBe(
      "Lumen Harbor Group",
    );
    expect(portfolioPreviewData.recommendationsWorkspace.recommendations.length).toBeGreaterThan(
      3,
    );
    expect(portfolioPreviewData.technologyRoadmap.phases).toHaveLength(3);
    expect(portfolioPreviewData.executiveReport.currentScore).toBe(68);
  });

  it("does not import application src modules or forbidden runtimes", () => {
    const files = listExportSourceFiles(EXPORT_ROOT);
    expect(files.length).toBeGreaterThan(8);

    const flags = buildImportGraphFlags(files);
    expect(flags.hasSrcImport).toBe(false);
    expect(flags.hasFetch).toBe(false);
    expect(flags.hasPrisma).toBe(false);
    expect(flags.hasAuth).toBe(false);
    expect(flags.hasProcessEnv).toBe(false);
    expect(flags.hasEmDash).toBe(false);
  });

  it("exports the five preview components from the package entry", () => {
    const indexSource = readFileSync(join(EXPORT_ROOT, "index.ts"), "utf8");
    for (const name of [
      "ExecutiveDashboardPreview",
      "TechnologyMaturityPreview",
      "RecommendationsWorkspacePreview",
      "TechnologyRoadmapPreview",
      "ExecutiveReportPreview",
      "portfolioPreviewData",
    ]) {
      expect(indexSource).toContain(name);
    }
  });
});
