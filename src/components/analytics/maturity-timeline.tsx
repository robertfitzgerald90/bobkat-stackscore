import { CheckCircle2, ClipboardList, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MaturityTimelineEvent } from "@/lib/analytics/types";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

type MaturityTimelineProps = {
  events: MaturityTimelineEvent[];
};

const EVENT_META = {
  assessment: {
    icon: ClipboardList,
    badge: "Assessment Completed",
    accent: "border-brand/30 bg-brand/5",
    iconClass: "text-brand",
  },
  project: {
    icon: CheckCircle2,
    badge: "Project Completed",
    accent: "border-success/30 bg-success/5",
    iconClass: "text-success",
  },
  recommendation: {
    icon: Lightbulb,
    badge: "Recommendation Closed",
    accent: "border-muted-foreground/20 bg-muted/20",
    iconClass: "text-muted-foreground",
  },
} as const;

export function MaturityTimeline({ events }: MaturityTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Timeline events appear as assessments, projects, and recommendations are completed.
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute top-3 bottom-3 left-[1.125rem] w-px bg-border" />
      {events.map((event, index) => {
        const meta = EVENT_META[event.type];
        const Icon = meta.icon;

        return (
          <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            <div
              className={cn(
                "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-card",
                meta.accent,
              )}
            >
              <Icon className={cn("h-4 w-4", meta.iconClass)} />
            </div>
            <div className="min-w-0 flex-1 rounded-lg border border-border/60 bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium leading-snug">{event.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{event.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{event.dateLabel}</p>
                  {event.score !== undefined ? (
                    <p className={cn("text-lg font-bold tabular-nums", getScoreTextColorClass(event.score))}>
                      {event.score}
                    </p>
                  ) : null}
                </div>
              </div>
              <Badge variant="outline" className="mt-3 text-xs">
                {meta.badge}
              </Badge>
              {index === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">Most recent milestone</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
