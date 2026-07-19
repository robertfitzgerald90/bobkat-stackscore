import type {
  BusinessOutcome,
  DemoConnectionMap,
  DemoRecommendation,
  DemoRoadmapInitiative,
  JourneyStage,
} from "@/lib/product-overview/types";

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: "assess",
    label: "Assess",
    description:
      "Determine the current technology maturity across eight strategic pillars and establish a measurable baseline.",
  },
  {
    id: "prioritize",
    label: "Prioritize",
    description:
      "Identify which risks and opportunities provide the greatest business value.",
  },
  {
    id: "plan",
    label: "Plan",
    description:
      "Convert recommendations into a multi-quarter technology roadmap aligned with business priorities.",
  },
  {
    id: "execute",
    label: "Execute",
    description: "Manage initiatives through measurable projects.",
  },
  {
    id: "review",
    label: "Review",
    description: "Measure progress through executive quarterly reviews.",
  },
  {
    id: "improve",
    label: "Improve",
    description: "Track technology maturity improvements over time.",
  },
];

export const CURRENT_ENVIRONMENT_ITEMS = [
  "Reactive IT",
  "Unclear priorities",
  "Unknown risks",
  "No roadmap",
  "Projects disconnected",
  "Budget uncertainty",
];

export const FUTURE_STATE_ITEMS = [
  "Technology score",
  "Prioritized roadmap",
  "Executive reporting",
  "Planned investments",
  "Managed projects",
  "Measured improvement",
];

