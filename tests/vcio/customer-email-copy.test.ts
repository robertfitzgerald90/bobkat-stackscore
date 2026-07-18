import { describe, expect, it } from "vitest";
import { getEmailTemplate } from "@/lib/communications/registry";
import { buildVcioWelcomeSampleData } from "@/lib/communications/sample-data";
import { VCIO_CUSTOMER_EMAIL_COPY } from "@/lib/vcio/customer-email-copy";

describe("Strategic IT Consulting customer email copy", () => {
  it("uses approved welcome subject and preview text in the registry", () => {
    const template = getEmailTemplate("EMAIL-010");
    expect(template?.subject).toBe("Welcome to Bobkat IT Strategic IT Consulting");
    expect(template?.previewText).toBe(
      "Your strategic technology advisory service is now active.",
    );
  });

  it("uses approved lifecycle subjects in the registry", () => {
    expect(getEmailTemplate("VCIO-PAYMENT-FAILED")?.subject).toBe(
      "Payment Action Required for Strategic IT Consulting",
    );
    expect(getEmailTemplate("VCIO-CANCELLATION-SCHEDULED")?.subject).toBe(
      "Strategic IT Consulting Cancellation Scheduled",
    );
    expect(getEmailTemplate("VCIO-SUBSCRIPTION-ENDED")?.subject).toBe(
      "Your Strategic IT Consulting Service Has Ended",
    );
  });

  it("does not expose StackScore vCIO in welcome sample data", () => {
    const sample = buildVcioWelcomeSampleData();
    const serialized = JSON.stringify(sample);
    expect(serialized).not.toContain("StackScore vCIO");
    expect(serialized).not.toContain("vCIO Dashboard");
    expect(sample.heroTitle).toBe(VCIO_CUSTOMER_EMAIL_COPY.welcome.heroTitle);
    expect(sample.primaryCta.label).toBe("Complete Onboarding");
    expect(sample.secondaryCta.label).toBe("Open StackScore Portal");
  });
});
