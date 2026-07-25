import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("post-purchase confirmation pages", () => {
  it("defines polished confirmation routes with noindex metadata", () => {
    const assessmentPage = readFileSync(
      resolve(process.cwd(), "src/app/assessment-purchased/page.tsx"),
      "utf8",
    );
    const subscriptionPage = readFileSync(
      resolve(process.cwd(), "src/app/subscription-activated/page.tsx"),
      "utf8",
    );

    expect(assessmentPage).toContain("Your Technology Maturity Assessment Is Ready");
    expect(assessmentPage).toContain("index: false");
    expect(assessmentPage).toContain("force-dynamic");
    expect(assessmentPage).toContain("verifyAssessmentConfirmation");
    expect(assessmentPage).not.toContain("Reference:");

    expect(subscriptionPage).toContain("Your Strategic IT Consulting Subscription Is Active");
    expect(subscriptionPage).toContain("index: false");
    expect(subscriptionPage).toContain("force-dynamic");
    expect(subscriptionPage).toContain("verifySubscriptionConfirmation");
    expect(subscriptionPage).not.toContain("Reference:");
  });

  it("keeps legacy success URLs as redirects", () => {
    const purchaseSuccess = readFileSync(
      resolve(process.cwd(), "src/app/purchase/success/page.tsx"),
      "utf8",
    );
    const vcioSuccess = readFileSync(
      resolve(process.cwd(), "src/app/vcio-offer/success/page.tsx"),
      "utf8",
    );

    expect(purchaseSuccess).toContain("ASSESSMENT_PURCHASED_PATH");
    expect(purchaseSuccess).toContain("redirect");
    expect(vcioSuccess).toContain("SUBSCRIPTION_ACTIVATED_PATH");
    expect(vcioSuccess).toContain("redirect");
  });

  it("does not expose Stripe identifiers in the shared confirmation UI", () => {
    const ui = readFileSync(
      resolve(process.cwd(), "src/components/purchase/confirmation-page.tsx"),
      "utf8",
    );
    expect(ui).not.toContain("session_id");
    expect(ui).not.toContain("cs_");
    expect(ui).toContain("Return to StackScore");
  });
});