export const DEMO_RECOMMENDATIONS: DemoRecommendation[] = [
  {
    id: "rec-backup-validation",
    title: "Implement Centralized Backup Validation",
    priority: "High",
    effort: "Medium",
    estimatedCost: "$3,500–$6,500",
    target: "Q4 2026",
    whyItMatters:
      "Backups run without a simple, repeatable recovery test — making readiness hard to prove.",
    expectedOutcome:
      "Documented recovery tests, clearer ownership, and lower business continuity risk.",
    pillarId: "business-continuity",
    pillarName: "Business Continuity",
    businessImpact: "Improves resilience without buying oversized enterprise DR platforms.",
    status: "Open",
    riskIfIgnored:
      "Recovery readiness remains difficult to prove during audits or incidents.",
    estimatedTimeline: "4–8 weeks",
    dependencies: ["Backup inventory", "Recovery test schedule"],
    relatedRoadmapInitiativeId: "roadmap-backup-validation",
    relatedProjectId: "proj-backup-validation",
    filterTags: ["high", "planned"],
    isPlannedThisQuarter: true,
  },
  {
    id: "rec-mfa",
    title: "Harden MFA on Microsoft 365 Business Premium",
    priority: "Critical",
    effort: "Medium",
    estimatedCost: "$2,000–$4,000",
    target: "Q3 2026",
    whyItMatters:
      "Multi-factor authentication is inconsistently enforced across privileged and admin accounts.",
    expectedOutcome:
      "Reduced cyber risk and stronger cyber insurance readiness using licenses already in place.",
    pillarId: "cybersecurity",
    pillarName: "Cybersecurity",
    businessImpact: "Closes the highest-risk identity gap with practical SMB consulting effort.",
    status: "Planned",
    riskIfIgnored: "Higher probability of account compromise and credential-based attacks.",
    estimatedTimeline: "3–6 weeks",
    dependencies: ["Conditional access baseline", "Privileged account inventory"],
    relatedRoadmapInitiativeId: "roadmap-m365-hardening",
    relatedProjectId: "proj-m365-hardening",
    filterTags: ["critical", "high", "planned"],
    isPlannedThisQuarter: true,
  },
  {
    id: "rec-network-switches",
    title: "Modernize Ubiquiti Switching & Wi-Fi",
    priority: "High",
    effort: "Medium",
    estimatedCost: "$6,000–$10,000",
    target: "Q4 2026",
    whyItMatters:
      "Aging switches and uneven Wi-Fi coverage are creating reliability and segmentation gaps.",
    expectedOutcome:
      "Business-grade Ubiquiti reliability, better coverage, and cleaner network segmentation.",
    pillarId: "infrastructure",
    pillarName: "Infrastructure",
    businessImpact: "Reduces downtime risk with right-sized hardware instead of enterprise chassis gear.",
    status: "Open",
    riskIfIgnored: "Increased outage risk and limited ability to segment critical systems.",
    estimatedTimeline: "4–8 weeks",
    dependencies: ["Site survey", "Hardware standards approval"],
    relatedRoadmapInitiativeId: "roadmap-network-refresh",
    relatedProjectId: "proj-network-refresh",
    filterTags: ["high"],
  },
  {
    id: "rec-endpoint-lifecycle",
    title: "Standardize Endpoint Lifecycle in NinjaOne",
    priority: "Medium",
    effort: "Low",
    estimatedCost: "$2,000–$5,000",
    target: "Q3 2026",
    whyItMatters:
      "Device replacement and patching policies vary across teams, leaving unsupported endpoints in service.",
    expectedOutcome:
      "Predictable refresh cycles, fewer unsupported devices, and clearer ownership in NinjaOne.",
    pillarId: "people-process",
    pillarName: "People & Process",
    businessImpact: "Reduces security gaps from aging endpoints without a large hardware refresh.",
    status: "Open",
    riskIfIgnored: "Unsupported devices remain in production environments longer than acceptable.",
    estimatedTimeline: "3–5 weeks",
    dependencies: ["Device inventory"],
    relatedRoadmapInitiativeId: "roadmap-endpoint-lifecycle",
    filterTags: ["quick-win", "planned"],
    isQuickWin: true,
    isPlannedThisQuarter: true,
  },
  {
    id: "rec-dr-procedures",
    title: "Document Disaster Recovery Procedures",
    priority: "High",
    effort: "Medium",
    estimatedCost: "$1,500–$3,500",
    target: "Q4 2026",
    whyItMatters:
      "Recovery steps depend too much on individual knowledge and are hard to hand off.",
    expectedOutcome:
      "Simple recovery playbooks with clear roles, escalation paths, and a test cadence.",
    pillarId: "business-continuity",
    pillarName: "Business Continuity",
    businessImpact: "Improves incident response confidence at an SMB-appropriate documentation cost.",
    status: "Open",
    riskIfIgnored: "Recovery delays increase during unplanned outages.",
    estimatedTimeline: "3–5 weeks",
    dependencies: ["Backup validation workflow"],
    relatedRoadmapInitiativeId: "roadmap-dr-exercise",
    filterTags: ["high"],
  },
  {
    id: "rec-governance-committee",
    title: "Establish Technology Steering Committee",
    priority: "Medium",
    effort: "Low",
    estimatedCost: "$500–$1,500",
    target: "Q1 2027",
    whyItMatters:
      "Technology priorities are not consistently tied to business outcomes at the leadership level.",
    expectedOutcome:
      "Quarterly leadership alignment on technology investments and risk acceptance.",
    pillarId: "strategy-governance",
    pillarName: "Strategy & Governance",
    businessImpact: "Helps leadership spend smarter by approving the highest-value work first.",
    status: "Planned",
    riskIfIgnored: "Technology spending continues without clear leadership accountability.",
    estimatedTimeline: "2–4 weeks",
    dependencies: ["Executive sponsor identification"],
    relatedRoadmapInitiativeId: "roadmap-governance-refresh",
    filterTags: ["planned"],
  },
  {
    id: "rec-data-classification",
    title: "Define Data Classification Policies",
    priority: "Medium",
    effort: "Low",
    estimatedCost: "$1,000–$2,000",
    target: "Q3 2026",
    whyItMatters:
      "Sensitive operational data lacks consistent retention and access expectations.",
    expectedOutcome:
      "Clear data ownership, retention rules, and access expectations across teams.",
    pillarId: "applications-data",
    pillarName: "Applications & Data",
    businessImpact: "Supports cleaner collaboration and practical compliance readiness.",
    status: "Completed",
    riskIfIgnored: "Data sprawl and inconsistent access controls persist across systems.",
    estimatedTimeline: "Completed",
    dependencies: [],
    relatedRoadmapInitiativeId: "roadmap-app-review",
    relatedProjectId: "proj-policy-standardization",
    filterTags: ["completed"],
  },
];

