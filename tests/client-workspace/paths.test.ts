import { describe, expect, it } from "vitest";
import {
  CLIENT_WORKSPACE_NAV,
  CLIENT_WORKSPACE_SECTIONS,
  isClientWorkspaceSection,
} from "@/lib/client-workspace";
import {
  clientImmediateFocusPath,
  clientProjectDetailPath,
  clientProjectsPath,
  clientRecommendationDetailPath,
  clientRecommendationsPath,
  clientTechnologyProfilePath,
  clientWorkspacePath,
  clientWorkspaceProjectsPath,
  clientWorkspaceSectionPath,
} from "@/lib/clients/paths";

describe("CLIENT_WORKSPACE_NAV", () => {
  it("lists DOC-201 sections in order with Overview first", () => {
    expect(CLIENT_WORKSPACE_NAV.map((item) => item.section)).toEqual([
      ...CLIENT_WORKSPACE_SECTIONS,
    ]);
    expect(CLIENT_WORKSPACE_NAV[0]).toMatchObject({
      section: "overview",
      label: "Overview",
      isOverview: true,
    });
    expect(CLIENT_WORKSPACE_NAV.some((item) => item.label === "Immediate Focus")).toBe(
      false,
    );
  });

  it("uses DOC-201 labels for primary modules", () => {
    const labels = CLIENT_WORKSPACE_NAV.map((item) => item.label);
    expect(labels).toContain("Technology Journey");
    expect(labels).toContain("Roadmap");
    expect(labels).toContain("Executive Reports");
    expect(labels).not.toContain("Project Register");
    expect(labels).not.toContain("Improvement Plan");
    expect(labels).not.toContain("Quarterly Review");
  });
});

describe("isClientWorkspaceSection", () => {
  it("accepts known sections and rejects unknown values", () => {
    expect(isClientWorkspaceSection("overview")).toBe(true);
    expect(isClientWorkspaceSection("executive-reports")).toBe(true);
    expect(isClientWorkspaceSection("technology-profile")).toBe(false);
    expect(isClientWorkspaceSection("")).toBe(false);
  });
});

describe("client workspace paths", () => {
  const clientId = "client-1";

  it("uses the live Overview route as the workspace home", () => {
    // Commit 1: Overview remains technology-profile so existing entry points work.
    expect(clientWorkspacePath(clientId)).toBe(
      "/clients/client-1/technology-profile",
    );
    expect(clientTechnologyProfilePath(clientId)).toBe(clientWorkspacePath(clientId));
  });

  it("builds section paths from DOC-201 section ids", () => {
    expect(clientWorkspaceSectionPath(clientId, "overview")).toBe(
      clientWorkspacePath(clientId),
    );
    expect(clientWorkspaceSectionPath(clientId, "journey")).toBe(
      "/clients/client-1/journey",
    );
    expect(clientWorkspaceSectionPath(clientId, "roadmap")).toBe(
      "/clients/client-1/roadmap",
    );
    expect(clientWorkspaceSectionPath(clientId, "executive-reports")).toBe(
      "/clients/client-1/executive-reports",
    );
    expect(clientWorkspaceSectionPath(clientId, "recommendations")).toBe(
      "/clients/client-1/recommendations",
    );
  });

  it("anchors Immediate Focus on the Overview route", () => {
    expect(clientImmediateFocusPath(clientId)).toBe(
      "/clients/client-1/technology-profile#immediate-focus",
    );
  });

  it("keeps recommendations under the workspace recommendations section", () => {
    expect(clientRecommendationsPath(clientId)).toBe(
      "/clients/client-1/recommendations",
    );
    expect(clientRecommendationDetailPath(clientId, "r1")).toBe(
      "/clients/client-1/recommendations?selected=r1",
    );
  });

  it("defines workspace projects path while live project links use the register", () => {
    expect(clientWorkspaceProjectsPath(clientId)).toBe("/clients/client-1/projects");
    expect(clientProjectsPath(clientId)).toBe("/projects?client=client-1");
    expect(clientProjectDetailPath(clientId, "p1")).toBe(
      "/projects?client=client-1&selected=p1",
    );
  });
});
