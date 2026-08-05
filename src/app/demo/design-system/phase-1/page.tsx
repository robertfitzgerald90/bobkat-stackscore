import type { Metadata } from "next";
import { instrumentFontVariables } from "@/components/design-system/instrument-fonts";
import { InstrumentScorePanel } from "@/components/design-system/instrument/instrument-score-panel";

export const metadata: Metadata = {
  title: "StackScore Instrument Design System — Phase 1",
  robots: { index: false, follow: false },
};

const swatches = [
  { name: "obsidian", value: "#08090C", note: "background" },
  { name: "frost-panel", value: "#12141A", note: "card / panel surfaces" },
  { name: "ash", value: "#8B92A0", note: "muted body text" },
  { name: "bone", value: "#F1F2F4", note: "headline / high-contrast text" },
  { name: "phosphor", value: "#3ECF7A", note: "single accent" },
  { name: "ember", value: "#B23A3A", note: "risk / critical / at-risk only" },
];

export default function InstrumentPhase1Page() {
  return (
    <div className={`instrument ${instrumentFontVariables} min-h-screen px-4 py-10 sm:px-8 sm:py-14`}>
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-3 border-b border-border pb-8">
          <p className="instrument-mono text-xs uppercase tracking-[0.2em] text-primary">
            Design System · Phase 1
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Tokens, type, and one reading</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Space Grotesk for headlines, Source Sans 3 for body copy, JetBrains Mono for every
            score, label, and timestamp. Phosphor is the single accent. Ember is reserved for
            critical and at-risk readings only. Nothing on this page affects the rest of the
            application — the tokens are scoped to the <code className="instrument-mono">.instrument</code>{" "}
            class.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Palette</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {swatches.map((swatch) => (
              <div key={swatch.name} className="space-y-2 border border-border p-3">
                <div
                  className="h-14 w-full border border-border"
                  style={{ backgroundColor: swatch.value }}
                />
                <p className="instrument-mono text-xs font-medium text-foreground">
                  --{swatch.name}
                </p>
                <p className="instrument-mono text-[11px] text-muted-foreground">{swatch.value}</p>
                <p className="text-[11px] text-muted-foreground">{swatch.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Type trio</h2>
          <div className="space-y-4 border border-border p-5">
            <p className="text-2xl font-semibold sm:text-3xl">
              Display — Space Grotesk for headlines
            </p>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Body — Source Sans 3 carries paragraph copy, descriptions, and supporting text
              across the interface.
            </p>
            <p className="instrument-mono text-lg text-primary">
              Mono — JetBrains Mono 0123456789 · 71 · +14 · 09:41:02Z
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Score panel</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Adapted from the production <code className="instrument-mono">AssessmentScorePanel</code>{" "}
            (same information architecture — overall score, projected score, pillar breakdown,
            top risks) rendered entirely on Instrument tokens with fictional data. The production
            component is unchanged.
          </p>
          <div className="max-w-md">
            <InstrumentScorePanel />
          </div>
        </section>
      </div>
    </div>
  );
}
