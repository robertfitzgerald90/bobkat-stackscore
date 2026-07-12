import { describe, expect, it, beforeEach } from "vitest";
import { canAccessCommand, canExecuteResolvedCommand } from "@/lib/command-center/permissions";
import { canClientAccessPath } from "@/lib/command-center/route-access";
import { fuzzyScore, rankByFuzzy } from "@/lib/command-center/fuzzy";
import { buildPageContext } from "@/lib/command-center/context";
import {
  clearCommandRegistry,
  getRegisteredCommands,
  registerCommand,
} from "@/lib/command-center/registry";
import { initializeCommandModules, resetCommandModulesForTests } from "@/lib/command-center/modules";
import {
  getAvailableCommands,
  getSuggestedCommands,
  searchCommands,
} from "@/lib/command-center/resolve-commands";

describe("command-center fuzzy", () => {
  it("scores prefix matches higher than scattered letters", () => {
    expect(fuzzyScore("ninja", "NinjaOne RMM")).toBeGreaterThan(
      fuzzyScore("ninja", "Manufacturing Bundle"),
    );
  });

  it("ranks items by relevance", () => {
    const ranked = rankByFuzzy(
      "abc",
      [
        { id: "1", label: "Northwind LLC" },
        { id: "2", label: "ABC Manufacturing" },
      ],
      (item) => [item.label],
    );
    expect(ranked[0]?.id).toBe("2");
  });
});

describe("command-center permissions", () => {
  const staffContext = buildPageContext({
    pathname: "/dashboard",
    role: "technician",
    userClientId: null,
  });

  const clientContext = buildPageContext({
    pathname: "/dashboard",
    role: "client",
    userClientId: "client-1",
    clientPortal: {
      draftAssessmentId: null,
      currentAssessmentId: "assessment-1",
      hasCompletedAssessment: true,
      hasRecommendations: true,
      reportHref: "/assessments/assessment-1/report",
      pdfHref: "/api/v1/assessments/assessment-1/export/pdf",
    },
  });

  it("blocks staff-only commands for clients", () => {
    expect(
      canAccessCommand({ staffOnly: true, clientHidden: true }, clientContext),
    ).toBe(false);
  });

  it("allows staff-only commands for technicians", () => {
    expect(canAccessCommand({ staffOnly: true, clientHidden: true }, staffContext)).toBe(
      true,
    );
  });

  it("denies commands without permissions metadata for clients", () => {
    expect(canAccessCommand(undefined, clientContext)).toBe(false);
    expect(canAccessCommand(undefined, staffContext)).toBe(true);
  });

  it("blocks client users from admin routes", () => {
    expect(canClientAccessPath("/admin/communications/analytics", clientContext)).toBe(false);
    expect(canClientAccessPath("/admin/communications/history", clientContext)).toBe(false);
  });

  it("blocks action commands for clients", () => {
    expect(
      canExecuteResolvedCommand(
        {
          id: "communications:quick-invite",
          permissions: { staffOnly: true },
          actionId: "communications:quick-invite",
        },
        clientContext,
      ),
    ).toBe(false);
  });
});

describe("command registry", () => {
  it("deduplicates command ids", () => {
    clearCommandRegistry();
    registerCommand("test", {
      id: "test:one",
      category: "navigation",
      title: "One",
      href: "/one",
      permissions: { staffOnly: true },
    });
    registerCommand("test", {
      id: "test:one",
      category: "navigation",
      title: "One Duplicate",
      href: "/two",
      permissions: { staffOnly: true },
    });
    expect(getRegisteredCommands()).toHaveLength(1);
    clearCommandRegistry();
  });
});

describe("registered command visibility", () => {
  beforeEach(() => {
    resetCommandModulesForTests();
    initializeCommandModules();
  });

  it("does not expose communication analytics to clients", () => {
    const context = buildPageContext({
      pathname: "/clients/client-1/technology-profile",
      role: "client",
      userClientId: "client-1",
      clientPortal: {
        draftAssessmentId: null,
        currentAssessmentId: null,
        hasCompletedAssessment: false,
        hasRecommendations: false,
        reportHref: null,
        pdfHref: null,
      },
    });

    const commands = getAvailableCommands(context);
    const titles = commands.map((command) => command.title);
    expect(titles).not.toContain("Communication Analytics");
    expect(titles).not.toContain("Campaigns");
    expect(titles).not.toContain("Quick Invite");
  });

  it("does not return admin commands when clients search for communication", () => {
    const context = buildPageContext({
      pathname: "/dashboard",
      role: "client",
      userClientId: "client-1",
    });

    const results = searchCommands("communication", context);
    expect(results.some((command) => command.title.includes("Communication"))).toBe(false);
    expect(results.some((command) => command.title.includes("Campaign"))).toBe(false);
  });

  it("shows only one assessment dashboard entry for clients", () => {
    const context = buildPageContext({
      pathname: "/dashboard",
      role: "client",
      userClientId: "client-1",
      clientPortal: {
        draftAssessmentId: "draft-1",
        currentAssessmentId: "assessment-1",
        hasCompletedAssessment: true,
        hasRecommendations: true,
        reportHref: "/assessments/assessment-1/report",
        pdfHref: "/api/v1/assessments/assessment-1/export/pdf",
      },
    });

    const commands = getAvailableCommands(context);
    const dashboardEntries = commands.filter((command) =>
      command.title.includes("Assessment Dashboard"),
    );
    expect(dashboardEntries).toHaveLength(1);
  });

  it("suggests client-safe commands only", () => {
    const context = buildPageContext({
      pathname: "/dashboard",
      role: "client",
      userClientId: "client-1",
      clientPortal: {
        draftAssessmentId: "draft-1",
        currentAssessmentId: "assessment-1",
        hasCompletedAssessment: true,
        hasRecommendations: true,
        reportHref: "/assessments/assessment-1/report",
        pdfHref: "/api/v1/assessments/assessment-1/export/pdf",
      },
    });

    const suggested = getSuggestedCommands(context);
    expect(suggested.every((command) => !command.title.includes("Quick Invite"))).toBe(true);
    expect(suggested.some((command) => command.id === "client:resume-assessment")).toBe(true);
  });

  it("keeps admin communications commands available to staff", () => {
    const context = buildPageContext({
      pathname: "/dashboard",
      role: "admin",
      userClientId: null,
    });

    const commands = getAvailableCommands(context);
    expect(commands.some((command) => command.title === "Communication Analytics")).toBe(true);
  });
});
