import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const componentDir = path.join(process.cwd(), "src/components/portfolio/stackscore");
const previewPath = path.join(process.cwd(), "src/app/demo/stackscore-case-study/page.tsx");

describe("StackScore portfolio visual system", () => {
  it("exports all ten requested case-study visuals", () => {
    const index = fs.readFileSync(path.join(componentDir, "index.ts"), "utf8");
    const exports = index.match(/^export \{/gm) ?? [];
    expect(exports).toHaveLength(10);
  });

  it("keeps the preview isolated, non-indexed, and explicit about demo data", () => {
    const preview = fs.readFileSync(previewPath, "utf8");
    expect(preview).toContain("index: false");
    expect(preview).toContain("Demo data only");
    expect(preview).toContain("fictional");
  });

  it("describes deterministic scoring without presenting runtime generative AI", () => {
    const files = fs.readdirSync(componentDir).filter((file) => file.endsWith(".tsx"));
    const source = files.map((file) => fs.readFileSync(path.join(componentDir, file), "utf8")).join("\n");
    expect(source).toContain("Rules-based scoring");
    expect(source.toLowerCase()).not.toContain("ai-generated");
    expect(source.toLowerCase()).not.toContain("generative ai");
  });
});

