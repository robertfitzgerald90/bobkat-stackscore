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

  it("retires the public /demo case-study preview to the customer-parity demo", () => {
    const preview = fs.readFileSync(previewPath, "utf8");
    expect(preview).toContain("permanentRedirect");
    expect(preview).toContain("RETIRED_PUBLIC_DEMO_REDIRECTS");
    expect(preview).not.toContain("ExecutiveTechnologyProfile");
  });

  it("describes deterministic scoring without presenting runtime generative AI", () => {
    const files = fs.readdirSync(componentDir).filter((file) => file.endsWith(".tsx"));
    const source = files.map((file) => fs.readFileSync(path.join(componentDir, file), "utf8")).join("\n");
    expect(source).toContain("Rules-based scoring");
    expect(source.toLowerCase()).not.toContain("ai-generated");
    expect(source.toLowerCase()).not.toContain("generative ai");
  });
});
