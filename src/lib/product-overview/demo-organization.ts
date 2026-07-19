import type { DemoOrganization } from "@/lib/product-overview/types";

export const northstarManufacturing: DemoOrganization = {
  id: "demo-northstar-manufacturing",
  name: "Northstar Manufacturing",
  employeeCount: 55,
  locationCount: 1,
  industry: "Light manufacturing",
  summary:
    "Northstar Manufacturing is a single-location SMB with about 55 employees and roughly 60 managed Windows endpoints. The company runs Microsoft 365 Business Premium, Ubiquiti networking, and NinjaOne endpoint management — and wants practical technology planning without enterprise-scale capital spending.",
  environmentHighlights: [
    "Microsoft 365 Business Premium for identity, email, and collaboration",
    "Ubiquiti networking with aging switches and Wi-Fi coverage gaps",
    "NinjaOne endpoint management with incomplete lifecycle standards",
    "Cloud-first services with practical cybersecurity and backup gaps",
  ],
};
