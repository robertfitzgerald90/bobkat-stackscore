import type {
  DemoBudgetPeriod,
  DemoBusinessOutcomeKpi,
  DemoExecutiveReport,
  DemoExecutiveReview,
  DemoPlatformMapStep,
  DemoReportPreview,
  DemoValueProposition,
} from "@/lib/product-overview/types";
import { NORTHSTAR_DEMO_BUDGET } from "@/lib/product-overview/demo-financials";
import { DEFAULT_DEMO_COMPANY_PROFILE } from "@/lib/demo-data/demo-financial-profile";

const STANDARD_TIMELINE = [
  { id: "planning", label: "Planning", status: "completed" as const },
  { id: "assessment", label: "Assessment Complete", status: "completed" as const },
  { id: "approved-rec", label: "Recommendation Approved", status: "completed" as const },
  { id: "budget", label: "Budget Approved", status: "completed" as const },
  { id: "implementation", label: "Implementation", status: "current" as const },
  { id: "validation", label: "Validation", status: "upcoming" as const },
  { id: "completed", label: "Completed", status: "upcoming" as const },
];

export const DEMO_EXECUTIVE_REVIEW: DemoExecutiveReview = {
  executiveSummary: [
    "Northstar Manufacturing improved its overall technology score by 6 points since the last review, reflecting measurable progress in identity protection and backup validation.",
    "Two strategic projects completed on schedule, including endpoint lifecycle standardization and data classification policy rollout.",
    `Technology spending remains disciplined at ${NORTHSTAR_DEMO_BUDGET.utilizationPercent}% budget utilization against a $${NORTHSTAR_DEMO_BUDGET.planned.toLocaleString("en-US")} annual plan — spend smarter, not more.`,
    "Leadership visibility into technology risk has improved significantly through StackScore executive reporting.",
  ],
  scoreTrend: [
    { quarter: "Q4 2025", score: 56 },
    { quarter: "Q1 2026", score: 59 },
    { quarter: "Q2 2026", score: 62 },
    { quarter: "Q3 2026", score: 68 },
  ],
  completedInitiatives: [
    "Endpoint lifecycle policy standardized for plant and office Windows devices",
    "Data classification policies approved by executive leadership",
    "Backup inventory completed for critical business systems",
    "Conditional access baseline deployed in Microsoft 365 Business Premium",
  ],
  openRisks: [
    "Privileged account MFA enforcement still in progress for two legacy service accounts",
    "Ubiquiti switching and Wi-Fi remain beyond recommended lifecycle",
    "Disaster recovery exercise not yet scheduled for Q4 2026",
  ],
  budgetSummary: [
    `Annual technology plan: $${NORTHSTAR_DEMO_BUDGET.planned.toLocaleString("en-US")}`,
    `Approved spend: $${NORTHSTAR_DEMO_BUDGET.approved.toLocaleString("en-US")} (${NORTHSTAR_DEMO_BUDGET.utilizationPercent}% utilization)`,
    `Committed: $${NORTHSTAR_DEMO_BUDGET.committed.toLocaleString("en-US")}`,
    `Remaining planned investment: $${NORTHSTAR_DEMO_BUDGET.remaining.toLocaleString("en-US")}`,
    "Spending 3% under plan with no critical overruns",
  ],
  roadmapProgress: [
    "Roadmap completion: 42%",
    "Q3 2026 initiatives on track: Microsoft 365 hardening, backup validation design",
    "Q4 2026 priorities confirmed: Ubiquiti network refresh, disaster recovery exercise",
    "Q1 2027 planning initiated: identity lifecycle and application review",
  ],
  topPrioritiesNextQuarter: [
    "Complete Microsoft 365 Security Hardening before Ubiquiti network refresh begins",
    "Execute first backup validation recovery test",
    "Finalize Ubiquiti network refresh schedule and hardware standards",
    "Prepare disaster recovery exercise for executive review in Q4",
  ],
  executiveRecommendations: [
    "Maintain current investment pace — progress is measurable without oversized capital spend.",
    "Prioritize identity protection completion before network modernization to reduce compound risk.",
    "Schedule executive review of disaster recovery readiness before year-end audit cycle.",
    "Continue business review cadence with StackScore to sustain accountability and score improvement momentum.",
  ],
};

