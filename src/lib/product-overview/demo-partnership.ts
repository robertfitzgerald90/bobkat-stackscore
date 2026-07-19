import type {
  DemoAiInsightPreview,
  DemoCollaborationParticipant,
  DemoEcosystemNode,
  DemoExecutiveWidget,
  DemoImprovementLoopStage,
  DemoProductTourStep,
  DemoStrategicPlanningTab,
  DemoSuccessOutcome,
  DemoTimelineSnapshot,
} from "@/lib/product-overview/types";
import { NORTHSTAR_DEMO_BUDGET } from "@/lib/product-overview/demo-financials";

const DEMO_ANNUAL_PLAN = NORTHSTAR_DEMO_BUDGET.planned;
const DEMO_NEXT_YEAR_PLAN = DEMO_ANNUAL_PLAN + 4_000;
const DEMO_ASSESSMENT_BASELINE_PLAN = Math.round(NORTHSTAR_DEMO_BUDGET.operatingAnnual + 10_000);

export const TECHNOLOGY_TIMELINE_SNAPSHOTS: DemoTimelineSnapshot[] = [
  {
    id: "assessment-2026",
    label: "2026 Assessment",
    period: "June 2026",
    metrics: {
      technologyScore: 58,
      maturityLabel: "Developing",
      openRecommendations: 18,
      activeProjects: 0,
      roadmapCompletionPercent: 0,
      annualTechnologyPlan: DEMO_ASSESSMENT_BASELINE_PLAN,
      approvedSpend: 0,
      highPriorityRecommendations: 7,
    },
    summary: "Baseline assessment establishes measurable technology maturity and prioritized improvement areas.",
  },
  {
    id: "roadmap-created",
    label: "Living Execution Plan",
    period: "July 2026",
    metrics: {
      technologyScore: 58,
      maturityLabel: "Developing",
      openRecommendations: 16,
      activeProjects: 0,
      roadmapCompletionPercent: 8,
      annualTechnologyPlan: DEMO_ANNUAL_PLAN,
      approvedSpend: 12_000,
      highPriorityRecommendations: 6,
    },
    summary: "Recommendations convert into a multi-quarter roadmap aligned with executive priorities and a practical SMB budget.",
  },
  {
    id: "projects-begin",
    label: "Projects Begin",
    period: "August 2026",
    metrics: {
      technologyScore: 62,
      maturityLabel: "Developing",
      openRecommendations: 15,
      activeProjects: 2,
      roadmapCompletionPercent: 18,
      annualTechnologyPlan: DEMO_ANNUAL_PLAN,
      approvedSpend: 18_000,
      highPriorityRecommendations: 5,
    },
    summary: "Identity protection and policy standardization projects launch with clear owners and milestones.",
  },
  {
    id: "qbr-1",
    label: "Business Review #1",
    period: "September 2026",
    metrics: {
      technologyScore: 68,
      maturityLabel: "Developing",
      openRecommendations: 14,
      activeProjects: 4,
      roadmapCompletionPercent: 28,
      annualTechnologyPlan: DEMO_ANNUAL_PLAN,
      approvedSpend: 24_000,
      highPriorityRecommendations: 5,
    },
    summary: "First executive business review shows +6 point score improvement and two completed initiatives.",
  },
  {
    id: "score-improves",
    label: "Technology Score Improves",
    period: "October 2026",
    metrics: {
      technologyScore: 72,
      maturityLabel: "Defined",
      openRecommendations: 12,
      activeProjects: 4,
      roadmapCompletionPercent: 35,
      annualTechnologyPlan: DEMO_ANNUAL_PLAN,
      approvedSpend: 27_000,
      highPriorityRecommendations: 4,
    },
    summary: "Maturity gains accelerate as security hardening and backup validation reach validation milestones.",
  },
  {
    id: "infra-modernization",
    label: "Infrastructure Modernization",
    period: "November 2026",
    metrics: {
      technologyScore: 76,
      maturityLabel: "Defined",
      openRecommendations: 10,
      activeProjects: 3,
      roadmapCompletionPercent: 48,
      annualTechnologyPlan: DEMO_ANNUAL_PLAN,
      approvedSpend: 30_000,
      highPriorityRecommendations: 3,
    },
    summary: "Ubiquiti network refresh completes while disaster recovery validation provides auditable recovery readiness.",
  },
  {
    id: "qbr-2",
    label: "Business Review #2",
    period: "December 2026",
    metrics: {
      technologyScore: 78,
      maturityLabel: "Defined",
      openRecommendations: 9,
      activeProjects: 3,
      roadmapCompletionPercent: 55,
      annualTechnologyPlan: DEMO_ANNUAL_PLAN,
      approvedSpend: 30_000,
      highPriorityRecommendations: 3,
    },
    summary: "Second business review confirms sustained progress, budget discipline, and reduced critical risks.",
  },
  {
    id: "strategic-planning",
    label: "Strategic Planning",
    period: "January 2027",
    metrics: {
      technologyScore: 80,
      maturityLabel: "Managed",
      openRecommendations: 8,
      activeProjects: 2,
      roadmapCompletionPercent: 62,
      annualTechnologyPlan: DEMO_NEXT_YEAR_PLAN,
      approvedSpend: 18_000,
      highPriorityRecommendations: 2,
    },
    summary: `Leadership aligns next-year investments with a refreshed $${DEMO_NEXT_YEAR_PLAN.toLocaleString("en-US")} plan and three-year vision.`,
  },
  {
    id: "annual-review",
    label: "Annual Technology Review",
    period: "March 2027",
    metrics: {
      technologyScore: 82,
      maturityLabel: "Managed",
      openRecommendations: 7,
      activeProjects: 2,
      roadmapCompletionPercent: 68,
      annualTechnologyPlan: DEMO_NEXT_YEAR_PLAN,
      approvedSpend: 22_000,
      highPriorityRecommendations: 2,
    },
    summary: "Annual review confirms Northstar's transformation from reactive IT to a managed technology strategy.",
  },
];

