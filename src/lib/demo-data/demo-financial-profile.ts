import type { TechnologyLifecycleItem } from "@/components/technology-stack/technology-lifecycle-card";

export type DemoCostClassification =
  | "one_time_implementation"
  | "hardware_purchase"
  | "monthly_recurring"
  | "annual_recurring"
  | "existing_operating_expense"
  | "planned_capital_expense"
  | "optional_future_investment"
  | "no_cost";

export type DemoCompanyProfile = {
  employeeCount: number;
  licensedUserCount: number;
  managedDeviceCount: number;
  locationCount: number;
  serverCount: number;
};

export type DemoPricingAssumptions = {
  /** Bobkat IT managed endpoint service — catalog-aligned ($15/device/month). */
  managedEndpointMonthlyPerDeviceCents: number;
  /** Microsoft 365 Business Premium planning rate per licensed user. */
  m365MonthlyPerUserCents: number;
  passwordManagerMonthlyPerUserCents: number;
  securityTrainingAnnualPerUserCents: number;
  /** Flat SMB backup monitoring / recovery service. */
  backupMonthlyCents: number;
  /** Optional hosting and management for open-source monitoring. */
  uptimeKumaHostingAnnualCents: number;
  /** Estimated owned-network replacement / refresh value (capital, not annual license). */
  networkReplacementValueCents: number;
  domainDnsAnnualCents: number;
  strategicConsultingMonthlyCents: number;
  /** Discretionary project reserve included in the annual technology plan. */
  annualProjectReserveCents: number;
};

export type DemoOperatingExpenseBreakdown = {
  m365AnnualCents: number;
  managedEndpointAnnualCents: number;
  managedEndpointMonthlyCents: number;
  backupAnnualCents: number;
  passwordManagerAnnualCents: number;
  securityTrainingAnnualCents: number;
  uptimeKumaHostingAnnualCents: number;
  domainDnsAnnualCents: number;
  strategicConsultingAnnualCents: number;
  totalOperatingAnnualCents: number;
};

export type DemoAnnualBudgetPlan = {
  plannedCents: number;
  approvedCents: number;
  committedCents: number;
  remainingCents: number;
  utilizationPercent: number;
};

export type DemoFinancialProfile = {
  company: DemoCompanyProfile;
  pricing: DemoPricingAssumptions;
  operating: DemoOperatingExpenseBreakdown;
  annualPlan: DemoAnnualBudgetPlan;
};

/**
 * Standard Interactive StackScore Experience baseline:
 * one location, ~50 licensed users, ~60 managed devices.
 */
export const DEFAULT_DEMO_COMPANY_PROFILE: DemoCompanyProfile = {
  employeeCount: 52,
  licensedUserCount: 50,
  managedDeviceCount: 60,
  locationCount: 1,
  serverCount: 2,
};

export const DEFAULT_DEMO_PRICING: DemoPricingAssumptions = {
  managedEndpointMonthlyPerDeviceCents: 5_000,
  m365MonthlyPerUserCents: 2_200,
  passwordManagerMonthlyPerUserCents: 300,
  securityTrainingAnnualPerUserCents: 1_500,
  backupMonthlyCents: 35_000,
  uptimeKumaHostingAnnualCents: 60_000,
  networkReplacementValueCents: 750_000,
  domainDnsAnnualCents: 30_000,
  strategicConsultingMonthlyCents: 50_000,
  annualProjectReserveCents: 1_635_000,
};

/** Pinnacle Engineering seeded dashboard client — larger but still SMB-scaled. */
export const PINNACLE_DEMO_COMPANY_PROFILE: DemoCompanyProfile = {
  employeeCount: 84,
  licensedUserCount: 84,
  managedDeviceCount: 92,
  locationCount: 2,
  serverCount: 3,
};

export function scaleDemoCompanyProfile(input: {
  managedDeviceCount: number;
  licensedUserCount: number;
  locationCount?: number;
}): DemoCompanyProfile {
  const locationCount = input.locationCount ?? 1;
  return {
    employeeCount: Math.max(input.licensedUserCount, input.managedDeviceCount - 10),
    licensedUserCount: input.licensedUserCount,
    managedDeviceCount: input.managedDeviceCount,
    locationCount,
    serverCount: locationCount === 1 ? 2 : 3,
  };
}

