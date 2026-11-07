/** Admin marketing analytics DTOs. Unavailable metrics stay null — never coerce them to zero. */

export type MetricAvailability = "available" | "not_connected" | "not_tracked" | "unavailable";

export type AnalyticsSite = "all" | "bobkat" | "stackscore";

export type AnalyticsProperty = "bobkat" | "stackscore";

export type AnalyticsSection = "overview" | "acquisition" | "conversion" | "content";

export type AnalyticsRangePreset = "7d" | "28d" | "90d" | "custom";

export type CountMetric = {
  id: string;
  label: string;
  availability: MetricAvailability;
  /** Null unless availability is "available". */
  value: number | null;
  previousValue: number | null;
  unit: "count" | "currency_cents";
  currency?: string;
  source: string;
  definition: string;
  refreshedAt: string;
  note?: string;
};

export type RateMetric = {
  id: string;
  label: string;
  availability: MetricAvailability;
  numerator: number | null;
  denominator: number | null;
  /** Fraction from 0 to 1. Null when a rate is not supported. */
  rate: number | null;
  source: string;
  definition: string;
  refreshedAt: string;
  note?: string;
};

export type BreakdownRow = {
  label: string;
  value: number;
};

export type BreakdownTable = {
  id: string;
  title: string;
  availability: MetricAvailability;
  source: string;
  definition: string;
  valueLabel: string;
  refreshedAt: string;
  rows: BreakdownRow[];
  note?: string;
};

export type TimePoint = {
  date: string;
  values: Record<string, number>;
};

export type TimeSeries = {
  id: string;
  title: string;
  availability: MetricAvailability;
  source: string;
  definition: string;
  refreshedAt: string;
  series: Array<{ key: string; label: string }>;
  points: TimePoint[];
  note?: string;
};

export type ConnectionState = "connected" | "not_connected" | "unavailable";

export type AdminAnalyticsFilters = {
  site: AnalyticsSite;
  section: AnalyticsSection;
  preset: AnalyticsRangePreset;
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  dayCount: number;
  warning?: string;
};

export type AdminAnalyticsDashboard = {
  filters: AdminAnalyticsFilters;
  generatedAt: string;
  visitors: CountMetric[];
  overview: CountMetric[];
  activity: TimeSeries;
  visitorsOverTime: TimeSeries;
  acquisition: BreakdownTable[];
  demo: CountMetric;
  conversionSteps: CountMetric[];
  conversionRates: RateMetric[];
  pages: BreakdownTable[];
  ctas: BreakdownTable[];
  connections: Array<{
    id: string;
    label: string;
    state: ConnectionState;
    detail: string;
  }>;
  followUps: string[];
};