export const CONTINUOUS_IMPROVEMENT_LOOP: DemoImprovementLoopStage[] = [
  {
    id: "assess",
    label: "Assess",
    whatHappens: "Measure technology maturity across strategic pillars and establish a current-state baseline.",
    whyItMatters: "Leaders cannot improve what they cannot measure.",
    whoBenefits: "CEO, CIO, and technology steering committee",
  },
  {
    id: "recommend",
    label: "Recommend",
    whatHappens: "Prioritize improvements by business impact, risk, and investment required.",
    whyItMatters: "Focuses limited budget on the highest-value work.",
    whoBenefits: "Executive team and department leaders",
  },
  {
    id: "plan",
    label: "Plan",
    whatHappens: "Convert recommendations into a sequenced roadmap with budget and timing.",
    whyItMatters: "Creates accountability and prevents reactive decision-making.",
    whoBenefits: "CFO, CIO, and project sponsors",
  },
  {
    id: "execute",
    label: "Execute",
    whatHappens: "Manage initiatives through projects with milestones, owners, and progress tracking.",
    whyItMatters: "Strategy only creates value when it is executed consistently.",
    whoBenefits: "IT staff, project owners, and operations leaders",
  },
  {
    id: "review",
    label: "Review",
    whatHappens: "Conduct executive business reviews with score movement and completed work.",
    whyItMatters: "Maintains executive visibility and course-correction cadence.",
    whoBenefits: "CEO, board advisors, and executive sponsors",
  },
  {
    id: "measure",
    label: "Measure",
    whatHappens: "Track maturity scores, project completion, budget accuracy, and risk reduction.",
    whyItMatters: "Proves ROI and sustains investment confidence.",
    whoBenefits: "CFO, CIO, and business unit leaders",
  },
  {
    id: "improve",
    label: "Improve",
    whatHappens: "Close recommendations, refine priorities, and update the strategic plan.",
    whyItMatters: "Technology maturity is a continuous journey, not a one-time project.",
    whoBenefits: "Entire leadership team",
  },
  {
    id: "repeat",
    label: "Repeat",
    whatHappens: "Begin the next improvement cycle with updated assessment signals and fresh priorities.",
    whyItMatters: "StackScore never becomes stale — the platform evolves with your business.",
    whoBenefits: "Organization-wide stakeholders",
  },
];