export function computeOperatingExpenses(
  company: DemoCompanyProfile,
  pricing: DemoPricingAssumptions,
): DemoOperatingExpenseBreakdown {
  const m365AnnualCents = company.licensedUserCount * pricing.m365MonthlyPerUserCents * 12;
  const managedEndpointMonthlyCents =
    company.managedDeviceCount * pricing.managedEndpointMonthlyPerDeviceCents;
  const managedEndpointAnnualCents = managedEndpointMonthlyCents * 12;
  const backupAnnualCents = pricing.backupMonthlyCents * 12;
  const passwordManagerAnnualCents =
    company.licensedUserCount * pricing.passwordManagerMonthlyPerUserCents * 12;
  const securityTrainingAnnualCents =
    company.licensedUserCount * pricing.securityTrainingAnnualPerUserCents;
  const uptimeKumaHostingAnnualCents = pricing.uptimeKumaHostingAnnualCents;
  const domainDnsAnnualCents = pricing.domainDnsAnnualCents;
  const strategicConsultingAnnualCents = pricing.strategicConsultingMonthlyCents * 12;

  const totalOperatingAnnualCents =
    m365AnnualCents +
    managedEndpointAnnualCents +
    backupAnnualCents +
    passwordManagerAnnualCents +
    securityTrainingAnnualCents +
    uptimeKumaHostingAnnualCents +
    domainDnsAnnualCents;

  return {
    m365AnnualCents,
    managedEndpointAnnualCents,
    managedEndpointMonthlyCents,
    backupAnnualCents,
    passwordManagerAnnualCents,
    securityTrainingAnnualCents,
    uptimeKumaHostingAnnualCents,
    domainDnsAnnualCents,
    strategicConsultingAnnualCents,
    totalOperatingAnnualCents,
  };
}

export function computeAnnualBudgetPlan(
  operating: DemoOperatingExpenseBreakdown,
  pricing: DemoPricingAssumptions,
): DemoAnnualBudgetPlan {
  const plannedCents = operating.totalOperatingAnnualCents + pricing.annualProjectReserveCents;
  const approvedCents = Math.round(plannedCents * 0.625);
  const committedCents = Math.round(plannedCents * 0.375);
  const remainingCents = approvedCents - committedCents;
  const utilizationPercent = Math.round((approvedCents / plannedCents) * 100);

  return {
    plannedCents,
    approvedCents,
    committedCents,
    remainingCents,
    utilizationPercent,
  };
}

export function buildDemoFinancialProfile(
  company: DemoCompanyProfile = DEFAULT_DEMO_COMPANY_PROFILE,
  pricing: DemoPricingAssumptions = DEFAULT_DEMO_PRICING,
): DemoFinancialProfile {
  const operating = computeOperatingExpenses(company, pricing);
  const annualPlan = computeAnnualBudgetPlan(operating, pricing);
  return { company, pricing, operating, annualPlan };
}

export const NORTHSTAR_DEMO_FINANCIAL_PROFILE = buildDemoFinancialProfile();

export function managedEndpointMonthlyDollars(profile: DemoFinancialProfile): number {
  return profile.operating.managedEndpointMonthlyCents / 100;
}

export function annualTechnologyPlanDollars(profile: DemoFinancialProfile): number {
  return profile.annualPlan.plannedCents / 100;
}

export function approvedTechnologySpendDollars(profile: DemoFinancialProfile): number {
  return profile.annualPlan.approvedCents / 100;
}

