"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { AdminAnalyticsFilters } from "@/lib/admin-analytics/types";

const fieldClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AnalyticsFilters({ filters }: { filters: AdminAnalyticsFilters }) {
  const [preset, setPreset] = useState(filters.preset);

  return (
    <form method="get" className="grid gap-3 rounded-xl border bg-card p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] xl:items-end">
      <input type="hidden" name="section" value={filters.section} />
      <div className="space-y-1.5">
        <Label htmlFor="analytics-site">Site</Label>
        <select id="analytics-site" name="site" defaultValue={filters.site} className={fieldClass}>
          <option value="all">Both properties</option>
          <option value="bobkat">Bobkat IT</option>
          <option value="stackscore">StackScore</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="analytics-range">Date range</Label>
        <select
          id="analytics-range"
          name="range"
          value={preset}
          onChange={(event) => setPreset(event.target.value as AdminAnalyticsFilters["preset"])}
          className={fieldClass}
        >
          <option value="7d">Last 7 days</option>
          <option value="28d">Last 28 days</option>
          <option value="90d">Last 90 days</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="analytics-from">From</Label>
        <input
          id="analytics-from"
          name="from"
          type="date"
          defaultValue={filters.from}
          disabled={preset !== "custom"}
          className={fieldClass}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="analytics-to">To</Label>
        <input
          id="analytics-to"
          name="to"
          type="date"
          defaultValue={filters.to}
          disabled={preset !== "custom"}
          className={fieldClass}
        />
      </div>
      <Button type="submit" className="w-full xl:w-auto">
        Apply
      </Button>
      <p className="text-xs text-muted-foreground sm:col-span-2 xl:col-span-5">
        Dates are UTC. The prior period is the {filters.dayCount} days immediately before this range.
        {preset !== "custom" ? " Custom dates apply only when the range is Custom." : ""}
      </p>
    </form>
  );
}
