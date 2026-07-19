import type { DemoIndustryId, DemoProfileBundle } from "@/lib/product-overview/demo-profiles/types";
import type { DemoRecommendation } from "@/lib/product-overview/types";

type IndustryPatch = {
  industryLabel: string;
  summary: string;
  environmentHighlights: string[];
  projectTitles: [string, string, string, string];
  projectDescriptions: [string, string, string, string];
  recommendationTitles: Record<string, string>;
  recommendationWhy: Record<string, string>;
  roadmapTitles: Record<string, string>;
  roadmapDescriptions: Record<string, string>;
  executiveSummary: string[];
  timelineSummaries: Record<string, string>;
  reportTitles: Record<string, string>;
};

const PATCHES: Record<Exclude<DemoIndustryId, "manufacturing">, IndustryPatch> = {
  "professional-services": {
    industryLabel: "Professional Services",
    summary:
      "{{companyName}} supports client delivery teams across multiple offices with growing cloud collaboration, client data protection, and compliance requirements.",
    environmentHighlights: [
      "Microsoft 365 for client delivery and internal operations",
      "Client data protection and retention policies in progress",
      "Hybrid work collaboration across partner and associate teams",
      "Technology governance maturing with executive oversight",
    ],
    projectTitles: [
      "Client Data Protection Program",
      "Microsoft 365 Security Hardening",
      "Practice Management Integration",
      "Technology Policy Standardization",
    ],
    projectDescriptions: [
      "Implement client data classification, retention, and secure sharing controls across {{companyName}} delivery teams.",
      "Harden Microsoft 365 identity, conditional access, and privileged protections for partners and staff.",
      "Connect practice management workflows with executive reporting and technology roadmap visibility.",
      "Standardize acceptable use, device lifecycle, and vendor management policies across offices.",
    ],
    recommendationTitles: {
      "rec-mfa": "Deploy Phishing Resistant MFA for Partners",
      "rec-backup-validation": "Validate Client and Internal Backup Recovery",
      "rec-network-switches": "Refresh Office Network Infrastructure",
      "rec-data-classification": "Define Client Data Classification Policies",
    },
    recommendationWhy: {
      "rec-mfa": "Partner and administrator accounts require stronger identity protection for client data access.",
      "rec-backup-validation": "Client deliverables and internal systems need auditable recovery validation.",
    },
    roadmapTitles: {
      "roadmap-m365-hardening": "Microsoft 365 Security Hardening",
      "roadmap-backup-validation": "Backup Validation Program",
      "roadmap-network-refresh": "Office Network Refresh",
    },
    roadmapDescriptions: {
      "roadmap-m365-hardening": "Protect partner accounts and client collaboration environments with modern identity controls.",
      "roadmap-backup-validation": "Validate recovery for client deliverables and internal systems with documented testing.",
    },
    executiveSummary: [
      "{{companyName}} improved its technology score by 6 points while strengthening client data protection and identity controls.",
      "Two strategic initiatives completed on schedule, improving partner account security and policy consistency.",
      "Technology spending remains disciplined with clear alignment to client delivery priorities.",
      "Executive reporting now provides partners with measurable technology risk visibility.",
    ],
    timelineSummaries: {
      "assessment-2026": "Baseline assessment establishes technology maturity across client delivery and internal operations.",
      "qbr-1": "First quarterly review shows measurable improvement in identity protection and policy standardization.",
    },
    reportTitles: {
      "report-assessment": "Technology Maturity Assessment — Professional Services",
      "report-qbr": "Quarterly Technology Review — Client Delivery Focus",
    },
  },
  healthcare: {
    industryLabel: "Healthcare",
    summary:
      "{{companyName}} operates clinical and administrative locations with HIPAA-aligned technology requirements, EHR integrations, and growing cybersecurity expectations.",
    environmentHighlights: [
      "Clinical and administrative systems across multiple locations",
      "HIPAA-aligned security and access controls in progress",
      "EHR and Microsoft 365 collaboration for care teams",
      "Backup and recovery validation prioritized for patient systems",
    ],
    projectTitles: [
      "HIPAA Security Controls Program",
      "Microsoft 365 Security Hardening",
      "Clinical Backup Validation",
      "Workstation Lifecycle Standardization",
    ],
    projectDescriptions: [
      "Strengthen HIPAA-aligned access controls, audit logging, and security policies across {{companyName}}.",
      "Deploy phishing-resistant MFA and conditional access for clinical and administrative staff.",
      "Centralize backup monitoring and recovery testing for patient-adjacent systems.",
      "Standardize workstation lifecycle and patching across clinical and office environments.",
    ],
    recommendationTitles: {
      "rec-mfa": "Deploy Phishing Resistant MFA for Clinical Staff",
      "rec-backup-validation": "Validate Clinical System Backup Recovery",
      "rec-dr-procedures": "Document Clinical Disaster Recovery Procedures",
    },
    recommendationWhy: {
      "rec-mfa": "Clinical and administrative accounts require stronger identity protection for patient data access.",
      "rec-backup-validation": "Patient-adjacent systems need auditable recovery validation for compliance readiness.",
    },
    roadmapTitles: {
      "roadmap-m365-hardening": "Identity Protection for Care Teams",
      "roadmap-backup-validation": "Clinical Backup Validation",
    },
    roadmapDescriptions: {
      "roadmap-m365-hardening": "Protect clinical and administrative accounts with modern identity and access controls.",
      "roadmap-backup-validation": "Validate recovery readiness for patient-adjacent systems with documented testing.",
    },
    executiveSummary: [
      "{{companyName}} improved technology maturity while strengthening HIPAA-aligned controls and recovery readiness.",
      "Identity protection and backup validation initiatives progressed on schedule with measurable risk reduction.",
      "Technology investments remain aligned with patient care continuity and compliance expectations.",
      "Executive reporting provides leadership with clear visibility into clinical technology risk.",
    ],
    timelineSummaries: {
      "assessment-2026": "Baseline assessment establishes HIPAA-aligned technology maturity priorities.",
      "qbr-1": "Quarterly review shows progress in identity protection and clinical backup validation.",
    },
    reportTitles: {
      "report-assessment": "Technology Maturity Assessment — Healthcare",
      "report-qbr": "Quarterly Technology Review — Clinical Operations",
    },
  },
  construction: {
    industryLabel: "Construction",
    summary:
      "{{companyName}} coordinates field crews, project sites, and corporate operations with mobile workflows, project data, and increasing cybersecurity requirements.",
    environmentHighlights: [
      "Field and office teams using mobile project workflows",
      "Project data stored across cloud and on-site systems",
      "Aging jobsite connectivity and network equipment",
      "Safety and project continuity depend on reliable systems",
    ],
    projectTitles: [
      "Jobsite Connectivity Upgrade",
      "Microsoft 365 Security Hardening",
      "Project Data Backup Validation",
      "Field Device Lifecycle Program",
    ],
    projectDescriptions: [
      "Improve jobsite connectivity and secure network segmentation for {{companyName}} project teams.",
      "Harden Microsoft 365 identity and mobile access for field superintendents and project managers.",
      "Validate backup and recovery for project documentation and estimating systems.",
      "Standardize field device lifecycle, patching, and replacement across active jobsites.",
    ],
    recommendationTitles: {
      "rec-network-switches": "Upgrade Jobsite Network Infrastructure",
      "rec-mfa": "Secure Field Team Mobile Access",
      "rec-endpoint-lifecycle": "Standardize Field Device Lifecycle",
    },
    recommendationWhy: {
      "rec-network-switches": "Jobsite connectivity gaps create project delays and limit secure field access.",
      "rec-mfa": "Field leadership accounts need stronger protection for project and financial data.",
    },
    roadmapTitles: {
      "roadmap-network-refresh": "Jobsite Connectivity Upgrade",
      "roadmap-m365-hardening": "Field Team Identity Protection",
    },
    roadmapDescriptions: {
      "roadmap-network-refresh": "Improve jobsite connectivity and network reliability for active project teams.",
      "roadmap-m365-hardening": "Protect field and office accounts with modern identity controls.",
    },
    executiveSummary: [
      "{{companyName}} improved technology score while strengthening jobsite connectivity and field team security.",
      "Project data protection and device lifecycle initiatives progressed with measurable operational benefit.",
      "Technology spending supports active project delivery without budget overruns.",
      "Executive reporting connects technology investments to project continuity and safety.",
    ],
    timelineSummaries: {
      "assessment-2026": "Baseline assessment prioritizes jobsite connectivity and project data protection.",
      "qbr-1": "Quarterly review shows progress in field team security and backup validation.",
    },
    reportTitles: {
      "report-assessment": "Technology Maturity Assessment — Construction",
      "report-roadmap": "Technology Roadmap — Project Operations",
    },
  },
  distribution: {
    industryLabel: "Distribution",
    summary:
      "{{companyName}} manages warehouse operations, logistics systems, and corporate teams with inventory platforms, mobile workflows, and supply chain continuity requirements.",
    environmentHighlights: [
      "Warehouse and logistics systems across multiple facilities",
      "Inventory and order management platform integrations",
      "Mobile scanning and handheld device workflows",
      "Supply chain continuity depends on reliable infrastructure",
    ],
    projectTitles: [
      "Warehouse Network Refresh",
      "Microsoft 365 Security Hardening",
      "Inventory System Backup Validation",
      "Handheld Device Lifecycle Program",
    ],
    projectDescriptions: [
      "Refresh warehouse network infrastructure to support scanning, inventory, and logistics systems at {{companyName}}.",
      "Harden identity and access controls for warehouse supervisors and corporate teams.",
      "Validate backup and recovery for inventory and order management platforms.",
      "Standardize handheld device lifecycle and patching across warehouse locations.",
    ],
    recommendationTitles: {
      "rec-network-switches": "Refresh Warehouse Network Infrastructure",
      "rec-backup-validation": "Validate Inventory Platform Backup Recovery",
      "rec-endpoint-lifecycle": "Standardize Handheld Device Lifecycle",
    },
    recommendationWhy: {
      "rec-network-switches": "Warehouse network capacity limits scanning throughput and operational visibility.",
      "rec-backup-validation": "Inventory platforms require auditable recovery validation for supply chain continuity.",
    },
    roadmapTitles: {
      "roadmap-network-refresh": "Warehouse Network Refresh",
      "roadmap-backup-validation": "Inventory Platform Backup Validation",
    },
    roadmapDescriptions: {
      "roadmap-network-refresh": "Improve warehouse network reliability for scanning and logistics systems.",
      "roadmap-backup-validation": "Validate recovery readiness for inventory and order management platforms.",
    },
    executiveSummary: [
      "{{companyName}} improved technology maturity while strengthening warehouse connectivity and inventory platform resilience.",
      "Network and backup validation initiatives align with supply chain continuity priorities.",
      "Technology spending remains disciplined across warehouse and corporate operations.",
      "Executive reporting connects technology investments to logistics performance.",
    ],
    timelineSummaries: {
      "assessment-2026": "Baseline assessment prioritizes warehouse infrastructure and inventory platform resilience.",
      "qbr-1": "Quarterly review shows measurable progress in network and backup validation initiatives.",
    },
    reportTitles: {
      "report-assessment": "Technology Maturity Assessment — Distribution",
      "report-budget": "Technology Budget Plan — Logistics Operations",
    },
  },
  engineering: {
    industryLabel: "Engineering",
    summary:
      "{{companyName}} delivers technical design and project work with CAD platforms, client collaboration tools, and intellectual property protection requirements.",
    environmentHighlights: [
      "CAD and engineering design platforms across project teams",
      "Client collaboration and secure file sharing workflows",
      "Project data protection and version control priorities",
      "Hybrid work across design studios and client sites",
    ],
    projectTitles: [
      "Design Data Protection Program",
      "Microsoft 365 Security Hardening",
      "Engineering Backup Validation",
      "CAD Workstation Lifecycle Program",
    ],
    projectDescriptions: [
      "Protect engineering design data, client deliverables, and intellectual property across {{companyName}} teams.",
      "Harden Microsoft 365 identity and secure collaboration for engineers and project managers.",
      "Validate backup and recovery for CAD files and project documentation.",
      "Standardize CAD workstation lifecycle and patching across design teams.",
    ],
    recommendationTitles: {
      "rec-data-classification": "Define Engineering Data Classification Policies",
      "rec-mfa": "Secure Engineer and PM Account Access",
      "rec-backup-validation": "Validate Design Data Backup Recovery",
    },
    recommendationWhy: {
      "rec-data-classification": "Engineering deliverables and IP require consistent classification and access controls.",
      "rec-backup-validation": "CAD and project data need auditable recovery validation for client commitments.",
    },
    roadmapTitles: {
      "roadmap-app-review": "Design Data Protection Program",
      "roadmap-backup-validation": "Engineering Backup Validation",
    },
    roadmapDescriptions: {
      "roadmap-app-review": "Protect engineering design data and client deliverables with classification and access controls.",
      "roadmap-backup-validation": "Validate recovery readiness for CAD files and project documentation.",
    },
    executiveSummary: [
      "{{companyName}} improved technology score while strengthening design data protection and engineer account security.",
      "Project data classification and backup validation initiatives support client delivery commitments.",
      "Technology investments align with intellectual property protection and project continuity.",
      "Executive reporting provides principals with measurable technology risk visibility.",
    ],
    timelineSummaries: {
      "assessment-2026": "Baseline assessment prioritizes design data protection and engineer collaboration security.",
      "qbr-1": "Quarterly review shows progress in data classification and backup validation.",
    },
    reportTitles: {
      "report-assessment": "Technology Maturity Assessment — Engineering",
      "report-phase-proposal": "Phase Proposal — Design Operations",
    },
  },
  "financial-services": {
    industryLabel: "Financial Services",
    summary:
      "{{companyName}} manages client financial data with strict compliance, identity protection, and executive reporting requirements across advisory teams.",
    environmentHighlights: [
      "Client financial data protection and compliance priorities",
      "Microsoft 365 collaboration for advisory teams",
      "Identity protection and audit logging requirements",
      "Executive reporting and technology governance maturing",
    ],
    projectTitles: [
      "Client Data Protection Program",
      "Microsoft 365 Security Hardening",
      "Compliance Backup Validation",
      "Advisor Device Lifecycle Program",
    ],
    projectDescriptions: [
      "Strengthen client data protection, retention, and access controls across {{companyName}} advisory teams.",
      "Deploy phishing-resistant MFA and privileged access controls for advisors and administrators.",
      "Validate backup and recovery for client data systems and compliance archives.",
      "Standardize advisor device lifecycle and patching across offices.",
    ],
    recommendationTitles: {
      "rec-mfa": "Deploy Phishing Resistant MFA for Advisors",
      "rec-data-classification": "Define Client Data Classification Policies",
      "rec-governance-committee": "Establish Technology Governance Committee",
    },
    recommendationWhy: {
      "rec-mfa": "Advisor and administrator accounts require stronger identity protection for client financial data.",
      "rec-governance-committee": "Technology investments need consistent executive oversight and compliance alignment.",
    },
    roadmapTitles: {
      "roadmap-m365-hardening": "Advisor Identity Protection",
      "roadmap-governance-refresh": "Technology Governance Program",
    },
    roadmapDescriptions: {
      "roadmap-m365-hardening": "Protect advisor accounts and client collaboration with modern identity controls.",
      "roadmap-governance-refresh": "Establish executive technology governance aligned with compliance requirements.",
    },
    executiveSummary: [
      "{{companyName}} improved technology maturity while strengthening client data protection and advisor account security.",
      "Governance and identity initiatives progressed with measurable compliance benefit.",
      "Technology spending remains aligned with fiduciary and regulatory expectations.",
      "Executive reporting provides principals with clear technology risk visibility.",
    ],
    timelineSummaries: {
      "assessment-2026": "Baseline assessment establishes compliance-aligned technology maturity priorities.",
      "qbr-1": "Quarterly review shows progress in advisor identity protection and governance.",
    },
    reportTitles: {
      "report-assessment": "Technology Maturity Assessment — Financial Services",
      "report-roadmap-progress": "Roadmap Progress Report — Advisory Operations",
    },
  },
  retail: {
    industryLabel: "Retail",
    summary:
      "{{companyName}} operates store locations and corporate teams with POS systems, inventory platforms, and customer data protection requirements.",
    environmentHighlights: [
      "Store POS and inventory systems across multiple locations",
      "Customer data protection and PCI-aligned controls",
      "Corporate and store team collaboration in Microsoft 365",
      "Seasonal traffic drives infrastructure and security priorities",
    ],
    projectTitles: [
      "Store Network Refresh",
      "Microsoft 365 Security Hardening",
      "POS Backup Validation Program",
      "Store Device Lifecycle Program",
    ],
    projectDescriptions: [
      "Refresh store network infrastructure to support POS, inventory, and guest Wi-Fi at {{companyName}} locations.",
      "Harden identity and access controls for store managers and corporate teams.",
      "Validate backup and recovery for POS and inventory platforms.",
      "Standardize store device lifecycle and patching across retail locations.",
    ],
    recommendationTitles: {
      "rec-network-switches": "Refresh Store Network Infrastructure",
      "rec-mfa": "Secure Store Manager Account Access",
      "rec-backup-validation": "Validate POS Backup Recovery",
    },
    recommendationWhy: {
      "rec-network-switches": "Store network reliability directly impacts POS uptime and customer experience.",
      "rec-backup-validation": "POS and inventory platforms require auditable recovery validation.",
    },
    roadmapTitles: {
      "roadmap-network-refresh": "Store Network Refresh",
      "roadmap-backup-validation": "POS Backup Validation Program",
    },
    roadmapDescriptions: {
      "roadmap-network-refresh": "Improve store network reliability for POS and inventory systems.",
      "roadmap-backup-validation": "Validate recovery readiness for POS and inventory platforms.",
    },
    executiveSummary: [
      "{{companyName}} improved technology score while strengthening store connectivity and POS resilience.",
      "Network and backup validation initiatives support seasonal operations and customer experience.",
      "Technology spending remains disciplined across store and corporate operations.",
      "Executive reporting connects technology investments to retail performance.",
    ],
    timelineSummaries: {
      "assessment-2026": "Baseline assessment prioritizes store infrastructure and POS resilience.",
      "qbr-1": "Quarterly review shows progress in store network and backup validation initiatives.",
    },
    reportTitles: {
      "report-assessment": "Technology Maturity Assessment — Retail",
      "report-qbr": "Quarterly Technology Review — Store Operations",
    },
  },
};

