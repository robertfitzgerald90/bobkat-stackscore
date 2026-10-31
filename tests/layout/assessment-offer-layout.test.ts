import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("assessment offer / Learn About StackScore landing (SS-WEB-004)", () => {
  it("composes learn page sections with shared StackScore 2.0 showcase", () => {
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
    expect(learnLanding).toContain("StackScoreAppShowcase");
    expect(learnLanding).toContain("LearnRecommendations");
    expect(learnLanding).toContain("LearnDeliverables");
    expect(learnLanding).toContain("LearnContinuedImprovement");
    expect(learnLanding).toContain("LearnConversion");
    expect(learnLanding).not.toContain("LearnMaturity");
    expect(learnLanding).not.toContain("LearnImprovementPlanning");

    expect(hero).toContain("LEARN_PAGE_HERO");
    expect(hero).toContain("AssessmentPurchaseButton");
    expect(hero).toContain("TechnologySnapshotLink");
    expect(hero).toContain("Book a Consultation");
    expect(hero).toContain("AppShowcaseFrame");
    expect(hero).not.toContain("AssessmentExecutiveOverviewPreview");
    expect(hero).not.toContain("OFFER_HERO_SCREENSHOT");
  });

  it("ships authentic demo screenshots for Overview, Explore, and Roadmap", () => {
    const showcase = readFileSync(
      resolve(process.cwd(), "src/lib/marketing/app-showcase.ts"),
      "utf8",
    );

    expect(showcase).toContain("Understand Your Technology");
    expect(showcase).toContain("Explore Your Technology Landscape");
    expect(showcase).toContain("Turn Insights Into Action");
    expect(showcase).toContain("/images/marketing/ss-web-004/overview.webp");
    expect(showcase).toContain("/images/marketing/ss-web-004/explore.webp");
    expect(showcase).toContain("/images/marketing/ss-web-004/roadmap.webp");
    expect(showcase).toContain("does not automatically change the official score");

    for (const file of ["overview.webp", "explore.webp", "roadmap.webp"]) {
      expect(existsSync(resolve(process.cwd(), `public/images/marketing/ss-web-004/${file}`))).toBe(
        true,
      );
    }
  });

  it("avoids legacy dashboard preview components on the offer page", () => {
    const hero = readFileSync(
      resolve(process.cwd(), "src/components/learn-about-stackscore/learn-hero.tsx"),
      "utf8",
    );
    const landing = readFileSync(
      resolve(
        process.cwd(),
        "src/components/learn-about-stackscore/learn-about-stackscore-landing.tsx",
      ),
      "utf8",
    );

    expect(hero).not.toContain("TechnologyMaturityProfilePreview");
    expect(hero).not.toContain("ClientDashboardPreview");
    expect(landing).not.toContain("technologyMaturityProfileDemoData");
    expect(landing).not.toContain("assessmentExecutiveOverviewDemoData");
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
    const hero = readFileSync(
      resolve(process.cwd(), "src/components/learn-about-stackscore/learn-hero.tsx"),
      "utf8",
    );

    expect(conversion).toContain("TechnologySnapshotLink");
    expect(conversion).toContain("AssessmentPurchaseButton");
    expect(conversion).toContain("LEARN_CONVERSION_CTAS.consultation.href");
    expect(hero).toContain('$1,500');
    expect(hero).toContain("Purchase Technology Maturity Assessment");
    expect(hero).toContain("#how-stackscore-works");
    expect(content).toContain("SERVICES_CTA_DESTINATIONS.snapshot");
    expect(content).toContain("generalConsultation");
  });

  it("distinguishes assessment deliverables from optional advisory", () => {
    const content = readFileSync(
      resolve(process.cwd(), "src/lib/learn-about-stackscore/content.ts"),
      "utf8",
    );

    expect(content).toContain("Included with the Technology Maturity Assessment");
    expect(content).toContain("Optional advisory & services");
    expect(content).toContain("not automatically included");
  });
});
