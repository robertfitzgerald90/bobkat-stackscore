import { describe, expect, it } from "vitest";
import { getSafeCallbackUrl, isAllowedCallbackPath } from "@/lib/auth/safe-callback-url";

describe("getSafeCallbackUrl", () => {
  it("preserves assessment and onboarding deep links", () => {
    expect(getSafeCallbackUrl("/onboarding")).toBe("/onboarding");
    expect(getSafeCallbackUrl("/assessment/start")).toBe("/assessment/start");
    expect(getSafeCallbackUrl("/assessments/abc123")).toBe("/assessments/abc123");
    expect(getSafeCallbackUrl("/clients/c1/technology-profile")).toBe(
      "/clients/c1/technology-profile",
    );
    expect(getSafeCallbackUrl("/portal/vcio/onboarding")).toBe("/portal/vcio/onboarding");
    expect(getSafeCallbackUrl("/clients/c1/proposals/p1?action=approve")).toBe(
      "/clients/c1/proposals/p1?action=approve",
    );
  });

  it("rejects marketing and open-redirect targets", () => {
    expect(getSafeCallbackUrl("/")).toBe("/dashboard");
    expect(getSafeCallbackUrl("/assessment-offer")).toBe("/dashboard");
    expect(getSafeCallbackUrl("/assessment-invitation")).toBe("/dashboard");
    expect(getSafeCallbackUrl("/demo")).toBe("/dashboard");
    expect(getSafeCallbackUrl("/login")).toBe("/dashboard");
    expect(getSafeCallbackUrl("//evil.example")).toBe("/dashboard");
    expect(getSafeCallbackUrl("https://evil.example")).toBe("/dashboard");
    expect(getSafeCallbackUrl(null)).toBe("/dashboard");
  });

  it("does not treat every path as blocked because of a bare slash", () => {
    expect(isAllowedCallbackPath("/assessment/start")).toBe(true);
    expect(isAllowedCallbackPath("/")).toBe(false);
    expect(isAllowedCallbackPath("/assessment-offer")).toBe(false);
  });
});
