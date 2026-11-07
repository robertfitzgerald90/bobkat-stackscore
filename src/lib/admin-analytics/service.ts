import { loadApplicationAnalytics, type ApplicationAnalytics } from "@/lib/admin-analytics/application";
import {
  ga4Gate,
  ProviderRequestError,
  selectedProperties,
  vercelGate,
} from "@/lib/admin-analytics/connections";
import { loadGa4Bundle, type Ga4Bundle } from "@/lib/admin-analytics/ga4";
import { eachUtcDay, parseAdminAnalyticsFilters } from "@/lib/admin-analytics/range";
import { supportedRate } from "@/lib/admin-analytics/rates";
import { summarizePurchases, type PurchaseSummary } from "@/lib/admin-analytics/revenue";
import type {
  AdminAnalyticsDashboard,
  AdminAnalyticsFilters,
  AnalyticsProperty,
  BreakdownTable,
  ConnectionState,
  CountMetric,
  RateMetric,
  TimeSeries,
} from "@/lib/admin-analytics/types";
import { loadVercelBundle, type VercelBundle } from "@/lib/admin-analytics/vercel";

const PROPERTY_LABEL: Record<AnalyticsProperty, string> = {
  bobkat: "Bobkat IT",
  stackscore: "StackScore",
};

const REVENUE_DEFINITION =
  "Net amount stored on confirmed Technology Assessment checkouts (AssessmentPurchase.amountTotal) with status fulfilled and payment status paid. Full refunds, including a BillingPayment with the same Stripe payment intent marked refunded, are excluded. Partial refunds and disputes are omitted because the retained cents are not stored. Pending and failed checkouts are excluded. Stripe test-mode sessions and internal or test emails are excluded. This is recorded checkout cash, not accounting revenue, and it excludes consulting subscriptions and manual invoices.";

const PAID_DEFINITION =
  "Technology Assessment purchases with status fulfilled and payment status paid in the selected UTC dates. Full refunds, disputes, Stripe test-mode sessions, and internal or test emails are excluded. Partially refunded purchases stay in the count and are omitted from revenue.";

type Ga4Result = {
  gate: { status: "ready" | "not_connected" | "unavailable"; message: string };
  bundle: Ga4Bundle | null;
  error: string | null;
};

type VercelResult = {
  gate: { status: "ready" | "not_connected" | "unavailable"; message: string };
  bundle: VercelBundle | null;
  error: string | null;
};

function includesBobkat(filters: AdminAnalyticsFilters): boolean {
  return filters.site !== "stackscore";
}

function includesStackscore(filters: AdminAnalyticsFilters): boolean {
  return filters.site !== "bobkat";
}

function unavailableMetric(
  id: string,
  label: string,
  availability: CountMetric["availability"],
  source: string,
  definition: string,
  refreshedAt: string,
  note?: string,
): CountMetric {
  return {
    id,
    label,
    availability,
    value: null,
    previousValue: null,
    unit: "count",
    source,
    definition,
    refreshedAt,
    note,
  };
}

function countMetric(
  id: string,
  label: string,
  value: number,
  previousValue: number | null,
  source: string,
  definition: string,
  refreshedAt: string,
  note?: string,
): CountMetric {
  return {
    id,
    label,
    availability: "available",
    value,
    previousValue,
    unit: "count",
    source,
    definition,
    refreshedAt,
    note,
  };
}

function exclusionNote(count: number, noun: string): string | undefined {
  if (count <= 0) return undefined;
  return `Excluded ${count} internal or test ${noun}${count === 1 ? "" : "s"}.`;
}

function joinNotes(...notes: Array<string | undefined>): string | undefined {
  const text = notes.filter(Boolean).join(" ");
  return text || undefined;
}

function table(
  id: string,
  title: string,
  availability: BreakdownTable["availability"],
  source: string,
  definition: string,
  valueLabel: string,
  refreshedAt: string,
  rows: BreakdownTable["rows"] = [],
  note?: string,
): BreakdownTable {
  return { id, title, availability, source, definition, valueLabel, refreshedAt, rows, note };
}

function emptySeries(
  id: string,
  title: string,
  availability: TimeSeries["availability"],
  source: string,
  definition: string,
  refreshedAt: string,
  note?: string,
): TimeSeries {
  return { id, title, availability, source, definition, refreshedAt, series: [], points: [], note };
}

function providerFailure(error: unknown): string {
  if (error instanceof ProviderRequestError) return error.message;
  return "The provider request failed.";
}

async function loadGa4(property: AnalyticsProperty, filters: AdminAnalyticsFilters): Promise<Ga4Result> {
  const gate = ga4Gate(property);
  if (gate.status !== "ready") return { gate, bundle: null, error: null };
  try {
    const bundle = await loadGa4Bundle({
      site: property,
      section: filters.section,
      from: filters.from,
      to: filters.to,
      previousFrom: filters.previousFrom,
      previousTo: filters.previousTo,
    });
    return { gate, bundle, error: null };
  } catch (error) {
    return { gate: { ...gate, status: "unavailable" }, bundle: null, error: providerFailure(error) };
  }
}

