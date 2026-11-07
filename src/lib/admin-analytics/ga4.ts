import { createSign } from "node:crypto";
import { PROVIDER_CACHE_TTL_MS, withProviderCache } from "@/lib/admin-analytics/cache";
import { propertyIdFor, ProviderRequestError, readGa4ServiceAccount } from "@/lib/admin-analytics/connections";
import type { AnalyticsProperty, AnalyticsSection } from "@/lib/admin-analytics/types";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

type Ga4RawReport = {
  dimensionHeaders?: Array<{ name?: string }>;
  metricHeaders?: Array<{ name?: string }>;
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
};

export type Ga4Row = Record<string, string>;

let tokenCache: { token: string; expiresAt: number } | null = null;

function base64url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function signServiceAccountJwt(account: ServiceAccount): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: account.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${signer.sign(account.private_key).toString("base64url")}`;
}

async function getAccessToken(account: ServiceAccount): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signServiceAccountJwt(account),
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new ProviderRequestError(`GA4 authentication failed (${response.status}).`);
  }
  const payload = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!payload.access_token) {
    throw new ProviderRequestError("GA4 authentication did not return an access token.");
  }
  tokenCache = {
    token: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
  };
  return payload.access_token;
}

export function readGa4Rows(report: Ga4RawReport): Ga4Row[] {
  const dimensions = (report.dimensionHeaders ?? []).map((header) => header.name ?? "");
  const metrics = (report.metricHeaders ?? []).map((header) => header.name ?? "");
  return (report.rows ?? []).map((row) => {
    const record: Ga4Row = {};
    dimensions.forEach((name, index) => {
      if (name) record[name] = row.dimensionValues?.[index]?.value ?? "";
    });
    metrics.forEach((name, index) => {
      if (name) record[name] = row.metricValues?.[index]?.value ?? "";
    });
    return record;
  });
}

export function ga4Number(value: string | undefined): number | null {
  if (value == null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function rowsToBreakdown(
  rows: Ga4Row[],
  labelKey: string,
  valueKey: string,
  limit = 15,
): Array<{ label: string; value: number }> {
  return rows
    .map((row) => ({
      label: row[labelKey]?.trim() || "(not set)",
      value: ga4Number(row[valueKey]) ?? 0,
    }))
    .filter((row) => row.label.length > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

async function runReport(
  propertyId: string,
  token: string,
  body: Record<string, unknown>,
): Promise<Ga4Row[]> {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    },
  );
  if (!response.ok) {
    throw new ProviderRequestError(`GA4 report failed (${response.status}).`);
  }
  return readGa4Rows((await response.json()) as Ga4RawReport);
}

export type Ga4Bundle = {
  refreshedAt: string;
  users: { current: number; previous: number } | null;
  dailyUsers: Array<{ date: string; users: number }> | null;
  sources: Array<{ label: string; value: number }> | null;
  campaigns: Array<{ label: string; value: number }> | null;
  landingPages: Array<{ label: string; value: number }> | null;
  pages: Array<{ label: string; value: number }> | null;
  events: Array<{ label: string; value: number }> | null;
  demoUsers: number | null;
};

function metricForRange(rows: Ga4Row[], rangeName: string, metric: string): number {
  const match = rows.find((row) => row.dateRange === rangeName);
  return ga4Number(match?.[metric]) ?? 0;
}

function ga4Date(value: string): string {
  if (/^\d{8}$/.test(value)) return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  return value;
}

const STACKSCORE_EVENTS = [
  "view_technology_snapshot",
  "start_technology_snapshot",
  "complete_technology_snapshot",
  "snapshot_assessment_cta_click",
  "begin_assessment_checkout",
  "purchase",
  "assessment_purchased",
  "book_consultation",
  "bobkat_referral_landing",
];

const BOBKAT_EVENTS = [
  "book_consultation",
  "consultation_booked",
  "submit_contact_form",
  "contact_form_success",
  "free_snapshot_click",
  "platform_demo_click",
  "stackscore_link_click",
  "technology_assessment_click",
  "assessment_purchase_click",
  "phone_click",
  "email_click",
  "service_primary_cta_click",
];

export function ga4EventAllowlist(site: AnalyticsProperty): string[] {
  return site === "bobkat" ? BOBKAT_EVENTS : STACKSCORE_EVENTS;
}

export async function loadGa4Bundle(input: {
  site: AnalyticsProperty;
  section: AnalyticsSection;
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
}): Promise<Ga4Bundle> {
  const propertyId = propertyIdFor(input.site);
  const account = readGa4ServiceAccount();
  if (!propertyId || !account) {
    throw new ProviderRequestError("GA4 is not configured.");
  }

  const key = `ga4:${propertyId}:${input.section}:${input.from}:${input.to}:${input.previousFrom}:${input.previousTo}`;
  const cached = await withProviderCache(key, PROVIDER_CACHE_TTL_MS, async () => {
    const token = await getAccessToken(account);
    const currentRange = { startDate: input.from, endDate: input.to, name: "current" };
    const previousRange = {
      startDate: input.previousFrom,
      endDate: input.previousTo,
      name: "previous",
    };
    const empty: Omit<Ga4Bundle, "refreshedAt"> = {
      users: null,
      dailyUsers: null,
      sources: null,
      campaigns: null,
      landingPages: null,
      pages: null,
      events: null,
      demoUsers: null,
    };

    if (input.section === "overview") {
      const [totals, daily, booked] = await Promise.all([
        runReport(propertyId, token, {
          dateRanges: [currentRange, previousRange],
          metrics: [{ name: "totalUsers" }],
        }),
        runReport(propertyId, token, {
          dateRanges: [currentRange],
          dimensions: [{ name: "date" }],
          metrics: [{ name: "totalUsers" }],
          orderBys: [{ dimension: { dimensionName: "date" } }],
          limit: 366,
        }),
        input.site === "bobkat"
          ? eventReport(propertyId, token, currentRange, input.site, ["consultation_booked"])
          : Promise.resolve(null),
      ]);
      return {
        ...empty,
        users: {
          current: metricForRange(totals, "current", "totalUsers"),
          previous: metricForRange(totals, "previous", "totalUsers"),
        },
        dailyUsers: daily.map((row) => ({
          date: ga4Date(row.date ?? ""),
          users: ga4Number(row.totalUsers) ?? 0,
        })),
        events: booked,
      };
    }

    if (input.section === "acquisition") {
      const [sources, campaigns, landingPages, demo] = await Promise.all([
        runReport(propertyId, token, {
          dateRanges: [currentRange],
          dimensions: [{ name: "sessionSourceMedium" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 15,
        }),
        runReport(propertyId, token, {
          dateRanges: [currentRange],
          dimensions: [{ name: "sessionCampaignName" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 15,
        }),
        runReport(propertyId, token, {
          dateRanges: [currentRange],
          dimensions: [{ name: "landingPagePlusQueryString" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 15,
        }),
        runReport(propertyId, token, {
          dateRanges: [currentRange],
          metrics: [{ name: "totalUsers" }],
          dimensionFilter: {
            filter: {
              fieldName: "pagePath",
              stringFilter: { matchType: "BEGINS_WITH", value: "/demo" },
            },
          },
        }),
      ]);
      return {
        ...empty,
        sources: rowsToBreakdown(sources, "sessionSourceMedium", "sessions"),
        campaigns: rowsToBreakdown(campaigns, "sessionCampaignName", "sessions"),
        landingPages: rowsToBreakdown(landingPages, "landingPagePlusQueryString", "sessions"),
        demoUsers: ga4Number(demo[0]?.totalUsers) ?? 0,
      };
    }

    if (input.section === "content") {
      const [pages, eventRows] = await Promise.all([
        runReport(propertyId, token, {
          dateRanges: [currentRange],
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "screenPageViews" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 15,
        }),
        eventReport(propertyId, token, currentRange, input.site),
      ]);
      return {
        ...empty,
        pages: rowsToBreakdown(pages, "pagePath", "screenPageViews"),
        events: eventRows,
      };
    }

    return {
      ...empty,
      events: await eventReport(propertyId, token, currentRange, input.site),
    };
  });

  return { ...cached.value, refreshedAt: cached.refreshedAt };
}

async function eventReport(
  propertyId: string,
  token: string,
  currentRange: { startDate: string; endDate: string; name: string },
  site: AnalyticsProperty,
  names = ga4EventAllowlist(site),
): Promise<Array<{ label: string; value: number }>> {
  const events = names;
  const eventRows = await runReport(propertyId, token, {
    dateRanges: [currentRange],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      filter: { fieldName: "eventName", inListFilter: { values: events } },
    },
    limit: events.length,
  });
  const eventCounts = new Map(eventRows.map((row) => [row.eventName, ga4Number(row.eventCount) ?? 0]));
  return events.map((name) => ({ label: name, value: eventCounts.get(name) ?? 0 }));
}
