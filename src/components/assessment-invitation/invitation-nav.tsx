import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import type { AssessmentInvitationContext } from "@/lib/assessment-invitation/content";
import { buildTechnologySnapshotUrl } from "@/lib/assessment-invitation/snapshot-url";
import { STICKY_SITE_HEADER_CLASS } from "@/lib/ui/sticky-chrome";
import { cn } from "@/lib/utils";

const navLinkClassName =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

type InvitationNavProps = {
  invitationContext?: AssessmentInvitationContext;
};

export function InvitationNav({ invitationContext }: InvitationNavProps) {
  const snapshotHref = buildTechnologySnapshotUrl(invitationContext);

  return (
    <header className={STICKY_SITE_HEADER_CLASS}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/assessment-invitation"
          className="min-w-0 shrink transition-opacity hover:opacity-90"
        >
          <BrandLogo size={32} showText className="gap-2" />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Assessment journey">
          <Link
            href="/solutions"
            className={cn(navLinkClassName, "rounded-md px-3 py-1.5 hover:bg-muted/60")}
          >
            Solutions
          </Link>
          <Link
            href="/services"
            className={cn(navLinkClassName, "rounded-md px-3 py-1.5 hover:bg-muted/60")}
          >
            Services
          </Link>
          <Link
            href="/assessment-offer"
            className={cn(navLinkClassName, "rounded-md px-3 py-1.5 hover:bg-muted/60")}
          >
            Assessment
          </Link>
          <Link
            href={snapshotHref}
            className={cn(
              navLinkClassName,
              "rounded-md bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/15 hover:text-primary",
            )}
          >
            Technology Snapshot
          </Link>
        </nav>

        <TechnologySnapshotLink
          label="Start My Free Technology Snapshot"
          className="h-9 shrink-0 px-3 text-xs sm:px-4 sm:text-sm"
          prospectId={invitationContext?.prospectId}
          campaignId={invitationContext?.campaignId}
        />
      </div>
    </header>
  );
}