async function loadVercel(property: AnalyticsProperty, filters: AdminAnalyticsFilters): Promise<VercelResult> {
  const gate = vercelGate(property);
  if (gate.status !== "ready") return { gate, bundle: null, error: null };
  try {
    const bundle = await loadVercelBundle({
      site: property,
      section: filters.section,
      from: filters.from,
      to: filters.to,
      previousFrom: filters.previousFrom,
      previousTo: filters.previousTo,
    });
    return { gate, bundle, error: null };
  } catch (error) {
    return { gate: { ...gate, status: "unavailable" }, bundle: null, error: providerFailure(error) };
  }
}

function connectionState(status: "ready" | "not_connected" | "unavailable"): ConnectionState {
  if (status === "ready") return "connected";
  return status;
}

export async function getAdminAnalyticsDashboard(
  params: Record<string, string | string[] | undefined>,
): Promise<AdminAnalyticsDashboard> {
  const filters = parseAdminAnalyticsFilters(params);
  const properties = selectedProperties(filters.site);
  const [application, ga4, vercel] = await Promise.all([
    loadApplicationAnalytics(filters),
    Promise.all(properties.map((property) => loadGa4(property, filters))),
    Promise.all(properties.map((property) => loadVercel(property, filters))),
  ]);
  const ga4BySite = new Map(properties.map((property, index) => [property, ga4[index]!]));
  const vercelBySite = new Map(properties.map((property, index) => [property, vercel[index]!]));
  return assemble(filters, application, ga4BySite, vercelBySite);
}

function assemble(
  filters: AdminAnalyticsFilters,
  application: ApplicationAnalytics,
  ga4BySite: Map<AnalyticsProperty, Ga4Result>,
  vercelBySite: Map<AnalyticsProperty, VercelResult>,
): AdminAnalyticsDashboard {
  const staffEmails = new Set(application.staffEmails);
  const currentSummary = summarizePurchases(application.purchaseFacts.current, staffEmails);
  const previousSummary = summarizePurchases(application.purchaseFacts.previous, staffEmails);
  const generatedAt = application.refreshedAt;
  const visitors = visitorMetrics(filters, ga4BySite, vercelBySite, generatedAt);

  return {
    filters,
    generatedAt,
    visitors,
    overview: overviewMetrics(filters, application, currentSummary, previousSummary, ga4BySite),
    activity: activitySeries(filters, application),
    visitorsOverTime: visitorSeries(filters, visitors, ga4BySite, vercelBySite),
    acquisition: acquisitionTables(ga4BySite, vercelBySite, generatedAt),
    demo: demoMetric(filters, ga4BySite, vercelBySite, generatedAt),
    conversionSteps: conversionStepMetrics(
      filters,
      application,
      currentSummary,
      previousSummary,
      ga4BySite,
      vercelBySite,
    ),
    conversionRates: conversionRateMetrics(currentSummary, ga4BySite, generatedAt),
    pages: pageTables(ga4BySite, vercelBySite, generatedAt),
    ctas: ctaTables(ga4BySite, vercelBySite, generatedAt),
    connections: connectionRows(ga4BySite, vercelBySite),
    followUps: [
      "Google Search Console is not connected. It needs a Search Console user on each property and a separate API credential.",
      "Campaign rows are the provider's source, medium, campaign, and landing page. There is no multi-touch attribution model.",
      "Bobkat IT and StackScore stay separate. These records do not measure one cross-domain customer journey.",
    ],
  };
}

