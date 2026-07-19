export type PresentationSection = {
  id: string;
  sectionId: string;
  title: string;
  narrative: string;
  durationMs: number;
};

export const PRESENTATION_SECTIONS: PresentationSection[] = [
  {
    id: "overview",
    sectionId: "product-overview-dashboard",
    title: "Demo Overview",
    narrative:
      "Meet the company, see the starting StackScore, and understand the phased improvement journey ahead.",
    durationMs: 22_000,
  },
  {
    id: "assessment",
    sectionId: "product-overview-assessment",
    title: "Assessment Results",
    narrative:
      "Pillar scores and priority gaps convert into an ordered roadmap — not one oversized investment ask.",
    durationMs: 22_000,
  },
  {
    id: "roadmap",
    sectionId: "product-overview-roadmap",
    title: "Living Execution Plan",
    narrative:
      "Four independently approvable phases with separated one-time and monthly investments.",
    durationMs: 28_000,
  },
  {
    id: "proposal",
    sectionId: "product-overview-phase-proposal",
    title: "Phase Proposal",
    narrative:
      "Phase 1 can be approved without committing to the full roadmap. Demo approval is local only.",
    durationMs: 25_000,
  },
  {
    id: "implementation",
    sectionId: "product-overview-implementation",
    title: "Implementation Progress",
    narrative:
      "Approved phases become living delivery with initiative status and business outcomes.",
    durationMs: 22_000,
  },
  {
    id: "improvement",
    sectionId: "product-overview-measurable-improvement",
    title: "Measurable Improvement",
    narrative:
      "Completed work raises the effective StackScore and unlocks the next recommended phase.",
    durationMs: 22_000,
  },
  {
    id: "budget",
    sectionId: "product-overview-budget",
    title: "Budget & Investment",
    narrative:
      "Review one-time and monthly recurring investments by phase — never a false grand total.",
    durationMs: 20_000,
  },
  {
    id: "reports",
    sectionId: "product-overview-reports",
    title: "Reports & Planning",
    narrative:
      "Assessment, living execution plan, phase proposal, progress, business review, and budget reports stay connected.",
    durationMs: 20_000,
  },
  {
    id: "final-cta",
    sectionId: "product-overview-final-cta",
    title: "Begin Your Technology Strategy",
    narrative:
      "Get a Technology Maturity Assessment and improve through a living execution plan.",
    durationMs: 24_000,
  },
];

export const PRESENTATION_STORAGE_KEY = "stackscore-product-overview-presentation";
