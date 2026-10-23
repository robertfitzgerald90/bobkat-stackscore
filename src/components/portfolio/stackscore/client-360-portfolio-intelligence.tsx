import { Activity, BriefcaseBusiness, CalendarClock, CircleDollarSign, HeartPulse, Route, ShieldAlert, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { demoOrganization } from "./demo-data";
import { Eyebrow, IconLabel, Metric, ProgressBar, VisualFrame } from "./visual-primitives";

const signals = [
  { label: "Technology health", value: "67 / Developing", icon: HeartPulse, tone: "warning" as const },
  { label: "Active roadmap", value: "Phase 2 · Secure", icon: Route, tone: "good" as const },
  { label: "Open risks", value: "2 critical · 5 high", icon: ShieldAlert, tone: "risk" as const },
  { label: "Advisory status", value: "QBR due in 18 days", icon: CalendarClock, tone: "default" as const },
  { label: "Commercial relationship", value: "vCIO · Active", icon: BriefcaseBusiness, tone: "good" as const },
  { label: "Current investment", value: "$24K + $900/mo", icon: CircleDollarSign, tone: "default" as const },
];

export function Client360PortfolioIntelligence() {
  return (
    <VisualFrame label="Client 360 · Management intelligence">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div><Eyebrow>Relationship view</Eyebrow><h3 className="mt-2 text-2xl font-semibold">{demoOrganization}</h3><p className="mt-1 text-sm text-muted-foreground">One view across health, delivery, advisory, and commercial context.</p></div>
          <div className="flex gap-2"><Badge variant="success">Active client</Badge><Badge variant="outline">Manufacturing</Badge></div>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {signals.map((signal) => (
            <div className="border border-border bg-background p-4" key={signal.label}>
              <IconLabel icon={signal.icon} tone={signal.tone}>{signal.label}</IconLabel>
              <div className="mt-3 text-sm font-semibold">{signal.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-6 border-t border-border pt-6 lg:grid-cols-[1fr_1fr_0.8fr]">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold"><Activity className="size-4 text-primary" />Recent activity</div>
            <div className="mt-4 space-y-3 text-xs text-muted-foreground">
              <div className="border-l border-success pl-3"><span className="text-foreground">Recovery validation completed</span><br />2 days ago · score evidence updated</div>
              <div className="border-l border-primary pl-3"><span className="text-foreground">Secure phase approved</span><br />8 days ago · proposal v2</div>
              <div className="border-l border-border pl-3"><span className="text-foreground">Quarterly review drafted</span><br />12 days ago · advisor action</div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold"><Users className="size-4 text-primary" />Upcoming priorities</div>
            <ol className="mt-4 space-y-3 text-xs text-muted-foreground">
              <li className="flex gap-3"><span className="instrument-mono text-primary">01</span><span>Complete managed detection onboarding</span></li>
              <li className="flex gap-3"><span className="instrument-mono text-primary">02</span><span>Run executive recovery tabletop</span></li>
              <li className="flex gap-3"><span className="instrument-mono text-primary">03</span><span>Prepare Q3 modernization decision</span></li>
            </ol>
          </div>
          <div>
            <Metric label="Client success signal" value="On track" detail="3 of 4 current priorities progressing" tone="good" />
            <div className="mt-5"><ProgressBar value={75} /></div>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