function visitorMetrics(
  filters: AdminAnalyticsFilters,
  ga4BySite: Map<AnalyticsProperty, Ga4Result>,
  vercelBySite: Map<AnalyticsProperty, VercelResult>,
  generatedAt: string,
): CountMetric[] {
  return selectedProperties(filters.site).map((property) => {
    const label = `${PROPERTY_LABEL[property]} visitors`;
    const ga4 = ga4BySite.get(property)!;
    const vercel = vercelBySite.get(property)!;
    if (ga4.gate.status === "ready" && ga4.bundle?.users) {
      return countMetric(
        `visitors-${property}`,
        label,
        ga4.bundle.users.current,
        ga4.bundle.users.previous,
        `GA4 Data API · ${PROPERTY_LABEL[property]} users`,
        "GA4 total users for the property. This is not added to Vercel visitors or to the other site.",
        ga4.bundle.refreshedAt,
      );
    }
    if (ga4.gate.status === "unavailable" || ga4.error) {
      return unavailableMetric(
        `visitors-${property}`,
        label,
        "unavailable",
        `GA4 Data API · ${PROPERTY_LABEL[property]}`,
        "GA4 total users.",
        generatedAt,
        ga4.error ?? ga4.gate.message,
      );
    }
    if (vercel.bundle?.visitorWindowConfirmed && vercel.bundle.visitors) {
      return countMetric(
        `visitors-${property}`,
        label,
        vercel.bundle.visitors.current,
        vercel.bundle.visitors.previous,
        `Vercel Web Analytics · ${PROPERTY_LABEL[property]} visitors`,
        "Vercel production visitors for the selected dates. Page views are not used as a substitute. Internal traffic is not removed here.",
        vercel.bundle.refreshedAt,
        vercel.bundle.visitors.previous == null
          ? "The prior period did not confirm a date window, so no comparison is shown."
          : undefined,
      );
    }
    if (vercel.bundle && vercel.bundle.visitorWindowConfirmed === false) {
      return unavailableMetric(
        `visitors-${property}`,
        label,
        "unavailable",
        `Vercel Web Analytics · ${PROPERTY_LABEL[property]}`,
        "Vercel production visitors.",
        vercel.bundle.refreshedAt,
        "Vercel did not confirm a date-bounded visitor count, so the lifetime total is not shown.",
      );
    }
    if (vercel.gate.status === "unavailable" || vercel.error) {
      return unavailableMetric(
        `visitors-${property}`,
        label,
        "unavailable",
        `Vercel Web Analytics · ${PROPERTY_LABEL[property]}`,
        "Vercel production visitors.",
        generatedAt,
        vercel.error ?? vercel.gate.message,
      );
    }
    return unavailableMetric(
      `visitors-${property}`,
      label,
      "not_connected",
      "GA4 or Vercel Web Analytics",
      "Anonymous visitors are not stored in StackScore.",
      generatedAt,
      ga4.gate.message,
    );
  });
}

function overviewMetrics(
  filters: AdminAnalyticsFilters,
  application: ApplicationAnalytics,
  currentSummary: PurchaseSummary,
  previousSummary: PurchaseSummary,
  ga4BySite: Map<AnalyticsProperty, Ga4Result>,
): CountMetric[] {
  const refreshedAt = application.refreshedAt;
  const bobkat = includesBobkat(filters);
  const stackscore = includesStackscore(filters);
  const bookings = confirmedBookings(filters, ga4BySite, refreshedAt);

  const marked = bobkat
    ? countMetric(
        "consultations-marked",
        "Leads marked consultation booked",
        application.consultationsMarked.total,
        application.consultationsMarked.previous,
        "StackScore website lead records",
        "Website leads whose current status is Consultation booked and whose record was updated in the range. This is a staff status, not a Cal.com booking. Leads later moved to Converted or Closed are not included.",
        refreshedAt,
        exclusionNote(application.consultationsMarked.excluded, "lead"),
      )
    : unavailableMetric(
        "consultations-marked",
        "Leads marked consultation booked",
        "not_tracked",
        "StackScore website lead records",
        "Consultation status is recorded on Bobkat IT contact leads.",
        refreshedAt,
        "Switch the site filter to Bobkat IT or Both.",
      );

  const inquiries = bobkat
    ? countMetric(
        "inquiries",
        "Contact inquiries",
        application.inquiries.total,
        application.inquiries.previous,
        "StackScore website lead records",
        "Contact form submissions from bobkatit.com stored as website leads. Snapshot submissions are not included.",
        refreshedAt,
        exclusionNote(application.inquiries.excluded, "inquiry"),
      )
    : unavailableMetric(
        "inquiries",
        "Contact inquiries",
        "not_tracked",
        "StackScore website lead records",
        "Contact inquiries are submitted on bobkatit.com.",
        refreshedAt,
        "Switch the site filter to Bobkat IT or Both.",
      );

  const snapshots = stackscore
    ? countMetric(
        "snapshots",
        "Completed free snapshots",
        application.snapshots.total,
        application.snapshots.previous,
        "StackScore technology snapshot submissions",
        "Snapshot questionnaires submitted in the range, including leads later archived. Archive is a follow-up status. Starts that were abandoned are not stored.",
        refreshedAt,
        exclusionNote(application.snapshots.excluded, "submission"),
      )
    : unavailableMetric(
        "snapshots",
        "Completed free snapshots",
        "not_tracked",
        "StackScore technology snapshot submissions",
        "Free snapshots are submitted on stackscore.tech.",
        refreshedAt,
        "Switch the site filter to StackScore or Both.",
      );

  const paid = stackscore
    ? countMetric(
        "paid-assessments",
        "Paid assessments",
        currentSummary.paidCount,
        previousSummary.paidCount,
        "StackScore assessment purchase records",
        PAID_DEFINITION,
        refreshedAt,
        joinNotes(...currentSummary.countNotes),
      )
    : unavailableMetric(
        "paid-assessments",
        "Paid assessments",
        "not_tracked",
        "StackScore assessment purchase records",
        "Assessment checkout is recorded in StackScore.",
        refreshedAt,
        "Switch the site filter to StackScore or Both.",
      );

  const revenue = revenueMetric(stackscore, currentSummary, previousSummary, refreshedAt);

  return [bookings, marked, inquiries, snapshots, paid, revenue];
}

