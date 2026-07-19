"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DemoEnvironmentBadge } from "@/components/interactive-demo/demo-environment-badge";
import { buttonVariants } from "@/components/ui/button";
import { trackDemoStarted } from "@/lib/analytics/interactive-demo-events";
import {
  DEMO_ENVIRONMENT_LABEL,
  DEMO_SAMPLE_DATA_NOTICE,
} from "@/lib/interactive-demo/content";
import { SOLUTIONS_HOME_PATH } from "@/lib/interactive-demo/routes";
import {
  dismissDemoWelcomeForSession,
  markDemoStartedForSession,
  wasDemoWelcomeDismissed,
} from "@/lib/interactive-demo/session";
import { cn } from "@/lib/utils";

type DemoEntryScreenProps = {
  onStarted?: () => void;
};

function trackStartedOnce(source?: string | null) {
  if (!markDemoStartedForSession()) return;
  trackDemoStarted(source ?? undefined);
}

export function DemoEntryScreen({ onStarted }: DemoEntryScreenProps) {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const skipped = wasDemoWelcomeDismissed();
    setVisible(!skipped);
    if (skipped) {
      trackStartedOnce(searchParams.get("source") ?? "session_resume");
    }
  }, [searchParams]);

  function startExploring() {
    if (dontShowAgain) {
      dismissDemoWelcomeForSession();
    }
    trackStartedOnce(searchParams.get("source"));
    setVisible(false);
    onStarted?.();
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-background/95 px-4 py-10 backdrop-blur-sm sm:items-center sm:py-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-entry-heading"
    >
      <div className="w-full max-w-xl rounded-2xl border border-border/70 bg-card p-6 shadow-xl sm:p-8">
        <DemoEnvironmentBadge />
        <h1
          id="demo-entry-heading"
          className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Welcome to the StackScore Interactive Demo
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          You are exploring a sample StackScore client portal created to demonstrate the technology
          visibility, recommendations, planning tools, reports, and strategic guidance available to
          clients.
        </p>

        <div className="mt-6 rounded-xl border border-border/70 bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {DEMO_ENVIRONMENT_LABEL}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {DEMO_SAMPLE_DATA_NOTICE}
          </p>
        </div>

        <label className="mt-5 flex items-start gap-2.5 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(event) => setDontShowAgain(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span>Do not show this again during this session</span>
        </label>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={startExploring}
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-11 w-full px-6 text-base shadow-md sm:w-auto",
            )}
          >
            Start Exploring
          </button>
          <Link
            href={SOLUTIONS_HOME_PATH}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 w-full justify-center px-6 text-base sm:w-auto",
            )}
          >
            Return to Bobkat IT
          </Link>
        </div>
      </div>
    </div>
  );
}
