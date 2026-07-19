import { describe, expect, it } from "vitest";
import { resolveActiveDemoSection } from "@/lib/product-overview/demo-scroll-spy";

describe("resolveActiveDemoSection", () => {
  const sections = [
    { id: "overview", offsetTop: 0 },
    { id: "assessment", offsetTop: 900 },
    { id: "roadmap", offsetTop: 1800 },
    { id: "reports", offsetTop: 5400 },
  ];

  it("selects overview near the top of the page", () => {
    expect(resolveActiveDemoSection(0, 140, sections)).toBe("overview");
    expect(resolveActiveDemoSection(200, 140, sections)).toBe("overview");
  });

  it("advances the active section as the user scrolls", () => {
    expect(resolveActiveDemoSection(700, 140, sections)).toBe("overview");
    expect(resolveActiveDemoSection(960, 140, sections)).toBe("assessment");
    expect(resolveActiveDemoSection(1900, 140, sections)).toBe("roadmap");
    expect(resolveActiveDemoSection(5600, 140, sections)).toBe("reports");
  });

  it("accounts for sticky shell height in the threshold", () => {
    expect(resolveActiveDemoSection(700, 140, sections)).toBe("overview");
    expect(resolveActiveDemoSection(700, 220, sections)).toBe("assessment");
  });
});
