import {
  assessmentExecutiveOverviewDemoData,
  toExecutiveOverviewProfileDetail,
} from "@/lib/demo-data/assessment-executive-overview";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";

export const CLIENT_DASHBOARD_PREVIEW_CLIENT_ID = "preview-pinnacle-engineering";

/** Static demo profile for public marketing previews — never loaded from the database. */
export const CLIENT_DASHBOARD_PREVIEW_DETAIL: TechnologyProfileDetail =
  toExecutiveOverviewProfileDetail(
    assessmentExecutiveOverviewDemoData,
    CLIENT_DASHBOARD_PREVIEW_CLIENT_ID,
  );
