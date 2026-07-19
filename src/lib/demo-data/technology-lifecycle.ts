import type { TechnologyLifecycleItem } from "@/components/technology-stack/technology-lifecycle-card";
import {
  buildTechnologyLifecycleDemoItems,
  NORTHSTAR_DEMO_FINANCIAL_PROFILE,
} from "@/lib/demo-data/demo-financial-profile";

/** Static demo data for public marketing previews — never loaded from the database. */
export const technologyLifecycleDemoData: TechnologyLifecycleItem[] =
  buildTechnologyLifecycleDemoItems(NORTHSTAR_DEMO_FINANCIAL_PROFILE);

export {
  buildDemoFinancialProfile,
  buildTechnologyLifecycleDemoItems,
  DEFAULT_DEMO_COMPANY_PROFILE,
  DEFAULT_DEMO_PRICING,
  NORTHSTAR_DEMO_FINANCIAL_PROFILE,
  PINNACLE_DEMO_COMPANY_PROFILE,
  scaleDemoCompanyProfile,
} from "@/lib/demo-data/demo-financial-profile";
