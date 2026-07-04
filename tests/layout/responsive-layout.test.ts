import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const globalsCss = readFileSync(
  resolve(process.cwd(), "src/app/globals.css"),
  "utf8",
);

describe("responsive layout utilities", () => {
  it("clips horizontal overflow at the document root", () => {
    expect(globalsCss).toContain("overflow-x: clip");
  });

  it("constrains page shells and content to the viewport width", () => {
    expect(globalsCss).toMatch(/\.page-content\s*\{[^}]*min-w-0[^}]*max-w-full/s);
    expect(globalsCss).toMatch(/\.page-shell\s*\{[^}]*min-w-0[^}]*max-w-full/s);
  });

  it("wraps long titles and descriptions instead of forcing page overflow", () => {
    expect(globalsCss).toMatch(/\.page-title\s*\{[^}]*break-words/s);
    expect(globalsCss).toMatch(/\.page-description\s*\{[^}]*break-words/s);
  });

  it("keeps desktop tables inside scroll containers", () => {
    expect(globalsCss).toMatch(/\.table-desktop\s*\{[^}]*min-w-0[^}]*max-w-full/s);
    expect(globalsCss).toMatch(/\.overflow-safe-x\s*\{[^}]*overflow-x-auto/s);
  });
});
