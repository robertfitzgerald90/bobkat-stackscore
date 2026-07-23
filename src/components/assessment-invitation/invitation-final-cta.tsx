import Link from "next/link";
import { OfferCtaPanel } from "@/components/assessment-offer/offer-cta-panel";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import { buttonVariants } from "@/components/ui/button";
import type { AssessmentInvitationContext } from "@/lib/assessment-invitation/content";
import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";
import { STACKSCORE_PUBLIC_ROUTES } from "@/lib/marketing/stackscore-routes";
import { cn } from "@/lib/utils";

type InvitationFinalCtaProps = {
  invitationContext?: AssessmentInvitationContext;
};

export function InvitationFinalCta({ invitationContext }: InvitationFinalCtaProps) {
  return (
    <OfferCtaPanel
      className="px-4 py-20 sm:px-6 sm:py-24 md:py-32"
      headline="Ready to See Where Your Technology Stands?"
      supportingText="The Technology Snapshot is free and only takes a few minutes. You'll immediately receive a high-level view of your organization's technology maturity and understand where deeper improvements may exist."
    >
      <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center">
        <TechnologySnapshotLink
          label="Start My Free Technology Snapshot"
          className="h-11 w-full px-8 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
          prospectId={invitationContext?.prospectId}
          campaignId={invitationContext?.campaignId}
        />
        <Link
          href={STACKSCORE_PUBLIC_ROUTES.assessmentOffer}
          className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full px-8 text-base sm:w-auto")}
        >
          Purchase the full assessment
        </Link>
        <a
          href={BOBKAT_IT_URLS.technologyMaturityAssessment}
          className={cn(buttonVariants({ variant: "ghost" }), "h-11 w-full px-8 text-base sm:w-auto")}
        >
          Learn more on Bobkat IT
        </a>
      </div>
    </OfferCtaPanel>
  );
}
