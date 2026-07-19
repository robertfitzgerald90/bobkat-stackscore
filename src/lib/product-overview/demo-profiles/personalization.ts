import type { DemoBusinessGoal, DemoPersonalization } from "@/lib/product-overview/demo-profiles/types";

export const DEMO_BUSINESS_GOALS: Array<{
  id: DemoBusinessGoal;
  label: string;
  description: string;
}> = [
  {
    id: "reduce-it-risk",
    label: "Reduce IT Risk",
    description: "Prioritize resilience, continuity, and operational stability.",
  },
  {
    id: "improve-cybersecurity",
    label: "Improve Cybersecurity",
    description: "Strengthen identity, monitoring, and security governance.",
  },
  {
    id: "plan-investments",
    label: "Plan Technology Investments",
    description: "Align budget, roadmap, and executive priorities.",
  },
  {
    id: "support-growth",
    label: "Support Growth",
    description: "Enable expansion with scalable systems and reporting.",
  },
  {
    id: "modernize-infrastructure",
    label: "Modernize Infrastructure",
    description: "Refresh aging systems and improve platform reliability.",
  },
];

export const DEFAULT_PERSONALIZATION: DemoPersonalization = {
  companyName: "Northstar Manufacturing",
  industryId: "manufacturing",
  employeeCount: 85,
  locationCount: 2,
  businessGoal: "reduce-it-risk",
};

export function replaceCompanyName(text: string, companyName: string, fallback = "Northstar Manufacturing") {
  return text.replaceAll(fallback, companyName).replaceAll("{{companyName}}", companyName);
}

export function personalizeDeep<T>(value: T, companyName: string, fallback = "Northstar Manufacturing"): T {
  if (typeof value === "string") {
    return replaceCompanyName(value, companyName, fallback) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => personalizeDeep(item, companyName, fallback)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, personalizeDeep(item, companyName, fallback)]),
    ) as T;
  }
  return value;
}