export const DEMO_EXECUTIVE_REPORTS: DemoExecutiveReport[] = [
  {
    id: "report-assessment",
    title: "Technology Maturity Assessment",
    description:
      "Comprehensive baseline across eight strategic pillars with maturity scores, findings, and executive summary.",
    generatedDate: "June 12, 2026",
    reportType: "assessment",
  },
  {
    id: "report-roadmap",
    title: "Living Execution Plan",
    description:
      "Phased implementation roadmap with separated one-time and monthly investments per phase.",
    generatedDate: "July 8, 2026",
    reportType: "roadmap",
  },
  {
    id: "report-phase-proposal",
    title: "Phase Proposal",
    description:
      "Phase 1 proposal scope, deliverables, and investment — approvable independently of later phases.",
    generatedDate: "July 10, 2026",
    reportType: "improvement-plan",
  },
  {
    id: "report-roadmap-progress",
    title: "Roadmap Progress Report",
    description:
      "Living roadmap status, completed initiatives, and effective StackScore movement.",
    generatedDate: "August 20, 2026",
    reportType: "strategic-summary",
  },
  {
    id: "report-qbr",
    title: "Business Review",
    description:
      "Flexible strategic review with score movement, completed work, open risks, and upcoming priorities.",
    generatedDate: "September 1, 2026",
    reportType: "qbr",
  },
  {
    id: "report-budget",
    title: "Technology Budget Report",
    description:
      "Phase-based one-time and monthly recurring investment outlook tied to the living roadmap.",
    generatedDate: "July 15, 2026",
    reportType: "budget",
  },
];

