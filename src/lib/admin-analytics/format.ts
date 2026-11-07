export type PeriodTrend = "up" | "down" | "neutral";

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatMoneyFromCents(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function formatRate(rate: number): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(rate * 100)}%`;
}

export function formatRefreshedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

export function periodComparison(
  current: number,
  previous: number,
): { trend: PeriodTrend; label: string } {
  if (current === previous) {
    return { trend: "neutral", label: "No change vs prior period" };
  }
  if (previous === 0) {
    return {
      trend: current > 0 ? "up" : "down",
      label: current > 0 ? "Up from 0 in the prior period" : "No change vs prior period",
    };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  return {
    trend: pct > 0 ? "up" : "down",
    label: `${pct > 0 ? "+" : ""}${pct}% vs prior period`,
  };
}

export function availabilityLabel(
  availability: "available" | "not_connected" | "not_tracked" | "unavailable",
): string {
  if (availability === "not_connected") return "Not connected";
  if (availability === "not_tracked") return "Not tracked";
  if (availability === "unavailable") return "Unavailable";
  return "";
}