function confirmedBookings(
  filters: AdminAnalyticsFilters,
  ga4BySite: Map<AnalyticsProperty, Ga4Result>,
  refreshedAt: string,
): CountMetric {
  if (!includesBobkat(filters)) {
    return unavailableMetric(
      "consultations-confirmed",
      "Confirmed consultation bookings",
      "not_tracked",
      "GA4 · Bobkat IT",
      "Completed Cal.com bookings are measured on bobkatit.com.",
      refreshedAt,
      "Switch the site filter to Bobkat IT or Both.",
    );
  }
  const ga4 = ga4BySite.get("bobkat");
  const event = ga4?.bundle?.events?.find((row) => row.label === "consultation_booked");
  if (event && ga4?.bundle) {
    return countMetric(
      "consultations-confirmed",
      "Confirmed consultation bookings",
      event.value,
      null,
      "GA4 Data API · Bobkat IT event consultation_booked",
      "Completed Cal.com bookings sent by the bobkatit.com site. This event query does not include the prior window, so no comparison is shown. It is not joined to StackScore leads.",
      ga4.bundle.refreshedAt,
    );
  }
  if (ga4?.error || ga4?.gate.status === "unavailable") {
    return unavailableMetric(
      "consultations-confirmed",
      "Confirmed consultation bookings",
      "unavailable",
      "GA4 Data API · Bobkat IT",
      "Completed Cal.com bookings.",
      refreshedAt,
      ga4.error ?? ga4.gate.message,
    );
  }
  return unavailableMetric(
    "consultations-confirmed",
    "Confirmed consultation bookings",
    "not_connected",
    "GA4 Data API · Bobkat IT",
    "Completed Cal.com bookings are sent to GA4 as consultation_booked. StackScore does not store the booking.",
    refreshedAt,
    ga4?.gate.message,
  );
}

function revenueMetric(
  applicable: boolean,
  currentSummary: PurchaseSummary,
  previousSummary: PurchaseSummary,
  refreshedAt: string,
): CountMetric {
  if (!applicable) {
    return unavailableMetric(
      "revenue",
      "Assessment revenue",
      "not_tracked",
      "StackScore assessment purchase records",
      REVENUE_DEFINITION,
      refreshedAt,
      "Switch the site filter to StackScore or Both.",
    );
  }
  if (currentSummary.revenueAvailability !== "available" || currentSummary.revenueCents == null) {
    return unavailableMetric(
      "revenue",
      "Assessment revenue",
      "unavailable",
      "StackScore assessment purchase records",
      REVENUE_DEFINITION,
      refreshedAt,
      joinNotes(...currentSummary.notes),
    );
  }
  const previous =
    previousSummary.revenueAvailability === "available" ? previousSummary.revenueCents : null;
  return {
    id: "revenue",
    label: "Assessment revenue",
    availability: "available",
    value: currentSummary.revenueCents,
    previousValue: previous,
    unit: "currency_cents",
    currency: currentSummary.currency ?? "usd",
    source: "StackScore assessment purchase records",
    definition: REVENUE_DEFINITION,
    refreshedAt,
    note: joinNotes(...currentSummary.notes),
  };
}

function activitySeries(filters: AdminAnalyticsFilters, application: ApplicationAnalytics): TimeSeries {
  const series: Array<{ key: string; label: string; daily: Record<string, number> }> = [];
  if (includesBobkat(filters)) {
    series.push({ key: "inquiries", label: "Contact inquiries", daily: application.inquiries.daily });
  }
  if (includesStackscore(filters)) {
    series.push(
      { key: "snapshots", label: "Completed snapshots", daily: application.snapshots.daily },
      { key: "purchases", label: "Paid assessments", daily: {} },
    );
  }
  const purchaseSummary = summarizePurchases(
    application.purchaseFacts.current,
    new Set(application.staffEmails),
  );
  const purchaseSeries = series.find((item) => item.key === "purchases");
  if (purchaseSeries) purchaseSeries.daily = purchaseSummary.dailyPaid;

  return {
    id: "activity",
    title: "Recorded activity",
    availability: "available",
    source: "StackScore application records",
    definition: "Daily counts of stored records. A day with no rows is a real zero. Anonymous traffic is not on this chart.",
    refreshedAt: application.refreshedAt,
    series: series.map(({ key, label }) => ({ key, label })),
    points: eachUtcDay(filters.from, filters.to).map((date) => ({
      date,
      values: Object.fromEntries(series.map((item) => [item.key, item.daily[date] ?? 0])),
    })),
  };
}

