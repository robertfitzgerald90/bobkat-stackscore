import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("assessment offer / Learn About StackScore landing (SS-MKT-001)", () => {
  it("composes the redesigned learn page sections", () => {
    const landing = readFileSync(
      resolve(process.cwd(), "src/components/assessment-offer/assessment-offer-landing.tsx"),
      "utf8",
    );
    const learnLanding = readFileSync(
      resolve(
        process.cwd(),
        "src/components/learn-about-stackscore/learn-about-stackscore-landing.tsx",
      ),
      "utf8",
    );
    const hero = readFileSync(
      resolve(process.cwd(), "src/components/learn-about-stackscore/learn-hero.tsx"),
      "utf8",
    );

    expect(landing).toContain("LearnAboutStackScoreLanding");
    expect(learnLanding).toContain("LearnHero");
    expect(learnLanding).toContain("LearnHowItWorks");
    expect(learnLanding).toContain("LearnMaturity");
    expect(learnLanding).toContain("LearnRecommendations");
    expect(learnLanding).toContain("LearnImprovementPlanning");
    expect(learnLanding).toContain("LearnDeliverables");
    expect(learnLanding).toContain("LearnContinuedImprovement");
    expect(learnLanding).toContain("LearnConversion");

    expect(hero).toContain("LEARN_PAGE_HERO");
    expect(hero).toContain("AssessmentPurchaseButton");
    expect(hero).toContain("TechnologySnapshotLink");
    expect(hero).toContain("Book a Consultation");
    expect(hero).toContain("AssessmentExecutiveOverviewPreview");
    expect(hero).not.toContain("OFFER_HERO_SCREENSHOT");

    const content = readFileSync(
      resolve(process.cwd(), "src/lib/learn-about-stackscore/content.ts"),
      "utf8",
    );
    expect(content).toContain("Understand your technology.");
    expect(content).toContain("Know what to improve.");
  });

  it("uses live maturity and executive previews with demo data only", () => {
    const maturity = readFileSync(
      resolve(process.cwd(), "src/components/learn-about-stackscore/learn-maturity.tsx"),
      "utf8",
    );
    const recommendations = readFileSync(
      resolve(process.cwd(), "src/components/learn-about-stackscore/learn-recommendations.tsx"),
      "utf8",
    );
    const content = readFileSync(
      resolve(process.cwd(), "src/lib/learn-about-stackscore/content.ts"),
      "utf8",
    );

    expect(maturity).toContain("TechnologyMaturityProfilePreview");
    expect(maturity).toContain("technologyMaturityProfileDemoData");
    expect(recommendations).toContain("LEARN_RECOMMENDATION_SAMPLES");
    expect(content).toContain("LEARN_DELIVERABLE_GROUPS");
    expect(content).not.toContain("templateCode");
    expect(content).not.toContain("latestTriggerReason");
  });

  it("wires conversion CTAs to operational destinations", () => {
    const conversion = readFileSync(
      resolve(process.cwd(), "src/components/learn-about-stackscore/learn-conversion.tsx"),
      "utf8",
    );
    const content = readFileSync(
      resolve(process.cwd(), "src/lib/learn-about-stackscore/content.ts"),
      "utf8",
    );

    expect(conversion).toContain("TechnologySnapshotLink");
    expect(conversion).toContain("AssessmentPurchaseButton");
    expect(conversion).toContain("LEARN_CONVERSION_CTAS.consultation.href");
    expect(content).toContain("SERVICES_CTA_DESTINATIONS.snapshot");
    expect(content).toContain("generalConsultation");
    expect(content).toContain("STACKSCORE_PUBLIC_ROUTES.assessmentOffer");
  });

  it("distinguishes assessment deliverables from optional advisory", () => {
    const content = readFileSync(
      resolve(process.cwd(), "src/lib/learn-about-stackscore/content.ts"),
      "utf8",
    );
    const planning = readFileSync(
      resolve(
        process.cwd(),
        "src/components/learn-about-stackscore/learn-improvement-planning.tsx",
      ),
      "utf8",
    );

    expect(content).toContain("Included with the Technology Maturity Assessment");
    expect(content).toContain("Optional advisory & services");
    expect(content).toContain("not automatically included");
    expect(planning).toContain("does not automatically include managed implementation");
  });

  it("uses responsive layout utilities on the hero", () => {
    const hero = readFileSync(
      resolve(process.cwd(), "src/components/learn-about-stackscore/learn-hero.tsx"),
      "utf8",
    );

    expect(hero).toContain("max-w-6xl");
    expect(hero).toContain("MARKETING_HERO_TITLE");
    expect(hero).toContain("sm:flex-row");
  });
});
