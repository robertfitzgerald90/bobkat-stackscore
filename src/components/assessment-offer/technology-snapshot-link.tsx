import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TechnologySnapshotLinkProps = {
  label: string;
  className?: string;
};

export function TechnologySnapshotLink({ label, className }: TechnologySnapshotLinkProps) {
  return (
    <Link
      href="/technology-snapshot"
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
