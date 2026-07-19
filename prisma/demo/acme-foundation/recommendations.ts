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
      "Deploy NinjaOne RMM across Pinnacle Engineering workstations and field laptops to inventory devices, enforce security baselines, and automate patching across both Dallas and satellite offices.",
    businessImpact:
      "Reduces unmanaged endpoint risk for CAD, project management, and field inspection devices while improving patch consistency for client deliverables and Azure-hosted line-of-business applications.",
    suggestedService: "Endpoint Management Rollout",
    priority: "critical",
    status: "in_progress",
    estimatedImpactPoints: 6,
    pillarCode: "endpoint_management",
    nextAction: "Complete pilot deployment on remaining engineering workstations.",
    effort: "High",
  },
  {
    key: "infrastructure-monitoring",
    title: "Deploy infrastructure availability monitoring",
    description:
      "Implement proactive monitoring for Ubiquiti network equipment, internet connectivity, Synology backup targets, and essential Azure-hosted services with alerting to the BobKat service team.",
    businessImpact:
      "Improves visibility before outages affect project deadlines, site coordination, and access to structural modeling applications.",
    suggestedService: "Network Monitoring Deployment",
    priority: "critical",
    status: "accepted",
    estimatedImpactPoints: 5,
    pillarCode: "security_operations",
    nextAction: "Approve monitoring targets and notification contacts.",
    effort: "Medium",
  },
  {
    key: "immutable-backup",
    title: "Establish immutable backup strategy",
    description:
      "Modernize Synology and cloud backup coverage for Microsoft 365, project files, and Azure-hosted line-of-business applications with immutable retention and documented recovery testing.",
    businessImpact:
      "Protects active project files, structural models, and client records against ransomware, accidental deletion, and site-level failures.",
    suggestedService: "Backup & Disaster Recovery Modernization",
    priority: "critical",
    status: "accepted",
    estimatedImpactPoints: 6,
    pillarCode: "data_protection_recovery",
    nextAction: "Finalize immutable retention policy and schedule implementation kickoff.",
    effort: "High",
  },
  {
    key: "m365-security-baseline",
    title: "Standardize Microsoft 365 security baseline",
    description:
      "Complete Microsoft 365 Business Premium security hardening with hybrid Entra ID controls, MFA enforcement, conditional access, and baseline admin role governance.",
    businessImpact:
      "Reduces account takeover risk for engineers, project managers, and executives accessing cloud collaboration and Azure-hosted applications.",
    suggestedService: "Microsoft 365 Security Baseline",
    priority: "critical",
    status: "in_progress",
    estimatedImpactPoints: 5,
    pillarCode: "productivity_collaboration",
    nextAction: "Finish conditional access rollout for field and office users.",
    effort: "Medium",
  },
  {
    key: "vendor-lifecycle",
    title: "Formalize vendor lifecycle documentation",
    description:
      "Track hardware refresh cycles, software renewals, and vendor contacts for network equipment, endpoint platforms, backup systems, and cloud subscriptions.",
    businessImpact:
      "Avoids surprise renewals and reduces operational risk from aging field laptops and unsupported infrastructure.",
    suggestedService: "Technology Governance",
    priority: "critical",
    status: "open",
    estimatedImpactPoints: 4,
    pillarCode: "technology_strategy",
    nextAction: "Import initial lifecycle inventory into StackScore.",
    effort: "Low",
  },
  {
    key: "admin-account-controls",
    title: "Formalize administrative account controls",
    description:
      "Separate privileged administrator accounts from daily user accounts, document admin access, and review hybrid Entra ID privileged role assignments.",
    businessImpact:
      "Limits blast radius of credential compromise across Microsoft 365, Azure, and on-premises hybrid identity systems.",
    suggestedService: "Identity Hardening",
    priority: "critical",
    status: "open",
    estimatedImpactPoints: 5,
    pillarCode: "identity_access",
    nextAction: "Issue dedicated admin accounts for IT leadership and BobKat consultants.",
    effort: "Medium",
  },
  {
    key: "patch-management",
    title: "Standardize patch-management policies",
    description:
      "Define patch approval windows, exception handling, and reporting for operating systems and engineering software across office and field endpoints.",
    businessImpact:
      "Closes recurring security gaps on laptops used for site inspections and remote project collaboration.",
    suggestedService: "Endpoint Management Rollout",
    priority: "critical",
    status: "open",
    estimatedImpactPoints: 5,
    pillarCode: "endpoint_management",
    nextAction: "Publish patch policy and align NinjaOne maintenance schedules.",
    effort: "Medium",
  },
  {
    key: "technology-documentation",
    title: "Improve technology documentation",
    description:
      "Create and maintain a client-visible technology inventory, network diagram, vendor list, and administrator credential escrow documentation for both office locations.",
    businessImpact:
      "Enables faster support, smoother staff transitions, and reduces dependency on informal engineering-team knowledge.",
    suggestedService: "Documentation Services",
    priority: "medium",
    status: "completed",
    estimatedImpactPoints: 4,
    pillarCode: "documentation_knowledge",
    nextAction: "Maintain quarterly documentation updates in StackScore.",
    effort: "Medium",
  },
  {
    key: "incident-response",
    title: "Create an incident-response plan",
    description:
      "Document roles, escalation paths, and recovery steps for cybersecurity incidents affecting project delivery systems and client data.",
    businessImpact:
      "Reduces confusion during an incident and supports leadership confidence in operational preparedness.",
    suggestedService: "Security Governance",
    priority: "medium",
    status: "completed",
    estimatedImpactPoints: 4,
    pillarCode: "security_operations",
    nextAction: "Review the approved plan during the next business review.",
    effort: "Medium",
  },
  {
    key: "quarterly-reviews",
    title: "Establish quarterly technology reviews",
    description:
      "Institute recurring executive reviews of technology health, open priorities, and budget alignment with Pinnacle Engineering growth goals.",
    businessImpact:
      "Keeps technology investment aligned with project delivery instead of reactive break/fix decisions.",
    suggestedService: "StackScore vCIO",
    priority: "low",
    status: "completed",
    estimatedImpactPoints: 3,
    pillarCode: "technology_strategy",
    nextAction: "Prepare Q3 2026 business review materials.",
    effort: "Low",
  },
  {
    key: "technology-roadmap",
    title: "Publish the Technology Improvement Plan",
    description:
      "Translate assessment findings into the approved Pinnacle Engineering 2026 Technology Improvement Plan with phased stabilization, governance, and modernization initiatives.",
    businessImpact:
      "Provides leadership-ready sequencing for investments and helps project teams understand what is changing and why.",
    suggestedService: "Technology Improvement Planning",
    priority: "low",
    status: "completed",
    estimatedImpactPoints: 4,
    pillarCode: "technology_strategy",
    nextAction: "Track living execution plan progress during business reviews.",
    effort: "Medium",
  },
  {
    key: "wireless-segmentation",
    title: "Segment guest and business wireless access",
    description:
      "Separate guest Wi-Fi from staff and project systems using Ubiquiti UniFi equipment and documented VLAN design for both office locations.",
    businessImpact:
      "Reduces lateral movement risk from visitor devices while keeping guest access available for client meetings.",
    suggestedService: "Network Modernization",
    priority: "medium",
    status: "completed",
    estimatedImpactPoints: 3,
    pillarCode: "network_connectivity",
    nextAction: "Validate segmentation during the network monitoring deployment.",
    effort: "Medium",
  },
];
