import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isClientDeliverableRecommendation } from "@/lib/recommendations/visibility";

describe("project linked recommendation title visibility", () => {
  it("withholds unpublished linked recommendation titles from clients", () => {
    const approved = {
      title: "Centralize workforce identity and authentication",
      recommendationTemplate: { code: "REC-IA-001" },
    };
    const stub = {
      title: "Improve Endpoint Management",
      recommendationTemplate: { code: "REC-TEST-STUB-001" },
    };

    expect(isClientDeliverableRecommendation(approved, "client")).toBe(true);
    expect(isClientDeliverableRecommendation(stub, "client")).toBe(false);
    expect(isClientDeliverableRecommendation(stub, "admin")).toBe(true);
  });

  it("wires projects page through isClientDeliverableRecommendation for linked titles", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/clients/[id]/projects/page.tsx"),
      "utf8",
    );
    expect(source).toContain("isClientDeliverableRecommendation");
    expect(source).toContain("recommendationTemplate: { select: { code: true } }");
  });
});
