import { DEFAULT_DEMO_COMPANY_PROFILE } from "@/lib/demo-data/demo-financial-profile";
import type { DemoIndustryId, DemoPersonalization, DemoProfileBundle, DemoIndustryOption } from "@/lib/product-overview/demo-profiles/types";
import { personalizeDeep } from "@/lib/product-overview/demo-profiles/personalization";
import { manufacturingProfile } from "@/lib/product-overview/demo-profiles/manufacturing-profile";
import { applyIndustryPatch } from "@/lib/product-overview/demo-profiles/industry-patches";

export const DEMO_INDUSTRY_OPTIONS: DemoIndustryOption[] = [
  { id: "manufacturing", label: "Manufacturing", defaultCompanyName: "Northstar Manufacturing" },
  { id: "professional-services", label: "Professional Services", defaultCompanyName: "Summit Advisory Group" },
  { id: "healthcare", label: "Healthcare", defaultCompanyName: "Clearview Medical Partners" },
  { id: "construction", label: "Construction", defaultCompanyName: "Ironbridge Construction" },
  { id: "distribution", label: "Distribution", defaultCompanyName: "Atlas Distribution Co." },
  { id: "engineering", label: "Engineering", defaultCompanyName: "Pinnacle Engineering" },
  { id: "financial-services", label: "Financial Services", defaultCompanyName: "Harbor Capital Advisors" },
  { id: "retail", label: "Retail", defaultCompanyName: "Brightline Retail Group" },
];

export function getIndustryOption(id: DemoIndustryId) {
  return DEMO_INDUSTRY_OPTIONS.find((option) => option.id === id) ?? DEMO_INDUSTRY_OPTIONS[0]!;
}

export function buildDemoProfile(personalization: DemoPersonalization): DemoProfileBundle {
  const industryOption = getIndustryOption(personalization.industryId);
  const baseCompany = industryOption.defaultCompanyName;
  const patched = applyIndustryPatch(manufacturingProfile, personalization.industryId, baseCompany);
  const personalized = personalizeDeep(patched, personalization.companyName, baseCompany);

  personalized.dashboard.organization = {
    ...personalized.dashboard.organization,
    name: personalization.companyName,
    employeeCount: personalization.employeeCount,
    locationCount: personalization.locationCount,
    industry: industryOption.label,
  };

  personalized.dashboard.metrics.openRecommendations = personalized.recommendations.filter(
    (rec) => rec.status === "Open" || rec.status === "Planned",
  ).length;

  return personalized;
}

export function getDefaultProfile(): DemoProfileBundle {
  return buildDemoProfile({
    companyName: "Northstar Manufacturing",
    industryId: "manufacturing",
    employeeCount: DEFAULT_DEMO_COMPANY_PROFILE.employeeCount,
    locationCount: 1,
    businessGoal: "reduce-it-risk",
  });
}
