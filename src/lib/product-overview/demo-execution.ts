import type {
  DemoBudgetPeriod,
  DemoBusinessOutcomeKpi,
  DemoExecutiveReport,
  DemoExecutiveReview,
  DemoPlatformMapStep,
  DemoReportPreview,
  DemoValueProposition,
} from "@/lib/product-overview/types";

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
    "Northstar Manufacturing improved its overall technology score by 6 points since the previous quarter, reflecting measurable progress in identity protection and backup validation.",
    "Two strategic projects completed on schedule, including endpoint lifecycle standardization and data classification policy rollout.",
    "Technology spending remains disciplined at 61% budget utilization with no critical overruns.",
    "Leadership visibility into technology risk has improved significantly through StackScore executive reporting.",
  ],
  scoreTrend: [
    { quarter: "Q4 2025", score: 56 },
    { quarter: "Q1 2026", score: 59 },
    { quarter: "Q2 2026", score: 62 },
    { quarter: "Q3 2026", score: 68 },
  ],
  completedInitiatives: [
    "Endpoint lifecycle policy standardized across plant and office environments",
    "Data classification policies approved by executive leadership",
    "Backup inventory completed for manufacturing and corporate systems",
    "Conditional access baseline deployed in Microsoft 365",
  ],
  openRisks: [
    "Privileged account MFA enforcement still in progress for two legacy service accounts",
    "Primary facility network switching remains beyond recommended lifecycle",
    "Disaster recovery exercise not yet scheduled for Q4 2026",
  ],
  budgetSummary: [
    "Annual technology plan: $118,000",
    "Approved spend: $72,000 (61% utilization)",
    "Committed: $51,000",
    "Remaining capacity: $21,000",
    "Spending 3% under plan with no critical overruns",
  ],
  roadmapProgress: [
    "Roadmap completion: 42%",
    "Q3 2026 initiatives on track: Microsoft 365 hardening, backup validation design",
    "Q4 2026 priorities confirmed: network refresh, disaster recovery exercise",
    "Q1 2027 planning initiated: identity lifecycle and application review",
  ],
  topPrioritiesNextQuarter: [
    "Complete Microsoft 365 Security Hardening before network refresh begins",
    "Execute first centralized backup validation recovery test",
    "Finalize network refresh implementation schedule and vendor selection",
    "Prepare disaster recovery exercise for executive review in Q4",
  ],
  executiveRecommendations: [
    "Maintain current investment pace — progress is measurable and aligned with business priorities.",
    "Prioritize identity protection completion before infrastructure refresh to reduce compound risk.",
    "Schedule executive review of disaster recovery readiness before year-end audit cycle.",
    "Continue quarterly StackScore reviews to sustain accountability and score improvement momentum.",
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
    id: "report-improvement-plan",
    title: "Technology Improvement Plan",
    description:
      "Prioritized recommendations with effort, cost estimates, and expected business outcomes.",
    generatedDate: "June 28, 2026",
    reportType: "improvement-plan",
  },
  {
    id: "report-qbr",
    title: "Quarterly Business Review",
    description:
      "Executive quarterly review with score movement, completed work, open risks, and next priorities.",
    generatedDate: "September 1, 2026",
    reportType: "qbr",
  },
  {
    id: "report-roadmap",
    title: "Executive Roadmap",
    description:
      "Multi-quarter strategic roadmap connecting recommendations, initiatives, and budget decisions.",
    generatedDate: "July 8, 2026",
    reportType: "roadmap",
  },
  {
    id: "report-budget",
    title: "Technology Budget Plan",
    description:
      "Annual technology investment plan with approved, committed, and remaining capacity by category.",
    generatedDate: "July 15, 2026",
    reportType: "budget",
  },
  {
    id: "report-strategic-summary",
    title: "Strategic Summary",
    description:
      "One-page executive overview of technology posture, progress, and strategic direction.",
    generatedDate: "September 1, 2026",
    reportType: "strategic-summary",
  },
];

