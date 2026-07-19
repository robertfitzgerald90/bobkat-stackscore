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
    estimatedCost: "$12,000–$18,000",
    target: "Q4 2026",
    whyItMatters:
      "Backups currently run across multiple systems without a standardized verification process.",
    expectedOutcome:
      "Consistent recovery testing, clearer ownership, and reduced business continuity risk.",
    pillarId: "business-continuity",
    pillarName: "Business Continuity",
    businessImpact: "Improves resilience and reduces operational disruption during outages.",
    status: "Open",
    riskIfIgnored:
      "Recovery readiness remains difficult to prove during audits or incidents.",
    estimatedTimeline: "8–12 weeks",
    dependencies: ["Backup inventory", "Recovery test schedule"],
    relatedRoadmapInitiativeId: "roadmap-backup-validation",
    relatedProjectId: "proj-backup-validation",
    filterTags: ["high", "planned"],
    isPlannedThisQuarter: true,
  },
  {
    id: "rec-mfa",
    title: "Deploy Phishing Resistant MFA",
    priority: "Critical",
    effort: "Medium",
    estimatedCost: "$18,000–$24,000",
    target: "Q3 2026",
    whyItMatters:
      "Multi-factor authentication is inconsistently enforced across privileged accounts.",
    expectedOutcome:
      "Reduced cyber risk and stronger cyber insurance readiness.",
    pillarId: "cybersecurity",
    pillarName: "Cybersecurity",
    businessImpact: "Reduces account compromise risk and strengthens cyber-insurance readiness.",
    status: "Planned",
    riskIfIgnored: "Higher probability of account compromise and credential-based attacks.",
    estimatedTimeline: "6–10 weeks",
    dependencies: ["Conditional access baseline", "Privileged account inventory"],
    relatedRoadmapInitiativeId: "roadmap-m365-hardening",
    relatedProjectId: "proj-m365-hardening",
    filterTags: ["critical", "high", "planned"],
    isPlannedThisQuarter: true,
  },
  {
    id: "rec-network-switches",
    title: "Replace Aging Core Switches",
    priority: "High",
    effort: "High",
    estimatedCost: "$42,000–$55,000",
    target: "Q4 2026",
    whyItMatters:
      "Primary facility switching is beyond recommended lifecycle and creating capacity pressure.",
    expectedOutcome:
      "Improved network reliability, segmentation, and support for modern security controls.",
    pillarId: "infrastructure",
    pillarName: "Infrastructure",
    businessImpact: "Reduces downtime risk and supports secure connectivity for production systems.",
    status: "Open",
    riskIfIgnored: "Increased outage risk and limited ability to segment critical systems.",
    estimatedTimeline: "12–16 weeks",
    dependencies: ["Site survey", "Hardware standards approval"],
    relatedRoadmapInitiativeId: "roadmap-network-refresh",
    relatedProjectId: "proj-network-refresh",
    filterTags: ["high"],
  },
  {
    id: "rec-endpoint-lifecycle",
    title: "Standardize Endpoint Lifecycle",
    priority: "Medium",
    effort: "Low",
    estimatedCost: "$4,000–$8,000",
    target: "Q3 2026",
    whyItMatters:
      "Device replacement and patching policies vary across departments and shifts.",
    expectedOutcome:
      "Predictable refresh cycles, fewer unsupported devices, and clearer ownership.",
    pillarId: "people-process",
    pillarName: "People & Process",
    businessImpact: "Reduces security gaps from aging endpoints and inconsistent patching.",
    status: "Open",
    riskIfIgnored: "Unsupported devices remain in production environments longer than acceptable.",
    estimatedTimeline: "4–6 weeks",
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
    estimatedCost: "$6,000–$10,000",
    target: "Q4 2026",
    whyItMatters:
      "Recovery steps are documented inconsistently and depend on individual staff knowledge.",
    expectedOutcome:
      "Auditable recovery playbooks with clear roles, escalation paths, and test cadence.",
    pillarId: "business-continuity",
    pillarName: "Business Continuity",
    businessImpact: "Improves incident response confidence and audit readiness.",
    status: "Open",
    riskIfIgnored: "Recovery delays increase during unplanned outages.",
    estimatedTimeline: "6–8 weeks",
    dependencies: ["Backup validation workflow"],
    relatedRoadmapInitiativeId: "roadmap-dr-exercise",
    filterTags: ["high"],
  },
  {
    id: "rec-governance-committee",
    title: "Establish Technology Steering Committee",
    priority: "Medium",
    effort: "Low",
    estimatedCost: "$2,000–$5,000",
    target: "Q1 2027",
    whyItMatters:
      "Technology priorities are not consistently tied to business outcomes at the executive level.",
    expectedOutcome:
      "Quarterly executive alignment on technology investments and risk acceptance.",
    pillarId: "strategy-governance",
    pillarName: "Strategy & Governance",
    businessImpact: "Improves decision velocity and keeps investments aligned with growth goals.",
    status: "Planned",
    riskIfIgnored: "Technology spending continues without clear executive accountability.",
    estimatedTimeline: "4–8 weeks",
    dependencies: ["Executive sponsor identification"],
    relatedRoadmapInitiativeId: "roadmap-governance-refresh",
    filterTags: ["planned"],
  },
  {
    id: "rec-data-classification",
    title: "Define Data Classification Policies",
    priority: "Medium",
    effort: "Medium",
    estimatedCost: "$8,000–$12,000",
    target: "Q3 2026",
    whyItMatters:
      "Sensitive operational data lacks consistent retention and access controls.",
    expectedOutcome:
      "Clear data ownership, retention rules, and access expectations across teams.",
    pillarId: "applications-data",
    pillarName: "Applications & Data",
    businessImpact: "Supports compliance readiness and cleaner collaboration workflows.",
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
      "Harden Microsoft 365 identity, conditional access, and privileged account protections across both locations.",
    budget: "$18,000–$24,000",
    expectedBusinessOutcome: "Closes the highest-priority identity risk before infrastructure refresh.",
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
      "Centralize backup monitoring, validation, and quarterly recovery testing across manufacturing and corporate systems.",
    budget: "$12,000–$18,000",
    expectedBusinessOutcome: "Provides auditable proof of recovery readiness for leadership and insurers.",
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
      "Standardize device replacement, patching, and ownership policies across plant and office environments.",
    budget: "$4,000–$8,000",
    expectedBusinessOutcome: "Reduces security gaps from aging endpoints and inconsistent patching.",
    relatedRecommendationId: "rec-endpoint-lifecycle",
    relatedPillarId: "people-process",
    status: "Planning",
    completionPercent: 18,
  },
  {
    id: "roadmap-network-refresh",
    title: "Network Refresh",
    quarter: "Q4 2026",
    priority: "High",
    description:
      "Replace aging switching and wireless infrastructure at the primary facility to improve reliability and segmentation.",
    budget: "$42,000–$55,000",
    expectedBusinessOutcome: "Supports secure connectivity for production systems and remote leadership access.",
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
      "Conduct a structured disaster recovery exercise using documented procedures and validated backup recovery paths.",
    budget: "$6,000–$10,000",
    expectedBusinessOutcome: "Improves incident response confidence and audit readiness.",
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
    budget: "$3,000–$6,000",
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
      "Extend identity lifecycle improvements beyond privileged accounts to standard user provisioning and offboarding.",
    budget: "$10,000–$15,000",
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
      "Review core business applications for modernization, licensing efficiency, and data ownership clarity.",
    budget: "$8,000–$12,000",
    expectedBusinessOutcome: "Supports compliance readiness and cleaner collaboration workflows.",
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
      "Launch a technology steering committee and align quarterly reviews with roadmap priorities.",
    budget: "$2,000–$5,000",
    expectedBusinessOutcome: "Improves decision velocity and keeps investments aligned with growth goals.",
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
    description: "Connect technology investments to approved spend, committed dollars, and remaining capacity.",
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
    title: "Prioritize technology spending",
    description: "Focus dollars on initiatives with the highest business impact instead of reactive fixes.",
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
