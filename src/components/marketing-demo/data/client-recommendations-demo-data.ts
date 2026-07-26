/**
 * Sanitized client-facing fixture for RecommendationsWorkspaceDemo.
 * No consultant notes, pricing, margins, or production records.
 */

export type DemoRecommendationPriority = "critical" | "high" | "medium" | "low";

export type DemoRecommendationStatus = "open" | "accepted" | "in_progress" | "planned";

export type DemoRecommendationType =
  | "security"
  | "operations"
  | "continuity"
  | "governance"
  | "endpoint";

export type ClientRecommendationsDemoItem = {
  id: string;
  title: string;
  priority: DemoRecommendationPriority;
  status: DemoRecommendationStatus;
  recommendationType: DemoRecommendationType;
  pillar: string;
  whyThisMatters: string;
  businessImpact: string;
  expectedOutcome: string;
  estimatedMaturityImprovement: number;
  latestAssessment: string;
  triggerEvidence: string;
  suggestedService: string;
  implementationPhase: string;
  businessOutcome: string;
  recommendedNextStep: string;
};

export type ClientRecommendationsDemoData = {
  clientName: string;
  clientStatus: string;
  pageTitle: string;
  pageSubtitle: string;
  navigation: Array<{ id: string; label: string }>;
  activeNavId: string;
  pillars: string[];
  recommendationTypes: Array<{ id: DemoRecommendationType | "all"; label: string }>;
  recommendations: ClientRecommendationsDemoItem[];
};

