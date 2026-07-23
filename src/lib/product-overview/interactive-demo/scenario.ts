import { DEFAULT_DEMO_COMPANY_PROFILE } from "@/lib/demo-data/demo-financial-profile";
import { DEFAULT_ROADMAP_PHASE_DEFINITIONS } from "@/lib/technology-improvement-plan/roadmap-engine/phase-config";
import { PRIORITY_TIMELINES } from "@/lib/recommendations/display";
import { VCIO_MONTHLY_AMOUNT_CENTS } from "@/lib/vcio/constants";
import type { InteractiveDemoScenario } from "./types";

/** $15/device/month — aligned with Managed IT marketing catalog. */
export const DEMO_MANAGED_IT_PER_DEVICE_MONTHLY_CENTS = 1_500;

const phaseDefs = DEFAULT_ROADMAP_PHASE_DEFINITIONS;
const demoCompany = DEFAULT_DEMO_COMPANY_PROFILE;
const managedEndpointMonthlyDollars =
  (demoCompany.managedDeviceCount * DEMO_MANAGED_IT_PER_DEVICE_MONTHLY_CENTS) / 100;

/**
 * Centralized Interactive StackScore Experience scenario.
 * All journey sections derive from this object — do not scatter pricing elsewhere.
 *
 * Pricing notes:
 * - Managed IT: $50/device/month × 60 devices = $3,000/month (catalog-aligned)
 * - Strategic IT Consulting: VCIO_MONTHLY_AMOUNT_CENTS ($500/month)
 * - One-time amounts are SMB-realistic implementation / project fees
 */
