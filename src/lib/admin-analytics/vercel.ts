import { PROVIDER_CACHE_TTL_MS, withProviderCache } from "@/lib/admin-analytics/cache";
import { ProviderRequestError, vercelProjectId } from "@/lib/admin-analytics/connections";
import type { AnalyticsProperty, AnalyticsSection } from "@/lib/admin-analytics/types";

type VercelCount = {
  query?: { since?: string; until?: string };
  data?: { pageviews?: number; visitors?: number };
};

export type VercelBundle = {
  refreshedAt: string;
  visitors: { current: number; previous: number | null } | null;
  visitorWindowConfirmed: boolean | null;
  dailyVisitors: Array<{ date: string; visitors: number }> | null;
  referrers: Array<{ label: string; value: number }> | null;
  sources: Array<{ label: string; value: number }> | null;
  campaigns: Array<{ label: string; value: number }> | null;
  pages: Array<{ label: string; value: number }> | null;
  events: Array<{ label: string; value: number }> | null;
  demoVisitors: number | null;
  demoPageviews: number | null;
};

const STACKSCORE_EVENTS = [
  "demo_cta_clicked",
  "demo_started",
  "demo_completed",
  "demo_assessment_cta_clicked",
  "demo_discovery_call_clicked",
  "snapshot_start",
  "assessment_checkout_start",
  "assessment_purchase",
  "cal_booking_click",
  "service_cta_click",
];

export function vercelEventAllowlist(site: AnalyticsProperty): string[] {
  return site === "stackscore" ? STACKSCORE_EVENTS : [];
}

function token(): string {
  const value = process.env.VERCEL_WEB_ANALYTICS_TOKEN?.trim();
  if (!value) throw new ProviderRequestError("Vercel analytics is not configured.");
  return value;
}

async function vercelGet(path: string, params: Record<string, string>): Promise<unknown> {
  const url = new URL(`https://api.vercel.com${path}`);
  const teamId = process.env.VERCEL_TEAM_ID?.trim();
  if (teamId) url.searchParams.set("teamId", teamId);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token()}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new ProviderRequestError(`Vercel analytics request failed (${response.status}).`);
  }
  return response.json();
}

export function readVisitorCount(payload: unknown): { visitors: number; windowConfirmed: boolean } {
  if (!payload || typeof payload !== "object") {
    throw new ProviderRequestError("Vercel visitor count could not be read.");
  }
  const body = payload as VercelCount;
  const visitors = body.data?.visitors;
  if (typeof visitors !== "number" || !Number.isFinite(visitors)) {
    throw new ProviderRequestError("Vercel visitor count did not include a visitor total.");
  }
  return {
    visitors,
    windowConfirmed: typeof body.query?.since === "string" && body.query.since.length > 0,
  };
}

export function readAggregateRows(payload: unknown): Array<Record<string, unknown>> {
  if (!payload || typeof payload !== "object") {
    throw new ProviderRequestError("Vercel aggregate response could not be read.");
  }
  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) {
    throw new ProviderRequestError("Vercel aggregate response had no rows.");
  }
  return data.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object");
}

export function aggregateBreakdown(
  rows: Array<Record<string, unknown>>,
  dimension: string,
  metric: "pageviews" | "visitors" | "count",
): Array<{ label: string; value: number }> {
  const parsed = rows.map((row) => {
    const rawLabel = row[dimension];
    const rawValue = row[metric];
    const value = typeof rawValue === "number" ? rawValue : Number(rawValue);
    return {
      label: typeof rawLabel === "string" && rawLabel.trim() ? rawLabel : "(not set)",
      value,
    };
  });
  if (rows.length > 0 && parsed.some((row) => !Number.isFinite(row.value))) {
    throw new ProviderRequestError("Vercel rows did not include the requested metric.");
  }
  return parsed
    .filter((row) => Number.isFinite(row.value))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);
}

function dailyVisitors(rows: Array<Record<string, unknown>>): Array<{ date: string; visitors: number }> {
  return rows.map((row) => {
    const timestamp = typeof row.timestamp === "string" ? row.timestamp : "";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime()) || typeof row.visitors !== "number") {
      throw new ProviderRequestError("Vercel daily visitors could not be read.");
    }
    return { date: date.toISOString().slice(0, 10), visitors: row.visitors };
  });
}

function sumMetric(rows: Array<Record<string, unknown>>, metric: "pageviews"): number {
  if (rows.some((row) => typeof row[metric] !== "number")) {
    throw new ProviderRequestError("Vercel demo page views could not be read.");
  }
  return rows.reduce((sum, row) => sum + (row[metric] as number), 0);
}

