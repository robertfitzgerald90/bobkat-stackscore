"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { trackSnapshotStart } from "@/lib/analytics/marketing-events";
import { buildTechnologySnapshotUrl } from "@/lib/assessment-invitation/snapshot-url";
import { cn } from "@/lib/utils";

type TechnologySnapshotLinkProps = {
  label: string;
  className?: string;
  prospectId?: string;
  campaignId?: string;
  placement?: string;
};

export function TechnologySnapshotLink({
  label,
  className,
  prospectId,
  campaignId,
  placement,
}: TechnologySnapshotLinkProps) {
  function handleClick() {
    trackSnapshotStart({
      trigger: "cta_click",
      placement,
      hasInvitationFlow: Boolean(prospectId || campaignId),
    });
  }

  return (
    <Link
      href={buildTechnologySnapshotUrl({ prospectId, campaignId })}
      className={cn(
        buttonVariants({ variant: "default" }),
        "shadow-md transition-shadow hover:shadow-lg",
        className,
      )}
      onClick={handleClick}
    >
      {label}
    </Link>
  );
}
