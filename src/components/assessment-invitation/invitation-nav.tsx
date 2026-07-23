import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import type { AssessmentInvitationContext } from "@/lib/assessment-invitation/content";
import { buildTechnologySnapshotUrl } from "@/lib/assessment-invitation/snapshot-url";
import { PUBLIC_MARKETING_HEADER_CLASS } from "@/lib/ui/sticky-chrome";
import { MARKETING_NAV_LINK } from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";

const navLinkClassName = MARKETING_NAV_LINK;

type InvitationNavProps = {
  invitationContext?: AssessmentInvitationContext;
};

export function InvitationNav({ invitationContext }: InvitationNavProps) {
  const snapshotHref = buildTechnologySnapshotUrl(invitationContext);

  return (
    <header className={PUBLIC_MARKETING_HEADER_CLASS}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/assessment-invitation"
          className="min-w-0 shrink transition-opacity hover:opacity-90"
        >
          <BrandLogo size={32} showText placement="header" priority className="gap-2" />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Assessment journey">
          <Link
            href="/solutions"
            className={cn(navLinkClassName, "rounded-md px-3 py-1.5 hover:bg-[rgba(35,135,255,0.08)]")}
          >
            Solutions
          </Link>
          <Link
            href="/services"
            className={cn(navLinkClassName, "rounded-md px-3 py-1.5 hover:bg-[rgba(35,135,255,0.08)]")}
          >
            Services
          </Link>
          <Link
            href="/assessment-offer"
            className={cn(navLinkClassName, "rounded-md px-3 py-1.5 hover:bg-[rgba(35,135,255,0.08)]")}
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
