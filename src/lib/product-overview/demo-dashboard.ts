import { northstarManufacturing } from "@/lib/product-overview/demo-organization";
import type { DemoDashboard, DemoRecommendation } from "@/lib/product-overview/types";

export const featuredRecommendation: DemoRecommendation = {
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
  isQuickWin: false,
  isPlannedThisQuarter: true,
};

export const northstarDemoDashboard: DemoDashboard = {
  organization: northstarManufacturing,
  technologyScore: {
    score: 68,
    maxScore: 100,
    maturityLabel: "Developing",
    changeSinceLastReview: 6,
    projectedScore: 82,
    projectedMaturityLabel: "Managed",
    projectedNote: "Projected score reflects completion of the current approved roadmap.",
  },
  metrics: {
    openRecommendations: 14,
    highPriorityRecommendations: 5,
    quickWins: 4,
    plannedThisQuarter: 3,
    activeProjects: 4,
    roadmapCompletionPercent: 42,
    annualTechnologyPlan: 118_000,
    approvedSpend: 72_000,
  },
  pillars: [
    {
      id: "strategy-governance",
      name: "Strategy & Governance",
      score: 72,
      maturityLabel: "Defined",
      summary: "Technology planning exists but needs stronger executive alignment and quarterly accountability.",
      primaryRisk: "Roadmap priorities are not consistently tied to business outcomes.",
      exampleRecommendation: "Establish a quarterly technology steering committee with executive sponsors.",
      targetScore: 84,
      businessImpact: "Improves decision velocity and keeps investments aligned with growth goals.",
    },
    {
      id: "infrastructure",
      name: "Infrastructure",
      score: 61,
      maturityLabel: "Developing",
      summary: "Core systems are stable, but aging network equipment is creating capacity and reliability pressure.",
      primaryRisk: "Primary facility switching is beyond recommended lifecycle.",
      exampleRecommendation: "Refresh core network infrastructure at the main production site.",
      targetScore: 80,
      businessImpact: "Reduces downtime risk and supports modern security controls.",
    },
    {
      id: "cybersecurity",
      name: "Cybersecurity",
      score: 58,
      maturityLabel: "Developing",
      summary: "Baseline protections are in place, but identity and monitoring coverage remain inconsistent.",
      primaryRisk: "Inconsistent identity protection and limited security monitoring.",
      exampleRecommendation: "Enforce phishing-resistant MFA for privileged accounts.",
      targetScore: 78,
      businessImpact: "Reduces account compromise risk and strengthens cyber-insurance readiness.",
    },
    {
      id: "business-continuity",
      name: "Business Continuity",
      score: 55,
      maturityLabel: "Developing",
      summary: "Backup jobs run regularly, but validation and recovery testing are not standardized.",
      primaryRisk: "Recovery readiness is difficult to prove during audits or incidents.",
      exampleRecommendation: "Implement centralized backup validation with documented recovery tests.",
      targetScore: 76,
      businessImpact: "Improves resilience and reduces operational disruption during outages.",
    },
    {
      id: "applications-data",
      name: "Applications & Data",
      score: 70,
      maturityLabel: "Defined",
      summary: "Microsoft 365 adoption is strong, but data ownership and lifecycle policies need refinement.",
      primaryRisk: "Sensitive operational data lacks consistent retention and access controls.",
      exampleRecommendation: "Define data classification and retention policies for manufacturing systems.",
      targetScore: 82,
      businessImpact: "Supports compliance readiness and cleaner collaboration workflows.",
    },
    {
      id: "operations-support",
      name: "Operations & Support",
      score: 74,
      maturityLabel: "Defined",
      summary: "Support processes are responsive, though documentation and escalation paths could be clearer.",
      primaryRisk: "Troubleshooting relies on tribal knowledge during shift changes.",
      exampleRecommendation: "Standardize incident response playbooks for production systems.",
      targetScore: 85,
      businessImpact: "Shortens resolution time and improves service consistency.",
    },
    {
      id: "people-process",
      name: "People & Process",
      score: 66,
      maturityLabel: "Developing",
      summary: "Teams adopt new tools quickly, but security and change-management training is uneven.",
      primaryRisk: "Process adherence varies across departments and shifts.",
      exampleRecommendation: "Launch role-based security awareness training for plant and office staff.",
      targetScore: 79,
      businessImpact: "Reduces human-factor risk and improves change adoption.",
    },
    {
      id: "digital-enablement",
      name: "Digital Enablement",
      score: 76,
      maturityLabel: "Defined",
      summary: "Digital tools support daily operations, with room to connect shop-floor and leadership reporting.",
      primaryRisk: "Operational reporting still requires manual consolidation.",
      exampleRecommendation: "Connect production metrics to executive dashboards in StackScore.",
      targetScore: 86,
      businessImpact: "Improves visibility for leadership and accelerates operational decisions.",
    },
  ],
  featuredRecommendationId: featuredRecommendation.id,
  projects: [
    {
      id: "proj-m365-hardening",
      title: "Microsoft 365 Security Hardening",
      status: "In Progress",
      progress: 68,
      owner: "Jordan Ellis",
      targetCompletion: "August 28, 2026",
      description:
        "Hardening Microsoft 365 identity, conditional access, and privileged account protections across Northstar's two locations.",
      milestones: [
        "Conditional access baseline deployed",
        "Privileged account MFA enforcement",
        "Legacy authentication blocked",
        "Security policy documentation finalized",
      ],
      relatedRecommendation: "Enforce phishing-resistant MFA for privileged accounts.",
      businessOutcome: "Closes the highest-priority identity risk before the network refresh begins.",
      budgetRange: "$18,000–$24,000",
    },
    {
      id: "proj-network-refresh",
      title: "Network Infrastructure Refresh",
      status: "Planning",
      progress: 22,
      owner: "Jordan Ellis",
      targetCompletion: "November 14, 2026",
      description:
        "Replace aging switching and wireless infrastructure at the primary facility to improve reliability and segmentation.",
      milestones: [
        "Site survey completed",
        "Hardware standards approved",
        "Implementation schedule confirmed",
      ],
      relatedRecommendation: "Refresh core network infrastructure at the main production site.",
      businessOutcome: "Supports secure connectivity for production systems and remote leadership access.",
      budgetRange: "$42,000–$55,000",
    },
    {
      id: "proj-backup-validation",
      title: "Backup and Disaster Recovery Validation",
      status: "On Track",
      progress: 41,
      owner: "Morgan Lee",
      targetCompletion: "October 3, 2026",
      description:
        "Centralize backup monitoring, validation, and quarterly recovery testing across manufacturing and corporate systems.",
      milestones: [
        "Backup inventory completed",
        "Validation workflow designed",
        "First recovery test scheduled",
      ],
      relatedRecommendation: featuredRecommendation.title,
      businessOutcome: "Provides auditable proof of recovery readiness for leadership and insurers.",
      budgetRange: "$12,000–$18,000",
    },
    {
      id: "proj-policy-standardization",
      title: "Technology Policy Standardization",
      status: "In Progress",
      progress: 54,
      owner: "Morgan Lee",
      targetCompletion: "September 19, 2026",
      description:
        "Standardize acceptable use, device lifecycle, and vendor management policies across Northstar operations.",
      milestones: [
        "Policy gap analysis completed",
        "Executive review scheduled",
        "Employee communication drafted",
      ],
      relatedRecommendation: "Define data classification and retention policies for manufacturing systems.",
      businessOutcome: "Creates consistent expectations and reduces compliance gaps.",
      budgetRange: "$8,000–$12,000",
    },
  ],
  roadmapQuarters: [
    {
      quarter: "Q3 2026",
      items: [
        "Microsoft 365 security hardening",
        "Device lifecycle policy",
        "Backup validation design",
      ],
    },
    {
      quarter: "Q4 2026",
      items: ["Network refresh", "Disaster recovery exercise", "Vendor inventory cleanup"],
    },
    {
      quarter: "Q1 2027",
      items: ["Application modernization review", "Identity lifecycle improvements"],
    },
  ],
  quarterlyReview: {
    nextReviewDate: "September 15, 2026",
    status: "Preparation in progress",
    scoreChange: 6,
    projectsCompleted: 2,
    recommendationsClosed: 5,
    budgetVariance: "3% under plan",
    executiveSummary: [
      "Technology score improved 6 points since the last quarterly review.",
      "Two strategic projects completed on schedule with measurable risk reduction.",
      "Five recommendations were closed, including three quick wins in identity and backup validation.",
      "Technology spending remains 3% under plan with no critical budget overruns.",
    ],
  },
  budget: {
    planned: 118_000,
    approved: 72_000,
    committed: 51_000,
    remaining: 21_000,
  },
  nextAction: {
    title: "Complete the Microsoft 365 Security Hardening project before beginning the network refresh.",
    body: "Complete the Microsoft 365 Security Hardening project before beginning the network refresh.",
    reason:
      "This closes the highest-priority identity risk and improves readiness for the next quarterly review.",
    relatedProjectId: "proj-m365-hardening",
    relatedRecommendationId: "rec-backup-validation",
  },
};

export function getDemoRecommendationById(id: string): DemoRecommendation | undefined {
  if (id === featuredRecommendation.id) return featuredRecommendation;
  return undefined;
}

export function getDemoPillarById(id: string) {
  return northstarDemoDashboard.pillars.find((pillar) => pillar.id === id);
}

export function getDemoProjectById(id: string) {
  return northstarDemoDashboard.projects.find((project) => project.id === id);
}

export function formatDemoCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