function visitorSeries(
  filters: AdminAnalyticsFilters,
  visitors: CountMetric[],
  ga4BySite: Map<AnalyticsProperty, Ga4Result>,
  vercelBySite: Map<AnalyticsProperty, VercelResult>,
): TimeSeries {
  const available = visitors.filter((metric) => metric.availability === "available");
  if (available.length === 0) {
    return emptySeries(
      "visitors-trend",
      "Visitors",
      visitors.some((metric) => metric.availability === "unavailable") ? "unavailable" : "not_connected",
      "GA4 or Vercel Web Analytics",
      "Anonymous visitor trend.",
      visitors[0]?.refreshedAt ?? new Date().toISOString(),
      "Connect a provider to chart visitors. Missing traffic is not shown as zero.",
    );
  }
  const kinds = new Set(available.map((metric) => (metric.source.startsWith("GA4") ? "ga4" : "vercel")));
  if (kinds.size > 1) {
    return emptySeries(
      "visitors-trend",
      "Visitors",
      "unavailable",
      "GA4 and Vercel Web Analytics",
      "Visitor trend.",
      available[0]!.refreshedAt,
      "The properties are not on the same visitor source, so their trends are not drawn together.",
    );
  }
  const kind = [...kinds][0];
  const series = available.flatMap((metric) => {
    const property = metric.id.endsWith("bobkat") ? "bobkat" : "stackscore";
    const points =
      kind === "ga4"
        ? ga4BySite.get(property)?.bundle?.dailyUsers
        : vercelBySite.get(property)?.bundle?.dailyVisitors?.map((point) => ({
            date: point.date,
            users: point.visitors,
          }));
    if (!points) return [];
    return [{ key: property, label: PROPERTY_LABEL[property], points }];
  });
  if (series.length !== available.length) {
    return emptySeries(
      "visitors-trend",
      "Visitors",
      "unavailable",
      available[0]!.source,
      "Visitor trend.",
      available[0]!.refreshedAt,
      "The provider total did not include a daily series.",
    );
  }
  return {
    id: "visitors-trend",
    title: kind === "ga4" ? "GA4 users" : "Vercel visitors",
    availability: "available",
    source: available.map((metric) => metric.source).join(" · "),
    definition:
      kind === "ga4"
        ? "Daily GA4 users. Days the report omitted are shown as zero because the report succeeded."
        : "Daily Vercel visitors. These daily uniques are not added together to make the period total.",
    refreshedAt: available[0]!.refreshedAt,
    series: series.map(({ key, label }) => ({ key, label })),
    points: eachUtcDay(filters.from, filters.to).map((date) => ({
      date,
      values: Object.fromEntries(
        series.map((item) => [item.key, item.points.find((point) => point.date === date)?.users ?? 0]),
      ),
    })),
  };
}

function acquisitionTables(
  ga4BySite: Map<AnalyticsProperty, Ga4Result>,
  vercelBySite: Map<AnalyticsProperty, VercelResult>,
  generatedAt: string,
): BreakdownTable[] {
  const tables: BreakdownTable[] = [];
  for (const [property, ga4] of ga4BySite) {
    const label = PROPERTY_LABEL[property];
    if (ga4.bundle?.sources && ga4.bundle.campaigns && ga4.bundle.landingPages) {
      const source = `GA4 Data API · ${label} sessions`;
      const refreshedAt = ga4.bundle.refreshedAt;
      tables.push(
        table(`${property}-sources`, `${label} traffic sources`, "available", source, "GA4 session source / medium. Top 15.", "Sessions", refreshedAt, ga4.bundle.sources, "Shares are within the listed rows."),
        table(`${property}-campaigns`, `${label} campaigns`, "available", source, "GA4 session campaign. Top 15. (not set) means the session had no campaign.", "Sessions", refreshedAt, ga4.bundle.campaigns),
        table(`${property}-landing`, `${label} landing pages`, "available", source, "GA4 landing page. Top 15.", "Sessions", refreshedAt, ga4.bundle.landingPages),
      );
      continue;
    }
    const vercel = vercelBySite.get(property)!;
    if (vercel.bundle?.referrers && vercel.bundle.sources && vercel.bundle.campaigns) {
      const source = `Vercel Web Analytics · ${label} page views`;
      const refreshedAt = vercel.bundle.refreshedAt;
      tables.push(
        table(`${property}-sources`, `${label} referrers`, "available", source, "Vercel production page views by referrer host. This is not a GA4 session source.", "Page views", refreshedAt, vercel.bundle.referrers),
        table(`${property}-utm`, `${label} UTM sources`, "available", source, "Vercel page views by utm_source.", "Page views", refreshedAt, vercel.bundle.sources),
        table(`${property}-campaigns`, `${label} campaigns`, "available", source, "Vercel page views by utm_campaign.", "Page views", refreshedAt, vercel.bundle.campaigns),
        table(`${property}-landing`, `${label} landing pages`, "not_tracked", source, "This Vercel query does not provide an entry-page dimension.", "Page views", refreshedAt, [], "Top pages are listed under Content."),
      );
      continue;
    }
    const failed = ga4.error || vercel.error;
    tables.push(
      table(
        `${property}-sources`,
        `${label} acquisition`,
        failed ? "unavailable" : "not_connected",
        "GA4 or Vercel Web Analytics",
        "Traffic source, campaign, and landing page data is not stored in StackScore.",
        "Sessions",
        generatedAt,
        [],
        failed ? ga4.error ?? vercel.error ?? undefined : ga4.gate.message,
      ),
    );
  }
  return tables;
}

