import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("technology snapshot public layout (SS-SNAP-003)", () => {
  it("whitelists the public route in auth config", () => {
    const authConfig = readFileSync(
      resolve(process.cwd(), "src/lib/auth/auth.config.ts"),
      "utf8",
    );

    expect(authConfig).toContain('pathname.startsWith("/technology-snapshot")');
    expect(authConfig).toContain('pathname.startsWith("/api/v1/public/technology-snapshot")');
  });

  it("uses anonymous-first wizard with mobile-safe controls", () => {
    const wizard = readFileSync(
      resolve(process.cwd(), "src/components/technology-snapshot/technology-snapshot-wizard.tsx"),
      "utf8",
    );

    expect(wizard).toContain("max-w-2xl");
    expect(wizard).toContain("w-full sm:w-auto");
    expect(wizard).toContain("Start Free Snapshot");
    expect(wizard).toContain("saveSnapshotSession");
    expect(wizard).toContain("buildSnapshotFindingsV2");
    expect(wizard).toContain("items={IT_MANAGEMENT_LABELS}");
    expect(wizard).toContain("activeQuestion.helpText");
    expect(wizard).not.toContain("AssessmentExecutiveOverviewPreview");
  });

  it("renders premium results dashboard with conversion CTAs", () => {
    const dashboard = readFileSync(
      resolve(
        process.cwd(),
        "src/components/technology-snapshot/snapshot-results-dashboard.tsx",
      ),
      "utf8",
    );

    expect(dashboard).toContain("SnapshotRadar");
    expect(dashboard).toContain("Book Your Free 60-Minute Technology Consultation");
    expect(dashboard).toContain("/assessment-offer");
    expect(dashboard).toContain("/demo/overview");
    expect(dashboard).toContain("SNAPSHOT_OFFICIAL_DISCLAIMER");
    expect(dashboard).toContain("SnapshotContactCapture");
  });

  it("renders a high-contrast brand-violet radar polygon", () => {
    const radar = readFileSync(
      resolve(process.cwd(), "src/components/technology-snapshot/snapshot-radar.tsx"),
      "utf8",
    );

    expect(radar).toContain("var(--brand-primary");
    expect(radar).not.toContain("hsl(var(--primary))");
    expect(radar).toContain("strokeWidth={2.75}");
    expect(radar).toContain("fillOpacity={0.38}");
    expect(radar).toContain("SnapshotRadarVertex");
    expect(radar).toContain('outerRadius="78%"');
  });

  it("restricts snapshot leads page to admins", () => {
    const page = readFileSync(
      resolve(process.cwd(), "src/app/(dashboard)/snapshot-leads/page.tsx"),
      "utf8",
    );

    expect(page).toContain('role !== "admin"');
    expect(page).toContain('redirect("/dashboard")');
  });
});