export const COLLABORATION_PARTICIPANTS: DemoCollaborationParticipant[] = [
  {
    id: "technology-advisor",
    label: "Technology Advisor",
    role: "Strategic IT Consulting Partner",
    description:
      "Guides assessment interpretation, living execution plan prioritization, and executive business reviews.",
    connections: ["Executive Team", "Living Execution Plan", "Business Reviews", "Reports"],
  },
  {
    id: "executive-team",
    label: "Executive Team",
    role: "Decision Makers",
    description:
      "Reviews technology score movement, approves investments, and sets strategic direction.",
    connections: ["Technology Advisor", "Reports", "Budget", "Strategic Planning"],
  },
  {
    id: "it-staff",
    label: "IT Staff",
    role: "Implementation Team",
    description:
      "Executes projects, maintains systems, and provides operational context for recommendations.",
    connections: ["Projects", "Living Execution Plan", "Meeting Notes", "Technology Advisor"],
  },
  {
    id: "business-leaders",
    label: "Business Leaders",
    role: "Department Sponsors",
    description:
      "Connect technology initiatives to business outcomes and operational priorities.",
    connections: ["Projects", "Reports", "Strategic Planning", "Executive Team"],
  },
];

export const COLLABORATION_ARTIFACTS = [
  { id: "projects", label: "Projects", description: "Shared initiative progress and milestone accountability" },
  { id: "reports", label: "Reports", description: "Executive-ready reporting everyone references" },
  { id: "roadmap", label: "Living Execution Plan", description: "Single source of truth for technology priorities" },
  { id: "meeting-notes", label: "Meeting Notes", description: "Business review decisions captured and tracked" },
];

export const STRATEGIC_PLANNING_TABS: DemoStrategicPlanningTab[] = [
  {
    id: "next-quarter",
    label: "Upcoming Priorities",
    initiatives: [
      {
        id: "sp-m365-complete",
        title: "Complete Microsoft 365 Security Hardening",
        summary: "Finish privileged account MFA enforcement and legacy authentication blocking.",
        priority: "Critical",
        timeframe: "Q3 2026",
        businessOutcome: "Closes highest-priority identity risk before infrastructure refresh.",
      },
      {
        id: "sp-backup-test",
        title: "Execute Backup Validation Recovery Test",
        summary: "Conduct first centralized recovery test with executive observer.",
        priority: "High",
        timeframe: "Q3 2026",
        businessOutcome: "Provides auditable proof of recovery readiness.",
      },
      {
        id: "sp-policy-rollout",
        title: "Roll Out Technology Policy Standards",
        summary: "Finalize and communicate acceptable use and device lifecycle policies.",
        priority: "Medium",
        timeframe: "Q3 2026",
        businessOutcome: "Creates consistent expectations and reduces compliance gaps.",
      },
    ],
  },
  {
    id: "twelve-month",
    label: "12 Month Plan",
    initiatives: [
      {
        id: "sp-network-refresh",
        title: "Network Infrastructure Refresh",
        summary: "Replace aging switching and wireless at the primary production facility.",
        priority: "High",
        timeframe: "Q4 2026",
        businessOutcome: "Reduces downtime risk and supports modern security controls.",
      },
      {
        id: "sp-dr-exercise",
        title: "Disaster Recovery Exercise",
        summary: "Structured recovery exercise using documented procedures and validated paths.",
        priority: "High",
        timeframe: "Q4 2026",
        businessOutcome: "Improves incident response confidence and audit readiness.",
      },
      {
        id: "sp-security-improvements",
        title: "Security Improvements Program",
        summary: "Extend identity lifecycle improvements beyond privileged accounts.",
        priority: "High",
        timeframe: "Q1 2027",
        businessOutcome: "Reduces orphaned accounts and strengthens access governance.",
      },
      {
        id: "sp-lifecycle-planning",
        title: "Endpoint Lifecycle Planning",
        summary: "Standardize refresh cycles and patching policies across plant and office endpoints.",
        priority: "Medium",
        timeframe: "Q1 2027",
        businessOutcome: "Reduces security gaps from aging endpoints.",
      },
    ],
  },
  {
    id: "three-year",
    label: "3 Year Vision",
    initiatives: [
      {
        id: "sp-cloud-modernization",
        title: "Cloud Modernization",
        summary: "Evaluate cloud-first strategies for manufacturing and corporate workloads.",
        priority: "Medium",
        timeframe: "2027–2028",
        businessOutcome: "Improves scalability and reduces infrastructure capital burden.",
      },
      {
        id: "sp-vendor-strategy",
        title: "Vendor Strategy",
        summary: "Consolidate vendor relationships and optimize contract renewals.",
        priority: "Medium",
        timeframe: "2027",
        businessOutcome: "Reduces duplicate spend and improves contract visibility.",
      },
      {
        id: "sp-tech-standards",
        title: "Technology Standards",
        summary: "Establish practical technology standards and lightweight governance for a growing SMB.",
        priority: "High",
        timeframe: "2027–2029",
        businessOutcome: "Improves decision velocity and reduces technical debt without bureaucracy.",
      },
      {
        id: "sp-budget-forecasting",
        title: "Budget Forecasting",
        summary: "Multi-year technology investment model tied to business growth projections.",
        priority: "High",
        timeframe: "2027–2029",
        businessOutcome: "Enables predictable technology spending aligned with business plans.",
      },
    ],
  },
];

