import { OfferFeatureGrid } from "@/components/assessment-offer/offer-feature-grid";
import { OfferTimeline } from "@/components/assessment-offer/offer-timeline";
import {
  INVITATION_BENEFITS,
  INVITATION_DISCOVER_FEATURES,
  INVITATION_TIMELINE,
  type AssessmentInvitationContext,
  type AssessmentInvitationPersonalization,
} from "@/lib/assessment-invitation/content";
import { OfferFooter } from "@/components/assessment-offer/offer-footer";
import { InvitationAboutBobkat } from "./invitation-about-bobkat";
import { InvitationFinalCta } from "./invitation-final-cta";
import { InvitationHero } from "./invitation-hero";
import { InvitationNav } from "./invitation-nav";

type AssessmentInvitationLandingProps = {
  personalization?: AssessmentInvitationPersonalization;
  invitationContext?: AssessmentInvitationContext;
};

export function AssessmentInvitationLanding({
  personalization,
  invitationContext,
}: AssessmentInvitationLandingProps) {
  return (
    <div className="min-h-screen bg-background">
      <InvitationNav invitationContext={invitationContext} />
      <main>
        <InvitationHero personalization={personalization} invitationContext={invitationContext} />

        <OfferFeatureGrid
          eyebrow="What you'll discover"
          title="A clearer picture of your technology environment"
          description="StackScore translates your technology landscape into business insights you can act on — starting with a free snapshot and growing into a full maturity assessment."
          features={INVITATION_DISCOVER_FEATURES}
          columns={4}
          sectionClassName="px-4 py-16 sm:px-6 sm:py-20 md:py-24"
        />

        <OfferTimeline
          steps={INVITATION_TIMELINE}
          eyebrow="How it works"
          title="Your path from snapshot to strategy"
        />

        <OfferFeatureGrid
          id="why-stackscore"
          eyebrow="Why organizations use StackScore"
          title="Technology clarity for business leaders"
          description="Built for owners and leadership teams who need practical insight — not another IT audit that sits in a drawer."
          features={INVITATION_BENEFITS}
          columns={3}
        />

        <InvitationAboutBobkat />
        <InvitationFinalCta invitationContext={invitationContext} />
      </main>
      <OfferFooter />
    </div>
  );
}