export const NORTHSTAR_INTERACTIVE_DEMO_SCENARIO: InteractiveDemoScenario = {
  company: {
    id: "demo-northstar-manufacturing",
    name: "Northstar Manufacturing",
    industry: "Light manufacturing",
    employeeCount: demoCompany.employeeCount,
    locationCount: demoCompany.locationCount,
    managedDeviceCount: demoCompany.managedDeviceCount,
    summary:
      "A single-location SMB with about 50 licensed users and 60 managed Windows endpoints. Microsoft 365 Business Premium, Ubiquiti networking, and growing operational dependence on technology — without enterprise-scale capital budgets.",
    primaryConcerns: [
      "Inconsistent endpoint visibility and patching",
      "Backup coverage without proven recovery tests",
      "Identity hardening gaps on Microsoft 365",
      "Aging Ubiquiti network reliability",
    ],
  },
  assessment: {
    initialStackScore: 58,
    projectedFinalStackScore: 92,
    availableImprovement: 34,
    phaseCount: 4,
    recommendationCount: 12,
    strengths: [
      "Microsoft 365 Business Premium already licensed",
      "Willing executive sponsorship for practical improvements",
      "Single-site environment simplifies standardization",
    ],
    priorityGaps: [
      "No centralized endpoint management standard",
      "Backup validation not operationalized",
      "Privileged MFA inconsistently enforced",
      "Network equipment beyond recommended lifecycle",
    ],
    primaryRisks: [
      "Credential-based compromise of privileged accounts",
      "Unproven recovery readiness during an outage",
      "Unsupported endpoints remaining in production",
    ],
  },
  strategicConsultingMonthlyCents: VCIO_MONTHLY_AMOUNT_CENTS,
  managedItPerDeviceMonthlyCents: DEMO_MANAGED_IT_PER_DEVICE_MONTHLY_CENTS,
  scoreProgression: {
    initialScore: 58,
    phase1Improvement: 15,
    afterPhase1Score: 73,
    projectedFinalScore: 92,
    pillarBeforeAfter: [
      { id: "backup", label: "Backup and Recovery", before: 42, afterPhase1: 78 },
      { id: "endpoint", label: "Endpoint Management", before: 30, afterPhase1: 82 },
      { id: "visibility", label: "Infrastructure Visibility", before: 38, afterPhase1: 76 },
      { id: "identity", label: "Identity Protection", before: 48, afterPhase1: 74 },
    ],
  },
  phases: [
    {
      id: phaseDefs[0]!.id,
      phaseNumber: 1,
      name: phaseDefs[0]!.name,
      timeline: PRIORITY_TIMELINES.critical,
      executiveSummary:
        "Stabilize the highest-risk gaps first: centralized endpoint management, reliable backup, identity hardening, and monitoring — before larger infrastructure spend.",
      whyItMatters:
        "Phase 1 reduces immediate operational and cyber risk while establishing the management foundation later phases depend on. Approving Phase 1 does not commit Northstar to the full roadmap.",
      riskLevel: "Critical",
      stackScoreImprovement: 15,
      oneTimeInvestment: 7_500,
      monthlyRecurringInvestment: managedEndpointMonthlyDollars,
      showMonthlyRecurring: true,
      monthlyRecurringLabel: "standard",
      primaryBusinessOutcome: "Centralized visibility and recoverable systems for every supported device",
      businessOutcomes: [
        "Centralized endpoint visibility",
        "Reliable backup and recovery",
        "Improved patch consistency",
        "Faster remote support",
        "Infrastructure monitoring",
        "Reduced operational risk",
      ],
      completionOutcomes: [
        "Centralized management for all supported devices",
        "Reliable backup coverage",
        "Automated monitoring",
        "Remote support capability",
        "Improved technology visibility",
      ],
      deliverables: [
        "NinjaOne endpoint management baseline",
        "Managed backup policy and first recovery test",
        "Microsoft 365 Business Premium MFA hardening",
        "Monitoring and alerting baseline",
        "Phase completion summary for leadership",
      ],
      assumptions: [
        "Approximately 60 Windows endpoints remain in scope",
        "Microsoft 365 Business Premium licenses remain available",
        "On-site access for Ubiquiti and server/network validation as needed",
        "Monthly managed services begin when services are activated",
      ],
      initialStatus: "awaiting_approval",
      initiatives: [
        {
          id: "init-ninjaone",
          title: "Deploy NinjaOne Endpoint Management",
          description: "Onboard supported devices into centralized monitoring, patching, and remote support.",
          businessBenefit: "Gives leadership and IT one source of truth for device health.",
          stackScoreContribution: 5,
          costType: "mixed",
          oneTimeInvestment: 2_500,
          monthlyRecurringInvestment: managedEndpointMonthlyDollars,
          initialStatus: "open",
        },
        {
          id: "init-backup",
          title: "Activate Managed Backup & Validation",
          description: "Stand up practical backup coverage with a documented recovery test cadence.",
          businessBenefit: "Proves recovery readiness without oversized DR platforms.",
          stackScoreContribution: 4,
          costType: "one_time",
          oneTimeInvestment: 2_000,
          monthlyRecurringInvestment: 0,
          initialStatus: "open",
        },
        {
          id: "init-mfa",
          title: "Harden MFA on Microsoft 365 Business Premium",
          description: "Enforce practical MFA and privileged access controls using licenses already in place.",
          businessBenefit: "Closes the highest-priority identity risk quickly.",
          stackScoreContribution: 4,
          costType: "one_time",
          oneTimeInvestment: 2_000,
          monthlyRecurringInvestment: 0,
          initialStatus: "open",
        },
        {
          id: "init-monitoring",
          title: "Establish Infrastructure Monitoring Baseline",
          description: "Enable alerting for critical systems and network health at the single site.",
          businessBenefit: "Surfaces issues before they become outages.",
          stackScoreContribution: 2,
          costType: "one_time",
          oneTimeInvestment: 1_000,
          monthlyRecurringInvestment: 0,
          initialStatus: "open",
        },
      ],
    },
    {
      id: phaseDefs[1]!.id,
      phaseNumber: 2,
      name: phaseDefs[1]!.name,
      timeline: PRIORITY_TIMELINES.high,
      executiveSummary:
        "Modernize Ubiquiti networking and standardize lifecycle policies once foundational visibility is in place.",
      whyItMatters:
        "With endpoints managed and identity hardened, network reliability and standards deliver compounding value without enterprise chassis spend.",
      riskLevel: "High",
      stackScoreImprovement: 9,
      oneTimeInvestment: 9_500,
      monthlyRecurringInvestment: 0,
      showMonthlyRecurring: false,
      primaryBusinessOutcome: "Reliable business-grade connectivity and clearer technology standards",
      businessOutcomes: [
        "Ubiquiti switching and Wi-Fi modernization",
        "Cleaner network segmentation",
        "Documented endpoint lifecycle standards",
        "Reduced downtime risk",
      ],
      completionOutcomes: [
        "Modernized Ubiquiti switching and Wi-Fi",
        "Approved device lifecycle standards",
        "Improved coverage for production and office areas",
      ],
      deliverables: [
        "Ubiquiti network modernization plan and implementation",
        "Endpoint lifecycle standards documentation",
        "Post-implementation validation summary",
      ],
      assumptions: [
        "Phase 1 management tooling remains active",
        "Hardware standards approved before procurement",
      ],
      initialStatus: "planned",
      initiatives: [
        {
          id: "init-ubiquiti",
          title: "Modernize Ubiquiti Switching & Wi-Fi",
          description: "Right-size switching and wireless upgrades for a single manufacturing site.",
          businessBenefit: "Improves reliability without enterprise infrastructure spend.",
          stackScoreContribution: 6,
          costType: "one_time",
          oneTimeInvestment: 8_000,
          monthlyRecurringInvestment: 0,
          initialStatus: "open",
        },
        {
          id: "init-lifecycle",
          title: "Standardize Endpoint Lifecycle Policies",
          description: "Define refresh, patching, and support expectations for plant and office devices.",
          businessBenefit: "Prevents unsupported devices from lingering in production.",
          stackScoreContribution: 3,
          costType: "one_time",
          oneTimeInvestment: 1_500,
          monthlyRecurringInvestment: 0,
          initialStatus: "open",
        },
      ],
    },
    {
      id: phaseDefs[2]!.id,
      phaseNumber: 3,
      name: phaseDefs[2]!.name,
      timeline: PRIORITY_TIMELINES.medium,
      executiveSummary:
        "Raise operational maturity with governance, documentation, and ongoing strategic guidance.",
      whyItMatters:
        "Once critical and high-priority work is underway, lightweight governance keeps improvements durable.",
      riskLevel: "Medium",
      stackScoreImprovement: 7,
      oneTimeInvestment: 2_500,
      monthlyRecurringInvestment: 300,
      showMonthlyRecurring: true,
      monthlyRecurringLabel: "strategic_consulting_included",
      primaryBusinessOutcome: "Predictable technology planning through Strategic IT Consulting",
      businessOutcomes: [
        "Technology standards and documentation baseline",
        "Quarterly roadmap reviews",
        "Budget forecasting discipline",
        "Ongoing risk monitoring",
      ],
      completionOutcomes: [
        "Living documentation baseline",
        "Active Strategic IT Consulting cadence",
        "Clear ownership for technology decisions",
      ],
      deliverables: [
        "Documentation and standards package",
        "Strategic IT Consulting onboarding",
        "First quarterly planning agenda",
      ],
      assumptions: [
        "Leadership participates in quarterly reviews",
        "Strategic IT Consulting retainer covers ongoing advisory work",
      ],
      initialStatus: "planned",
      initiatives: [
        {
          id: "init-documentation",
          title: "Documentation & Technology Standards Baseline",
          description: "Capture critical systems, ownership, and standards in a maintainable package.",
          businessBenefit: "Reduces tribal knowledge risk as the business grows.",
          stackScoreContribution: 3,
          costType: "one_time",
          oneTimeInvestment: 1_500,
          monthlyRecurringInvestment: 0,
          includedInStrategicConsulting: true,
          initialStatus: "open",
        },
        {
          id: "init-vcio",
          title: "Strategic IT Consulting Cadence",
          description: "Establish quarterly reviews, roadmap stewardship, and investment prioritization.",
          businessBenefit: "Keeps technology decisions aligned with business priorities.",
          stackScoreContribution: 4,
          costType: "recurring",
          oneTimeInvestment: 1_000,
          monthlyRecurringInvestment: 300,
          initialStatus: "open",
        },
      ],
    },
    {
      id: phaseDefs[3]!.id,
      phaseNumber: 4,
      name: phaseDefs[3]!.name,
      timeline: PRIORITY_TIMELINES.low,
      executiveSummary:
        "Pursue selective enhancements that improve efficiency once the foundation is stable.",
      whyItMatters:
        "Strategic enhancements are valuable only after critical risk and operational maturity are addressed.",
      riskLevel: "Low",
      stackScoreImprovement: 3,
      oneTimeInvestment: 3_500,
      monthlyRecurringInvestment: 0,
      showMonthlyRecurring: false,
      primaryBusinessOutcome: "Selective capability upgrades tied to business growth",
      businessOutcomes: [
        "Application and workflow review",
        "Vendor consolidation opportunities",
        "Forward-looking investment options",
      ],
      completionOutcomes: [
        "Prioritized enhancement backlog",
        "Clear go/no-go decisions for discretionary spend",
      ],
      deliverables: [
        "Strategic enhancement recommendations",
        "Updated multi-quarter roadmap options",
      ],
      assumptions: ["Phases 1–3 outcomes remain in place"],
      initialStatus: "planned",
      initiatives: [
        {
          id: "init-app-review",
          title: "Application & Workflow Efficiency Review",
          description: "Identify practical automation and SaaS consolidation opportunities.",
          businessBenefit: "Spend smarter on tools that actually move operations forward.",
          stackScoreContribution: 3,
          costType: "one_time",
          oneTimeInvestment: 3_500,
          monthlyRecurringInvestment: 0,
          initialStatus: "open",
        },
      ],
    },
  ],
  proposals: [
    {
      id: "demo-proposal-phase-1",
      proposalNumber: "PROP-DEMO-1001",
      version: 1,
      phaseId: phaseDefs[0]!.id,
      initialStatus: "sent",
      scopeSummary:
        "Phase 1 — Critical Stabilization for Northstar Manufacturing: endpoint management, managed backup validation, Microsoft 365 MFA hardening, and monitoring baseline.",
      approvalLanguage:
        "Approval applies only to this implementation phase. Remaining roadmap phases may be reviewed and approved separately as priorities and budget allow.",
    },
  ],
};
