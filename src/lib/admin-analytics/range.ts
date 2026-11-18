import type { AdminAnalyticsFilters, AnalyticsRangePreset, AnalyticsSection, AnalyticsSite } from "@/lib/admin-analytics/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAYS = 366;

const SITES = new Set<AnalyticsSite>(["all", "bobkat", "stackscore"]);
const SECTIONS = new Set<AnalyticsSection>(["overview", "acquisition", "conversion", "content"]);
const PRESETS = new Set<AnalyticsRangePreset>(["7d", "28d", "90d", "custom"]);

export function utcDayString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseUtcDay(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  if (utcDayString(date) !== value) return null;
  return date;
}

export function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function inclusiveDayCount(from: string, to: string): number {
  const start = parseUtcDay(from);
  const end = parseUtcDay(to);
  if (!start || !end) return 0;
  return Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
}

function presetDays(preset: Exclude<AnalyticsRangePreset, "custom">): number {
  if (preset === "7d") return 7;
  if (preset === "90d") return 90;
  return 28;
}

function windowEnding(to: string, days: number): { from: string; to: string } {
  const end = parseUtcDay(to) ?? parseUtcDay(utcDayString(new Date()))!;
  const start = addUtcDays(end, -(days - 1));
  return { from: utcDayString(start), to: utcDayString(end) };
}

function previousWindow(from: string, to: string): { from: string; to: string } {
  const days = inclusiveDayCount(from, to);
  const start = parseUtcDay(from)!;
  const previousEnd = addUtcDays(start, -1);
  const previousStart = addUtcDays(previousEnd, -(days - 1));
  return { from: utcDayString(previousStart), to: utcDayString(previousEnd) };
}

export function eachUtcDay(from: string, to: string): string[] {
  const start = parseUtcDay(from);
  const end = parseUtcDay(to);
  if (!start || !end || end < start) return [];
  const days: string[] = [];
  for (let cursor = start; cursor <= end && days.length <= MAX_DAYS; cursor = addUtcDays(cursor, 1)) {
    days.push(utcDayString(cursor));
  }
  return days;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseAdminAnalyticsFilters(
  params: Record<string, string | string[] | undefined>,
  now = new Date(),
): AdminAnalyticsFilters {
  const today = utcDayString(now);
  const siteParam = firstParam(params.site);
  const sectionParam = firstParam(params.section);
  const presetParam = firstParam(params.range);
  const site = SITES.has(siteParam as AnalyticsSite) ? (siteParam as AnalyticsSite) : "all";
  const section = SECTIONS.has(sectionParam as AnalyticsSection)
    ? (sectionParam as AnalyticsSection)
    : "overview";
  const preset = PRESETS.has(presetParam as AnalyticsRangePreset)
    ? (presetParam as AnalyticsRangePreset)
    : "28d";

  let warning: string | undefined;
  let from: string;
  let to: string;

  if (preset === "custom") {
    const requestedFrom = firstParam(params.from);
    const requestedTo = firstParam(params.to);
    const parsedFrom = requestedFrom ? parseUtcDay(requestedFrom) : null;
    const parsedTo = requestedTo ? parseUtcDay(requestedTo) : null;
    if (!parsedFrom || !parsedTo || parsedFrom > parsedTo) {
      const fallback = windowEnding(today, 28);
      from = fallback.from;
      to = fallback.to;
      warning = "The custom date range was invalid. Showing the last 28 UTC days.";
    } else {
      from = utcDayString(parsedFrom);
      to = utcDayString(parsedTo);
      const days = inclusiveDayCount(from, to);
      if (days > MAX_DAYS) {
        from = utcDayString(addUtcDays(parsedTo, -(MAX_DAYS - 1)));
        warning = `Custom ranges are limited to ${MAX_DAYS} days. The start date was moved forward.`;
      }
    }
  } else {
    const window = windowEnding(today, presetDays(preset));
    from = window.from;
    to = window.to;
  }

  const previous = previousWindow(from, to);
  return {
    site,
    section,
    preset: warning && preset === "custom" && warning.includes("invalid") ? "28d" : preset,
    from,
    to,
    previousFrom: previous.from,
    previousTo: previous.to,
    dayCount: inclusiveDayCount(from, to),
    warning,
  };
}

export function rangeStart(day: string): Date {
  return parseUtcDay(day)!;
}

export function rangeEndExclusive(day: string): Date {
  return addUtcDays(parseUtcDay(day)!, 1);
}

export function isDayInRange(day: string, from: string, to: string): boolean {
  return day >= from && day <= to;
}