function demoMetric(
  filters: AdminAnalyticsFilters,
  ga4BySite: Map<AnalyticsProperty, Ga4Result>,
  vercelBySite: Map<AnalyticsProperty, VercelResult>,
  generatedAt: string,
): CountMetric {
  if (!includesStackscore(filters)) {
    return unavailableMetric(
      "demo",
      "Demo visits",
      "not_tracked",
      "StackScore /demo",
      "The interactive demo is hosted on stackscore.tech. bobkatit.com records demo CTA clicks, not demo visits.",
      generatedAt,
    );
  }
  const vercel = vercelBySite.get("stackscore");
  const ga4 = ga4BySite.get("stackscore");
  if (typeof vercel?.bundle?.demoVisitors === "number") {
    return countMetric(
      "demo",
      "Demo visitors",
      vercel.bundle.demoVisitors,
      null,
      "Vercel Web Analytics · StackScore paths starting with /demo",
      "Vercel production visitors whose page path starts with /demo. This filtered count has no prior-period comparison. It is not added to Bobkat IT demo CTA clicks.",
      vercel.bundle.refreshedAt,
    );
  }
  if (typeof vercel?.bundle?.demoPageviews === "number") {
    return countMetric(
      "demo",
      "Demo page views",
      vercel.bundle.demoPageviews,
      null,
      "Vercel Web Analytics · StackScore paths starting with /demo",
      "Vercel production page views for paths starting with /demo. Unique visitors were not confirmed for this filtered window.",
      vercel.bundle.refreshedAt,
    );
  }
  if (typeof ga4?.bundle?.demoUsers === "number") {
    return countMetric(
      "demo",
      "Demo visitors",
      ga4.bundle.demoUsers,
      null,
      "GA4 Data API · StackScore page path begins with /demo",
      "GA4 users who viewed a page path starting with /demo. This filtered count has no prior-period comparison.",
      ga4.bundle.refreshedAt,
    );
  }
  if (vercel?.error || ga4?.error) {
    return unavailableMetric(
      "demo",
      "Demo visits",
      "unavailable",
      "Vercel Web Analytics or GA4",
      "Demo traffic on stackscore.tech/demo.",
      generatedAt,
      vercel?.error ?? ga4?.error ?? undefined,
    );
  }
  return unavailableMetric(
    "demo",
    "Demo visits",
    "not_connected",
    "Vercel Web Analytics or GA4",
    "Demo page views are not stored in StackScore. Interactive demo events are sent to Vercel Analytics.",
    generatedAt,
    "Set the StackScore provider credentials to read demo traffic.",
  );
}

function eventValue(bundle: Ga4Bundle | VercelBundle | null | undefined, name: string): number | null {
  const row = bundle?.events?.find((item) => item.label === name);
  return row ? row.value : null;
}