export const DEMO_REPORT_PREVIEWS: Record<string, DemoReportPreview> = {
  "report-assessment": {
    reportId: "report-assessment",
    title: "Technology Maturity Assessment",
    subtitle: "Northstar Manufacturing · Executive Summary",
    generatedDate: "June 12, 2026",
    metrics: [
      { label: "Overall Score", value: "58 / 100" },
      { label: "Maturity Level", value: "Developing" },
      { label: "Highest Priority", value: "Cybersecurity" },
      { label: "Projected Target", value: "92 / 100" },
    ],
    sections: [
      {
        heading: "Executive Summary",
        body: "Northstar Manufacturing demonstrates a developing technology posture with strong operational support and digital enablement, but significant gaps in cybersecurity, business continuity, and infrastructure modernization require prioritized investment.",
      },
      {
        heading: "Key Findings",
        bullets: [
          "Multi-factor authentication is inconsistently enforced across privileged accounts.",
          "Ubiquiti switching and Wi-Fi are beyond recommended lifecycle.",
          "Backup validation and recovery testing are not standardized.",
          "Technology priorities lack consistent executive sponsorship.",
        ],
      },
      {
        heading: "Recommended Next Steps",
        bullets: [
          "Harden MFA on Microsoft 365 Business Premium for privileged accounts.",
          "Implement practical backup validation with documented recovery tests.",
          "Modernize Ubiquiti switching and Wi-Fi at the single production site.",
          "Establish business reviews with executive sponsors.",
        ],
      },
    ],
  },
  "report-phase-proposal": {
    reportId: "report-phase-proposal",
    title: "Phase Proposal",
    subtitle: "Northstar Manufacturing · Phase 1 Critical Stabilization",
    generatedDate: "July 10, 2026",
    metrics: [
      { label: "Phase", value: "1 of 4" },
      { label: "One-Time", value: "$7,500" },
      { label: "Monthly Recurring", value: `$${NORTHSTAR_DEMO_BUDGET.managedEndpointMonthly.toLocaleString("en-US")}/month` },
      { label: "Score Impact", value: "+15" },
    ],
    sections: [
      {
        heading: "Scope",
        body: "Phase 1 covers NinjaOne endpoint management, managed backup validation, Microsoft 365 MFA hardening, and monitoring baseline. Approval applies only to this phase.",
      },
      {
        heading: "Investment",
        bullets: [
          "One-time implementation investment: $7,500",
          `New monthly recurring investment: $${NORTHSTAR_DEMO_BUDGET.managedEndpointMonthly.toLocaleString("en-US")}/month (Managed endpoint service · ${DEFAULT_DEMO_COMPANY_PROFILE.managedDeviceCount} devices × $15)`,
          "Future phases are excluded from this proposal",
        ],
      },
    ],
  },
  "report-qbr": {
    reportId: "report-qbr",
    title: "Business Review",
    subtitle: "Northstar Manufacturing · Review Period: Apr 1 – Sep 30, 2026",
    generatedDate: "September 1, 2026",
    metrics: [
      { label: "Current Score", value: "73" },
      { label: "Previous Review", value: "58" },
      { label: "Improvement", value: "+15" },
      { label: "Next Phase", value: "Phase 2" },
    ],
    sections: [
      {
        heading: "Executive Summary",
        body: "Phase 1 Critical Stabilization is complete. Effective StackScore improved from 58 to 73. Next recommended work is Phase 2 High-Priority Improvements.",
      },
      {
        heading: "Completed Roadmap Work",
        bullets: [
          "NinjaOne endpoint management deployed",
          "Managed backup validation activated",
          "Microsoft 365 MFA hardening completed",
          "Infrastructure monitoring baseline established",
        ],
      },
      {
        heading: "Ongoing Strategic Guidance",
        bullets: [
          "Living Execution Plan Reviews",
          "Business Reviews",
          "Lifecycle Planning",
          "Budget Forecasting",
          "Risk Monitoring",
          "Strategic IT Consulting starting at $300/month",
        ],
      },
    ],
  },
  "report-roadmap": {
    reportId: "report-roadmap",
    title: "Living Execution Plan",
    subtitle: "Northstar Manufacturing · Phased Plan",
    generatedDate: "July 8, 2026",
    metrics: [
      { label: "Phases", value: "4" },
      { label: "Initial Score", value: "58" },
      { label: "Projected Final", value: "92" },
      { label: "Available Gain", value: "+34" },
    ],
    sections: [
      {
        heading: "Roadmap Overview",
        body: "Four independently approvable phases sequence critical stabilization before high-priority improvements, operational maturity, and strategic enhancements.",
      },
      {
        heading: "Phase Highlights",
        bullets: [
          `Phase 1 Critical Stabilization (0–30 days): +15 points · $7,500 one-time · $${NORTHSTAR_DEMO_BUDGET.managedEndpointMonthly.toLocaleString("en-US")}/month`,
          "Phase 2 High-Priority Improvements (30–90 days): +9 points · $9,500 one-time",
          "Phase 3 Operational Maturity (90–180 days): +7 points · Strategic IT Consulting cadence",
          "Phase 4 Strategic Enhancements (180+ days): +3 points · selective upgrades",
        ],
      },
    ],
  },
  "report-budget": {
    reportId: "report-budget",
    title: "Technology Budget Report",
    subtitle: "Northstar Manufacturing · Phased Investment",
    generatedDate: "July 15, 2026",
    metrics: [
      { label: "Total One-Time", value: "$23,000" },
      { label: "Total Monthly", value: "$1,200/month" },
      { label: "Phase 1 One-Time", value: "$7,500" },
      { label: "Phase 1 Monthly", value: `$${NORTHSTAR_DEMO_BUDGET.managedEndpointMonthly.toLocaleString("en-US")}/month` },
    ],
    sections: [
      {
        heading: "Investment Summary",
        body: "One-time implementation and new monthly recurring investments are reported separately. No combined grand total is presented.",
      },
      {
        heading: "By Phase",
        bullets: [
          `Phase 1: $7,500 one-time · $${NORTHSTAR_DEMO_BUDGET.managedEndpointMonthly.toLocaleString("en-US")}/month managed endpoint service`,
          "Phase 2: $9,500 one-time · no new monthly recurring",
          "Phase 3: $2,500 one-time · $300/month Strategic IT Consulting",
          "Phase 4: $3,500 one-time · no new monthly recurring",
        ],
      },
    ],
  },
  "report-roadmap-progress": {
    reportId: "report-roadmap-progress",
    title: "Roadmap Progress Report",
    subtitle: "Northstar Manufacturing · Living Roadmap",
    generatedDate: "August 20, 2026",
    metrics: [
      { label: "Effective Score", value: "73" },
      { label: "Phase 1", value: "Completed" },
      { label: "Phase 2", value: "Awaiting Approval" },
      { label: "Completion", value: "33%" },
    ],
    sections: [
      {
        heading: "Progress Summary",
        body: "Phase 1 completion raised the effective StackScore from 58 to 73. Phase 2 is now the logical next recommendation.",
      },
      {
        heading: "Strategic Direction",
        bullets: [
          "Keep approving phases independently as budget allows",
          "Measure maturity gains after each completed phase",
          "Continue quarterly strategic reviews under Strategic IT Consulting",
        ],
      },
    ],
  },
};

