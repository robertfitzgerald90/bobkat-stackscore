import type { ProductOverviewNavItem } from "@/lib/product-overview/types";

export const PRODUCT_OVERVIEW_NAV_ITEMS: ProductOverviewNavItem[] = [
  { id: "overview", label: "Overview", phase: 1 },
  {
    id: "my-technology",
    label: "My Technology",
    phase: 2,
    teaserTitle: "Technology Maturity Assessment",
    teaserDescription:
      "See how assessments translate into pillar scores, maturity labels, and executive-ready insights.",
  },
  {
    id: "recommendations",
    label: "Recommendations",
    phase: 2,
    teaserTitle: "Recommendations",
    teaserDescription:
      "Prioritized improvements with effort, cost, and business impact — not just a static report.",
  },
  {
    id: "roadmap",
    label: "Roadmap",
    phase: 2,
    teaserTitle: "Strategic Roadmap",
    teaserDescription:
      "Quarter-by-quarter planning that connects recommendations, projects, and budget decisions.",
  },
  {
    id: "projects",
    label: "Projects",
    phase: 2,
    teaserTitle: "Projects",
    teaserDescription:
      "Track initiative progress, milestones, owners, and outcomes in one workspace.",
  },
  {
    id: "quarterly-review",
    label: "Quarterly Review",
    phase: 2,
    teaserTitle: "Quarterly Reviews",
    teaserDescription:
      "Executive-ready review summaries with score movement, completed work, and next priorities.",
  },
  {
    id: "budget",
    label: "Budget",
    phase: 2,
    teaserTitle: "Budget Planning",
    teaserDescription:
      "Align approved spend, committed dollars, and remaining capacity with your technology roadmap.",
  },
  {
    id: "reports",
    label: "Reports",
    phase: 2,
    teaserTitle: "Executive Reports",
    teaserDescription:
      "Share polished leadership reports built from live platform data instead of one-off slide decks.",
  },
];

export const PHASE_2_TEASER_MODULES = PRODUCT_OVERVIEW_NAV_ITEMS.filter((item) => item.phase === 2);