export async function loadVercelBundle(input: {
  site: AnalyticsProperty;
  section: AnalyticsSection;
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
}): Promise<VercelBundle> {
  const projectId = vercelProjectId(input.site);
  if (!projectId) throw new ProviderRequestError("Vercel analytics is not configured.");

  const key = `vercel:${projectId}:${input.section}:${input.from}:${input.to}:${input.previousFrom}:${input.previousTo}`;
  const cached = await withProviderCache(key, PROVIDER_CACHE_TTL_MS, async () => {
    const base = { projectId, since: input.from, until: input.to };
    const empty: Omit<VercelBundle, "refreshedAt"> = {
      visitors: null,
      visitorWindowConfirmed: null,
      dailyVisitors: null,
      referrers: null,
      sources: null,
      campaigns: null,
      pages: null,
      events: null,
      demoVisitors: null,
      demoPageviews: null,
    };

    if (input.section === "overview") {
      const [currentPayload, previousPayload, dailyPayload] = await Promise.all([
        vercelGet("/v1/query/web-analytics/visits/count", base),
        vercelGet("/v1/query/web-analytics/visits/count", {
          projectId,
          since: input.previousFrom,
          until: input.previousTo,
        }),
        vercelGet("/v1/query/web-analytics/visits/aggregate", { ...base, by: "day" }),
      ]);
      const current = readVisitorCount(currentPayload);
      const previous = readVisitorCount(previousPayload);
      return {
        ...empty,
        visitorWindowConfirmed: current.windowConfirmed,
        visitors: current.windowConfirmed
          ? { current: current.visitors, previous: previous.windowConfirmed ? previous.visitors : null }
          : null,
        dailyVisitors: dailyVisitors(readAggregateRows(dailyPayload)),
      };
    }

    if (input.section === "acquisition") {
      const [referrers, sources, campaigns, pages, demoCount, demoDaily] = await Promise.all([
        vercelGet("/v1/query/web-analytics/visits/aggregate", { ...base, by: "referrerHostname", limit: "15" }),
        vercelGet("/v1/query/web-analytics/visits/aggregate", { ...base, by: "utmSource", limit: "15" }),
        vercelGet("/v1/query/web-analytics/visits/aggregate", { ...base, by: "utmCampaign", limit: "15" }),
        vercelGet("/v1/query/web-analytics/visits/aggregate", { ...base, by: "requestPath", limit: "15" }),
        input.site === "stackscore"
          ? vercelGet("/v1/query/web-analytics/visits/count", {
              ...base,
              filter: "startswith(requestPath, '/demo')",
            })
          : Promise.resolve(null),
        input.site === "stackscore"
          ? vercelGet("/v1/query/web-analytics/visits/aggregate", {
              ...base,
              by: "day",
              filter: "startswith(requestPath, '/demo')",
            })
          : Promise.resolve(null),
      ]);
      const demo = demoCount ? readVisitorCount(demoCount) : null;
      const demoRows = demoDaily ? readAggregateRows(demoDaily) : [];
      return {
        ...empty,
        referrers: aggregateBreakdown(readAggregateRows(referrers), "referrerHostname", "pageviews"),
        sources: aggregateBreakdown(readAggregateRows(sources), "utmSource", "pageviews"),
        campaigns: aggregateBreakdown(readAggregateRows(campaigns), "utmCampaign", "pageviews"),
        pages: aggregateBreakdown(readAggregateRows(pages), "requestPath", "pageviews"),
        demoVisitors: demo?.windowConfirmed ? demo.visitors : null,
        demoPageviews: demoDaily ? sumMetric(demoRows, "pageviews") : null,
      };
    }

    if (input.section === "content") {
      const pagesPayload = await vercelGet("/v1/query/web-analytics/visits/aggregate", {
        ...base,
        by: "requestPath",
        limit: "15",
      });
      const events = await loadEvents(input.site, base);
      return {
        ...empty,
        pages: aggregateBreakdown(readAggregateRows(pagesPayload), "requestPath", "pageviews"),
        events,
      };
    }

    return { ...empty, events: await loadEvents(input.site, base) };
  });

  return { ...cached.value, refreshedAt: cached.refreshedAt };
}

async function loadEvents(
  site: AnalyticsProperty,
  base: { projectId: string; since: string; until: string },
): Promise<Array<{ label: string; value: number }> | null> {
  const names = vercelEventAllowlist(site);
  if (names.length === 0) return null;
  const filter = names.map((name) => `eventName eq '${name}'`).join(" or ");
  const payload = await vercelGet("/v1/query/web-analytics/events/aggregate", {
    ...base,
    by: "eventName",
    filter,
    limit: String(names.length),
  });
  const rows = aggregateBreakdown(readAggregateRows(payload), "eventName", "count");
  const counts = new Map(rows.map((row) => [row.label, row.value]));
  return names.map((name) => ({ label: name, value: counts.get(name) ?? 0 }));
}
