import type { TechnologyJourneyPhase, TechnologyJourneyProgress } from "./types";

type JourneyInput = {
  assessmentsCompleted: number;
  openRecommendations: number;
  activeProjects: number;
  completedProjects: number;
  scoreDelta: number | null;
};

const PHASE_LABELS: Record<TechnologyJourneyPhase, string> = {
  assess: "Assess",
  improve: "Improve",
  maintain: "Maintain",
};

export function deriveJourneyPhase(input: JourneyInput): TechnologyJourneyPhase {
  if (input.assessmentsCompleted === 0) return "assess";
  if (input.openRecommendations > 0 || input.activeProjects > 0) return "improve";
  return "maintain";
}

/** Minimal Technology Journey progress (DOC-113 / DOC-127). */
export function computeJourneyProgress(input: JourneyInput): TechnologyJourneyProgress {
  const phase = deriveJourneyPhase(input);

  const milestones = [
    input.assessmentsCompleted > 0,
    input.completedProjects > 0 || input.openRecommendations === 0,
    phase === "maintain",
  ];
  const progressPercent = Math.round(
    (milestones.filter(Boolean).length / milestones.length) * 100,
  );

  return {
    phase,
    phaseLabel: PHASE_LABELS[phase],
    assessmentsCompleted: input.assessmentsCompleted,
    openRecommendations: input.openRecommendations,
    activeProjects: input.activeProjects,
    completedProjects: input.completedProjects,
    scoreDelta: input.scoreDelta,
    progressPercent,
  };
}
