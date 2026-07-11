import { describe, expect, it } from "vitest";
import { canAccessCommand } from "@/lib/command-center/permissions";
import { fuzzyScore, rankByFuzzy } from "@/lib/command-center/fuzzy";
import {
  clearCommandRegistry,
  getRegisteredCommands,
  registerCommand,
} from "@/lib/command-center/registry";
import { buildPageContext } from "@/lib/command-center/context";

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
});

describe("command registry", () => {
  it("deduplicates command ids", () => {
    clearCommandRegistry();
    registerCommand("test", {
      id: "test:one",
      category: "navigation",
      title: "One",
      href: "/one",
    });
    registerCommand("test", {
      id: "test:one",
      category: "navigation",
      title: "One Duplicate",
      href: "/two",
    });
    expect(getRegisteredCommands()).toHaveLength(1);
    clearCommandRegistry();
  });
});
