import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("assessment invitation landing page", () => {
  it("includes invitation sections and hero headline", () => {
    const landing = readFileSync(
      resolve(process.cwd(), "src/components/assessment-invitation/assessment-invitation-landing.tsx"),
      "utf8",
    );
    const hero = readFileSync(
      resolve(process.cwd(), "src/components/assessment-invitation/invitation-hero.tsx"),
      "utf8",
    );

    expect(landing).toContain("OfferFeatureGrid");
    expect(landing).toContain("OfferTimeline");
    expect(landing).toContain("InvitationAboutBobkat");
    expect(landing).toContain("InvitationFinalCta");
    expect(hero).toContain("TechnologySnapshotLink");
    expect(hero).toContain("Been Invited to Assess Your Technology");
    expect(hero).toContain("Start My Free Technology Snapshot");
    expect(hero).not.toContain("AssessmentPurchaseButton");
  });

  it("routes primary CTA to technology snapshot", () => {
    const snapshotLink = readFileSync(
      resolve(process.cwd(), "src/components/assessment-offer/technology-snapshot-link.tsx"),
      "utf8",
    );

    expect(snapshotLink).toContain('href="/technology-snapshot"');
  });

  it("allows public access to the invitation route", () => {
    const authConfig = readFileSync(
      resolve(process.cwd(), "src/lib/auth/auth.config.ts"),
      "utf8",
    );

    expect(authConfig).toContain('pathname.startsWith("/assessment-invitation")');
  });
});
