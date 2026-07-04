"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  Flag,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import {
  filterJourneyTimelineEvents,
  JOURNEY_TIMELINE_EVENT_LABELS,
  JOURNEY_TIMELINE_FILTER_LABELS,
  type JourneyTimelineEvent,
  type JourneyTimelineEventType,
  type JourneyTimelineFilter,
} from "@/lib/technology-profile/timeline";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

const FILTERS: JourneyTimelineFilter[] = [
  "all",
  "assessments",
  "projects",
  "reports",
  "reviews",
  "profile",
];

const EVENT_META: Record<
  JourneyTimelineEventType,
  { icon: typeof ClipboardList; accent: string; iconClass: string }
> = {
  business_profile: {
    icon: Building2,
    accent: "border-brand/30 bg-brand/5",
    iconClass: "text-brand",
  },
  assessment: {
    icon: ClipboardList,
    accent: "border-brand/30 bg-brand/5",
    iconClass: "text-brand",
  },
  tip: {
    icon: Lightbulb,
    accent: "border-primary/30 bg-primary/5",
    iconClass: "text-primary",
  },
  project_approved: {
    icon: Flag,
    accent: "border-warning/30 bg-warning/5",
    iconClass: "text-warning",
  },
  project_completed: {
    icon: CheckCircle2,
    accent: "border-success/30 bg-success/5",
    iconClass: "text-success",
  },
  completion_report: {
    icon: FileText,
    accent: "border-muted-foreground/20 bg-muted/20",
    iconClass: "text-muted-foreground",
  },
  progress_report: {
    icon: TrendingUp,
    accent: "border-muted-foreground/20 bg-muted/20",
    iconClass: "text-muted-foreground",
  },
  quarterly_review: {
    icon: FileText,
    accent: "border-brand/20 bg-brand/5",
    iconClass: "text-brand",
  },
  profile_milestone: {
    icon: TrendingUp,
    accent: "border-primary/20 bg-primary/5",
    iconClass: "text-primary",
  },
};

type TpJourneyTimelineProps = {
  clientId: string;
  events: JourneyTimelineEvent[];
  assessmentsCompleted: number;
  /** When true, omits card chrome for workspace section embedding. */
  embedded?: boolean;
};

export function TpJourneyTimeline({
  clientId,
  events,
  assessmentsCompleted,
  embedded = false,
}: TpJourneyTimelineProps) {
  const [filter, setFilter] = useState<JourneyTimelineFilter>("all");
  const visibleEvents = useMemo(
    () => filterJourneyTimelineEvents(events, filter),
    [events, filter],
  );

  return (
    <Card className="stat-card">
      {!embedded ? (
        <CardHeader>
          <CardTitle>Technology Journey</CardTitle>
          <CardDescription>
            A chronological record of assessments, projects, reports, and Technology Maturity Profile
            milestones.
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={cn("space-y-5", embedded && "pt-(--card-spacing)")}>
        {embedded ? (
          <p className="text-sm text-muted-foreground">
            Chronological record of assessments, projects, reports, and profile milestones.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filter === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {JOURNEY_TIMELINE_FILTER_LABELS[option]}
            </button>
          ))}
        </div>

        {visibleEvents.length === 0 ? (
          assessmentsCompleted === 0 ? (
            <TpEmptyState
              icon={ClipboardList}
              title="Journey starts with an assessment"
              message="Complete an assessment to begin building this client's technology story."
              actionLabel="Start assessment"
              actionHref={`/clients/${clientId}/technology-profile`}
            />
          ) : (
            <TpEmptyState
              icon={FileText}
              title="No events in this category"
              message="Try another filter to explore this client's technology journey."
            />
          )
        ) : (
          <div className="relative space-y-0">
            <div className="absolute top-3 bottom-3 left-[1.125rem] w-px bg-border" />
            {visibleEvents.map((event, index) => (
              <TimelineEventRow key={event.id} event={event} isLatest={index === 0} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TimelineEventRow({
  event,
  isLatest,
}: {
  event: JourneyTimelineEvent;
  isLatest: boolean;
}) {
  const meta = EVENT_META[event.eventType];
  const Icon = meta.icon;

  const card = (
    <div className="min-w-0 flex-1 rounded-lg border border-border/60 bg-card p-4 transition-colors hover:border-border">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="min-w-0 break-words font-medium leading-snug">{event.title}</p>
            <Badge variant="outline" className="text-xs">
              {JOURNEY_TIMELINE_EVENT_LABELS[event.eventType]}
            </Badge>
          </div>
          <p className="break-words text-sm text-muted-foreground">{event.description}</p>
          {event.profileImpact ? (
            <p className="text-sm text-foreground/90">
              <span className="font-medium">Profile impact:</span> {event.profileImpact}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 sm:text-right">
          <p className="text-sm font-medium">{event.dateLabel}</p>
          {event.score !== null ? (
            <p
              className={cn(
                "text-lg font-bold tabular-nums",
                getScoreTextColorClass(event.score),
              )}
            >
              {event.score}
            </p>
          ) : null}
        </div>
      </div>
      {isLatest ? (
        <p className="mt-2 text-xs text-muted-foreground">Most recent milestone</p>
      ) : null}
    </div>
  );

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      <div
        className={cn(
          "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-card",
          meta.accent,
        )}
      >
        <Icon className={cn("h-4 w-4", meta.iconClass)} />
      </div>
      {!event.href ? (
        card
      ) : event.href.startsWith("/api/") ? (
        <a href={event.href} className="min-w-0 flex-1" target="_blank" rel="noreferrer">
          {card}
        </a>
      ) : (
        <Link href={event.href} className="min-w-0 flex-1">
          {card}
        </Link>
      )}
    </div>
  );
}