export function buildTechnologyLifecycleDemoItems(
  profile: DemoFinancialProfile = NORTHSTAR_DEMO_FINANCIAL_PROFILE,
): TechnologyLifecycleItem[] {
  const { company, operating, pricing } = profile;
  const networkReplacementCents =
    pricing.networkReplacementValueCents +
    Math.max(0, company.locationCount - 1) * 250_000;

  return [
    {
      id: "demo-lifecycle-unifi",
      name: "Ubiquiti UniFi",
      provider: "Ubiquiti",
      lifecycleStatus: "In service",
      plannedReplacementDate: "2028-09-15T00:00:00.000Z",
      renewalDate: "2028-09-15T00:00:00.000Z",
      costLines: [
        { label: "Replacement value", amountCents: networkReplacementCents, note: "Planning estimate" },
        { label: "Annual software licensing", amountCents: 0, note: "None — owned infrastructure" },
        {
          label: "Optional network support",
          amountCents: null,
          note: "Quoted separately when managed network support is included",
        },
      ],
    },
    {
      id: "demo-lifecycle-managed-endpoints",
      name: "Managed Endpoint Service",
      provider: "Bobkat IT",
      platformLabel: "NinjaOne",
      lifecycleStatus: "In service",
      renewalDate: "2026-09-30T00:00:00.000Z",
      costLines: [
        { label: "Managed devices", amountCents: null, note: `${company.managedDeviceCount} devices` },
        {
          label: "Monthly service",
          amountCents: operating.managedEndpointMonthlyCents,
          note: "Bobkat IT managed endpoint service",
        },
        {
          label: "Annual service",
          amountCents: operating.managedEndpointAnnualCents,
          note: "Not a standalone NinjaOne license",
        },
      ],
    },
    {
      id: "demo-lifecycle-uptime-kuma",
      name: "Uptime Kuma",
      provider: "Open-source monitoring",
      lifecycleStatus: "In service",
      renewalDate: "2026-11-19T00:00:00.000Z",
      costLines: [
        { label: "Software license", amountCents: 0, note: "Open source" },
        {
          label: "Hosting and management",
          amountCents: operating.uptimeKumaHostingAnnualCents,
          note: "Estimated annual",
        },
      ],
    },
    {
      id: "demo-lifecycle-m365",
      name: "Microsoft 365 Business Premium",
      provider: "Microsoft",
      lifecycleStatus: "In service",
      renewalDate: "2026-08-01T00:00:00.000Z",
      costLines: [
        {
          label: "Licensed users",
          amountCents: null,
          note: `${company.licensedUserCount} users`,
        },
        {
          label: "Monthly licensing",
          amountCents: Math.round(operating.m365AnnualCents / 12),
          note: "Planning estimate",
        },
        {
          label: "Annual licensing",
          amountCents: operating.m365AnnualCents,
          note: "Excludes separate Azure LOB hosting",
        },
      ],
    },
  ];
}

/** Seed budgets for Pinnacle Engineering demo client technologies. */
export function getPinnacleSeedTechnologyBudgets(
  profile: DemoFinancialProfile = buildDemoFinancialProfile(
    PINNACLE_DEMO_COMPANY_PROFILE,
    {
      ...DEFAULT_DEMO_PRICING,
      networkReplacementValueCents: 1_000_000,
      uptimeKumaHostingAnnualCents: 80_000,
      annualProjectReserveCents: 2_000_000,
    },
  ),
) {
  const { operating, pricing } = profile;
  const networkReplacementCents =
    pricing.networkReplacementValueCents +
    Math.max(0, profile.company.locationCount - 1) * 250_000;

  return {
    annualTechnologyBudgetCents: profile.annualPlan.plannedCents,
    remainingTechnologyBudgetCents:
      profile.annualPlan.plannedCents - profile.annualPlan.committedCents,
    allocations: {
      "ubiquiti-unifi": {
        budgetAmountCents: networkReplacementCents,
        budgetPeriod: "one_time",
        budgetNotes:
          "Replacement value for owned UniFi switching, Wi-Fi, and gateway hardware — not an annual subscription.",
        renewalDate: new Date("2028-09-15"),
        quantity: profile.company.locationCount,
        quantityUnit: "sites",
      },
      ninjaone: {
        budgetAmountCents: operating.managedEndpointAnnualCents,
        budgetPeriod: "annual",
        budgetNotes: `Bobkat IT managed endpoint service for ${profile.company.managedDeviceCount} devices — not a standalone NinjaOne license.`,
        renewalDate: new Date("2026-10-01"),
        quantity: profile.company.managedDeviceCount,
        quantityUnit: "devices",
      },
      "uptime-kuma": {
        budgetAmountCents: operating.uptimeKumaHostingAnnualCents,
        budgetPeriod: "annual",
        budgetNotes: "Open-source software ($0 license) with optional hosting and management.",
        renewalDate: new Date("2026-11-20"),
        quantity: 1,
        quantityUnit: "service",
      },
      stackscore: {
        budgetAmountCents: operating.m365AnnualCents,
        budgetPeriod: "annual",
        budgetNotes: `Microsoft 365 Business Premium licensing for ${profile.company.licensedUserCount} users. Azure LOB apps billed separately when applicable.`,
        renewalDate: new Date("2026-08-01"),
        quantity: profile.company.licensedUserCount,
        quantityUnit: "users",
      },
    },
  } as const;
}

export function formatDemoCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
