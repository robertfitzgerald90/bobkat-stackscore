"use client";

import { useState } from "react";
import { instrumentFontVariables } from "@/components/design-system/instrument-fonts";
import { CornerBrackets } from "@/components/design-system/instrument/corner-brackets";
import { InstrumentScorePanel } from "@/components/design-system/instrument/instrument-score-panel";
import { InstrumentExecutiveSummary } from "@/components/design-system/instrument/instrument-executive-summary";

const navItems = ["Overview", "Recommendations", "Roadmap", "Report"];

const secondaryCards = [
  { id: "backup", title: "Establish immutable backup strategy" },
  { id: "baseline", title: "Standardize Microsoft 365 security baseline" },
  { id: "docs", title: "Formalize vendor lifecycle documentation" },
];

const restraintChecklist = [
  { label: "Glow / pulse effects", status: "Removed" },
  { label: "Bounce / spring easing", status: "Removed" },
  { label: "Gradient blobs", status: "Removed" },
  { label: "Shimmer / skeleton loading glow", status: "Removed" },
  { label: "Hover state", status: "Hairline border brighten or bracket tighten only" },
  { label: "prefers-reduced-motion", status: "Transitions and count-up both disabled" },
];

export function InstrumentPhase3Client() {
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className={`instrument ${instrumentFontVariables} min-h-screen px-4 py-10 sm:px-8 sm:py-14`}>
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-3 border-b border-border pb-8">
          <p className="instrument-mono text-xs uppercase tracking-[0.2em] text-primary">
            Design System · Phase 3
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Motion pass</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Restraint everywhere, with one exception: a brief phosphor count-up when a score
            reveals. Everything else is a single-property hover transition, and every transition
            here respects <code className="instrument-mono">prefers-reduced-motion</code>.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Restraint checklist</h2>
          <div className="border border-border">
            {restraintChecklist.map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${
                  index !== restraintChecklist.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="text-foreground">{item.label}</span>
                <span className="instrument-mono text-xs text-primary">{item.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Hover — bracket tightening</h2>
          <p className="text-sm text-muted-foreground">
            Hover a nav item. Brackets pull in from a 6px gap to 3px — no scale, no glow.
          </p>
          <div className="flex flex-wrap gap-4">
            {navItems.map((item, index) => (
              <CornerBrackets key={item} corners="two" tone="measured" interactive>
                <span
                  className={`instrument-mono block px-4 py-2 text-xs uppercase tracking-wide ${
                    index === 0 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item}
                </span>
              </CornerBrackets>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Hover — hairline border brighten</h2>
          <p className="text-sm text-muted-foreground">
            Hover a card. The border shifts from ash to phosphor — color only, nothing moves.
          </p>
          <div className="space-y-3">
            {secondaryCards.map((item) => (
              <div
                key={item.id}
                className="instrument-hoverable flex items-center justify-between gap-3 border border-border p-3"
              >
                <span className="text-sm text-foreground">{item.title}</span>
                <span className="instrument-mono text-[10px] uppercase tracking-wide text-primary">
                  Ready
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Score reveal — the one exception</h2>
            <button
              type="button"
              onClick={() => setReplayKey((key) => key + 1)}
              className="instrument-hoverable border border-border px-3 py-1.5 text-xs text-foreground"
            >
              Replay reveal
            </button>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            0 to the measured value over ~600ms, ease-out, no bounce. Reserved for primary
            readings only. Under reduced motion, the number appears immediately at its final
            value instead of animating.
          </p>
          <div key={replayKey} className="grid gap-8 lg:grid-cols-2">
            <div className="max-w-md">
              <InstrumentScorePanel />
            </div>
            <InstrumentExecutiveSummary />
          </div>
        </section>
      </div>
    </div>
  );
}
