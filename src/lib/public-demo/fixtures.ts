/**
 * SS-WEB-003 — Deterministic fictional Northstar Manufacturing fixtures.
 * No production customer records. IDs use the demo- prefix only.
 */

import type { Priority, ProjectStatus, RecommendationStatus } from "@/generated/prisma/client";
import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";
import { PUBLIC_DEMO_ID_PREFIX } from "@/lib/public-demo/constants";

export type DemoOpportunityFixture = {
  id: string;
  title: string;
  priority: Priority;
  status: RecommendationStatus;
  pillarCode: TechnologyPillarCode;
  finding: string;
  recommendedAction: string;
  expectedOutcome: string;
  businessImpact: string;
  complexity: "Easy" | "Moderate" | "Complex";
};

export type DemoControlFixture = {
  questionCode: string;
  questionText: string;
  answerText: string;
  resultKind: "satisfied" | "partial" | "unsatisfied" | "excluded";
  resultLabel:
    | "Satisfied"
    | "Partially satisfied"
    | "Not satisfied"
    | "Excluded from scoring";
  isCritical: boolean;
};

export type DemoProjectTaskFixture = {
  id: string;
  title: string;
  description: string | null;
  status: "not_started" | "in_progress" | "completed";
  dueDate: string | null;
  completedAt: string | null;
};

export type DemoProjectMilestoneFixture = {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  completedAt: string | null;
};

export type DemoProjectFixture = {
  id: string;
  title: string;
  status: ProjectStatus;
  priority: Priority;
  description: string;
  pillarCode: TechnologyPillarCode;
  startDate: string | null;
  targetCompletionDate: string | null;
  completedAt: string | null;
  opportunityId: string;
  phaseId: string;
  phaseName: string;
  tasks: DemoProjectTaskFixture[];
  milestones: DemoProjectMilestoneFixture[];
  activity: Array<{
    id: string;
    title: string;
    description: string | null;
    occurredAt: string;
    eventType:
      | "project_task_completed"
      | "project_milestone_completed"
      | "project_started"
      | "project_status_changed";
  }>;
};

export type DemoInitiativeFixture = {
  id: string;
  title: string;
  priority: Priority;
  status: RecommendationStatus;
  pillarCode: TechnologyPillarCode;
  opportunityId: string;
  phaseId: string;
  phaseName: string;
  implementationNotes: string;
  businessImpact: string;
};

export type DemoPhaseFixture = {
  id: string;
  name: string;
  subtitle: string;
  purpose: string;
  timeline: string;
  status: "completed" | "in_progress" | "planned";
  statusLabel: string;
  isCurrent: boolean;
};

function demoId(suffix: string): string {
  return `${PUBLIC_DEMO_ID_PREFIX}${suffix}`;
}

