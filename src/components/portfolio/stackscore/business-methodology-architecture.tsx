import { ArrowDown, Blocks, Database, LockKeyhole, Workflow } from "lucide-react";
import { Eyebrow, VisualFrame } from "./visual-primitives";

const layers = [
  { title: "Business lifecycle", icon: Workflow, items: ["Discover", "Assess", "Plan", "Implement", "Measure"] },
  { title: "Product domains", icon: Blocks, items: ["Assessment", "Scoring", "Recommendations", "Technology Profile", "TIP", "Roadmap", "Proposals", "Projects", "QBR", "Billing", "Communications"] },
  { title: "System controls", icon: LockKeyhole, items: ["Versioning", "Snapshots", "Transactions", "Authorization", "Approval gates", "Audit events", "Idempotency"] },
  { title: "Platform", icon: Database, items: ["Next.js / TypeScript", "Domain services", "Prisma", "PostgreSQL", "Stripe", "Resend", "Vercel"] },
];

export function BusinessMethodologyArchitecture() {
  return (
    <VisualFrame label="Architecture · From Business Methodology to Operating Platform">
      <div className="p-6 sm:p-8">
        <div className="max-w-3xl"><Eyebrow>Architecture follows the operating method</Eyebrow><h3 className="mt-2 text-2xl font-semibold">Business intent flows downward into domains, controls, and platform choices</h3></div>
        <div className="mt-7 space-y-2">
          {layers.map((layer, index) => { const Icon = layer.icon; return <div key={layer.title}><div className={`grid gap-4 border p-4 sm:grid-cols-[13rem_1fr] sm:items-center ${index === 0 ? "border-primary/40 bg-primary/8" : "border-border bg-background"}`}><div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center border border-border bg-card"><Icon className="size-4 text-primary" /></span><div><div className="instrument-mono text-[9px] uppercase tracking-wider text-muted-foreground">Layer 0{index + 1}</div><div className="mt-1 text-sm font-semibold">{layer.title}</div></div></div><div className="flex flex-wrap gap-2">{layer.items.map((item) => <span className="border border-border bg-muted/25 px-2.5 py-1.5 text-xs text-muted-foreground" key={item}>{item}</span>)}</div></div>{index < layers.length - 1 ? <ArrowDown className="mx-auto my-[-1px] size-4 text-primary" /> : null}</div>; })}
        </div>
        <div className="mt-5 border-l-2 border-primary pl-4 text-sm text-muted-foreground">The diagram is intentionally not a cloud inventory: it shows how a consulting methodology becomes enforceable product behavior.</div>
      </div>
    </VisualFrame>
  );
}

