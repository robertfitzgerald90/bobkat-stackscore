import { describe, expect, it } from "vitest";
import {
  buildSnapshotLeadMailtoUrl,
  resolveLeadDisplayName,
} from "@/lib/technology-snapshot/contact-helpers";

describe("snapshot lead contact helpers", () => {
  it("builds a display name from first and last name", () => {
    expect(
      resolveLeadDisplayName({
        contactName: "",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@acme.com",
      }),
    ).toBe("Jane Doe");
  });

  it("falls back to email when no name is available", () => {
    expect(
      resolveLeadDisplayName({
        contactName: "",
        email: "jane@acme.com",
      }),
    ).toBe("jane@acme.com");
  });

  it("builds a prefilled mailto link", () => {
    const url = buildSnapshotLeadMailtoUrl({
      contactName: "Jane Doe",
      firstName: "Jane",
      email: "jane@acme.com",
    });

    expect(url.startsWith("mailto:jane@acme.com?subject=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Hi Jane");
  });
});