export const DEMO_OPPORTUNITIES: DemoOpportunityFixture[] = [
  {
    id: demoId("opp-identity-governance"),
    title: "Strengthen Microsoft 365 identity governance",
    priority: "critical",
    status: "in_progress",
    pillarCode: "identity_access",
    finding:
      "Privileged Microsoft 365 accounts do not consistently enforce MFA and periodic access reviews.",
    recommendedAction:
      "Enable conditional access MFA for all privileged roles and schedule quarterly access reviews.",
    expectedOutcome:
      "Reduced account-compromise risk and clearer evidence for cyber-insurance readiness.",
    businessImpact:
      "Limits blast radius from credential theft against finance and production systems.",
    complexity: "Moderate",
  },
  {
    id: demoId("opp-backup-validation"),
    title: "Validate backup recovery for critical systems",
    priority: "high",
    status: "accepted",
    pillarCode: "data_protection_recovery",
    finding:
      "Backup jobs run nightly, but recovery testing is informal and undocumented.",
    recommendedAction:
      "Establish monthly restore tests with documented recovery-time evidence for ERP and file shares.",
    expectedOutcome:
      "Provable recovery readiness during audits and incidents.",
    businessImpact:
      "Shortens downtime decisions when production data is unavailable.",
    complexity: "Moderate",
  },
  {
    id: demoId("opp-documentation"),
    title: "Modernize environment documentation",
    priority: "high",
    status: "open",
    pillarCode: "documentation_knowledge",
    finding:
      "Network diagrams, vendor contacts, and change history are incomplete or outdated.",
    recommendedAction:
      "Build a living documentation baseline covering identity, network, backup, and vendor runbooks.",
    expectedOutcome:
      "Another trusted technician can support the environment without tribal knowledge.",
    businessImpact:
      "Reduces support delay and onboarding friction for managed services.",
    complexity: "Easy",
  },
  {
    id: demoId("opp-security-monitoring"),
    title: "Expand security monitoring coverage",
    priority: "high",
    status: "open",
    pillarCode: "security_operations",
    finding:
      "Endpoint alerts exist, but correlation and after-hours response expectations are unclear.",
    recommendedAction:
      "Define monitoring coverage, alert triage ownership, and escalation paths for production systems.",
    expectedOutcome:
      "Faster detection and clearer response accountability.",
    businessImpact:
      "Improves incident readiness without requiring an enterprise SOC build-out.",
    complexity: "Complex",
  },
  {
    id: demoId("opp-network-lifecycle"),
    title: "Refresh aging plant-floor network gear",
    priority: "medium",
    status: "open",
    pillarCode: "network_connectivity",
    finding:
      "Core switching and Wi-Fi hardware are beyond recommended lifecycle at the production site.",
    recommendedAction:
      "Plan a phased Ubiquiti refresh tied to production windows and segmented guest access.",
    expectedOutcome:
      "More reliable connectivity for production systems and visitors.",
    businessImpact:
      "Lowers unplanned downtime risk on the plant floor.",
    complexity: "Complex",
  },
  {
    id: demoId("opp-strategy-cadence"),
    title: "Establish quarterly technology steering",
    priority: "medium",
    status: "accepted",
    pillarCode: "technology_strategy",
    finding:
      "Technology priorities exist but lack a recurring executive review cadence.",
    recommendedAction:
      "Stand up a quarterly steering agenda linking StackScore priorities to business decisions.",
    expectedOutcome:
      "Clearer improvement sequencing and accountable ownership.",
    businessImpact:
      "Keeps technology priorities aligned to manufacturing growth goals.",
    complexity: "Easy",
  },
];

export const DEMO_PHASES: DemoPhaseFixture[] = [
  {
    id: demoId("phase-stabilize"),
    name: "Stabilize",
    subtitle: "Critical risk reduction",
    purpose: "Close urgent identity and recovery gaps that create immediate operational exposure.",
    timeline: "0–60 days",
    status: "in_progress",
    statusLabel: "In progress",
    isCurrent: true,
  },
  {
    id: demoId("phase-strengthen"),
    name: "Strengthen",
    subtitle: "Operational consistency",
    purpose: "Standardize documentation, monitoring, and network lifecycle planning.",
    timeline: "60–150 days",
    status: "planned",
    statusLabel: "Planned",
    isCurrent: false,
  },
  {
    id: demoId("phase-optimize"),
    name: "Optimize",
    subtitle: "Strategic cadence",
    purpose: "Embed quarterly steering and continuous improvement against StackScore.",
    timeline: "150–240 days",
    status: "planned",
    statusLabel: "Planned",
    isCurrent: false,
  },
];

