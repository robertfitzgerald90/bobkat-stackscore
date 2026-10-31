import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("assessment invitation landing page (SS-WEB-004)", () => {
  it("includes invitation sections and shared app showcase", () => {
    const landing = readFileSync(
      resolve(process.cwd(), "src/components/assessment-invitation/assessment-invitation-landing.tsx"),
      "utf8",
    );
    const hero = readFileSync(
      resolve(process.cwd(), "src/components/assessment-invitation/invitation-hero.tsx"),
      "utf8",
    );
    const discover = readFileSync(
      resolve(process.cwd(), "src/components/assessment-invitation/invitation-discover-section.tsx"),
      "utf8",
    );

    expect(landing).toContain("InvitationDiscoverSection");
    expect(landing).toContain("StackScoreAppShowcase");
    expect(landing).toContain("OfferTimeline");
    expect(landing).toContain("InvitationWhySection");
    expect(landing).toContain("InvitationAboutBobkat");
    expect(landing).toContain("InvitationFinalCta");
    expect(hero).toContain("TechnologySnapshotLink");
    expect(hero).toContain("Been Invited to Assess Your");
    expect(hero).toContain("marketing-text-gradient");
    expect(hero).toContain("Start My Free Technology Snapshot");
    expect(hero).not.toContain("AssessmentPurchaseButton");
    expect(hero).toContain("AppShowcaseFrame");
    expect(hero).not.toContain("ClientDashboardPreview");
    expect(hero).not.toContain("INVITATION_HERO_SCREENSHOT");
    expect(discover).not.toContain("SnapshotResultCard");
  });

  it("uses the same showcase screenshot assets as the offer page", () => {
    const showcase = readFileSync(
      resolve(process.cwd(), "src/lib/marketing/app-showcase.ts"),
      "utf8",
    );
    expect(showcase).toContain("/images/marketing/ss-web-004/overview.webp");
    expect(existsSync(resolve(process.cwd(), "public/images/marketing/ss-web-004/overview.webp"))).toBe(
      true,
    );
  });

  it("routes primary CTA to technology snapshot", () => {
    const snapshotLink = readFileSync(
      resolve(process.cwd(), "src/components/assessment-offer/technology-snapshot-link.tsx"),
      "utf8",
    );

    expect(snapshotLink).toContain("buildTechnologySnapshotUrl");
  });

  it("allows public access to the invitation route", () => {
    const authConfig = readFileSync(
      resolve(process.cwd(), "src/lib/auth/auth.config.ts"),
      "utf8",
    );

    expect(authConfig).toContain('pathname.startsWith("/assessment-invitation")');
  });

  it("avoids obsolete Technology Health labeling", () => {
    const content = readFileSync(
      resolve(process.cwd(), "src/lib/assessment-invitation/content.ts"),
      "utf8",
    );
    expect(content).not.toContain("Technology Health");
    expect(content).toContain("Technology Maturity");
    expect(content).toContain("does not automatically change your official StackScore");
  });
});
