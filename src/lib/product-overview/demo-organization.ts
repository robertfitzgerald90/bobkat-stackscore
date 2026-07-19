import type { DemoOrganization } from "@/lib/product-overview/types";
import { DEFAULT_DEMO_COMPANY_PROFILE } from "@/lib/demo-data/demo-financial-profile";

export const northstarManufacturing: DemoOrganization = {
  id: "demo-northstar-manufacturing",
  name: "Northstar Manufacturing",
  employeeCount: DEFAULT_DEMO_COMPANY_PROFILE.employeeCount,
  locationCount: DEFAULT_DEMO_COMPANY_PROFILE.locationCount,
  industry: "Light manufacturing",
  summary:
    "Northstar Manufacturing is a single-location SMB with about 50 licensed users and 60 managed Windows endpoints. The company runs Microsoft 365 Business Premium, Ubiquiti networking, and Bobkat IT managed endpoint service — and wants transparent technology planning without enterprise-scale capital spending.",
  environmentHighlights: [
    "Microsoft 365 Business Premium for identity, email, and collaboration",
    "Ubiquiti networking with aging switches and Wi-Fi coverage gaps",
    "Bobkat IT managed endpoint service with incomplete lifecycle standards",
    "Cloud-first services with practical cybersecurity and backup gaps",
  ],
};