export const DEMO_INITIATIVES: DemoInitiativeFixture[] = [
  {
    id: demoId("init-identity"),
    title: "Identity governance hardening",
    priority: "critical",
    status: "in_progress",
    pillarCode: "identity_access",
    opportunityId: demoId("opp-identity-governance"),
    phaseId: demoId("phase-stabilize"),
    phaseName: "Stabilize",
    implementationNotes:
      "Conditional access policies roll out in waves for privileged roles first.",
    businessImpact:
      "Reduces credential-theft exposure against finance and ERP access.",
  },
  {
    id: demoId("init-backup"),
    title: "Backup recovery validation",
    priority: "high",
    status: "accepted",
    pillarCode: "data_protection_recovery",
    opportunityId: demoId("opp-backup-validation"),
    phaseId: demoId("phase-stabilize"),
    phaseName: "Stabilize",
    implementationNotes:
      "Monthly restore evidence will be stored with the executive report package.",
    businessImpact:
      "Makes recovery readiness auditable for leadership and insurers.",
  },
  {
    id: demoId("init-docs"),
    title: "Documentation modernization",
    priority: "high",
    status: "open",
    pillarCode: "documentation_knowledge",
    opportunityId: demoId("opp-documentation"),
    phaseId: demoId("phase-strengthen"),
    phaseName: "Strengthen",
    implementationNotes:
      "Focus first on identity, network, backup, and vendor contact runbooks.",
    businessImpact:
      "Removes tribal knowledge dependencies for day-to-day support.",
  },
  {
    id: demoId("init-monitoring"),
    title: "Security monitoring coverage",
    priority: "high",
    status: "open",
    pillarCode: "security_operations",
    opportunityId: demoId("opp-security-monitoring"),
    phaseId: demoId("phase-strengthen"),
    phaseName: "Strengthen",
    implementationNotes:
      "Define alert ownership before expanding tooling footprint.",
    businessImpact:
      "Improves detection without overbuilding an enterprise SOC.",
  },
  {
    id: demoId("init-steering"),
    title: "Quarterly technology steering",
    priority: "medium",
    status: "accepted",
    pillarCode: "technology_strategy",
    opportunityId: demoId("opp-strategy-cadence"),
    phaseId: demoId("phase-optimize"),
    phaseName: "Optimize",
    implementationNotes:
      "Use StackScore priorities as the standing agenda for each review.",
    businessImpact:
      "Connects maturity gaps to funded decisions.",
  },
];

