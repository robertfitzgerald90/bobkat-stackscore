import { InvitationAboutBobkat } from "./invitation-about-bobkat";
import { InvitationDiscoverSection } from "./invitation-discover-section";
import { InvitationFinalCta } from "./invitation-final-cta";
import { InvitationHero } from "./invitation-hero";
import { InvitationNav } from "./invitation-nav";
import { InvitationWhySection } from "./invitation-why-section";
import { OfferFooter } from "@/components/assessment-offer/offer-footer";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { OfferTimeline } from "@/components/assessment-offer/offer-timeline";
import {
  INVITATION_TIMELINE,
  type AssessmentInvitationContext,
  type AssessmentInvitationPersonalization,
} from "@/lib/assessment-invitation/content";

type AssessmentInvitationLandingProps = {
  personalization?: AssessmentInvitationPersonalization;
  invitationContext?: AssessmentInvitationContext;
};

export function AssessmentInvitationLanding({
  personalization,
  invitationContext,
}: AssessmentInvitationLandingProps) {
  return (
    <PublicPageShell>
      <InvitationNav invitationContext={invitationContext} />
      <main>
        <InvitationHero personalization={personalization} invitationContext={invitationContext} />

        <InvitationDiscoverSection />

        <OfferTimeline
          steps={INVITATION_TIMELINE}
          eyebrow="How it works"
          title="Your path from snapshot to strategy"
          sectionClassName="px-4 py-16 sm:px-6 sm:py-20 md:py-28"
        />

        <InvitationWhySection />

        <InvitationAboutBobkat />
        <InvitationFinalCta invitationContext={invitationContext} />
      </main>
      <OfferFooter />
    </PublicPageShell>
  );
}