function conversionStepMetrics(
  filters: AdminAnalyticsFilters,
  application: ApplicationAnalytics,
  currentSummary: PurchaseSummary,
  previousSummary: PurchaseSummary,
  ga4BySite: Map<AnalyticsProperty, Ga4Result>,
  vercelBySite: Map<AnalyticsProperty, VercelResult>,
): CountMetric[] {
  const refreshedAt = application.refreshedAt;
  const steps: CountMetric[] = [];
  if (!includesStackscore(filters)) {
    return [
      unavailableMetric(
        "snapshot-starts",
        "Snapshot starts",
        "not_tracked",
        "StackScore",
        "Snapshot activity is recorded on stackscore.tech.",
        refreshedAt,
      ),
    ];
  }

  const ga4 = ga4BySite.get("stackscore");
  const vercel = vercelBySite.get("stackscore");
  const ga4Start = eventValue(ga4?.bundle, "start_technology_snapshot");
  const vercelStart = eventValue(vercel?.bundle, "snapshot_start");

  steps.push(
    unavailableMetric(
      "snapshot-starts-records",
      "Snapshot starts in application records",
      "not_tracked",
      "StackScore technology snapshot submissions",
      "Abandoned starts are not stored. A submission row is a completion.",
      refreshedAt,
    ),
  );
  if (ga4Start != null && ga4?.bundle) {
    steps.push(
      countMetric(
        "snapshot-starts-ga4",
        "GA4 snapshot starts",
        ga4Start,
        null,
        "GA4 Data API · start_technology_snapshot",
        "GA4 event count. This is not a unique-user count and is not matched to database submissions. No prior-period comparison is shown for this event query.",
        ga4.bundle.refreshedAt,
      ),
    );
  } else if (ga4?.gate.status === "not_connected") {
    steps.push(
      unavailableMetric(
        "snapshot-starts-ga4",
        "GA4 snapshot starts",
        "not_connected",
        "GA4 Data API",
        "start_technology_snapshot is sent to GA4 when analytics is enabled.",
        refreshedAt,
        ga4.gate.message,
      ),
    );
  }
  if (vercelStart != null && vercel?.bundle) {
    steps.push(
      countMetric(
        "snapshot-starts-vercel",
        "Vercel snapshot starts",
        vercelStart,
        null,
        "Vercel Web Analytics · snapshot_start",
        "Custom event count from track(). Not added to the GA4 start event. No prior-period comparison is shown for this event query.",
        vercel.bundle.refreshedAt,
      ),
    );
  }
  steps.push(
    countMetric(
      "snapshot-completions",
      "Snapshot completions",
      application.snapshots.total,
      application.snapshots.previous,
      "StackScore technology snapshot submissions",
      "Submitted snapshot questionnaires in the range.",
      refreshedAt,
      exclusionNote(application.snapshots.excluded, "submission"),
    ),
    countMetric(
      "assessment-purchases",
      "Assessment purchases",
      currentSummary.paidCount,
      previousSummary.paidCount,
      "StackScore assessment purchase records",
      PAID_DEFINITION,
      refreshedAt,
      joinNotes(...currentSummary.countNotes),
    ),
    countMetric(
      "assessment-completions",
      "Assessment completions",
      application.completions.total,
      application.completions.previous,
      "StackScore assessment records linked to a technology assessment purchase",
      "Assessments marked completed during the range whose purchase is fulfilled or fully refunded. Test and internal purchases are excluded. Consultant assessments without a checkout are not included.",
      refreshedAt,
      exclusionNote(application.completions.excluded, "completion"),
    ),
  );
  return steps;
}

function conversionRateMetrics(
  currentSummary: PurchaseSummary,
  ga4BySite: Map<AnalyticsProperty, Ga4Result>,
  generatedAt: string,
): RateMetric[] {
  const rates: RateMetric[] = [];
  const ga4 = ga4BySite.get("stackscore")?.bundle;
  const start = ga4?.events?.find((row) => row.label === "start_technology_snapshot")?.value;
  const complete = ga4?.events?.find((row) => row.label === "complete_technology_snapshot")?.value;
  if (start != null && complete != null && ga4) {
    const rate = supportedRate(complete, start);
    rates.push({
      id: "ga4-snapshot-rate",
      label: "GA4 snapshot completion rate",
      availability: rate == null ? "unavailable" : "available",
      numerator: complete,
      denominator: start,
      rate,
      source: "GA4 Data API · StackScore events",
      definition: "complete_technology_snapshot events divided by start_technology_snapshot events in the same query. This is not matched to database submissions.",
      refreshedAt: ga4.refreshedAt,
      note: rate == null ? "Not shown. The start count is zero or completions exceed starts, so this is not a valid rate." : undefined,
    });
  }

  const cohort = supportedRate(currentSummary.cohortCompleted, currentSummary.cohortDenominator);
  rates.push({
    id: "purchase-completion-rate",
    label: "Paid assessments completed",
    availability: currentSummary.cohortDenominator > 0 && cohort != null ? "available" : "unavailable",
    numerator: currentSummary.cohortDenominator > 0 ? currentSummary.cohortCompleted : null,
    denominator: currentSummary.cohortDenominator > 0 ? currentSummary.cohortDenominator : null,
    rate: cohort,
    source: "StackScore assessment purchase records",
    definition: "Share of paid assessments purchased in this range whose linked assessment is now completed. Completion may fall outside the range.",
    refreshedAt: generatedAt,
    note:
      currentSummary.cohortDenominator === 0
        ? "Not shown. There were no paid assessments in this range to use as the denominator."
        : cohort == null
          ? "Not shown. Completed linked assessments exceed the paid cohort, so this is not a valid rate."
          : undefined,
  });
  return rates;
}