export const DEMO_PROJECTS: DemoProjectFixture[] = [
  {
    id: demoId("proj-identity"),
    title: "Identity Governance Improvement",
    status: "in_progress",
    priority: "critical",
    description:
      "Harden Microsoft 365 privileged access with MFA enforcement and recurring access reviews.",
    pillarCode: "identity_access",
    startDate: "2026-08-01T00:00:00.000Z",
    targetCompletionDate: "2026-10-31T00:00:00.000Z",
    completedAt: null,
    opportunityId: demoId("opp-identity-governance"),
    phaseId: demoId("phase-stabilize"),
    phaseName: "Stabilize",
    tasks: [
      {
        id: demoId("task-id-1"),
        title: "Inventory privileged Microsoft 365 roles",
        description: "Confirm global admin and role-admin accounts.",
        status: "completed",
        dueDate: "2026-08-15T00:00:00.000Z",
        completedAt: "2026-08-12T00:00:00.000Z",
      },
      {
        id: demoId("task-id-2"),
        title: "Enable conditional access MFA for privileged roles",
        description: null,
        status: "completed",
        dueDate: "2026-09-01T00:00:00.000Z",
        completedAt: "2026-08-28T00:00:00.000Z",
      },
      {
        id: demoId("task-id-3"),
        title: "Pilot quarterly access review workflow",
        description: null,
        status: "in_progress",
        dueDate: "2026-10-15T00:00:00.000Z",
        completedAt: null,
      },
      {
        id: demoId("task-id-4"),
        title: "Document break-glass account procedures",
        description: null,
        status: "not_started",
        dueDate: "2026-10-31T00:00:00.000Z",
        completedAt: null,
      },
    ],
    milestones: [
      {
        id: demoId("ms-id-1"),
        title: "Privileged MFA enforced",
        description: null,
        targetDate: "2026-09-01T00:00:00.000Z",
        completedAt: "2026-08-28T00:00:00.000Z",
      },
      {
        id: demoId("ms-id-2"),
        title: "First access review completed",
        description: null,
        targetDate: "2026-10-20T00:00:00.000Z",
        completedAt: null,
      },
    ],
    activity: [
      {
        id: demoId("act-id-1"),
        title: "Project started",
        description: "Identity governance improvement kicked off.",
        occurredAt: "2026-08-01T15:00:00.000Z",
        eventType: "project_started",
      },
      {
        id: demoId("act-id-2"),
        title: "Task completed",
        description: "Privileged role inventory finished.",
        occurredAt: "2026-08-12T18:00:00.000Z",
        eventType: "project_task_completed",
      },
      {
        id: demoId("act-id-3"),
        title: "Milestone completed",
        description: "Privileged MFA enforced.",
        occurredAt: "2026-08-28T17:30:00.000Z",
        eventType: "project_milestone_completed",
      },
    ],
  },
  {
    id: demoId("proj-backup"),
    title: "Backup Recovery Validation",
    status: "scheduled",
    priority: "high",
    description:
      "Establish documented restore tests for ERP and shared file data.",
    pillarCode: "data_protection_recovery",
    startDate: "2026-10-01T00:00:00.000Z",
    targetCompletionDate: "2026-11-30T00:00:00.000Z",
    completedAt: null,
    opportunityId: demoId("opp-backup-validation"),
    phaseId: demoId("phase-stabilize"),
    phaseName: "Stabilize",
    tasks: [
      {
        id: demoId("task-bk-1"),
        title: "Confirm backup coverage for ERP and file shares",
        description: null,
        status: "completed",
        dueDate: "2026-10-05T00:00:00.000Z",
        completedAt: "2026-10-03T00:00:00.000Z",
      },
      {
        id: demoId("task-bk-2"),
        title: "Run first documented restore test",
        description: null,
        status: "not_started",
        dueDate: "2026-10-20T00:00:00.000Z",
        completedAt: null,
      },
      {
        id: demoId("task-bk-3"),
        title: "Publish recovery evidence package",
        description: null,
        status: "not_started",
        dueDate: "2026-11-15T00:00:00.000Z",
        completedAt: null,
      },
    ],
    milestones: [
      {
        id: demoId("ms-bk-1"),
        title: "Coverage confirmed",
        description: null,
        targetDate: "2026-10-05T00:00:00.000Z",
        completedAt: "2026-10-03T00:00:00.000Z",
      },
      {
        id: demoId("ms-bk-2"),
        title: "Restore evidence published",
        description: null,
        targetDate: "2026-11-15T00:00:00.000Z",
        completedAt: null,
      },
    ],
    activity: [
      {
        id: demoId("act-bk-1"),
        title: "Status changed",
        description: "Moved to scheduled delivery.",
        occurredAt: "2026-09-20T16:00:00.000Z",
        eventType: "project_status_changed",
      },
      {
        id: demoId("act-bk-2"),
        title: "Task completed",
        description: "Backup coverage confirmed.",
        occurredAt: "2026-10-03T19:00:00.000Z",
        eventType: "project_task_completed",
      },
    ],
  },
  {
    id: demoId("proj-docs"),
    title: "Technology Documentation Modernization",
    status: "approved",
    priority: "high",
    description:
      "Create a living documentation baseline for identity, network, backup, and vendors.",
    pillarCode: "documentation_knowledge",
    startDate: null,
    targetCompletionDate: "2026-12-15T00:00:00.000Z",
    completedAt: null,
    opportunityId: demoId("opp-documentation"),
    phaseId: demoId("phase-strengthen"),
    phaseName: "Strengthen",
    tasks: [],
    milestones: [
      {
        id: demoId("ms-doc-1"),
        title: "Documentation outline approved",
        description: null,
        targetDate: "2026-11-01T00:00:00.000Z",
        completedAt: null,
      },
    ],
    activity: [
      {
        id: demoId("act-doc-1"),
        title: "Status changed",
        description: "Project approved for upcoming phase.",
        occurredAt: "2026-09-18T14:00:00.000Z",
        eventType: "project_status_changed",
      },
    ],
  },
];

const RESULT = {
  satisfied: {
    resultKind: "satisfied" as const,
    resultLabel: "Satisfied" as const,
  },
  partial: {
    resultKind: "partial" as const,
    resultLabel: "Partially satisfied" as const,
  },
  unsatisfied: {
    resultKind: "unsatisfied" as const,
    resultLabel: "Not satisfied" as const,
  },
  excluded: {
    resultKind: "excluded" as const,
    resultLabel: "Excluded from scoring" as const,
  },
};

