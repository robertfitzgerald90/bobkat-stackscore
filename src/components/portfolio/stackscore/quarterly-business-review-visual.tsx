import { ArrowRight, CheckCircle2, CircleDollarSign, Flag, ShieldAlert, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Eyebrow, IconLabel, Metric, ProgressBar, VisualFrame } from "./visual-primitives";

export function QuarterlyBusinessReviewVisual() {
  return (
    <VisualFrame label="Quarterly Business Review · Q2 executive brief">
      <div className="grid xl:grid-cols-[0.78fr_1.22fr]">
        <div className="border-b border-border bg-muted/20 p-6 sm:p-8 xl:border-b-0 xl:border-r">
          <Eyebrow>Measured progress</Eyebrow>
          <div className="mt-7 flex items-center gap-4">
            <div><div className="instrument-mono text-xs text-muted-foreground">Starting</div><div className="instrument-mono mt-1 text-4xl">58</div></div>
            <ArrowRight className="size-5 text-primary" />
            <div><div className="instrument-mono text-xs text-muted-foreground">Current</div><div className="instrument-mono mt-1 text-5xl text-success">74</div></div>
          </div>
          <div className="mt-5"><ProgressBar value={74} /></div>
          <div className="mt-4"><IconLabel icon={TrendingUp} tone="good">+16 effective movement since baseline</IconLabel></div>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">The quarter moved from evidence to completed controls, with remaining exposure explicitly carried into the next plan.</p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Metric label="Work completed" value="6" detail="initiatives" tone="good" />
            <Metric label="Remaining risks" value="7" detail="2 critical" tone="risk" />
            <Metric label="Quarter spend" value="$18.5K" detail="within plan" />
            <Metric label="Next phase" value="Secure" detail="in progress" tone="warning" />
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <div className="border border-border bg-background p-4">
              <IconLabel icon={CheckCircle2} tone="good">What changed</IconLabel>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li>Recovery process validated</li><li>Privileged access inventoried</li><li>Endpoint baseline established</li></ul>
            </div>
            <div className="border border-destructive/25 bg-destructive/6 p-4">
              <IconLabel icon={ShieldAlert} tone="risk">What remains exposed</IconLabel>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li>Monitoring coverage gap</li><li>Conditional access incomplete</li><li>Executive tabletop pending</li></ul>
            </div>
          </div>
          <div className="mt-4 flex flex-col justify-between gap-3 border border-primary/30 bg-primary/6 p-4 sm:flex-row sm:items-center">
            <div><IconLabel icon={Flag}>Next-quarter priorities</IconLabel><div className="mt-2 text-sm font-semibold">Detection · Identity · Recovery governance</div></div>
            <div className="flex items-center gap-2"><CircleDollarSign className="size-4 text-primary" /><Badge variant="outline">$24K + $900/mo</Badge></div>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