export const EXECUTIVE_DECISION_WIDGETS: DemoExecutiveWidget[] = [
  {
    id: "technology-health",
    label: "Technology Health",
    value: "68 / 100",
    status: "attention",
    whyExecutivesCare: "Technology posture directly affects operational risk and competitive readiness.",
    businessImplications: "Score improvement of +6 this quarter indicates the roadmap is working.",
    suggestedAction: "Maintain investment pace through Q4 priority completion.",
  },
  {
    id: "budget-health",
    label: "Budget Health",
    value: `${NORTHSTAR_DEMO_BUDGET.utilizationPercent}% utilized`,
    status: "healthy",
    whyExecutivesCare: "Technology spending must align with approved plans without surprise overruns.",
    businessImplications: `$${NORTHSTAR_DEMO_BUDGET.remaining.toLocaleString("en-US")} remaining on a $${DEMO_ANNUAL_PLAN.toLocaleString("en-US")} annual plan — capacity for prioritized Q4 work.`,
    suggestedAction: "Approve Q4 Ubiquiti network refresh from remaining planned investment.",
  },
  {
    id: "project-health",
    label: "Project Health",
    value: "4 active",
    status: "healthy",
    whyExecutivesCare: "Projects translate strategy into measurable operational change.",
    businessImplications: "Two projects on track, one in planning, one approaching validation.",
    suggestedAction: "Prioritize M365 hardening completion before network refresh begins.",
  },
  {
    id: "risk-level",
    label: "Risk Level",
    value: "Moderate",
    status: "attention",
    whyExecutivesCare: "Unaddressed technology risks can disrupt operations and compliance.",
    businessImplications: "Critical identity risks declining; infrastructure risk remains elevated.",
    suggestedAction: "Review open risks in the next executive business review.",
  },
  {
    id: "business-impact",
    label: "Business Impact",
    value: "High",
    status: "healthy",
    whyExecutivesCare: "Technology investments must connect to measurable business outcomes.",
    businessImplications: "Current initiatives address insurance readiness, compliance, and uptime.",
    suggestedAction: "Continue linking project outcomes to business review metrics.",
  },
  {
    id: "compliance-readiness",
    label: "Compliance Readiness",
    value: "Improving",
    status: "healthy",
    whyExecutivesCare: "Auditors and insurers expect documented controls and recovery proof.",
    businessImplications: "Policy standardization and backup validation strengthen audit posture.",
    suggestedAction: "Schedule disaster recovery exercise before year-end audit cycle.",
  },
  {
    id: "vendor-health",
    label: "Vendor Health",
    value: "Needs review",
    status: "attention",
    whyExecutivesCare: "Vendor sprawl increases cost and creates support gaps.",
    businessImplications: "Vendor inventory cleanup planned for Q4 2026.",
    suggestedAction: "Include vendor consolidation in next strategic planning session.",
  },
  {
    id: "upcoming-decisions",
    label: "Upcoming Decisions",
    value: "3 pending",
    status: "neutral",
    whyExecutivesCare: "Executive decisions unblock projects and maintain roadmap momentum.",
    businessImplications: "Network refresh approval, DR exercise scheduling, and policy rollout sign-off.",
    suggestedAction: "Address pending decisions in the September 15 business review.",
  },
];

