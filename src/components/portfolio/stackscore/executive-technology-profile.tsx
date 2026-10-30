"use client";

import { AlertTriangle, ArrowUpRight, Focus, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatMaturityScore } from "@/lib/scoring/score-display";
import { demoOrganization, pillars } from "./demo-data";
import { Eyebrow, IconLabel, Metric, ProgressBar, VisualFrame } from "./visual-primitives";

export function ExecutiveTechnologyProfile() {
  const [selected, setSelected] = useState(pillars[5]);
  return (
    <VisualFrame label="Executive technology profile">
      <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
        <div className="border-b border-border p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <Eyebrow>{demoOrganization}</Eyebrow>
          <div className="mt-5 flex items-end gap-3">
            <div className="instrument-mono text-7xl font-semibold leading-none text-foreground">67</div>
            <div className="pb-1">
              <div className="text-sm text-muted-foreground">StackScore / 100</div>
              <Badge className="mt-2" variant="warning">Developing</Badge>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-5">
            <Metric label="Movement" value="+9" detail="from baseline" tone="good" />
            <Metric label="Critical exposure" value="2" detail="requires attention" tone="risk" />
          </div>
          <div className="mt-7 border border-destructive/30 bg-destructive/8 p-4">
            <IconLabel icon={ShieldAlert} tone="risk">Immediate focus</IconLabel>
            <div className="mt-2 font-semibold">Security operations & recovery assurance</div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Close monitoring coverage gaps and validate recovery readiness before modernization work expands.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <Eyebrow>Where attention belongs</Eyebrow>
              <h3 className="mt-2 text-xl font-semibold">Technology pillars</h3>
            </div>
            <IconLabel icon={ArrowUpRight} tone="good">Improving across 7 pillars</IconLabel>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {pillars.map((pillar) => (
              <button
                type="button"
                key={pillar.name}
                onClick={() => setSelected(pillar)}
                className={`border p-3 text-left transition-colors motion-reduce:transition-none ${selected.name === pillar.name ? "border-primary bg-primary/8" : "border-border bg-background hover:border-primary/60"}`}
              >
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-foreground">{pillar.name}</span>
                  <span className="instrument-mono text-muted-foreground">
                    {formatMaturityScore(pillar.score)}
                  </span>
                </div>
                <div className="mt-2"><ProgressBar value={pillar.score} risk={pillar.score < 60} /></div>
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <IconLabel icon={selected.score < 60 ? AlertTriangle : Focus} tone={selected.score < 60 ? "risk" : "default"}>{selected.name}</IconLabel>
              <div className="mt-2 text-sm font-semibold">{selected.note}</div>
              <div className="mt-1 text-xs text-muted-foreground">Selected pillar briefing</div>
            </div>
            <div className="instrument-mono text-2xl text-success">+{selected.movement}</div>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

