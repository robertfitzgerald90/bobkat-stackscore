import { cn } from "@/lib/utils";

type MiniSparklineProps = {
  values: number[];
  className?: string;
  strokeClassName?: string;
};

export function MiniSparkline({
  values,
  className,
  strokeClassName = "stroke-primary",
}: MiniSparklineProps) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 64;
  const height = 24;
  const padding = 2;

  const points = values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-6 w-16 shrink-0", className)}
      aria-hidden
    >
      <polyline
        fill="none"
        className={cn(strokeClassName, "opacity-80")}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
