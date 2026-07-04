import { describe, expect, it } from "vitest";
import {
  getVisibleWorkspaceNav,
  resolveActiveWorkspaceSection,
  resolveClientWorkspaceNavHref,
} from "@/lib/client-workspace";

describe("resolveClientWorkspaceNavHref", () => {
  it("maps live interim routes for available sections", () => {
    expect(resolveClientWorkspaceNavHref("c1", "overview")).toBe(
      "/clients/c1/technology-profile",
    );
    expect(resolveClientWorkspaceNavHref("c1", "recommendations")).toBe(
      "/clients/c1/recommendations",
    );
    expect(resolveClientWorkspaceNavHref("c1", "roadmap")).toBe(
      "/clients/c1/improvement-plan",
    );
    expect(resolveClientWorkspaceNavHref("c1", "assessments")).toBe(
      "/clients/c1/assessments/history",
    );
    expect(resolveClientWorkspaceNavHref("c1", "contacts")).toBe(
      "/clients/c1/business-profile",
    );
    expect(resolveClientWorkspaceNavHref("c1", "executive-reports")).toBe(
      "/clients/c1/quarterly-review",
    );
  });

  it("returns null for sections not yet routed", () => {
    expect(resolveClientWorkspaceNavHref("c1", "journey")).toBeNull();
    expect(resolveClientWorkspaceNavHref("c1", "projects")).toBeNull();
    expect(resolveClientWorkspaceNavHref("c1", "assets")).toBeNull();
    expect(resolveClientWorkspaceNavHref("c1", "activity")).toBeNull();
  });
});

describe("resolveActiveWorkspaceSection", () => {
  it("detects overview and interim module routes", () => {
    expect(resolveActiveWorkspaceSection("/clients/c1/technology-profile")).toBe(
      "overview",
    );
    expect(resolveActiveWorkspaceSection("/clients/c1/recommendations")).toBe(
      "recommendations",
    );
    expect(resolveActiveWorkspaceSection("/clients/c1/improvement-plan/tip-1")).toBe(
      "roadmap",
    );
    expect(resolveActiveWorkspaceSection("/clients/c1/business-profile")).toBe(
      "contacts",
    );
    expect(resolveActiveWorkspaceSection("/clients/c1/quarterly-review")).toBe(
      "executive-reports",
    );
    expect(resolveActiveWorkspaceSection("/clients/c1/assessments/history")).toBe(
      "assessments",
    );
  });
});

describe("getVisibleWorkspaceNav", () => {
  it("limits client-portal users to overview-oriented sections", () => {
    const sections = getVisibleWorkspaceNav("client").map((item) => item.section);
    expect(sections).toEqual(["overview", "documents", "contacts"]);
  });

  it("shows the full DOC-201 nav for internal roles", () => {
    expect(getVisibleWorkspaceNav("admin")).toHaveLength(13);
    expect(getVisibleWorkspaceNav("admin")[0]?.section).toBe("overview");
  });
});
