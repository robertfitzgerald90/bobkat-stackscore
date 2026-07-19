"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  INTERACTIVE_DEMO_STORAGE_KEY,
  createInitialInteractiveDemoState,
  deriveInteractiveDemoView,
  parseInteractiveDemoState,
  reduceInteractiveDemoState,
  type DerivedDemoView,
  type InteractiveDemoAction,
  type InteractiveDemoPersistedState,
} from "@/lib/product-overview/interactive-demo";

type InteractiveDemoContextValue = {
  state: InteractiveDemoPersistedState;
  view: DerivedDemoView;
  dispatch: (action: InteractiveDemoAction) => void;
  resetInteractiveDemo: () => void;
  approvePhase1: () => void;
  startImplementation: () => void;
  completePhase1: () => void;
  selectPhase: (phaseId: string) => void;
};

const InteractiveDemoContext = createContext<InteractiveDemoContextValue | null>(null);

function readStoredState(): InteractiveDemoPersistedState {
  if (typeof window === "undefined") return createInitialInteractiveDemoState();
  return (
    parseInteractiveDemoState(window.sessionStorage.getItem(INTERACTIVE_DEMO_STORAGE_KEY)) ??
    createInitialInteractiveDemoState()
  );
}

export function InteractiveDemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InteractiveDemoPersistedState>(createInitialInteractiveDemoState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStoredState());
    setHydrated(true);
    const onReset = () => setState(createInitialInteractiveDemoState());
    window.addEventListener("stackscore-interactive-demo-reset", onReset);
    return () => window.removeEventListener("stackscore-interactive-demo-reset", onReset);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.sessionStorage.setItem(INTERACTIVE_DEMO_STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const dispatch = useCallback((action: InteractiveDemoAction) => {
    setState((current) => reduceInteractiveDemoState(current, action));
  }, []);

  const value = useMemo<InteractiveDemoContextValue>(() => {
    const view = deriveInteractiveDemoView(state);
    return {
      state,
      view,
      dispatch,
      resetInteractiveDemo: () => dispatch({ type: "reset" }),
      approvePhase1: () => dispatch({ type: "approve_phase1" }),
      startImplementation: () => dispatch({ type: "start_implementation" }),
      completePhase1: () => dispatch({ type: "complete_phase1" }),
      selectPhase: (phaseId: string) => dispatch({ type: "select_phase", phaseId }),
    };
  }, [state, dispatch]);

  return (
    <InteractiveDemoContext.Provider value={value}>{children}</InteractiveDemoContext.Provider>
  );
}

export function useInteractiveDemo() {
  const context = useContext(InteractiveDemoContext);
  if (!context) {
    throw new Error("useInteractiveDemo must be used within InteractiveDemoProvider");
  }
  return context;
}
