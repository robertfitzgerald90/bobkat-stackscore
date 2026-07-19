import type { PhaseProposalStatus, RoadmapPhaseStatus } from "@/generated/prisma/client";
import { NORTHSTAR_INTERACTIVE_DEMO_SCENARIO } from "./scenario";
import type {
  DemoInitiativeStatus,
  InteractiveDemoPersistedState,
  InteractiveDemoStage,
} from "./types";

export const INTERACTIVE_DEMO_STORAGE_KEY = "stackscore-interactive-demo-v1";

const scenario = NORTHSTAR_INTERACTIVE_DEMO_SCENARIO;
const phase1Id = scenario.phases[0]!.id;
const phase2Id = scenario.phases[1]!.id;

function buildInitialInitiativeStatuses(): Record<string, DemoInitiativeStatus> {
  const statuses: Record<string, DemoInitiativeStatus> = {};
  for (const phase of scenario.phases) {
    for (const initiative of phase.initiatives) {
      statuses[initiative.id] = initiative.initialStatus;
    }
  }
  return statuses;
}

function buildInitialPhaseStatuses(): Record<string, RoadmapPhaseStatus> {
  return Object.fromEntries(scenario.phases.map((phase) => [phase.id, phase.initialStatus]));
}

function buildInitialProposalStatuses(): Record<string, PhaseProposalStatus> {
  return Object.fromEntries(
    scenario.proposals.map((proposal) => [proposal.id, proposal.initialStatus]),
  );
}

export function createInitialInteractiveDemoState(): InteractiveDemoPersistedState {
  return {
    stage: "phase1_awaiting_approval",
    initiativeStatuses: buildInitialInitiativeStatuses(),
    proposalStatuses: buildInitialProposalStatuses(),
    phaseStatuses: buildInitialPhaseStatuses(),
    selectedPhaseId: phase1Id,
    implementationStartedAt: null,
    implementationTargetAt: null,
  };
}

export function parseInteractiveDemoState(raw: string | null): InteractiveDemoPersistedState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as InteractiveDemoPersistedState;
    if (!parsed?.stage || !parsed.phaseStatuses || !parsed.initiativeStatuses) return null;
    return {
      ...createInitialInteractiveDemoState(),
      ...parsed,
      initiativeStatuses: {
        ...buildInitialInitiativeStatuses(),
        ...parsed.initiativeStatuses,
      },
      phaseStatuses: {
        ...buildInitialPhaseStatuses(),
        ...parsed.phaseStatuses,
      },
      proposalStatuses: {
        ...buildInitialProposalStatuses(),
        ...parsed.proposalStatuses,
      },
    };
  } catch {
    return null;
  }
}

export type InteractiveDemoAction =
  | { type: "reset" }
  | { type: "select_phase"; phaseId: string }
  | { type: "approve_phase1" }
  | { type: "start_implementation" }
  | { type: "complete_initiative"; initiativeId: string }
  | { type: "complete_phase1" };

function withPhase1Initiatives(
  state: InteractiveDemoPersistedState,
  status: DemoInitiativeStatus,
): Record<string, DemoInitiativeStatus> {
  const next = { ...state.initiativeStatuses };
  for (const initiative of scenario.phases[0]!.initiatives) {
    next[initiative.id] = status;
  }
  return next;
}

export function reduceInteractiveDemoState(
  state: InteractiveDemoPersistedState,
  action: InteractiveDemoAction,
): InteractiveDemoPersistedState {
  switch (action.type) {
    case "reset":
      return createInitialInteractiveDemoState();
    case "select_phase":
      return { ...state, selectedPhaseId: action.phaseId };
    case "approve_phase1": {
      if (state.stage !== "phase1_awaiting_approval") return state;
      const proposalId = scenario.proposals[0]!.id;
      return {
        ...state,
        stage: "phase1_approved",
        phaseStatuses: { ...state.phaseStatuses, [phase1Id]: "approved" },
        proposalStatuses: { ...state.proposalStatuses, [proposalId]: "approved" },
        initiativeStatuses: withPhase1Initiatives(state, "accepted"),
        selectedPhaseId: phase1Id,
      };
    }
    case "start_implementation": {
      if (state.stage !== "phase1_approved" && state.stage !== "phase1_in_progress") {
        return state;
      }
      const started = state.implementationStartedAt ?? new Date().toISOString();
      const target =
        state.implementationTargetAt ??
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const initiativeStatuses = { ...state.initiativeStatuses };
      const phase1Initiatives = scenario.phases[0]!.initiatives;
      // Seed a realistic mid-flight mix when entering implementation.
      phase1Initiatives.forEach((initiative, index) => {
        if (index === 0 || index === 2) initiativeStatuses[initiative.id] = "completed";
        else if (index === 1) initiativeStatuses[initiative.id] = "in_progress";
        else initiativeStatuses[initiative.id] = "open";
      });
      return {
        ...state,
        stage: "phase1_in_progress",
        phaseStatuses: { ...state.phaseStatuses, [phase1Id]: "in_progress" },
        initiativeStatuses,
        implementationStartedAt: started,
        implementationTargetAt: target,
        selectedPhaseId: phase1Id,
      };
    }
    case "complete_initiative": {
      if (state.stage !== "phase1_in_progress") return state;
      return {
        ...state,
        initiativeStatuses: {
          ...state.initiativeStatuses,
          [action.initiativeId]: "completed",
        },
      };
    }
    case "complete_phase1": {
      if (state.stage !== "phase1_in_progress" && state.stage !== "phase1_approved") {
        return state;
      }
      return {
        ...state,
        stage: "phase1_completed",
        phaseStatuses: {
          ...state.phaseStatuses,
          [phase1Id]: "completed",
          [phase2Id]: "awaiting_approval",
        },
        initiativeStatuses: withPhase1Initiatives(state, "completed"),
        selectedPhaseId: phase2Id,
      };
    }
    default:
      return state;
  }
}

export function stageLabel(stage: InteractiveDemoStage): string {
  switch (stage) {
    case "assessment_complete":
      return "Assessment Complete";
    case "phase1_awaiting_approval":
      return "Phase 1 Awaiting Approval";
    case "phase1_approved":
      return "Phase 1 Approved";
    case "phase1_in_progress":
      return "Phase 1 In Progress";
    case "phase1_completed":
      return "Phase 1 Complete";
    default:
      return stage;
  }
}
