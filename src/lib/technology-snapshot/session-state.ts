import type { SnapshotItManagementModel } from "./types";
import type { SnapshotAnswersV2 } from "./engine";

export const SNAPSHOT_SESSION_KEY = "stackscore.snapshot.v2";

export type SnapshotBusinessContext = {
  companyName: string;
  industry: string;
  companySize: string;
  itManagementModel: SnapshotItManagementModel | "";
};

export type SnapshotSessionState = {
  version: 2;
  phase: "welcome" | "context" | "questions" | "results";
  questionIndex: number;
  context: SnapshotBusinessContext;
  answers: Partial<SnapshotAnswersV2>;
  /** ISO timestamp when results were first computed in-session */
  completedAt?: string;
};

export const EMPTY_BUSINESS_CONTEXT: SnapshotBusinessContext = {
  companyName: "",
  industry: "",
  companySize: "",
  itManagementModel: "",
};

export function createEmptySessionState(): SnapshotSessionState {
  return {
    version: 2,
    phase: "welcome",
    questionIndex: 0,
    context: { ...EMPTY_BUSINESS_CONTEXT },
    answers: {},
  };
}

export function loadSnapshotSession(): SnapshotSessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SNAPSHOT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SnapshotSessionState;
    if (parsed?.version !== 2) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSnapshotSession(state: SnapshotSessionState): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SNAPSHOT_SESSION_KEY, JSON.stringify(state));
  } catch {
    // Quota / private mode — progress recovery is best-effort.
  }
}

export function clearSnapshotSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SNAPSHOT_SESSION_KEY);
  } catch {
    // ignore
  }
}