export const DEMO_ROADMAP_INITIATIVES: DemoRoadmapInitiative[] = [
  {
    id: "roadmap-m365-hardening",
    title: "Microsoft 365 Security Hardening",
    quarter: "Q3 2026",
    priority: "Critical",
    description:
      "Harden Microsoft 365 Business Premium identity, conditional access, and privileged account protections for the single site.",
    budget: "$2,000–$4,000",
    expectedBusinessOutcome: "Closes the highest-priority identity risk before network modernization.",
    relatedRecommendationId: "rec-mfa",
    relatedPillarId: "cybersecurity",
    status: "In Progress",
    completionPercent: 68,
  },
  {
    id: "roadmap-backup-validation",
    title: "Backup Validation",
    quarter: "Q3 2026",
    priority: "High",
    description:
      "Stand up practical backup monitoring, validation, and quarterly recovery testing for critical systems.",
    budget: "$3,500–$6,500",
    expectedBusinessOutcome: "Provides auditable proof of recovery readiness without enterprise DR spend.",
    relatedRecommendationId: "rec-backup-validation",
    relatedPillarId: "business-continuity",
    status: "On Track",
    completionPercent: 41,
  },
  {
    id: "roadmap-endpoint-lifecycle",
    title: "Endpoint Lifecycle",
    quarter: "Q3 2026",
    priority: "Medium",
    description:
      "Standardize device replacement, patching, and ownership policies in NinjaOne across roughly 60 managed endpoints.",
    budget: "$2,000–$5,000",
    expectedBusinessOutcome: "Reduces security gaps from aging endpoints and inconsistent patching.",
    relatedRecommendationId: "rec-endpoint-lifecycle",
    relatedPillarId: "people-process",
    status: "Planning",
    completionPercent: 18,
  },
  {
    id: "roadmap-network-refresh",
    title: "Ubiquiti Network Refresh",
    quarter: "Q4 2026",
    priority: "High",
    description:
      "Upgrade aging Ubiquiti switches and Wi-Fi to improve reliability, coverage, and segmentation.",
    budget: "$6,000–$10,000",
    expectedBusinessOutcome: "Right-sized network modernization that supports secure day-to-day operations.",
    relatedRecommendationId: "rec-network-switches",
    relatedPillarId: "infrastructure",
    status: "Planning",
    completionPercent: 22,
  },
  {
    id: "roadmap-dr-exercise",
    title: "Disaster Recovery Exercise",
    quarter: "Q4 2026",
    priority: "High",
    description:
      "Run a structured recovery exercise using documented procedures and validated backup recovery paths.",
    budget: "$1,500–$3,500",
    expectedBusinessOutcome: "Improves incident response confidence at an SMB-appropriate cost.",
    relatedRecommendationId: "rec-dr-procedures",
    relatedPillarId: "business-continuity",
    status: "Not Started",
    completionPercent: 0,
  },
  {
    id: "roadmap-vendor-cleanup",
    title: "Vendor Cleanup",
    quarter: "Q4 2026",
    priority: "Medium",
    description:
      "Consolidate vendor inventory, contracts, and renewal dates into a single governance view.",
    budget: "$500–$1,500",
    expectedBusinessOutcome: "Reduces duplicate spend and improves contract visibility.",
    relatedRecommendationId: "rec-governance-committee",
    relatedPillarId: "strategy-governance",
    status: "Not Started",
    completionPercent: 0,
  },
  {
    id: "roadmap-identity-improvements",
    title: "Identity Improvements",
    quarter: "Q1 2027",
    priority: "High",
    description:
      "Extend Microsoft 365 identity lifecycle improvements to everyday user provisioning and offboarding.",
    budget: "$1,500–$3,500",
    expectedBusinessOutcome: "Reduces orphaned accounts and strengthens access governance.",
    relatedRecommendationId: "rec-mfa",
    relatedPillarId: "cybersecurity",
    status: "Planned",
    completionPercent: 0,
  },
  {
    id: "roadmap-app-review",
    title: "Application Review",
    quarter: "Q1 2027",
    priority: "Medium",
    description:
      "Review core business applications for licensing efficiency, ownership clarity, and cloud-fit opportunities.",
    budget: "$1,000–$2,500",
    expectedBusinessOutcome: "Supports cleaner collaboration and avoids unnecessary software spend.",
    relatedRecommendationId: "rec-data-classification",
    relatedPillarId: "applications-data",
    status: "Planned",
    completionPercent: 0,
  },
  {
    id: "roadmap-governance-refresh",
    title: "Technology Governance Refresh",
    quarter: "Q1 2027",
    priority: "Medium",
    description:
      "Launch a lightweight technology steering cadence and align quarterly reviews with roadmap priorities.",
    budget: "$500–$1,500",
    expectedBusinessOutcome: "Helps leadership prioritize high-value work and spend smarter over time.",
    relatedRecommendationId: "rec-governance-committee",
    relatedPillarId: "strategy-governance",
    status: "Planned",
    completionPercent: 0,
  },
];

