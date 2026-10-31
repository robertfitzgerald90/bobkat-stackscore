import { describe, expect, it } from "vitest";
import { SNAPSHOT_QUESTIONS_V2 } from "@/lib/technology-snapshot/catalog-v2";
import { createSnapshotLeadV2Schema } from "@/lib/technology-snapshot/schemas";

function validV2Payload() {
  const answers = Object.fromEntries(
    SNAPSHOT_QUESTIONS_V2.map((question) => [question.id, "yes"]),
  );

  return {
    firstName: "Jordan",
    lastName: "Lee",
    email: "jordan@example.com",
    phone: "",
    companyName: "Northstar",
    industry: "Manufacturing",
    companySize: "26–50 employees",
    itManagementModel: "outsourced" as const,
    answers,
    contactConsent: true,
    marketingConsent: false,
    website: "",
  };
}

describe("createSnapshotLeadV2Schema", () => {
  it("accepts a complete contact-capture submission", () => {
    const parsed = createSnapshotLeadV2Schema.safeParse(validV2Payload());
    expect(parsed.success).toBe(true);
  });

  it("allows optional company and industry", () => {
    const parsed = createSnapshotLeadV2Schema.safeParse({
      ...validV2Payload(),
      companyName: "",
      industry: "",
      itManagementModel: undefined,
    });
    expect(parsed.success).toBe(true);
  });

  it("requires contact consent", () => {
    const parsed = createSnapshotLeadV2Schema.safeParse({
      ...validV2Payload(),
      contactConsent: false,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects honeypot fills", () => {
    const parsed = createSnapshotLeadV2Schema.safeParse({
      ...validV2Payload(),
      website: "https://spam.example",
    });
    expect(parsed.success).toBe(false);
  });

  it("requires all fourteen answers", () => {
    const payload = validV2Payload();
    delete (payload.answers as Record<string, string>).A1;
    const parsed = createSnapshotLeadV2Schema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });
});
