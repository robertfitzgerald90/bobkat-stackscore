import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { buildTechnologySnapshotUrl } from "@/lib/assessment-invitation/snapshot-url";
import { cn } from "@/lib/utils";

type TechnologySnapshotLinkProps = {
  label: string;
  className?: string;
  prospectId?: string;
  campaignId?: string;
};

export function TechnologySnapshotLink({
  label,
  className,
  prospectId,
  campaignId,
}: TechnologySnapshotLinkProps) {
  return (
    <Link
      href={buildTechnologySnapshotUrl({ prospectId, campaignId })}
      className={cn(
        buttonVariants({ variant: "default" }),
        "shadow-md transition-shadow hover:shadow-lg",
        className,
      )}
    >
      {label}
    </Link>
  );
}