export const AI_INSIGHTS_PREVIEWS: DemoAiInsightPreview[] = [
  {
    id: "trend-detection",
    title: "Technology trend detection",
    description: "Identify emerging technology risks and opportunities before they impact operations.",
  },
  {
    id: "budget-forecasting",
    title: "Budget forecasting",
    description: "Predict technology spending needs based on roadmap progress and lifecycle data.",
  },
  {
    id: "rec-prioritization",
    title: "Recommendation prioritization",
    description: "AI-assisted ranking of recommendations by business impact and risk reduction.",
  },
  {
    id: "lifecycle-forecasting",
    title: "Lifecycle forecasting",
    description: "Anticipate end-of-life events for infrastructure, endpoints, and software.",
  },
  {
    id: "risk-prediction",
    title: "Risk prediction",
    description: "Surface likely risk scenarios based on maturity trends and open gaps.",
  },
  {
    id: "vendor-optimization",
    title: "Vendor optimization",
    description: "Identify consolidation opportunities and contract renewal priorities.",
  },
  {
    id: "executive-summaries",
    title: "Executive summaries",
    description: "Generate leadership-ready summaries from live platform data.",
  },
];

export const CLIENT_SUCCESS_OUTCOMES: DemoSuccessOutcome[] = [
  { id: "tech-score", label: "Technology Score", value: "58 → 82" },
  { id: "critical-risks", label: "Critical Risks", value: "9 → 2" },
  { id: "completed-projects", label: "Completed Projects", value: "14" },
  { id: "budget-accuracy", label: "Budget Accuracy", value: "97%" },
  { id: "quarterly-reviews", label: "Business Reviews", value: "8" },
  { id: "business-continuity", label: "Business Continuity", value: "Improved", detail: "Validated recovery readiness" },
  { id: "cyber-maturity", label: "Cybersecurity Maturity", value: "+20 points" },
];

export const ECOSYSTEM_NODES: DemoEcosystemNode[] = [
  {
    id: "assessment",
    label: "Technology Assessment",
    description: "Establish a measurable baseline across eight strategic pillars.",
    businessValue: "Replaces uncertainty with executive-ready clarity.",
  },
  {
    id: "score",
    label: "Technology Score",
    description: "Translate findings into a maturity score leadership can track over time.",
    businessValue: "Creates a single metric for technology health.",
  },
  {
    id: "recommendations",
    label: "Recommendations",
    description: "Prioritize improvements by business impact, risk, and investment.",
    businessValue: "Focuses budget on what matters most.",
  },
  {
    id: "roadmap",
    label: "Living Execution Plan",
    description: "Sequence initiatives across quarters aligned with business priorities.",
    businessValue: "Turns strategy into an executable plan.",
  },
  {
    id: "projects",
    label: "Projects",
    description: "Execute initiatives with milestones, owners, and measurable progress.",
    businessValue: "Delivers tangible operational improvement.",
  },
  {
    id: "quarterly-reviews",
    label: "Business Reviews",
    description: "Measure progress through executive business reviews.",
    businessValue: "Sustains accountability and executive alignment.",
  },
  {
    id: "reports",
    label: "Reports",
    description: "Share polished leadership reports from live platform data.",
    businessValue: "Eliminates one-off slide decks and report fatigue.",
  },
  {
    id: "technology-strategy",
    label: "Technology Strategy",
    description: "Continuous strategic planning tied to business growth objectives.",
    businessValue: "Keeps technology aligned with business direction.",
  },
  {
    id: "business-growth",
    label: "Business Growth",
    description: "Technology enables operational efficiency, risk reduction, and competitive advantage.",
    businessValue: "Technology becomes a growth enabler, not a cost center.",
  },
];