export const DEMO_REPORT_PREVIEWS: Record<string, DemoReportPreview> = {
  "report-assessment": {
    reportId: "report-assessment",
    title: "Technology Maturity Assessment",
    subtitle: "Northstar Manufacturing · Executive Summary",
    generatedDate: "June 12, 2026",
    metrics: [
      { label: "Overall Score", value: "68 / 100" },
      { label: "Maturity Level", value: "Developing" },
      { label: "Highest Priority", value: "Cybersecurity" },
      { label: "Projected Target", value: "82 / 100" },
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
          "Primary facility network switching is beyond recommended lifecycle.",
          "Backup validation and recovery testing are not standardized.",
          "Technology priorities lack consistent executive sponsorship.",
        ],
      },
      {
        heading: "Recommended Next Steps",
        bullets: [
          "Deploy phishing-resistant MFA for privileged accounts.",
          "Implement centralized backup validation with documented recovery tests.",
          "Refresh core network infrastructure at the main production site.",
          "Establish quarterly technology steering committee with executive sponsors.",
        ],
      },
    ],
  },
  "report-improvement-plan": {
    reportId: "report-improvement-plan",
    title: "Technology Improvement Plan",
    subtitle: "Northstar Manufacturing · Prioritized Recommendations",
    generatedDate: "June 28, 2026",
    metrics: [
      { label: "Open Recommendations", value: "14" },
      { label: "High Priority", value: "5" },
      { label: "Quick Wins", value: "4" },
      { label: "Planned This Quarter", value: "3" },
    ],
    sections: [
      {
        heading: "Improvement Strategy",
        body: "This plan prioritizes identity protection and business continuity improvements before infrastructure refresh, aligning technology investments with Northstar's highest business risks.",
      },
      {
        heading: "Critical Priorities",
        bullets: [
          "Deploy Phishing Resistant MFA — Critical · $18,000–$24,000 · Q3 2026",
          "Implement Centralized Backup Validation — High · $12,000–$18,000 · Q4 2026",
          "Replace Aging Core Switches — High · $42,000–$55,000 · Q4 2026",
        ],
      },
    ],
  },
  "report-qbr": {
    reportId: "report-qbr",
    title: "Quarterly Business Review",
    subtitle: "Northstar Manufacturing · Q3 2026",
    generatedDate: "September 1, 2026",
    metrics: [
      { label: "Current Score", value: "68" },
      { label: "Previous Quarter", value: "62" },
      { label: "Improvement", value: "+6" },
      { label: "Budget Utilization", value: "61%" },
    ],
    sections: [
      {
        heading: "Executive Summary",
        body: "Technology score improved 6 points since the last quarterly review. Two strategic projects completed on schedule with measurable risk reduction. Technology spending remains 3% under plan.",
      },
      {
        heading: "Completed This Quarter",
        bullets: [
          "Endpoint lifecycle policy standardized",
          "Data classification policies approved",
          "Conditional access baseline deployed",
        ],
      },
      {
        heading: "Top Priorities Next Quarter",
        bullets: [
          "Complete Microsoft 365 Security Hardening",
          "Execute first backup validation recovery test",
          "Finalize network refresh schedule",
        ],
      },
    ],
  },
  "report-roadmap": {
    reportId: "report-roadmap",
    title: "Executive Roadmap",
    subtitle: "Northstar Manufacturing · Strategic Plan",
    generatedDate: "July 8, 2026",
    metrics: [
      { label: "Roadmap Completion", value: "42%" },
      { label: "Active Initiatives", value: "9" },
      { label: "Planning Horizon", value: "Q3 2026 – Q1 2027" },
    ],
    sections: [
      {
        heading: "Roadmap Overview",
        body: "The approved roadmap sequences identity protection and backup validation before infrastructure refresh, ensuring compound risks are addressed in the correct order.",
      },
      {
        heading: "Quarter Highlights",
        bullets: [
          "Q3 2026: Microsoft 365 hardening, backup validation, endpoint lifecycle",
          "Q4 2026: Network refresh, disaster recovery exercise, vendor cleanup",
          "Q1 2027: Identity improvements, application review, governance refresh",
        ],
      },
    ],
  },
  "report-budget": {
    reportId: "report-budget",
    title: "Technology Budget Plan",
    subtitle: "Northstar Manufacturing · FY 2026",
    generatedDate: "July 15, 2026",
    metrics: [
      { label: "Annual Plan", value: "$118,000" },
      { label: "Approved", value: "$72,000" },
      { label: "Committed", value: "$51,000" },
      { label: "Remaining", value: "$21,000" },
    ],
    sections: [
      {
        heading: "Investment Summary",
        body: "Technology spending is aligned with the approved roadmap, with 61% of the annual plan committed to active initiatives and remaining capacity reserved for Q4 priorities.",
      },
      {
        heading: "Category Breakdown",
        bullets: [
          "Infrastructure: $38,000",
          "Cybersecurity: $28,000",
          "Cloud & Microsoft 365: $18,000",
          "Projects & Implementation: $16,000",
          "Professional Services: $10,000",
          "Business Continuity: $8,000",
        ],
      },
    ],
  },
  "report-strategic-summary": {
    reportId: "report-strategic-summary",
    title: "Strategic Summary",
    subtitle: "Northstar Manufacturing · Leadership Brief",
    generatedDate: "September 1, 2026",
    metrics: [
      { label: "Technology Score", value: "68 → 82" },
      { label: "Risk Level", value: "Moderate → Low" },
      { label: "Roadmap Progress", value: "42%" },
    ],
    sections: [
      {
        heading: "Where We Stand",
        body: "Northstar Manufacturing has moved from reactive technology management to a measurable improvement program with executive accountability, prioritized investments, and clear progress tracking.",
      },
      {
        heading: "Strategic Direction",
        bullets: [
          "Close identity protection gaps before infrastructure refresh",
          "Validate backup and disaster recovery readiness",
          "Modernize network infrastructure at primary facility",
          "Establish ongoing quarterly executive technology reviews",
        ],
      },
    ],
  },
};

