export type ReviewPeriod = {
  start: Date;
  end: Date;
  label: string;
};

export function getQuarterBounds(date: Date = new Date()): ReviewPeriod {
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();
  const quarterIndex = Math.floor(month / 3);
  const start = new Date(Date.UTC(year, quarterIndex * 3, 1));
  const end = new Date(Date.UTC(year, quarterIndex * 3 + 3, 0, 23, 59, 59, 999));

  return {
    start,
    end,
    label: `Q${quarterIndex + 1} ${year}`,
  };
}

export function formatReviewPeriodLabel(start: Date, end: Date): string {
  const quarter = getQuarterBounds(start);
  if (quarter.start.getTime() === start.getTime() && quarter.end.getTime() === end.getTime()) {
    return quarter.label;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function isWithinReviewPeriod(date: Date, period: Pick<ReviewPeriod, "start" | "end">): boolean {
  const time = date.getTime();
  return time >= period.start.getTime() && time <= period.end.getTime();
}

export function defaultQbrTitle(clientName: string, period: ReviewPeriod): string {
  return `${period.label} Quarterly Business Review — ${clientName}`;
}
