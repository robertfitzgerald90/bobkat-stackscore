"use client";

import Link from "next/link";
import {
  CommunicationsPanel,
  StatusPill,
} from "@/components/communications/communications-shell";

type ClientActivityTimelineViewProps = {
  companyName: string;
  events: Array<{
    id: string;
    category: string;
    eventType: string;
    title: string;
    description: string | null;
    occurredAt: string;
    visibility: string;
  }>;
  includeInternal: boolean;
};

export function ClientActivityTimelineView({
  companyName,
  events,
  includeInternal,
}: ClientActivityTimelineViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#082F5B]">Activity Timeline</h2>
        <p className="mt-1 text-muted-foreground">
          Unified customer activity for {companyName}
          {includeInternal ? " including internal communications diagnostics." : "."}
        </p>
      </div>

      <CommunicationsPanel title="Recent Activity">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-[#1e3a5f]/10 bg-[#082F5B]/[0.02] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{event.title}</p>
                  <StatusPill tone="neutral">{event.category}</StatusPill>
                  {event.visibility === "INTERNAL" ? (
                    <StatusPill tone="info">Internal</StatusPill>
                  ) : null}
                </div>
                {event.description ? (
                  <p className="mt-1 text-sm text-secondary-token">{event.description}</p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(event.occurredAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CommunicationsPanel>

      <p className="text-sm text-muted-foreground">
        Need delivery details?{" "}
        <Link href="/admin/communications/history" className="font-medium text-[#082F5B] hover:underline">
          Open Communication History
        </Link>
      </p>
    </div>
  );
}
