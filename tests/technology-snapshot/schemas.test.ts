import { describe, expect, it } from "vitest";
import { SNAPSHOT_QUESTIONS } from "@/lib/technology-snapshot/questions";
import { createSnapshotLeadSchema } from "@/lib/technology-snapshot/schemas";

function validPayload() {
  const answers = Object.fromEntries(
    SNAPSHOT_QUESTIONS.map((question) => [question.pillarCode, "yes"]),
  );

  return {
    contactName: "Jane Doe",
    companyName: "Acme Corp",
    email: "jane@acme.com",
    phone: "",
    industry: "Professional Services",
    companySize: "11–25 employees",
    itManagementModel: "outsourced" as const,
    answers,
  };
}

describe("createSnapshotLeadSchema", () => {
  it("accepts a complete valid submission", () => {
    const parsed = createSnapshotLeadSchema.safeParse(validPayload());
    expect(parsed.success).toBe(true);
  });

  it("requires all pillar answers", () => {
    const payload = validPayload();
    delete (payload.answers as Record<string, string>).identity_access;

    const parsed = createSnapshotLeadSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const parsed = createSnapshotLeadSchema.safeParse({
      ...validPayload(),
      email: "not-an-email",
    });
    expect(parsed.success).toBe(false);
  });
});
