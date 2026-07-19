import { northstarDemoDashboard } from "@/lib/product-overview/demo-dashboard";
import {
  DEMO_CONNECTIONS,
  DEMO_RECOMMENDATIONS,
  DEMO_ROADMAP_INITIATIVES,
  JOURNEY_STAGES,
} from "@/lib/product-overview/demo-strategy";
import {
  DEMO_BUDGET_PERIODS,
  DEMO_EXECUTIVE_REPORTS,
  DEMO_EXECUTIVE_REVIEW,
  DEMO_REPORT_PREVIEWS,
} from "@/lib/product-overview/demo-execution";
import { TECHNOLOGY_TIMELINE_SNAPSHOTS } from "@/lib/product-overview/demo-partnership";
import type { DemoProfileBundle } from "@/lib/product-overview/demo-profiles/types";

export const manufacturingProfile: DemoProfileBundle = {
  id: "manufacturing",
  label: "Manufacturing",
  dashboard: northstarDemoDashboard,
  recommendations: DEMO_RECOMMENDATIONS,
  roadmapInitiatives: DEMO_ROADMAP_INITIATIVES,
  connections: DEMO_CONNECTIONS,
  journeyStages: JOURNEY_STAGES,
  executiveReview: DEMO_EXECUTIVE_REVIEW,
  executiveReports: DEMO_EXECUTIVE_REPORTS,
  reportPreviews: DEMO_REPORT_PREVIEWS,
  budgetPeriods: DEMO_BUDGET_PERIODS,
  timelineSnapshots: TECHNOLOGY_TIMELINE_SNAPSHOTS,
};
