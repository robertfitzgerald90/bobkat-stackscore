"use client";

import { buttonClassName } from "@/components/ui/button";

type ReportPaginationProps = {
  totalCount: number;
  visibleCount: number;
  expanded: boolean;
  onToggle: () => void;
  itemLabel?: string;
};

export function ReportPagination({
  totalCount,
  visibleCount,
  expanded,
  onToggle,
  itemLabel = "items",
}: ReportPaginationProps) {
  if (totalCount <= visibleCount) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={buttonClassName({
        variant: "ghost",
        size: "sm",
        className: "report-no-print",
      })}
    >
      {expanded
        ? `Show fewer ${itemLabel}`
        : `Show all ${totalCount} ${itemLabel}`}
    </button>
  );
}
