import type { Priority, RecommendationStatus } from "@/generated/prisma/client";
import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";
import type { AcmeDemoRecKey } from "./constants";

export type CuratedRecommendationSpec = {
  key: AcmeDemoRecKey;
  title: string;
  description: string;
  businessImpact: string;
  suggestedService: string;
  priority: Priority;
  status: RecommendationStatus;
  estimatedImpactPoints: number;
  pillarCode: TechnologyPillarCode;
  nextAction: string;
  effort: "Low" | "Medium" | "High";
};

export const ACME_CURATED_RECOMMENDATIONS: CuratedRecommendationSpec[] = [
  {
    key: "endpoint-management",
    title: "Implement centralized endpoint management",
    description:
      "Deploy a unified endpoint management platform to inventory devices, enforce security baselines, and automate patching across Acme Foundation workstations and shared office devices.",
    businessImpact:
      "Reduces unmanaged device risk, improves patch consistency, and gives leadership confidence that donor and program data is accessed from secured endpoints.",
    suggestedService: "Endpoint Management Deployment",
    priority: "critical",
    status: "in_progress",
    estimatedImpactPoints: 12,
    pillarCode: "endpoint_management",
    nextAction: "Complete pilot deployment on remaining shared workstations.",
    effort: "High",
  },
  {
    key: "backup-recovery",
    title: "Establish managed backup and recovery",
    description:
      "Standardize backup coverage for Microsoft 365, shared file locations, and critical nonprofit systems with documented retention and recovery testing.",
    businessImpact:
      "Protects donor records, grant documentation, and operational continuity if ransomware or accidental deletion occurs.",
    suggestedService: "Backup & Recovery Standardization",
    priority: "critical",
    status: "accepted",
    estimatedImpactPoints: 11,
    pillarCode: "data_protection_recovery",
    nextAction: "Finalize scope and schedule implementation project kickoff.",
    effort: "High",
  },
  {
    key: "infrastructure-monitoring",
    title: "Deploy infrastructure availability monitoring",
    description:
      "Implement proactive monitoring for network equipment, internet connectivity, and essential cloud services with alerting to the BobKat service team.",
    businessImpact:
      "Improves visibility before staff outages affect program delivery and reduces time to restore critical services.",
    suggestedService: "Managed Monitoring",
    priority: "critical",
    status: "open",
    estimatedImpactPoints: 10,
    pillarCode: "security_operations",
    nextAction: "Approve monitoring targets and notification contacts.",
    effort: "Medium",
  },
  {
    key: "admin-account-controls",
    title: "Formalize administrative account controls",
    description:
      "Separate privileged administrator accounts from daily user accounts, document admin access, and review Microsoft 365 global admin assignments.",
    businessImpact:
      "Limits blast radius of credential compromise and supports nonprofit compliance expectations for sensitive donor information.",
    suggestedService: "Identity Hardening",
    priority: "high",
    status: "open",
    estimatedImpactPoints: 9,
    pillarCode: "identity_access",
    nextAction: "Issue dedicated admin accounts for IT volunteers and leadership approvers.",
    effort: "Medium",
  },
  {
    key: "technology-documentation",
    title: "Improve technology documentation",
    description:
      "Create and maintain a client-visible technology inventory, network diagram, vendor list, and administrator credential escrow documentation.",
    businessImpact:
      "Enables faster support, smoother staff transitions, and reduces dependency on informal knowledge.",
    suggestedService: "Documentation Services",
    priority: "medium",
    status: "accepted",
    estimatedImpactPoints: 7,
    pillarCode: "documentation_knowledge",
    nextAction: "Schedule documentation workshop with office manager and BobKat consultant.",
    effort: "Medium",
  },
  {
    key: "patch-management",
    title: "Standardize patch-management policies",
    description:
      "Define patch approval windows, exception handling, and reporting for operating systems and third-party applications.",
    businessImpact:
      "Closes recurring security gaps on shared workstations used by rotating volunteers.",
    suggestedService: "Endpoint Management Deployment",
    priority: "medium",
    status: "in_progress",
    estimatedImpactPoints: 8,
    pillarCode: "endpoint_management",
    nextAction: "Publish patch policy and align endpoint management schedules.",
    effort: "Medium",
  },
  {
    key: "incident-response",
    title: "Create an incident-response plan",
    description:
      "Document roles, escalation paths, and recovery steps for cybersecurity incidents affecting Acme Foundation programs and donor data.",
    businessImpact:
      "Reduces confusion during an incident and supports board-level confidence in operational preparedness.",
    suggestedService: "Security Governance",
    priority: "medium",
    status: "open",
    estimatedImpactPoints: 7,
    pillarCode: "security_operations",
    nextAction: "Review draft IR plan with executive director and BobKat consultant.",
    effort: "Medium",
  },
  {
    key: "wireless-segmentation",
    title: "Segment guest and business wireless access",
    description:
      "Separate guest Wi-Fi from staff and donor-facing systems using business-grade network equipment and documented VLAN design.",
    businessImpact:
      "Reduces lateral movement risk from visitor devices while keeping community Wi-Fi available for events.",
    suggestedService: "Network Modernization",
    priority: "medium",
    status: "deferred",
    estimatedImpactPoints: 6,
    pillarCode: "network_connectivity",
    nextAction: "Revisit after endpoint management rollout completes.",
    effort: "Medium",
  },
  {
    key: "quarterly-reviews",
    title: "Establish quarterly technology reviews",
    description:
      "Institute recurring executive reviews of technology health, open priorities, and budget alignment with Acme Foundation program goals.",
    businessImpact:
      "Keeps technology investment aligned with nonprofit mission outcomes instead of reactive break/fix decisions.",
    suggestedService: "Virtual CIO Advisory",
    priority: "low",
    status: "accepted",
    estimatedImpactPoints: 5,
    pillarCode: "technology_strategy",
    nextAction: "Schedule first quarterly review on the calendar.",
    effort: "Low",
  },
  {
    key: "technology-roadmap",
    title: "Develop a three-year technology roadmap",
    description:
      "Translate assessment findings into a phased roadmap covering stabilization, governance, and modernization initiatives.",
    businessImpact:
      "Provides board-ready sequencing for investments and helps staff understand what is changing and why.",
    suggestedService: "Technology Improvement Planning",
    priority: "low",
    status: "completed",
    estimatedImpactPoints: 6,
    pillarCode: "technology_strategy",
    nextAction: "Review published roadmap during executive session.",
    effort: "Medium",
  },
  {
    key: "vendor-lifecycle",
    title: "Formalize vendor and lifecycle governance",
    description:
      "Track hardware refresh cycles, software renewals, and vendor contacts for shared devices, network equipment, and cloud subscriptions.",
    businessImpact:
      "Avoids surprise renewals and reduces operational risk from aging shared workstations.",
    suggestedService: "Technology Governance",
    priority: "low",
    status: "open",
    estimatedImpactPoints: 5,
    pillarCode: "technology_strategy",
    nextAction: "Import initial lifecycle inventory into StackScore.",
    effort: "Low",
  },
];