export const DEMO_PILLAR_CONTROLS: Record<TechnologyPillarCode, DemoControlFixture[]> = {
  identity_access: [
    {
      questionCode: "IA-01",
      questionText: "Are privileged accounts protected with multi-factor authentication?",
      answerText: "Partially",
      ...RESULT.partial,
      isCritical: true,
    },
    {
      questionCode: "IA-02",
      questionText: "Are user access rights reviewed on a defined cadence?",
      answerText: "No",
      ...RESULT.unsatisfied,
      isCritical: false,
    },
    {
      questionCode: "IA-03",
      questionText: "Is there a documented joiners/movers/leavers process?",
      answerText: "Yes",
      ...RESULT.satisfied,
      isCritical: false,
    },
    {
      questionCode: "IA-04",
      questionText: "Are shared generic admin accounts avoided?",
      answerText: "Partially",
      ...RESULT.partial,
      isCritical: false,
    },
  ],
  endpoint_management: [
    {
      questionCode: "EM-01",
      questionText: "Are company endpoints enrolled in centralized management?",
      answerText: "Yes",
      ...RESULT.satisfied,
      isCritical: false,
    },
    {
      questionCode: "EM-02",
      questionText: "Are security patches applied within an approved window?",
      answerText: "Yes",
      ...RESULT.satisfied,
      isCritical: false,
    },
    {
      questionCode: "EM-03",
      questionText: "Is endpoint disk encryption enforced for portable devices?",
      answerText: "Yes",
      ...RESULT.satisfied,
      isCritical: false,
    },
    {
      questionCode: "EM-04",
      questionText: "Are unsupported operating systems tracked and remediating?",
      answerText: "Partially",
      ...RESULT.partial,
      isCritical: false,
    },
  ],
  network_connectivity: [
    {
      questionCode: "NC-01",
      questionText: "Is guest wireless segmented from production networks?",
      answerText: "Yes",
      ...RESULT.satisfied,
      isCritical: false,
    },
    {
      questionCode: "NC-02",
      questionText: "Is core switching within supported lifecycle?",
      answerText: "No",
      ...RESULT.unsatisfied,
      isCritical: false,
    },
    {
      questionCode: "NC-03",
      questionText: "Are firewall change reviews documented?",
      answerText: "Partially",
      ...RESULT.partial,
      isCritical: false,
    },
    {
      questionCode: "NC-04",
      questionText: "Is site-to-cloud connectivity monitored for availability?",
      answerText: "Yes",
      ...RESULT.satisfied,
      isCritical: false,
    },
  ],
  data_protection_recovery: [
    {
      questionCode: "DP-01",
      questionText: "Do critical systems have automated backups?",
      answerText: "Yes",
      ...RESULT.satisfied,
      isCritical: false,
    },
    {
      questionCode: "DP-02",
      questionText: "Are restore tests performed and documented?",
      answerText: "Partially",
      ...RESULT.partial,
      isCritical: true,
    },
    {
      questionCode: "DP-03",
      questionText: "Are backup failure alerts reviewed daily?",
      answerText: "Yes",
      ...RESULT.satisfied,
      isCritical: false,
    },
    {
      questionCode: "DP-04",
      questionText: "Is ransomware-resistant backup retention defined?",
      answerText: "Partially",
      ...RESULT.partial,
      isCritical: false,
    },
  ],
  productivity_collaboration: [
    {
      questionCode: "PC-01",
      questionText: "Is Microsoft 365 used as the primary collaboration platform?",
      answerText: "Yes",
      ...RESULT.satisfied,
      isCritical: false,
    },
    {
      questionCode: "PC-02",
      questionText: "Are external sharing defaults reviewed?",
      answerText: "Partially",
      ...RESULT.partial,
      isCritical: false,
    },
    {
      questionCode: "PC-03",
      questionText: "Do employees have a supported remote-work pattern?",
      answerText: "Yes",
      ...RESULT.satisfied,
      isCritical: false,
    },
    {
      questionCode: "PC-04",
      questionText: "Is unused licensed software reviewed periodically?",
      answerText: "Yes",
      ...RESULT.satisfied,
      isCritical: false,
    },
  ],
  security_operations: [
    {
      questionCode: "SO-01",
      questionText: "Are endpoint threat alerts actively monitored?",
      answerText: "Partially",
      ...RESULT.partial,
      isCritical: false,
    },
    {
      questionCode: "SO-02",
      questionText: "Is there a documented incident response contact path?",
      answerText: "No",
      ...RESULT.unsatisfied,
      isCritical: true,
    },
    {
      questionCode: "SO-03",
      questionText: "Are security advisories reviewed for relevant systems?",
      answerText: "Partially",
      ...RESULT.partial,
      isCritical: false,
    },
    {
      questionCode: "SO-04",
      questionText: "Is phishing awareness training delivered annually?",
      answerText: "Yes",
      ...RESULT.satisfied,
      isCritical: false,
    },
  ],
  documentation_knowledge: [
    {
      questionCode: "DK-01",
      questionText: "Are network diagrams current and accessible?",
      answerText: "No",
      ...RESULT.unsatisfied,
      isCritical: false,
    },
    {
      questionCode: "DK-02",
      questionText: "Are vendor and escalation contacts maintained?",
      answerText: "Partially",
      ...RESULT.partial,
      isCritical: false,
    },
    {
      questionCode: "DK-03",
      questionText: "Is change history recorded for major systems?",
      answerText: "No",
      ...RESULT.unsatisfied,
      isCritical: false,
    },
    {
      questionCode: "DK-04",
      questionText: "Do technicians have a standard onboarding packet?",
      answerText: "Partially",
      ...RESULT.partial,
      isCritical: false,
    },
  ],
  technology_strategy: [
    {
      questionCode: "TS-01",
      questionText: "Is there an approved technology roadmap?",
      answerText: "Yes",
      ...RESULT.satisfied,
      isCritical: false,
    },
    {
      questionCode: "TS-02",
      questionText: "Are roadmap priorities reviewed with executives quarterly?",
      answerText: "No",
      ...RESULT.unsatisfied,
      isCritical: false,
    },
    {
      questionCode: "TS-03",
      questionText: "Are technology priorities tied to business outcomes?",
      answerText: "Partially",
      ...RESULT.partial,
      isCritical: false,
    },
    {
      questionCode: "TS-04",
      questionText: "Is StackScore used in planning discussions?",
      answerText: "Yes",
      ...RESULT.satisfied,
      isCritical: false,
    },
  ],
};

