import type { RecommendationStatus } from "@/generated/prisma/client";
import { initiativeStatusBadgeClass } from "@/lib/client-roadmap/initiative-status-style";
import { cn } from "@/lib/utils";

export function InitiativeStatusBadge({
  status,
  label,
}: {
  status: RecommendationStatus;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        initiativeStatusBadgeClass(status),
      )}
    >
      {label}
    </span>
  );
}
