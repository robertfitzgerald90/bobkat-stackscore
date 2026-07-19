import { NORTHSTAR_INTERACTIVE_DEMO_SCENARIO } from "./scenario";
import type {
  DerivedDemoPhase,
  DerivedDemoView,
  InteractiveDemoPersistedState,
} from "./types";

const scenario = NORTHSTAR_INTERACTIVE_DEMO_SCENARIO;

function derivePhase(
  state: InteractiveDemoPersistedState,
  phaseId: string,
): DerivedDemoPhase {
  const phase = scenario.phases.find((item) => item.id === phaseId)!;
  const initiatives = phase.initiatives.map((initiative) => ({
    ...initiative,
    status: state.initiativeStatuses[initiative.id] ?? initiative.initialStatus,
  }));
  const completedInitiativeCount = initiatives.filter((item) => item.status === "completed").length;
  const completionPercent =
    initiatives.length === 0
      ? 0
      : Math.round((completedInitiativeCount / initiatives.length) * 100);

  return {
    ...phase,
    status: state.phaseStatuses[phase.id] ?? phase.initialStatus,
    initiativeCount: initiatives.length,
    completedInitiativeCount,
    completionPercent,
    initiatives,
  };
}

export function deriveInteractiveDemoView(
  state: InteractiveDemoPersistedState,
): DerivedDemoView {
  const phases = scenario.phases.map((phase) => derivePhase(state, phase.id));
  const phase1 = phases[0]!;
  const phase2 = phases[1];
  const selectedPhase =
    phases.find((phase) => phase.id === state.selectedPhaseId) ?? phase1;
  const proposalSeed = scenario.proposals[0]!;
  const proposal = {
    ...proposalSeed,
    status: state.proposalStatuses[proposalSeed.id] ?? proposalSeed.initialStatus,
  };

  const totalInitiatives = phases.reduce((sum, phase) => sum + phase.initiativeCount, 0);
  const completedInitiativeCount = phases.reduce(
    (sum, phase) => sum + phase.completedInitiativeCount,
    0,
  );
  const roadmapCompletionPercent =
    totalInitiatives === 0
      ? 0
      : Math.round((completedInitiativeCount / totalInitiatives) * 100);

  const phase1Complete = state.stage === "phase1_completed";
  const effectiveScore = phase1Complete
    ? scenario.scoreProgression.afterPhase1Score
    : scenario.scoreProgression.initialScore;
  const completedImprovement = phase1Complete
    ? scenario.scoreProgression.phase1Improvement
    : 0;

  const totalOneTimeInvestment = scenario.phases.reduce(
    (sum, phase) => sum + phase.oneTimeInvestment,
    0,
  );
  const totalMonthlyRecurring = scenario.phases.reduce(
    (sum, phase) => sum + (phase.showMonthlyRecurring ? phase.monthlyRecurringInvestment : 0),
    0,
  );

  const currentPhase =
    phases.find((phase) => phase.status === "in_progress") ??
    phases.find((phase) => phase.status === "awaiting_approval") ??
    phases.find((phase) => phase.status === "approved") ??
    phases[0]!;

  return {
    stage: state.stage,
    company: scenario.company,
    assessment: scenario.assessment,
    phases,
    selectedPhase,
    phase1,
    phase2,
    proposal,
    effectiveScore,
    completedImprovement,
    projectedFinalScore: scenario.scoreProgression.projectedFinalScore,
    roadmapCompletionPercent,
    completedInitiativeCount,
    remainingInitiativeCount: totalInitiatives - completedInitiativeCount,
    totalOneTimeInvestment,
    totalMonthlyRecurring,
    currentPhaseNumber: currentPhase.phaseNumber,
    canApprovePhase1: state.stage === "phase1_awaiting_approval",
    canStartImplementation:
      state.stage === "phase1_approved" || state.stage === "phase1_in_progress",
    canSimulateCompletion: state.stage === "phase1_in_progress",
    showNextPhaseIntro: state.stage === "phase1_completed",
  };
}

export function getInteractiveDemoScenario() {
  return scenario;
}