export const DEMO_PILLAR_NARRATIVES: Record<
  TechnologyPillarCode,
  { strengthSummary: string; weaknessSummary: string }
> = {
  identity_access: {
    strengthSummary: "Joiners/movers/leavers steps are documented for day-to-day account changes.",
    weaknessSummary: "Privileged MFA and access reviews remain inconsistent.",
  },
  endpoint_management: {
    strengthSummary: "Centralized endpoint management and patching are established strengths.",
    weaknessSummary: "A small set of aging devices still needs lifecycle cleanup.",
  },
  network_connectivity: {
    strengthSummary: "Guest segmentation and availability monitoring are in place.",
    weaknessSummary: "Core switching hardware is beyond recommended lifecycle.",
  },
  data_protection_recovery: {
    strengthSummary: "Automated backups cover critical systems with monitored job alerts.",
    weaknessSummary: "Restore testing is not yet standardized or evidenced.",
  },
  productivity_collaboration: {
    strengthSummary: "Microsoft 365 collaboration patterns are consistent for plant and office staff.",
    weaknessSummary: "External sharing defaults need a tighter periodic review.",
  },
  security_operations: {
    strengthSummary: "Annual phishing awareness training is delivered.",
    weaknessSummary: "Incident response ownership and after-hours triage are incomplete.",
  },
  documentation_knowledge: {
    strengthSummary: "Some vendor contacts exist, but the knowledge base is incomplete.",
    weaknessSummary: "Network diagrams and change history are not reliably maintained.",
  },
  technology_strategy: {
    strengthSummary: "A technology roadmap exists and StackScore informs planning.",
    weaknessSummary: "Executive review cadence is not yet quarterly and accountable.",
  },
};