export const PRODUCT_TOUR_STEPS: DemoProductTourStep[] = [
  {
    id: "tour-overview",
    stepNumber: 1,
    title: "Demo Overview",
    sectionId: "product-overview-dashboard",
    featureDescription: "See the company baseline, starting StackScore, and the phased journey ahead.",
    whyItMatters: "Prospects need the story before the details.",
    businessValue: "Frames StackScore as a guided improvement platform.",
  },
  {
    id: "tour-assessment",
    stepNumber: 2,
    title: "Assessment Results",
    sectionId: "product-overview-assessment",
    featureDescription: "Pillar scores, risks, and how findings become an ordered roadmap.",
    whyItMatters: "You cannot improve what you have not measured.",
    businessValue: "Establishes a credible baseline for phased investment decisions.",
  },
  {
    id: "tour-roadmap",
    stepNumber: 3,
    title: "Living Execution Plan",
    sectionId: "product-overview-roadmap",
    featureDescription: "Four phases with separated one-time and monthly investments.",
    whyItMatters: "Strategy requires sequencing, not one oversized capital ask.",
    businessValue: "Lets leaders approve the highest-priority phase first.",
  },
  {
    id: "tour-proposal",
    stepNumber: 4,
    title: "Phase Proposal",
    sectionId: "product-overview-phase-proposal",
    featureDescription: "Preview Phase 1 scope and simulate approval safely in the demo.",
    whyItMatters: "Approval should be phase-specific and low risk.",
    businessValue: "Shows independent phase commitment without full-roadmap lock-in.",
  },
  {
    id: "tour-implementation",
    stepNumber: 5,
    title: "Implementation Progress",
    sectionId: "product-overview-implementation",
    featureDescription: "Watch approved work move through initiative delivery.",
    whyItMatters: "Plans only create value when they are executed.",
    businessValue: "Makes StackScore feel like an operating system, not a PDF.",
  },
  {
    id: "tour-improvement",
    stepNumber: 6,
    title: "Measurable Improvement",
    sectionId: "product-overview-measurable-improvement",
    featureDescription: "Completed phases raise the effective StackScore and unlock Phase 2.",
    whyItMatters: "Leaders need proof that investment improved maturity.",
    businessValue: "Connects delivery to measurable technology outcomes.",
  },
  {
    id: "tour-budget",
    stepNumber: 7,
    title: "Budget & Investment",
    sectionId: "product-overview-budget",
    featureDescription: "Phase-based one-time and monthly recurring investment views.",
    whyItMatters: "Cash flow clarity builds executive confidence.",
    businessValue: "Avoids false combined grand totals.",
  },
  {
    id: "tour-reports",
    stepNumber: 8,
    title: "Reports & Planning",
    sectionId: "product-overview-reports",
    featureDescription: "Connected assessment, living execution plan, proposal, progress, business review, and budget reports.",
    whyItMatters: "Executives need concise reporting from live roadmap data.",
    businessValue: "Reinforces ongoing strategic partnership value.",
  },
];

export const ENGAGEMENT_NEXT_STEPS = [
  { step: 1, label: "Purchase Assessment", description: "Begin with a Technology Maturity Assessment." },
  { step: 2, label: "Complete Onboarding", description: "Share organization context and technology environment." },
  { step: 3, label: "Technology Review", description: "Collaborate on assessment scope and executive priorities." },
  { step: 4, label: "Receive Assessment", description: "Review pillar scores, findings, and prioritized recommendations." },
  { step: 5, label: "Build Execution Plan", description: "Convert recommendations into a sequenced living execution plan." },
  { step: 6, label: "Begin Strategic IT Consulting", description: "Partner ongoing for execution, reviews, and continuous improvement." },
];

export const TOUR_STORAGE_KEY = "stackscore-product-overview-tour";

export function getTimelineSnapshotById(id: string) {
  return TECHNOLOGY_TIMELINE_SNAPSHOTS.find((snapshot) => snapshot.id === id);
}

export function getExecutiveWidgetById(id: string) {
  return EXECUTIVE_DECISION_WIDGETS.find((widget) => widget.id === id);
}

export function getStrategicInitiativeById(id: string) {
  for (const tab of STRATEGIC_PLANNING_TABS) {
    const initiative = tab.initiatives.find((item) => item.id === id);
    if (initiative) return initiative;
  }
  return undefined;
}

export function getCollaborationParticipantById(id: string) {
  return COLLABORATION_PARTICIPANTS.find((participant) => participant.id === id);
}

export function getEcosystemNodeById(id: string) {
  return ECOSYSTEM_NODES.find((node) => node.id === id);
}