export const clientRecommendationsDemoData: ClientRecommendationsDemoData = {
  clientName: "Acme Inc.",
  clientStatus: "Active",
  pageTitle: "Recommendations",
  pageSubtitle: "Client-level improvement opportunities across assessments.",
  activeNavId: "recommendations",
  navigation: [
    { id: "overview", label: "Overview" },
    { id: "journey", label: "Technology Journey" },
    { id: "roadmap", label: "Roadmap" },
    { id: "projects", label: "Projects" },
    { id: "assessments", label: "Assessments" },
    { id: "recommendations", label: "Recommendations" },
    { id: "assets", label: "Technology Stack" },
    { id: "documents", label: "Documents" },
    { id: "contacts", label: "Contacts" },
    { id: "billing", label: "Billing" },
    { id: "executive-reports", label: "Executive Reports" },
    { id: "risks", label: "Risks" },
    { id: "activity", label: "Activity" },
  ],
  pillars: [
    "Cybersecurity",
    "Infrastructure",
    "Business Continuity",
    "Applications & Data",
    "People & Process",
    "Strategy & Governance",
  ],
  recommendationTypes: [
    { id: "all", label: "All types" },
    { id: "security", label: "Security" },
    { id: "endpoint", label: "Endpoint" },
    { id: "operations", label: "Operations" },
    { id: "continuity", label: "Continuity" },
    { id: "governance", label: "Governance" },
  ],
  recommendations: [
    {
      id: "rec-mdm",
      title: "Implement centralized endpoint management",
      priority: "critical",
      status: "open",
      recommendationType: "endpoint",
      pillar: "Infrastructure",
      whyThisMatters:
        "Devices are managed inconsistently, which increases support effort and leaves security controls uneven across the organization.",
      businessImpact:
        "A single management standard reduces preventable risk and shortens time-to-resolution when issues occur.",
      expectedOutcome:
        "All company workstations enrolled with patching, encryption, and remote support baselines.",
      estimatedMaturityImprovement: 8,
      latestAssessment: "Q2 Technology Maturity Assessment",
      triggerEvidence:
        "Assessment responses indicated mixed local admin practices and incomplete device inventory coverage.",
      suggestedService: "Managed Endpoint Platform",
      implementationPhase: "Stabilize",
      businessOutcome: "Predictable device security and lower operational friction for staff.",
      recommendedNextStep: "Start a discovery project to confirm device inventory and enrollment path.",
    },
    {
      id: "rec-mfa",
      title: "Enable MFA across privileged accounts",
      priority: "critical",
      status: "accepted",
      recommendationType: "security",
      pillar: "Cybersecurity",
      whyThisMatters:
        "Privileged accounts without MFA remain a primary path for account takeover and business email compromise.",
      businessImpact:
        "Protects finance, email, and administrative systems from credential-based attacks.",
      expectedOutcome: "MFA enforced for administrators and all privileged identity roles.",
      estimatedMaturityImprovement: 7,
      latestAssessment: "Q2 Technology Maturity Assessment",
      triggerEvidence:
        "Privileged access controls were reported as partially implemented without consistent MFA enforcement.",
      suggestedService: "Identity & Access Hardening",
      implementationPhase: "Stabilize",
      businessOutcome: "Material reduction in unauthorized access risk for critical systems.",
      recommendedNextStep: "Review privileged account inventory and schedule MFA rollout.",
    },
    {
      id: "rec-backup",
      title: "Modernize backup strategy",
      priority: "high",
      status: "open",
      recommendationType: "continuity",
      pillar: "Business Continuity",
      whyThisMatters:
        "Backup coverage exists, but restore confidence and retention alignment with business needs are unclear.",
      businessImpact:
        "Verified recovery capability protects revenue and operations during outages or ransomware events.",
      expectedOutcome: "Documented recovery objectives with tested restore procedures.",
      estimatedMaturityImprovement: 6,
      latestAssessment: "Q2 Technology Maturity Assessment",
      triggerEvidence:
        "Restore testing cadence and recovery ownership were not confirmed during the assessment.",
      suggestedService: "Backup & Recovery Validation",
      implementationPhase: "Stabilize",
      businessOutcome: "Leadership can trust recovery timelines when disruption occurs.",
      recommendedNextStep: "Schedule a restore test for a business-critical workload.",
    },
    {
      id: "rec-firewall",
      title: "Replace unsupported firewall",
      priority: "high",
      status: "in_progress",
      recommendationType: "security",
      pillar: "Infrastructure",
      whyThisMatters:
        "Unsupported edge security hardware increases exposure and limits modern threat protections.",
      businessImpact:
        "Modern network perimeter controls reduce downtime risk and strengthen compliance posture.",
      expectedOutcome: "Supported firewall platform with monitoring and change controls in place.",
      estimatedMaturityImprovement: 5,
      latestAssessment: "Q2 Technology Maturity Assessment",
      triggerEvidence:
        "Current firewall platform was identified as end-of-support with limited logging visibility.",
      suggestedService: "Network Security Refresh",
      implementationPhase: "Strengthen",
      businessOutcome: "Stable perimeter defense aligned with current security expectations.",
      recommendedNextStep: "Finalize cutover window and communication plan for stakeholders.",
    },
    {
      id: "rec-provisioning",
      title: "Standardize workstation provisioning",
      priority: "high",
      status: "open",
      recommendationType: "endpoint",
      pillar: "People & Process",
      whyThisMatters:
        "Ad-hoc device setup creates inconsistent configurations and slows onboarding for new hires.",
      businessImpact:
        "Standard provisioning improves employee readiness and keeps security baselines consistent from day one.",
      expectedOutcome: "Repeatable workstation image and onboarding checklist for every new device.",
      estimatedMaturityImprovement: 4,
      latestAssessment: "Q2 Technology Maturity Assessment",
      triggerEvidence:
        "Provisioning steps varied by technician and were not documented as a single standard.",
      suggestedService: "Endpoint Standardization",
      implementationPhase: "Strengthen",
      businessOutcome: "Faster onboarding with fewer configuration-related support tickets.",
      recommendedNextStep: "Approve a standard workstation build and onboarding checklist.",
    },
    {
      id: "rec-reviews",
      title: "Implement quarterly technology reviews",
      priority: "medium",
      status: "planned",
      recommendationType: "governance",
      pillar: "Strategy & Governance",
      whyThisMatters:
        "Without a recurring executive cadence, priorities drift and maturity gains are harder to sustain.",
      businessImpact:
        "Quarterly reviews keep technology investment aligned with business goals and measurable progress.",
      expectedOutcome: "Scheduled reviews with score tracking, roadmap status, and decision ownership.",
      estimatedMaturityImprovement: 4,
      latestAssessment: "Q2 Technology Maturity Assessment",
      triggerEvidence:
        "Technology planning was described as reactive rather than governed through a recurring review cycle.",
      suggestedService: "vCIO Quarterly Review",
      implementationPhase: "Optimize",
      businessOutcome: "Clear leadership visibility into risk, progress, and next-quarter priorities.",
      recommendedNextStep: "Reserve the first quarterly review date with executive sponsors.",
    },
    {
      id: "rec-patching",
      title: "Improve patch management",
      priority: "high",
      status: "open",
      recommendationType: "operations",
      pillar: "Cybersecurity",
      whyThisMatters:
        "Inconsistent patching leaves known vulnerabilities open longer than necessary.",
      businessImpact:
        "A disciplined patch process reduces exploit risk and stabilizes production systems.",
      expectedOutcome: "Defined patch windows, reporting, and exception handling for critical systems.",
      estimatedMaturityImprovement: 5,
      latestAssessment: "Q2 Technology Maturity Assessment",
      triggerEvidence:
        "Patch cadence and exception tracking were incomplete across servers and endpoints.",
      suggestedService: "Managed Patch Operations",
      implementationPhase: "Strengthen",
      businessOutcome: "Lower exposure from known vulnerabilities across the environment.",
      recommendedNextStep: "Confirm critical systems list and approve maintenance windows.",
    },
    {
      id: "rec-m365",
      title: "Strengthen Microsoft 365 security",
      priority: "medium",
      status: "accepted",
      recommendationType: "security",
      pillar: "Cybersecurity",
      whyThisMatters:
        "Collaboration platforms are a frequent entry point for phishing and data exposure.",
      businessImpact:
        "Hardened Microsoft 365 controls protect email, files, and identity without slowing the business.",
      expectedOutcome: "Security baseline policies, anti-phishing controls, and mailbox auditing enabled.",
      estimatedMaturityImprovement: 5,
      latestAssessment: "Q2 Technology Maturity Assessment",
      triggerEvidence:
        "Microsoft 365 security defaults and anti-phishing policies were only partially configured.",
      suggestedService: "Microsoft 365 Security Baseline",
      implementationPhase: "Strengthen",
      businessOutcome: "Reduced likelihood of successful phishing and accidental data sharing.",
      recommendedNextStep: "Review recommended security baseline and approve policy changes.",
    },
    {
      id: "rec-docs",
      title: "Standardize documentation",
      priority: "medium",
      status: "open",
      recommendationType: "operations",
      pillar: "People & Process",
      whyThisMatters:
        "Critical environment knowledge is fragmented, increasing dependency on individual staff members.",
      businessImpact:
        "Shared documentation improves continuity, onboarding, and incident response quality.",
      expectedOutcome: "Core runbooks and environment documentation maintained in a single standard location.",
      estimatedMaturityImprovement: 3,
      latestAssessment: "Q2 Technology Maturity Assessment",
      triggerEvidence:
        "Key procedures for recovery, access, and network changes were not centrally documented.",
      suggestedService: "Documentation Acceleration",
      implementationPhase: "Optimize",
      businessOutcome: "Less operational risk when staff change or urgent issues arise.",
      recommendedNextStep: "Identify the top five procedures to document first.",
    },
    {
      id: "rec-governance",
      title: "Introduce strategic technology governance",
      priority: "low",
      status: "planned",
      recommendationType: "governance",
      pillar: "Strategy & Governance",
      whyThisMatters:
        "Technology decisions are made without a consistent ownership model or decision framework.",
      businessImpact:
        "Governance creates accountability and keeps initiatives tied to measurable business outcomes.",
      expectedOutcome: "Defined decision rights, intake process, and success measures for major initiatives.",
      estimatedMaturityImprovement: 4,
      latestAssessment: "Q2 Technology Maturity Assessment",
      triggerEvidence:
        "Stakeholders reported unclear ownership for prioritization and technology investment decisions.",
      suggestedService: "Technology Governance Framework",
      implementationPhase: "Optimize",
      businessOutcome: "A scalable foundation for prioritizing and measuring technology investments.",
      recommendedNextStep: "Draft a simple RACI for technology decisions with executive sponsors.",
    },
  ],
};
