import type { Metadata } from "next";
import { instrumentFontVariables } from "@/components/design-system/instrument-fonts";
import { CornerBrackets } from "@/components/design-system/instrument/corner-brackets";
import { InstrumentScorePanel } from "@/components/design-system/instrument/instrument-score-panel";
import { InstrumentMaturityRadar } from "@/components/design-system/instrument/instrument-maturity-radar";
import { InstrumentExecutiveSummary } from "@/components/design-system/instrument/instrument-executive-summary";
import { InstrumentCriticalReading } from "@/components/design-system/instrument/instrument-critical-reading";

export const metadata: Metadata = {
  title: "StackScore Instrument Design System — Phase 2",
  robots: { index: false, follow: false },
};

const openRecommendations = [
  { id: "backup", title: "Establish immutable backup strategy", tone: "critical" as const },
  { id: "baseline", title: "Standardize Microsoft 365 security baseline", tone: "measured" as const },
  { id: "docs", title: "Formalize vendor lifecycle documentation", tone: "measured" as const },
];

const navItems = ["Overview", "Recommendations", "Roadmap", "Report"];

export default function InstrumentPhase2Page() {
  return (
    <div className={`instrument ${instrumentFontVariables} min-h-screen px-4 py-10 sm:px-8 sm:py-14`}>
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-3 border-b border-border pb-8">
          <p className="instrument-mono text-xs uppercase tracking-[0.2em] text-primary">
            Design System · Phase 2
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Corner brackets</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Four corners on anything showing an active reading — score panel, maturity radar,
            executive summary. Two corners on secondary cards, list items, and navigation. Bracket
            color carries the severity signal: phosphor for a normal reading, ember when the
            panel is critical or at-risk.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Navigation — two corners</h2>
          <div className="flex flex-wrap gap-4">
            {navItems.map((item, index) => (
              <CornerBrackets key={item} corners="two" tone="measured">
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
          <h2 className="text-lg font-semibold">Assessment overview — four corners on readings</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            <CornerBrackets corners="four" tone="measured">
              <InstrumentScorePanel />
            </CornerBrackets>

            <div className="space-y-4">
              <CornerBrackets corners="four" tone="measured" className="border border-border p-5">
                <p className="instrument-mono mb-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Technology Maturity Radar
                </p>
                <InstrumentMaturityRadar />
              </CornerBrackets>

              <CornerBrackets corners="four" tone="measured">
                <InstrumentExecutiveSummary />
              </CornerBrackets>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Bracket color as signal — ember for a critical reading
          </h2>
          <div className="max-w-sm">
            <CornerBrackets corners="four" tone="critical">
              <InstrumentCriticalReading />
            </CornerBrackets>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Secondary list items — two corners</h2>
          <div className="space-y-3">
            {openRecommendations.map((item) => (
              <CornerBrackets key={item.id} corners="two" tone={item.tone}>
                <div className="flex items-center justify-between gap-3 border border-border p-3">
                  <span className="text-sm text-foreground">{item.title}</span>
                  <span
                    className={`instrument-mono text-[10px] uppercase tracking-wide ${
                      item.tone === "critical" ? "text-destructive" : "text-primary"
                    }`}
                  >
                    {item.tone === "critical" ? "Critical" : "Ready"}
                  </span>
                </div>
              </CornerBrackets>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
