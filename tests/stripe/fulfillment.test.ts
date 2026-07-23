import { describe, expect, it } from "vitest";
import {
  generateActivationToken,
  normalizePurchaserEmail,
  resolveCompanyName,
  resolveContactName,
} from "@/lib/stripe/fulfillment/helpers";
import {
  isTechnologyAssessmentProduct,
  TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE,
} from "@/lib/stripe/products";

describe("stripe products", () => {
  it("recognizes technology assessment product type", () => {
    expect(TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE).toBe("technology_assessment");
    expect(isTechnologyAssessmentProduct("technology_assessment")).toBe(true);
    expect(isTechnologyAssessmentProduct("other")).toBe(false);
  });
});

describe("fulfillment helpers", () => {
  it("normalizes purchaser email", () => {
    expect(normalizePurchaserEmail("  Buyer@Example.COM ")).toBe("buyer@example.com");
  });

  it("resolves company and contact names", () => {
    expect(resolveCompanyName("  Acme Corp  ")).toBe("Acme Corp");
    expect(resolveCompanyName(undefined)).toBe("Company Pending");
    expect(resolveContactName(null, "jane@acme.com")).toBe("jane");
  });

  it("generates unique activation tokens with hashes", () => {
    const first = generateActivationToken();
    const second = generateActivationToken();
    expect(first.rawToken).not.toBe(second.rawToken);
    expect(first.tokenHash).not.toBe(second.tokenHash);
    expect(first.tokenHash).toHaveLength(64);
  });
});

describe("checkout metadata contract", () => {
  it("uses productType in assessment checkout metadata builder", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const checkout = readFileSync(
      resolve(process.cwd(), "src/app/api/checkout/create-session/route.ts"),
      "utf8",
    );
    const metadataBuilder = readFileSync(
      resolve(process.cwd(), "src/lib/stripe/assessment-checkout.ts"),
      "utf8",
    );

    expect(checkout).toContain("buildAssessmentCheckoutMetadata");
    expect(metadataBuilder).toContain("productType");
    expect(metadataBuilder).toContain("service");
    expect(metadataBuilder).toContain("platform");
    expect(metadataBuilder).not.toContain('product: "technology_assessment"');
  });
});
