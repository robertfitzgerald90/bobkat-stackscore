import type { PortfolioScoreTrendPoint } from "@/lib/portfolio/types";
import { cn } from "@/lib/utils";

type PortfolioSparklineProps = {
  points: PortfolioScoreTrendPoint[];
  className?: string;
};

export function PortfolioSparkline({ points, className }: PortfolioSparklineProps) {
  if (points.length < 2) {
    return (
      <div
        className={cn("h-7 w-[4.5rem] rounded-sm bg-muted/50", className)}
        aria-hidden
      />
    );
  }

  const scores = points.map((point) => point.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;
  const width = 72;
  const height = 28;

  const polylinePoints = scores
    .map((score, index) => {
      const x = (index / (scores.length - 1)) * width;
      const y = height - ((score - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-7 w-[4.5rem] shrink-0 text-primary", className)}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylinePoints}
      />
    </svg>
  );
}