export const DEMO_BUDGET_PERIODS: DemoBudgetPeriod[] = [
  {
    id: "current-year",
    label: "Current Year",
    annual: {
      planned: NORTHSTAR_DEMO_BUDGET.planned,
      approved: NORTHSTAR_DEMO_BUDGET.approved,
      committed: NORTHSTAR_DEMO_BUDGET.committed,
      remaining: NORTHSTAR_DEMO_BUDGET.remaining,
    },
    categories: [
      { id: "infrastructure", label: "Infrastructure", amount: 14_000 },
      { id: "cybersecurity", label: "Cybersecurity", amount: 10_000 },
      { id: "cloud", label: "Cloud", amount: 8_000 },
      { id: "projects", label: "Projects", amount: 7_000 },
      { id: "professional-services", label: "Professional Services", amount: 5_000 },
      { id: "business-continuity", label: "Business Continuity", amount: 4_000 },
    ],
  },
  {
    id: "next-year",
    label: "Next Year",
    annual: { planned: 52_000, approved: 34_000, committed: 12_000, remaining: 22_000 },
    categories: [
      { id: "infrastructure", label: "Infrastructure", amount: 16_000 },
      { id: "cybersecurity", label: "Cybersecurity", amount: 12_000 },
      { id: "cloud", label: "Cloud", amount: 9_000 },
      { id: "projects", label: "Projects", amount: 7_000 },
      { id: "professional-services", label: "Professional Services", amount: 5_000 },
      { id: "business-continuity", label: "Business Continuity", amount: 3_000 },
    ],
  },
  {
    id: "three-year",
    label: "Three-Year Plan",
    annual: { planned: 150_000, approved: 96_000, committed: 48_000, remaining: 48_000 },
    categories: [
      { id: "infrastructure", label: "Infrastructure", amount: 44_000 },
      { id: "cybersecurity", label: "Cybersecurity", amount: 34_000 },
      { id: "cloud", label: "Cloud", amount: 26_000 },
      { id: "projects", label: "Projects", amount: 22_000 },
      { id: "professional-services", label: "Professional Services", amount: 14_000 },
      { id: "business-continuity", label: "Business Continuity", amount: 10_000 },
    ],
  },
];