function patchProjects(profile: DemoProfileBundle, patch: IndustryPatch, companyName: string) {
  profile.dashboard.projects = profile.dashboard.projects.map((project, index) => {
    const title = patch.projectTitles[index] ?? project.title;
    const description = (patch.projectDescriptions[index] ?? project.description).replaceAll(
      "{{companyName}}",
      companyName,
    );
    return { ...project, title, description };
  });
}

function patchRecommendations(profile: DemoProfileBundle, patch: IndustryPatch) {
  profile.recommendations = profile.recommendations.map((rec) => patchRecommendation(rec, patch));
  profile.dashboard.recommendations = profile.recommendations;
}

function patchRecommendation(rec: DemoRecommendation, patch: IndustryPatch): DemoRecommendation {
  return {
    ...rec,
    title: patch.recommendationTitles[rec.id] ?? rec.title,
    whyItMatters: patch.recommendationWhy[rec.id] ?? rec.whyItMatters,
  };
}

function patchRoadmap(profile: DemoProfileBundle, patch: IndustryPatch) {
  profile.roadmapInitiatives = profile.roadmapInitiatives.map((item) => ({
    ...item,
    title: patch.roadmapTitles[item.id] ?? item.title,
    description: patch.roadmapDescriptions[item.id] ?? item.description,
  }));
  profile.dashboard.roadmapInitiatives = profile.roadmapInitiatives;
}

