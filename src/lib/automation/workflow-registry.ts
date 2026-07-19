/**
 * Operational automation catalog for the commercial platform.
 * Documents intended workflows and current readiness without executing vendor-specific jobs.
 */

export type AutomationWorkflowStatus =
  | "connected"
  | "partial"
  | "planned"
  | "manual";

export type AutomationWorkflowDefinition = {
  key: string;
  name: string;
  description: string;
  trigger: string;
  steps: string[];
  status: AutomationWorkflowStatus;
  owningEngines: string[];
  extensionPoint: string;
};

export const OPERATIONAL_AUTOMATION_REGISTRY: AutomationWorkflowDefinition[] = [
  {
    key: "assessment_to_roadmap",
    name: "Assessment → Roadmap",
    description: "Completed assessments materialize a draft living roadmap.",
    trigger: "Assessment completed",
    steps: [
      "Persist score history",
      "Sync recommendations",
      "Materialize draft ClientRoadmap",
      "Notify consultant",
    ],
    status: "connected",
    owningEngines: ["Assessment Engine", "Recommendation Engine", "Technology Roadmap Engine"],
    extensionPoint: "src/lib/client-roadmap/materialize.ts",
  },
  {
    key: "roadmap_review_scheduling",
    name: "Roadmap Review Scheduling",
    description: "Schedule consultant review after roadmap delivery.",
    trigger: "Roadmap activated / TIP generated",
    steps: ["Notify consultant", "Create review reminder", "Optional Cal.com booking link"],
    status: "partial",
    owningEngines: ["Technology Roadmap Engine", "Notification Engine"],
    extensionPoint: "src/lib/notifications + future calendar adapter",
  },
  {
    key: "phase_proposal_generation",
    name: "Phase Proposal Generation",
    description: "Generate a phase-scoped proposal from the living roadmap.",
    trigger: "Consultant generates proposal for phase",
    steps: ["Snapshot phase scope", "Create PhaseProposal version", "Attach PDF document"],
    status: "connected",
    owningEngines: ["Proposal Engine", "Technology Roadmap Engine", "Reporting Engine"],
    extensionPoint: "src/lib/phase-proposals/service.ts",
  },
  {
    key: "proposal_to_implementation",
    name: "Proposal → Implementation",
    description: "Approved proposals sync phase status and open implementation tracking.",
    trigger: "Phase proposal approved",
    steps: [
      "Mark proposal approved",
      "Sync roadmap phase to approved",
      "Prepare implementation project hooks",
    ],
    status: "partial",
    owningEngines: ["Proposal Engine", "Technology Roadmap Engine"],
    extensionPoint: "src/lib/phase-proposals/service.ts",
  },
  {
    key: "implementation_onboarding",
    name: "Implementation Onboarding",
    description: "Create projects/tasks and schedule onboarding after phase approval.",
    trigger: "Phase status → in_progress",
    steps: ["Set projectStartedAt", "Optional PSA project create", "Notify stakeholders"],
    status: "planned",
    owningEngines: ["Technology Roadmap Engine", "Integration adapters"],
    extensionPoint: "src/lib/integrations (future)",
  },
  {
    key: "managed_service_activation",
    name: "Managed Service Activation",
    description: "Activate recurring services after implementation acceptance.",
    trigger: "Phase completed + acceptance",
    steps: ["Evaluate service catalog links", "Create/activate RecurringService", "Notify billing"],
    status: "planned",
    owningEngines: ["Lifecycle Engine", "Billing"],
    extensionPoint: "src/lib/billing/recurring-service.ts",
  },
  {
    key: "first_qbr_scheduling",
    name: "First QBR Scheduling",
    description: "Schedule the first quarterly review after managed services activate.",
    trigger: "Managed services active / vCIO entitlement",
    steps: ["Create QBR draft period", "Notify consultant + client", "Optional calendar invite"],
    status: "partial",
    owningEngines: ["Reporting Engine / QBR", "Notification Engine"],
    extensionPoint: "src/lib/qbr/service.ts",
  },
  {
    key: "phase_complete_opportunity_scan",
    name: "Post-Phase Opportunity Scan",
    description: "Evaluate emerging risks and refresh cycles after phase completion.",
    trigger: "Roadmap phase completed",
    steps: ["Evaluate opportunities", "Persist LifecycleOpportunity", "Notify consultant"],
    status: "connected",
    owningEngines: ["Lifecycle Engine", "Notification Engine"],
    extensionPoint: "src/lib/technology-lifecycle/opportunity.ts",
  },
];

export function listAutomationWorkflows() {
  return OPERATIONAL_AUTOMATION_REGISTRY;
}