export const DEMO_CONNECTIONS: DemoConnectionMap[] = [
  {
    pillarId: "cybersecurity",
    recommendationId: "rec-mfa",
    roadmapInitiativeId: "roadmap-m365-hardening",
  },
  {
    pillarId: "infrastructure",
    recommendationId: "rec-network-switches",
    roadmapInitiativeId: "roadmap-network-refresh",
  },
  {
    pillarId: "business-continuity",
    recommendationId: "rec-backup-validation",
    roadmapInitiativeId: "roadmap-backup-validation",
  },
  {
    pillarId: "people-process",
    recommendationId: "rec-endpoint-lifecycle",
    roadmapInitiativeId: "roadmap-endpoint-lifecycle",
  },
  {
    pillarId: "strategy-governance",
    recommendationId: "rec-governance-committee",
    roadmapInitiativeId: "roadmap-governance-refresh",
  },
  {
    pillarId: "applications-data",
    recommendationId: "rec-data-classification",
    roadmapInitiativeId: "roadmap-app-review",
  },
];

export const BUSINESS_OUTCOMES: BusinessOutcome[] = [
  {
    id: "reduce-risk",
    title: "Reduce operational risk",
    description: "Identify and prioritize the risks that matter most to business continuity and security.",
    icon: "shield",
  },
  {
    id: "improve-budgeting",
    title: "Improve budgeting",
    description: "Plan realistic SMB technology investments with approved, committed, and remaining capacity.",
    icon: "wallet",
  },
  {
    id: "executive-visibility",
    title: "Increase executive visibility",
    description: "Give leadership a clear view of technology posture, progress, and upcoming priorities.",
    icon: "eye",
  },
  {
    id: "prioritize-spending",
    title: "Spend smarter, not more",
    description: "Focus limited budget on the highest-impact work instead of oversized capital projects.",
    icon: "chart",
  },
  {
    id: "measure-improvement",
    title: "Measure improvement over time",
    description: "Track maturity gains quarter over quarter with a consistent scoring framework.",
    icon: "trending",
  },
  {
    id: "strengthen-security",
    title: "Strengthen cybersecurity",
    description: "Turn assessment findings into prioritized identity, monitoring, and resilience improvements.",
    icon: "lock",
  },
  {
    id: "support-compliance",
    title: "Support compliance initiatives",
    description: "Document policies, controls, and evidence that auditors and insurers expect to see.",
    icon: "clipboard",
  },
  {
    id: "improve-continuity",
    title: "Improve business continuity",
    description: "Validate backups, recovery paths, and disaster readiness before an incident occurs.",
    icon: "refresh",
  },
];

export function getDemoRecommendationById(id: string): DemoRecommendation | undefined {
  return DEMO_RECOMMENDATIONS.find((recommendation) => recommendation.id === id);
}

export function getDemoRoadmapInitiativeById(id: string): DemoRoadmapInitiative | undefined {
  return DEMO_ROADMAP_INITIATIVES.find((initiative) => initiative.id === id);
}

export function getDemoConnectionByPillarId(pillarId: string): DemoConnectionMap | undefined {
  return DEMO_CONNECTIONS.find((connection) => connection.pillarId === pillarId);
}

export function getDemoConnectionByRecommendationId(
  recommendationId: string,
): DemoConnectionMap | undefined {
  return DEMO_CONNECTIONS.find((connection) => connection.recommendationId === recommendationId);
}

export function getDemoConnectionByRoadmapInitiativeId(
  initiativeId: string,
): DemoConnectionMap | undefined {
  return DEMO_CONNECTIONS.find((connection) => connection.roadmapInitiativeId === initiativeId);
}
