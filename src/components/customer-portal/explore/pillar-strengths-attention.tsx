"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { ClientStatusBadge } from "@/components/client-ui";
import { buttonClassName } from "@/components/ui/button";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import type { CustomerPillarControlFinding } from "@/lib/customer-portal/pillar-detail-dto";
import { cn } from "@/lib/utils";

const PREVIEW_LIMIT = 3;

type PillarStrengthsAttentionProps = {
  code: string;
  strengths: CustomerPillarControlFinding[];
  attentionItems: CustomerPillarControlFinding[];
};

/** SS-UX-016-R1 — Side-by-side What's Working / What Needs Attention. */
export function PillarStrengthsAttention({
  code,
  strengths,
  attentionItems,
}: PillarStrengthsAttentionProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FindingColumn
        id={`pillar-working-${code}`}
        title="What's Working"
        emptyTitle="No demonstrated strengths yet"
        emptyDescription="Satisfied assessment controls for this pillar will appear here when recorded."
        items={strengths}
        tone="success"
      />
      <FindingColumn
        id={`pillar-attention-${code}`}
        title="What Needs Attention"
        emptyTitle="No gaps recorded for this pillar"
        emptyDescription="Partially satisfied and not-satisfied controls will appear here when present. Nothing is invented to fill this section."
        items={attentionItems}
        tone="warning"
      />
    </div>
  );
}

function FindingColumn({
  id,
  title,
  emptyTitle,
  emptyDescription,
  items,
  tone,
}: {
  id: string;
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  items: CustomerPillarControlFinding[];
  tone: "success" | "warning";
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, PREVIEW_LIMIT);
  const hiddenCount = Math.max(0, items.length - PREVIEW_LIMIT);

  return (
    <section className="space-y-2" aria-labelledby={id}>
      <h3 id={id} className="text-sm font-semibold text-foreground">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{emptyTitle}. </span>
          {emptyDescription}
        </p>
      ) : (
        <>
          <ul className="space-y-1.5">
            {visible.map((item) => (
              <FindingRow key={item.questionCode} item={item} tone={tone} />
            ))}
          </ul>
          {hiddenCount > 0 ? (
            <button
              type="button"
              className={buttonClassName({ variant: "ghost", size: "sm" })}
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
            >
              {expanded ? "Show less" : `View all (${items.length})`}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}

function FindingRow({
  item,
  tone,
}: {
  item: CustomerPillarControlFinding;
  tone: "success" | "warning";
}) {
  return (
    <li
      className={cn(
        CLIENT_SURFACE_CARD,
        "flex items-start gap-2 rounded-sm border bg-card px-3 py-2.5",
      )}
    >
      {tone === "success" ? (
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
      ) : (
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden />
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <ClientStatusBadge tone={tone === "success" ? "default" : "warning"}>
            {item.resultLabel}
          </ClientStatusBadge>
          {item.isCritical ? (
            <ClientStatusBadge tone="warning">Critical flag</ClientStatusBadge>
          ) : null}
        </div>
        <p className="text-sm font-medium leading-snug text-foreground">{item.questionText}</p>
        <p className="text-xs text-muted-foreground">Recorded answer · {item.answerText}</p>
      </div>
    </li>
  );
}
