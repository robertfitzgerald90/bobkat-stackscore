import { BrandLogo } from "@/components/brand/brand-logo";
import { OfferHeroBackground } from "@/components/assessment-offer/offer-hero-background";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import { buttonVariants } from "@/components/ui/button";
import type { AssessmentInvitationPersonalization } from "@/lib/assessment-invitation/content";
import { BRAND } from "@/lib/branding";
import { cn } from "@/lib/utils";

type InvitationHeroProps = {
  personalization?: AssessmentInvitationPersonalization;
};

function InvitationPersonalizationBanner({
  personalization,
}: {
  personalization: AssessmentInvitationPersonalization;
}) {
  const { invitedByName, invitedByOrganization, campaignName, recipientFirstName } =
    personalization;

  if (!invitedByName && !invitedByOrganization && !campaignName && !recipientFirstName) {
    return null;
  }

  return (
    <div className="mb-6 rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-1.5 text-sm text-primary">
      {recipientFirstName ? `Welcome, ${recipientFirstName}. ` : null}
      {invitedByName ? `Invited by ${invitedByName}` : null}
      {invitedByOrganization && invitedByName ? ` at ${invitedByOrganization}` : null}
      {!invitedByName && invitedByOrganization ? `Invited by ${invitedByOrganization}` : null}
      {campaignName ? (
        <span className="text-primary/80">
          {invitedByName || invitedByOrganization ? " · " : ""}
          {campaignName}
        </span>
      ) : null}
    </div>
  );
}

export function InvitationHero({ personalization }: InvitationHeroProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 md:pb-24 md:pt-16">
      <OfferHeroBackground />

      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <OfferReveal>
          <BrandLogo size={44} variant="stacked" className="mb-8" />
        </OfferReveal>

        {personalization ? (
          <OfferReveal delayMs={30}>
            <InvitationPersonalizationBanner personalization={personalization} />
          </OfferReveal>
        ) : null}

        <OfferReveal delayMs={60}>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            You&apos;ve Been Invited to Assess Your Technology
          </h1>
        </OfferReveal>

        <OfferReveal delayMs={120}>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:mt-6">
            Someone believes your organization could benefit from a clearer understanding of its
            technology environment.
          </p>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {BRAND.productName} helps organizations identify strengths, uncover hidden risks, and
            prioritize practical improvements through a guided Technology Maturity Assessment.
          </p>
        </OfferReveal>

        <OfferReveal delayMs={180} className="mt-8 flex w-full max-w-md flex-col items-center gap-3 sm:mt-10">
          <TechnologySnapshotLink
            label="Start My Free Technology Snapshot"
            className="h-11 w-full px-8 text-base sm:w-auto"
          />
          <a
            href="#why-stackscore"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 w-full px-8 text-base sm:w-auto",
            )}
          >
            Learn About StackScore
          </a>
        </OfferReveal>
      </div>
    </section>
  );
}