export const DEMO_BUDGET_PERIODS: DemoBudgetPeriod[] = [
  {
    id: "current-year",
    label: "Current Year",
    annual: { planned: 118_000, approved: 72_000, committed: 51_000, remaining: 21_000 },
    categories: [
      { id: "infrastructure", label: "Infrastructure", amount: 38_000 },
      { id: "cybersecurity", label: "Cybersecurity", amount: 28_000 },
      { id: "cloud", label: "Cloud", amount: 18_000 },
      { id: "projects", label: "Projects", amount: 16_000 },
      { id: "professional-services", label: "Professional Services", amount: 10_000 },
      { id: "business-continuity", label: "Business Continuity", amount: 8_000 },
    ],
  },
  {
    id: "next-year",
    label: "Next Year",
    annual: { planned: 142_000, approved: 96_000, committed: 34_000, remaining: 62_000 },
    categories: [
      { id: "infrastructure", label: "Infrastructure", amount: 52_000 },
      { id: "cybersecurity", label: "Cybersecurity", amount: 32_000 },
      { id: "cloud", label: "Cloud", amount: 22_000 },
      { id: "projects", label: "Projects", amount: 18_000 },
      { id: "professional-services", label: "Professional Services", amount: 12_000 },
      { id: "business-continuity", label: "Business Continuity", amount: 6_000 },
    ],
  },
  {
    id: "three-year",
    label: "Three-Year Plan",
    annual: { planned: 385_000, approved: 248_000, committed: 142_000, remaining: 106_000 },
    categories: [
      { id: "infrastructure", label: "Infrastructure", amount: 128_000 },
      { id: "cybersecurity", label: "Cybersecurity", amount: 86_000 },
      { id: "cloud", label: "Cloud", amount: 58_000 },
      { id: "projects", label: "Projects", amount: 52_000 },
      { id: "professional-services", label: "Professional Services", amount: 34_000 },
      { id: "business-continuity", label: "Business Continuity", amount: 27_000 },
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
      "Align approved spend, committed dollars, and remaining capacity with your strategic roadmap.",
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
    label: "Quarterly Reviews",
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
