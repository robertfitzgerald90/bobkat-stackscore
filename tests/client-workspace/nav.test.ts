import { describe, expect, it } from "vitest";
import {
  getVisibleWorkspaceNav,
  resolveActiveWorkspaceSection,
  resolveClientWorkspaceNavHref,
} from "@/lib/client-workspace";

describe("resolveClientWorkspaceNavHref", () => {
  it("maps wired DOC-201 sections to workspace routes", () => {
    expect(resolveClientWorkspaceNavHref("c1", "overview")).toBe(
      "/clients/c1/technology-profile",
    );
    expect(resolveClientWorkspaceNavHref("c1", "recommendations")).toBe(
      "/clients/c1/recommendations",
    );
    expect(resolveClientWorkspaceNavHref("c1", "roadmap")).toBe("/clients/c1/roadmap");
    expect(resolveClientWorkspaceNavHref("c1", "assessments")).toBe(
      "/clients/c1/assessments",
    );
    expect(resolveClientWorkspaceNavHref("c1", "projects")).toBe("/clients/c1/projects");
    expect(resolveClientWorkspaceNavHref("c1", "documents")).toBe(
      "/clients/c1/documents",
    );
    expect(resolveClientWorkspaceNavHref("c1", "contacts")).toBe("/clients/c1/contacts");
    expect(resolveClientWorkspaceNavHref("c1", "executive-reports")).toBe(
      "/clients/c1/executive-reports",
    );
  });

  it("maps all DOC-201 sections to workspace routes", () => {
    expect(resolveClientWorkspaceNavHref("c1", "journey")).toBe("/clients/c1/journey");
    expect(resolveClientWorkspaceNavHref("c1", "assets")).toBe("/clients/c1/assets");
    expect(resolveClientWorkspaceNavHref("c1", "billing")).toBe("/clients/c1/billing");
    expect(resolveClientWorkspaceNavHref("c1", "risks")).toBe("/clients/c1/risks");
    expect(resolveClientWorkspaceNavHref("c1", "activity")).toBe("/clients/c1/activity");
  });
});

describe("resolveActiveWorkspaceSection", () => {
  it("detects overview and wired module routes", () => {
    expect(resolveActiveWorkspaceSection("/clients/c1/technology-profile")).toBe(
      "overview",
    );
    expect(resolveActiveWorkspaceSection("/clients/c1/recommendations")).toBe(
      "recommendations",
    );
    expect(resolveActiveWorkspaceSection("/clients/c1/roadmap")).toBe("roadmap");
    expect(resolveActiveWorkspaceSection("/clients/c1/improvement-plan/tip-1")).toBe(
      "roadmap",
    );
    expect(resolveActiveWorkspaceSection("/clients/c1/contacts")).toBe("contacts");
    expect(resolveActiveWorkspaceSection("/clients/c1/business-profile")).toBe(
      "contacts",
    );
    expect(resolveActiveWorkspaceSection("/clients/c1/executive-reports")).toBe(
      "executive-reports",
    );
    expect(resolveActiveWorkspaceSection("/clients/c1/quarterly-review")).toBe(
      "executive-reports",
    );
    expect(resolveActiveWorkspaceSection("/clients/c1/assessments")).toBe(
      "assessments",
    );
    expect(resolveActiveWorkspaceSection("/clients/c1/assessments/history")).toBe(
      "assessments",
    );
    expect(resolveActiveWorkspaceSection("/clients/c1/projects")).toBe("projects");
    expect(resolveActiveWorkspaceSection("/clients/c1/documents")).toBe("documents");
    expect(resolveActiveWorkspaceSection("/clients/c1/journey")).toBe("journey");
    expect(resolveActiveWorkspaceSection("/clients/c1/assets")).toBe("assets");
  });
});

describe("getVisibleWorkspaceNav", () => {
  it("limits client-portal users to overview-oriented sections", () => {
    const sections = getVisibleWorkspaceNav("client").map((item) => item.section);
    expect(sections).toEqual(["overview", "recommendations", "billing", "executive-reports"]);
  });

  it("shows the full DOC-201 nav for internal roles", () => {
    expect(getVisibleWorkspaceNav("admin")).toHaveLength(13);
    expect(getVisibleWorkspaceNav("admin")[0]?.section).toBe("overview");
  });
});
