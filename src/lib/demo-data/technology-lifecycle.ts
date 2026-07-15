import type { TechnologyLifecycleItem } from "@/components/technology-stack/technology-lifecycle-card";

/** Static demo data for public marketing previews — never loaded from the database. */
export const technologyLifecycleDemoData: TechnologyLifecycleItem[] = [
  {
    id: "demo-lifecycle-1",
    name: "Ubiquiti UniFi",
    provider: "Ubiquiti",
    renewalDate: "2026-09-14T00:00:00.000Z",
    annualBudgetCents: 1_850_000,
    budgetPeriod: "annual",
  },
  {
    id: "demo-lifecycle-2",
    name: "NinjaOne",
    provider: "NinjaOne",
    renewalDate: "2026-09-30T00:00:00.000Z",
    annualBudgetCents: 1_620_000,
    budgetPeriod: "annual",
  },
  {
    id: "demo-lifecycle-3",
    name: "Uptime Kuma",
    provider: "Open-source project",
    renewalDate: "2026-11-19T00:00:00.000Z",
    annualBudgetCents: 980_000,
    budgetPeriod: "annual",
  },
  {
    id: "demo-lifecycle-4",
    name: "Microsoft 365 Business Premium & Azure LOB Apps",
    provider: "Bobkat IT",
    annualBudgetCents: 3_800_000,
    budgetPeriod: "annual",
  },
];