function pageTables(
  ga4BySite: Map<AnalyticsProperty, Ga4Result>,
  vercelBySite: Map<AnalyticsProperty, VercelResult>,
  generatedAt: string,
): BreakdownTable[] {
  const tables: BreakdownTable[] = [];
  for (const [property, ga4] of ga4BySite) {
    const label = PROPERTY_LABEL[property];
    if (ga4.bundle?.pages) {
      tables.push(
        table(
          `${property}-pages`,
          `${label} top pages`,
          "available",
          `GA4 Data API · ${label} screen page views`,
          "Top 15 page paths. Shares are within the listed rows.",
          "Views",
          ga4.bundle.refreshedAt,
          ga4.bundle.pages,
        ),
      );
      continue;
    }
    const vercel = vercelBySite.get(property);
    if (vercel?.bundle?.pages) {
      tables.push(
        table(
          `${property}-pages`,
          `${label} top pages`,
          "available",
          `Vercel Web Analytics · ${label} page views`,
          "Top production page paths. This is not a GA4 page report.",
          "Page views",
          vercel.bundle.refreshedAt,
          vercel.bundle.pages,
        ),
      );
      continue;
    }
    tables.push(
      table(
        `${property}-pages`,
        `${label} top pages`,
        ga4.error || vercel?.error ? "unavailable" : "not_connected",
        "GA4 or Vercel Web Analytics",
        "Page paths are not stored in StackScore.",
        "Views",
        generatedAt,
        [],
        ga4.error ?? vercel?.error ?? ga4.gate.message,
      ),
    );
  }
  return tables;
}

function ctaTables(
  ga4BySite: Map<AnalyticsProperty, Ga4Result>,
  vercelBySite: Map<AnalyticsProperty, VercelResult>,
  generatedAt: string,
): BreakdownTable[] {
  const tables: BreakdownTable[] = [];
  for (const [property, ga4] of ga4BySite) {
    const label = PROPERTY_LABEL[property];
    if (ga4.bundle?.events) {
      tables.push(
        table(
          `${property}-ga4-cta`,
          `${label} GA4 events`,
          "available",
          `GA4 Data API · ${label}`,
          "Allowlisted events already sent by the site. A zero means the query returned no hits. Events that the site does not send are omitted.",
          "Events",
          ga4.bundle.refreshedAt,
          ga4.bundle.events,
        ),
      );
    } else if (ga4.gate.status !== "ready") {
      tables.push(
        table(
          `${property}-ga4-cta`,
          `${label} GA4 events`,
          ga4.error ? "unavailable" : "not_connected",
          "GA4 Data API",
          "Click and conversion events already implemented on the site.",
          "Events",
          generatedAt,
          [],
          ga4.error ?? ga4.gate.message,
        ),
      );
    }
    const vercel = vercelBySite.get(property);
    if (property === "bobkat") {
      tables.push(
        table(
          `${property}-vercel-cta`,
          `${label} Vercel custom events`,
          "not_tracked",
          "Vercel Web Analytics",
          "Bobkat IT sends these clicks to GA4. Its Vercel Analytics install records page views, not these CTA names.",
          "Events",
          generatedAt,
        ),
      );
      continue;
    }
    if (vercel?.bundle?.events) {
      tables.push(
        table(
          `${property}-vercel-cta`,
          `${label} Vercel custom events`,
          "available",
          "Vercel Web Analytics · track()",
          "Demo and marketing events already sent with track(). Not added to GA4 event counts.",
          "Events",
          vercel.bundle.refreshedAt,
          vercel.bundle.events,
        ),
      );
    } else {
      tables.push(
        table(
          `${property}-vercel-cta`,
          `${label} Vercel custom events`,
          vercel?.error ? "unavailable" : "not_connected",
          "Vercel Web Analytics",
          "Interactive demo and marketing clicks sent with track().",
          "Events",
          generatedAt,
          [],
          vercel?.error ?? vercel?.gate.message,
        ),
      );
    }
  }
  return tables;
}

function connectionRows(
  ga4BySite: Map<AnalyticsProperty, Ga4Result>,
  vercelBySite: Map<AnalyticsProperty, VercelResult>,
): AdminAnalyticsDashboard["connections"] {
  const rows: AdminAnalyticsDashboard["connections"] = [];
  for (const [property, ga4] of ga4BySite) {
    rows.push({
      id: `ga4-${property}`,
      label: `GA4 · ${PROPERTY_LABEL[property]}`,
      state: connectionState(ga4.gate.status),
      detail: ga4.error ?? ga4.gate.message,
    });
  }
  for (const [property, vercel] of vercelBySite) {
    rows.push({
      id: `vercel-${property}`,
      label: `Vercel · ${PROPERTY_LABEL[property]}`,
      state: connectionState(vercel.gate.status),
      detail: vercel.error ?? vercel.gate.message,
    });
  }
  return rows;
}
