import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { Priority, Rating, TrendDirection } from "@/generated/prisma/client";

export const TREND_CONFIG: Record<
  TrendDirection,
  { label: string; icon: typeof ArrowUp; className: string }
> = {
  improving: { label: "Improving", icon: ArrowUp, className: "text-primary" },
  stable: { label: "Stable", icon: Minus, className: "text-muted-foreground" },
  declining: { label: "Declining", icon: ArrowDown, className: "text-destructive" },
};

export const RATING_VARIANT: Record<
  Rating,
  "success" | "default" | "secondary" | "warning" | "destructive"
> = {
  exceptional: "success",
  strong: "success",
  stable: "secondary",
  at_risk: "warning",
  critical: "destructive",
};

export const PRIORITY_BADGE: Record<
  Priority,
  "destructive" | "warning" | "secondary" | "outline"
> = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "outline",
};