function patchExecutiveContent(profile: DemoProfileBundle, patch: IndustryPatch, companyName: string) {
  profile.executiveReview = {
    ...profile.executiveReview,
    executiveSummary: patch.executiveSummary.map((line) => line.replaceAll("{{companyName}}", companyName)),
  };
  profile.dashboard.quarterlyReview = {
    ...profile.dashboard.quarterlyReview,
    executiveSummary: profile.executiveReview.executiveSummary.slice(0, 4),
  };
}

function patchTimeline(profile: DemoProfileBundle, patch: IndustryPatch) {
  profile.timelineSnapshots = profile.timelineSnapshots.map((snapshot) => ({
    ...snapshot,
    summary: patch.timelineSummaries[snapshot.id] ?? snapshot.summary,
  }));
}

function patchReports(profile: DemoProfileBundle, patch: IndustryPatch) {
  profile.executiveReports = profile.executiveReports.map((report) => ({
    ...report,
    title: patch.reportTitles[report.id] ?? report.title,
  }));
}

export function applyIndustryPatch(
  baseProfile: DemoProfileBundle,
  industryId: DemoIndustryId,
  companyName: string,
): DemoProfileBundle {
  if (industryId === "manufacturing") {
    return structuredClone(baseProfile);
  }

  const patch = PATCHES[industryId];
  const profile = structuredClone(baseProfile) as DemoProfileBundle;
  profile.id = industryId;
  profile.label = patch.industryLabel;

  profile.dashboard.organization = {
    ...profile.dashboard.organization,
    name: companyName,
    industry: patch.industryLabel,
    summary: patch.summary.replaceAll("{{companyName}}", companyName),
    environmentHighlights: patch.environmentHighlights,
  };

  patchProjects(profile, patch, companyName);
  patchRecommendations(profile, patch);
  patchRoadmap(profile, patch);
  patchExecutiveContent(profile, patch, companyName);
  patchTimeline(profile, patch);
  patchReports(profile, patch);

  return profile;
}
