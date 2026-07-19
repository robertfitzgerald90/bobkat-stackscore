import type { RoadmapPhaseStatus } from "@/generated/prisma/client";
import { ROADMAP_PHASE_STATUS_LABELS } from "@/lib/client-roadmap/labels";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<RoadmapPhaseStatus, string> = {
  planned: "bg-slate-100 text-slate-700 border-slate-200",
  awaiting_approval: "bg-amber-50 text-amber-800 border-amber-200",
  approved: "bg-sky-50 text-sky-800 border-sky-200",
  in_progress: "bg-blue-50 text-blue-800 border-blue-200",
  completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  deferred: "bg-orange-50 text-orange-800 border-orange-200",
  cancelled: "bg-rose-50 text-rose-800 border-rose-200",
};

export function RoadmapStatusBadge({
  status,
  className,
}: {
  status: RoadmapPhaseStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[status],
        className,
      )}
    >
      {ROADMAP_PHASE_STATUS_LABELS[status]}
    </span>
  );
}
