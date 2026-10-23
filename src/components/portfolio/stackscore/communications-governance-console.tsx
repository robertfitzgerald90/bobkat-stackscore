import { CheckCircle2, Clock3, Eye, GitBranch, MailCheck, ShieldCheck, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Eyebrow, IconLabel, VisualFrame } from "./visual-primitives";

const events = [
  { label: "Approved", time: "09:14", icon: UserCheck },
  { label: "Scheduled", time: "09:15", icon: Clock3 },
  { label: "Delivered", time: "10:01", icon: MailCheck },
  { label: "Opened", time: "10:24", icon: Eye },
];

export function CommunicationsGovernanceConsole() {
  return (
    <VisualFrame label="Communications governance">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div><Eyebrow>Operational automation with control</Eyebrow><h3 className="mt-2 text-xl font-semibold">Roadmap ready communication</h3></div>
          <Badge variant="success">Connected workflow</Badge>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="border border-border bg-background p-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="text-muted-foreground">Template</span><div className="instrument-mono mt-1 text-foreground">EMAIL-003 · v4</div></div>
              <div><span className="text-muted-foreground">Trigger</span><div className="mt-1 font-medium">Roadmap published</div></div>
              <div><span className="text-muted-foreground">Review mode</span><div className="mt-1 font-medium">Human approval</div></div>
              <div><span className="text-muted-foreground">Idempotency</span><div className="mt-1 font-medium">Roadmap + version</div></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4"><IconLabel icon={ShieldCheck} tone="good">Approved copy</IconLabel><IconLabel icon={GitBranch}>Version retained</IconLabel></div>
          </div>
          <div className="border border-border bg-muted/15 p-4">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold">Delivery timeline</span><CheckCircle2 className="size-4 text-success" /></div>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {events.map((event, index) => { const Icon = event.icon; return <div className="relative text-center" key={event.label}><div className="mx-auto flex size-7 items-center justify-center border border-primary/40 bg-primary/8"><Icon className="size-3.5 text-primary" /></div>{index < events.length - 1 ? <div className="absolute left-[calc(50%+14px)] right-[-50%] top-3.5 h-px bg-border" /> : null}<div className="mt-2 text-[10px] font-medium">{event.label}</div><div className="instrument-mono mt-1 text-[9px] text-muted-foreground">{event.time}</div></div>; })}
            </div>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

