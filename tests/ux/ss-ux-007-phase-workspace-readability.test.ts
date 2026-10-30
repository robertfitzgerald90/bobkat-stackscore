import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { RECOMMENDATION_LIFECYCLE_LABELS, RECOMMENDATION_STATUS_VALUES } from "@/lib/client-roadmap/labels";
import { INITIATIVE_STATUS_BADGE_CLASS } from "@/lib/client-roadmap/initiative-status-style";
import {
  parseRecommendationDescription,
  presentRecommendationDescription,
} from "@/lib/customer-portal/recommendation-content";
import type { RecommendationStatus } from "@/generated/prisma/client";

const STRUCTURED = [
  "Context the catalog stored ahead of the labels.",
  "",
  "Finding: Assessment responses indicate MFA is inconsistent.",
  "Coverage differs by site.",
  "",
  "Recommended action: Enforce MFA for privileged accounts first.",
  "",
  "Expected outcome: Credential theft is less likely to grant access.",
  "",
  "Implementation considerations: Start with remote-access paths.",
].join("\n");

const LEGACY = ["Backup jobs run overnight.", "Failures are reviewed weekly.", "", "No labeled sections are stored."].join(
  "\n",
);

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((channel) => channel + channel).join("")
    : normalized;
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function channel(value: number): number {
  const srgb = value / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const [red, green, blue] = hexToRgb(hex);
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function mixHex(overlay: string, surface: string, alpha: number): string {
  const [or, og, ob] = hexToRgb(overlay);
  const [sr, sg, sb] = hexToRgb(surface);
  const blend = (overlayChannel: number, surfaceChannel: number) =>
    Math.round(overlayChannel * alpha + surfaceChannel * (1 - alpha));
  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  return `#${toHex(blend(or, sr))}${toHex(blend(og, sg))}${toHex(blend(ob, sb))}`;
}

/**
 * Token pairs behind INITIATIVE_STATUS_BADGE_CLASS.
 * Solid fills use the theme surface. Washes composite the semantic color at 10% over the card.
 */
const THEMES = {
  customer: {
    foreground: "#f1f2f4",
    secondary: "#16181f",
    muted: "#16181f",
    primary: "#3ecf7a",
    warning: "#c9a227",
    success: "#3ecf7a",
    destructive: "#b23a3a",
    card: "#12141a",
  },
  staff: {
    foreground: "#0f172a",
    secondary: "#e8eef3",
    muted: "#f4f6f8",
    primary: "#082F5B",
    warning: "#b45309",
    success: "#15803d",
    destructive: "#dc2626",
    card: "#ffffff",
  },
} as const;

type ThemeName = keyof typeof THEMES;

function badgeColors(status: RecommendationStatus, themeName: ThemeName): { text: string; background: string } {
  const theme = THEMES[themeName];
  switch (status) {
    case "open":
      return { text: theme.foreground, background: theme.secondary };
    case "accepted":
      return { text: theme.primary, background: mixHex(theme.primary, theme.card, 0.1) };
    case "in_progress":
    case "deferred":
      return { text: theme.foreground, background: mixHex(theme.warning, theme.card, 0.1) };
    case "completed":
      return { text: theme.foreground, background: mixHex(theme.success, theme.card, 0.1) };
    case "archived":
      return { text: theme.foreground, background: theme.muted };
    case "declined":
      return { text: theme.foreground, background: mixHex(theme.destructive, theme.card, 0.1) };
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

describe("SS-UX-007-FIX phase workspace readability", () => {
  it("keeps approved section text intact and separated", () => {
    const sections = parseRecommendationDescription(STRUCTURED);
    expect(sections.hasStructuredSections).toBe(true);
    expect(sections.leadingText).toBe("Context the catalog stored ahead of the labels.");
    expect(sections.finding).toBe(
      "Assessment responses indicate MFA is inconsistent.\nCoverage differs by site.",
    );
    expect(sections.recommendedAction).toBe("Enforce MFA for privileged accounts first.");
    expect(sections.expectedOutcome).toBe("Credential theft is less likely to grant access.");
    expect(sections.implementationConsiderations).toBe("Start with remote-access paths.");

    for (const body of [
      sections.leadingText,
      sections.finding,
      sections.recommendedAction,
      sections.expectedOutcome,
      sections.implementationConsiderations,
    ]) {
      expect(body).toBeTruthy();
      expect(STRUCTURED).toContain(body);
    }
  });

  it("preserves unstructured legacy paragraphs and line breaks", () => {
    const presented = presentRecommendationDescription(LEGACY);
    expect(presented.sections.hasStructuredSections).toBe(false);
    expect(presented.sections.finding).toBeNull();
    expect(presented.sections.recommendedAction).toBeNull();
    expect(presented.unstructuredText).toBe(LEGACY);
    expect(presented.paragraphs).toEqual([
      "Backup jobs run overnight.\nFailures are reviewed weekly.",
      "No labeled sections are stored.",
    ]);
  });

  it("does not drop source text when labels have no body", () => {
    const source = "Finding:\n\nRecommended action:";
    const presented = presentRecommendationDescription(source);
    expect(presented.sections.hasStructuredSections).toBe(false);
    expect(presented.unstructuredText).toBe(source);
    expect(presented.paragraphs.join("\n\n")).toContain("Finding:");
    expect(presented.paragraphs.join("\n\n")).toContain("Recommended action:");
  });

  it("does not invent sections for empty input or label-like prose", () => {
    expect(presentRecommendationDescription(null).paragraphs).toEqual([]);
    expect(presentRecommendationDescription("   ").unstructuredText).toBeNull();

    const prose = "The notes mention Finding without a section label.\n\nSecond paragraph remains.";
    const presented = presentRecommendationDescription(prose);
    expect(presented.sections.hasStructuredSections).toBe(false);
    expect(presented.unstructuredText).toBe(prose);
    expect(presented.paragraphs).toHaveLength(2);
  });

  it("gives every supported initiative status an explicit contrasting chip", () => {
    expect(Object.keys(INITIATIVE_STATUS_BADGE_CLASS).sort()).toEqual(
      [...RECOMMENDATION_STATUS_VALUES].sort(),
    );

    for (const status of RECOMMENDATION_STATUS_VALUES) {
      const classes = INITIATIVE_STATUS_BADGE_CLASS[status];
      expect(classes, status).toMatch(/\btext-/);
      expect(classes, status).toMatch(/\bbg-/);
      expect(classes, status).not.toContain("bg-white");
      expect(classes, status).not.toContain("text-white");
      expect(RECOMMENDATION_LIFECYCLE_LABELS[status].length).toBeGreaterThan(0);

      for (const themeName of ["customer", "staff"] as const) {
        const colors = badgeColors(status, themeName);
        const ratio = contrastRatio(colors.text, colors.background);
        expect(ratio, `${status} on ${themeName}`).toBeGreaterThanOrEqual(4.5);
      }
    }

    expect(INITIATIVE_STATUS_BADGE_CLASS.open).toContain("text-foreground");
    expect(INITIATIVE_STATUS_BADGE_CLASS.open).toContain("bg-secondary");
    expect(INITIATIVE_STATUS_BADGE_CLASS.declined).toContain("text-foreground");
  });

  it("wires phase workspace cards to the shared parser and status chip", () => {
    const workspace = readFileSync(
      join(process.cwd(), "src/components/client-roadmap/phase-workspace.tsx"),
      "utf8",
    );
    const content = readFileSync(
      join(process.cwd(), "src/components/client-roadmap/initiative-recommendation-content.tsx"),
      "utf8",
    );

    expect(workspace).toContain("InitiativeStatusBadge");
    expect(workspace).toContain("InitiativeRecommendationContent");
    expect(workspace).toContain("InitiativeBusinessBenefit");
    expect(workspace).not.toContain("bg-white");
    expect(workspace).toContain("phase.isConsultant");
    expect(content).toContain("presentRecommendationDescription");
    expect(content).toContain("Finding");
    expect(content).toContain("Recommended action");
    expect(content).toContain("Expected outcome");
    expect(content).toContain("Implementation considerations");
    expect(content).toContain("Business benefit");
    expect(content).not.toContain("generate");
  });
});
