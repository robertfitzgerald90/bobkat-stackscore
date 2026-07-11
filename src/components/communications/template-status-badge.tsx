"use client";

import { Badge } from "@/components/ui/badge";
import type { EmailTemplateStatus } from "@/lib/communications/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<EmailTemplateStatus, string> = {
  active: "border-success/30 bg-success/10 text-success",
  draft: "border-border bg-muted/40 text-secondary-token",
  archived: "border-warning/30 bg-warning/10 text-warning",
};

export function TemplateStatusBadge({
  status,
  className,
}: {
  status: EmailTemplateStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLES[status], className)}>
      {status === "active" ? "Active" : status === "draft" ? "Draft" : "Archived"}
    </Badge>
  );
}
