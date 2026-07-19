export type PresentationSection = {
  id: string;
  sectionId: string;
  title: string;
  narrative: string;
  durationMs: number;
};

export const PRESENTATION_SECTIONS: PresentationSection[] = [
  {
    id: "dashboard",
    sectionId: "product-overview-dashboard",
    title: "Client Success Dashboard",
    narrative:
      "One command center for technology posture, priorities, projects, and executive planning signals.",
    durationMs: 25_000,
  },
  {
    id: "timeline",
    sectionId: "product-overview-timeline",
    title: "Technology Timeline",
    narrative:
      "Track measurable maturity gains across an ongoing Strategic IT Consulting partnership.",
    durationMs: 22_000,
  },
  {
    id: "assessment",
    sectionId: "product-overview-assessment",
    title: "Technology Assessment",
    narrative:
      "Eight strategic pillars establish a credible baseline for investment and improvement decisions.",
    durationMs: 25_000,
  },
  {
    id: "recommendations",
    sectionId: "product-overview-recommendations",
    title: "Recommendations",
    narrative:
      "Prioritized improvements with business impact, effort, and investment estimates — not a static report.",
    durationMs: 25_000,
  },
  {
    id: "roadmap",
    sectionId: "product-overview-roadmap",
    title: "Strategic Roadmap",
    narrative:
      "Quarter-by-quarter planning connects recommendations, budget, and business priorities.",
    durationMs: 25_000,
  },
  {
    id: "projects",
    sectionId: "product-overview-projects",
    title: "Project Execution",
    narrative:
      "Initiatives become managed projects with owners, milestones, and measurable outcomes.",
    durationMs: 25_000,
  },
  {
    id: "quarterly-review",
    sectionId: "product-overview-quarterly-review",
    title: "Quarterly Reviews",
    narrative:
      "Executive accountability every quarter with score movement, completed work, and next priorities.",
    durationMs: 22_000,
  },
  {
    id: "reports",
    sectionId: "product-overview-reports",
    title: "Executive Reports",
    narrative:
      "Polished leadership reports generated from live platform data instead of one-off slide decks.",
    durationMs: 22_000,
  },
  {
    id: "budget",
    sectionId: "product-overview-budget",
    title: "Budget Planning",
    narrative:
      "Align approved spend, committed dollars, and remaining capacity with your technology roadmap.",
    durationMs: 22_000,
  },
  {
    id: "planning",
    sectionId: "product-overview-strategic-planning",
    title: "Strategic Planning",
    narrative:
      "Next-quarter, 12-month, and three-year planning keep technology aligned with business growth.",
    durationMs: 22_000,
  },
  {
    id: "executive-decisions",
    sectionId: "product-overview-executive-decisions",
    title: "Executive Decision Center",
    narrative:
      "Technology, budget, project, and risk signals with clear business context for leadership.",
    durationMs: 22_000,
  },
  {
    id: "ecosystem",
    sectionId: "product-overview-ecosystem",
    title: "StackScore Ecosystem",
    narrative:
      "Assessment through continuous improvement — technology strategy that drives business growth.",
    durationMs: 25_000,
  },
  {
    id: "final-cta",
    sectionId: "product-overview-final-cta",
    title: "Begin Your Technology Strategy",
    narrative:
      "Every engagement starts with a Technology Maturity Assessment and evolves into ongoing partnership.",
    durationMs: 28_000,
  },
];

export const PRESENTATION_STORAGE_KEY = "stackscore-product-overview-presentation";
