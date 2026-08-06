import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import type { AssessmentInvitationContext } from "@/lib/assessment-invitation/content";
import { buildTechnologySnapshotUrl } from "@/lib/assessment-invitation/snapshot-url";
import {
  buildAssessmentInvitationHref,
  buildAssessmentOfferHref,
} from "@/lib/assessment-offer/attribution";
import { PUBLIC_MARKETING_HEADER_CLASS } from "@/lib/ui/sticky-chrome";
import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";
import { MARKETING_NAV_LINK } from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";

const navLinkClassName = MARKETING_NAV_LINK;

type InvitationNavProps = {
  invitationContext?: AssessmentInvitationContext;
};

/**
 * NOTE: This is a hand-rolled duplicate of `PublicMarketingNav`
 * (`@/components/public/public-marketing-nav`), kept separate only because
 * this route needs invitation-context-aware links (prospect/campaign
 * attribution baked into hrefs). Styling here is kept in sync manually with
 * the shared nav — flag for future consolidation into one component that
 * accepts an optional invitation-context prop.
 */
export function InvitationNav({ invitationContext }: InvitationNavProps) {
  const snapshotHref = buildTechnologySnapshotUrl(invitationContext);

  return (
    <header className={PUBLIC_MARKETING_HEADER_CLASS}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={buildAssessmentInvitationHref(invitationContext)}
          className="min-w-0 shrink transition-opacity hover:opacity-90"
        >
          <BrandLogo size={32} showText placement="header" priority className="gap-2" />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Assessment journey">
          <a
            href={BOBKAT_IT_URLS.solutions}
            className={cn(navLinkClassName, "rounded-[2px] px-3 py-1.5 hover:bg-primary/8")}
          >
            Solutions
          </a>
          <a
            href={BOBKAT_IT_URLS.services}
            className={cn(navLinkClassName, "rounded-[2px] px-3 py-1.5 hover:bg-primary/8")}
          >
            Services
          </a>
          <Link
            href={buildAssessmentOfferHref(invitationContext)}
            className={cn(navLinkClassName, "rounded-[2px] px-3 py-1.5 hover:bg-primary/8")}
          >
            Assessment Offer
          </Link>
          <Link
            href={buildAssessmentInvitationHref(invitationContext)}
            className={cn(navLinkClassName, "rounded-[2px] px-3 py-1.5 hover:bg-primary/8")}
          >
            Assessment Invitation
          </Link>
          <Link
            href={snapshotHref}
            className={cn(
              navLinkClassName,
              "rounded-[2px] bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/15 hover:text-primary",
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