export const DEMO_BUSINESS_OUTCOME_KPIS: DemoBusinessOutcomeKpi[] = [
  { id: "tech-score", label: "Technology Score", currentValue: "68", targetValue: "82" },
  { id: "projects-completed", label: "Projects Completed", currentValue: "2 of 4" },
  { id: "recs-closed", label: "Recommendations Closed", currentValue: "5" },
  {
    id: "risk-reduction",
    label: "Risk Reduction",
    currentValue: "Moderate",
    targetValue: "Low",
  },
  { id: "budget-accuracy", label: "Budget Accuracy", currentValue: "97%" },
  { id: "roadmap-completion", label: "Roadmap Completion", currentValue: "42%" },
  {
    id: "cyber-maturity",
    label: "Cybersecurity Maturity",
    currentValue: "58",
    targetValue: "78",
  },
  {
    id: "bc-maturity",
    label: "Business Continuity",
    currentValue: "55",
    targetValue: "74",
  },
];

export const WHY_CLIENTS_LOVE_STACKSCORE: DemoValueProposition[] = [
  {
    id: "know-where-you-stand",
    title: "Know exactly where you stand",
    description:
      "Replace technology uncertainty with a measurable score, maturity labels, and executive-ready insights.",
    icon: "compass",
  },
  {
    id: "prioritize-right-work",
    title: "Prioritize the right work",
    description:
      "Focus on recommendations with the highest business impact instead of reactive IT firefighting.",
    icon: "target",
  },
  {
    id: "track-progress",
    title: "Track measurable progress",
    description:
      "See score improvements, completed projects, and closed recommendations quarter over quarter.",
    icon: "trending",
  },
  {
    id: "executive-confidence",
    title: "Build executive confidence",
    description:
      "Deliver polished quarterly reviews and executive reports leadership actually uses.",
    icon: "sparkles",
  },
  {
    id: "plan-investments",
    title: "Plan technology investments",
    description:
      "Align approved spend, committed dollars, and remaining capacity so you spend smarter — not more.",
    icon: "wallet",
  },
  {
    id: "strengthen-security",
    title: "Strengthen cybersecurity",
    description:
      "Turn assessment findings into prioritized identity, monitoring, and resilience improvements.",
    icon: "lock",
  },
  {
    id: "improve-continuity",
    title: "Improve business continuity",
    description:
      "Validate backups, recovery paths, and disaster readiness before an incident occurs.",
    icon: "refresh",
  },
  {
    id: "continual-improvement",
    title: "Drive continual improvement",
    description:
      "Sustain accountability through quarterly reviews and a continuous improvement cycle.",
    icon: "shield",
  },
];

export const PLATFORM_MAP_STEPS: DemoPlatformMapStep[] = [
  {
    id: "assessment",
    label: "Technology Assessment",
    description: "Establish a measurable baseline across eight strategic pillars.",
  },
  {
    id: "score",
    label: "Technology Score",
    description: "Translate findings into an executive maturity score and trend.",
  },
  {
    id: "recommendations",
    label: "Recommendations",
    description: "Prioritize improvements with business impact and investment estimates.",
  },
  {
    id: "roadmap",
    label: "Roadmap",
    description: "Sequence initiatives across quarters aligned with business priorities.",
  },
  {
    id: "projects",
    label: "Projects",
    description: "Execute initiatives with milestones, owners, and measurable progress.",
  },
  {
    id: "quarterly-reviews",
    label: "Business Reviews",
    description: "Measure progress through executive quarterly business reviews.",
  },
  {
    id: "reports",
    label: "Reports",
    description: "Share polished leadership reports built from live platform data.",
  },
  {
    id: "improvement",
    label: "Continuous Improvement",
    description: "Track maturity gains and refine the plan every quarter.",
  },
];

export { STANDARD_TIMELINE };

export function getDemoExecutiveReportById(id: string) {
  return DEMO_EXECUTIVE_REPORTS.find((report) => report.id === id);
}

export function getDemoReportPreviewById(id: string): DemoReportPreview | undefined {
  return DEMO_REPORT_PREVIEWS[id];
}

export function getDemoBudgetPeriodById(id: string) {
  return DEMO_BUDGET_PERIODS.find((period) => period.id === id);
}
