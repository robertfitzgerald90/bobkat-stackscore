import type { ProductOverviewNavItem } from "@/lib/product-overview/types";

/**
 * Guided Interactive StackScore Experience navigation.
 * Intentionally shorter than the full page — this is a product story, not an admin sandbox.
 */
export const PRODUCT_OVERVIEW_NAV_ITEMS: ProductOverviewNavItem[] = [
  {
    id: "overview",
    label: "Overview",
    phase: 1,
    sectionId: "product-overview-dashboard",
  },
  {
    id: "assessment",
    label: "Assessment",
    phase: 1,
    sectionId: "product-overview-assessment",
    teaserTitle: "Assessment Results",
    teaserDescription:
      "See pillar scores, risks, and how findings become an independently approvable roadmap.",
  },
  {
    id: "roadmap",
    label: "Roadmap",
    phase: 2,
    sectionId: "product-overview-roadmap",
    teaserTitle: "Technology Roadmap",
    teaserDescription:
      "Four phases with separated one-time and monthly investments — approve one phase at a time.",
  },
  {
    id: "phase-proposal",
    label: "Proposal",
    phase: 2,
    sectionId: "product-overview-phase-proposal",
    teaserTitle: "Phase Proposal",
    teaserDescription:
      "Preview a Phase 1 proposal and simulate approval without creating a real record.",
  },
  {
    id: "implementation",
    label: "Implementation",
    phase: 3,
    sectionId: "product-overview-implementation",
    teaserTitle: "Implementation Progress",
    teaserDescription:
      "See how an approved phase becomes living delivery with clear initiative status.",
  },
  {
    id: "improvement",
    label: "Improvement",
    phase: 3,
    sectionId: "product-overview-measurable-improvement",
    teaserTitle: "Measurable Improvement",
    teaserDescription:
      "Completed work increases the effective StackScore and unlocks the next recommended phase.",
  },
  {
    id: "budget",
    label: "Budget",
    phase: 3,
    sectionId: "product-overview-budget",
    teaserTitle: "Investment by Phase",
    teaserDescription:
      "Review one-time and monthly recurring investments by phase — never a false grand total.",
  },
  {
    id: "reports",
    label: "Reports",
    phase: 3,
    sectionId: "product-overview-reports",
    teaserTitle: "Reports & Planning",
    teaserDescription:
      "Executive roadmap, phase proposal, progress, QBR, and budget reports from connected data.",
  },
];
