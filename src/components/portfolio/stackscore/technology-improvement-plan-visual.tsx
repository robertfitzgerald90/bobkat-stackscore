import { ArrowUpRight, Check, FileText, Layers3, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Eyebrow, Metric, VisualFrame } from "./visual-primitives";

const initiatives = [
  { title: "Recovery assurance", phase: "Stabilize", recs: 3, amount: "$12.5K" },
  { title: "Identity hardening", phase: "Secure", recs: 4, amount: "$18K + $450/mo" },
  { title: "Managed detection", phase: "Secure", recs: 2, amount: "$450/mo" },
  { title: "Infrastructure lifecycle", phase: "Modernize", recs: 3, amount: "$31K" },
];

export function TechnologyImprovementPlanVisual() {
  return (
    <VisualFrame label="Technology Improvement Plan · Executive preview">
      <div className="grid xl:grid-cols-[1.25fr_0.75fr]">
        <div className="border-b border-border p-6 sm:p-8 xl:border-b-0 xl:border-r">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <Eyebrow>Investment strategy</Eyebrow>
              <h3 className="mt-2 text-2xl font-semibold">Northstar Technology Improvement Plan</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                A phased plan designed to reduce immediate risk, establish operational controls, and sequence modernization without losing business continuity.
              </p>
            </div>
            <Badge variant="success">Ready for review</Badge>
          </div>
          <div className="mt-7 grid gap-2 sm:grid-cols-2">
            {initiatives.map((item) => (
              <div className="border border-border bg-background p-4" key={item.title}>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline">{item.phase}</Badge>
                  <span className="instrument-mono text-xs text-muted-foreground">{item.recs} findings</span>
                </div>
                <div className="mt-4 font-semibold">{item.title}</div>
                <div className="instrument-mono mt-2 text-sm text-primary">{item.amount}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-success" />12 recommendations organized</span>
            <span className="inline-flex items-center gap-1.5"><Layers3 className="size-3.5 text-primary" />4 strategic phases</span>
            <span className="inline-flex items-center gap-1.5"><FileText className="size-3.5 text-primary" />Executive deliverable generated</span>
          </div>
        </div>

        <div className="bg-muted/20 p-6 sm:p-8">
          <Eyebrow>Plan economics</Eyebrow>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <Metric label="One-time investment" value="$61.5K" detail="phased over 12 months" />
            <Metric label="Recurring investment" value="$900/mo" detail="ongoing controls" />
            <Metric label="Current score" value="67" detail="developing" />
            <Metric label="Expected improvement" value="+26" detail="configured estimate" tone="good" />
          </div>
          <div className="mt-8 border border-primary/35 bg-primary/8 p-5">
            <div className="flex items-center gap-2"><WalletCards className="size-4 text-primary" /><span className="text-sm font-semibold">Decision preview</span></div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Investment is separated by timing and operating impact so leadership can approve the right work in the right sequence.
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">From findings to funded action <ArrowUpRight className="size-3.5" /></div>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

