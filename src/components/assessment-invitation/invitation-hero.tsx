import { BrandLogo } from "@/components/brand/brand-logo";
import { OfferHeroBackground } from "@/components/assessment-offer/offer-hero-background";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import { ClientDashboardPreview } from "@/components/marketing/client-dashboard-preview";
import { buttonVariants } from "@/components/ui/button";
import type {
  AssessmentInvitationContext,
  AssessmentInvitationPersonalization,
} from "@/lib/assessment-invitation/content";
import { BRAND } from "@/lib/branding";
import { MARKETING_HERO_TITLE } from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";

type InvitationHeroProps = {
  personalization?: AssessmentInvitationPersonalization;
  invitationContext?: AssessmentInvitationContext;
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

export function InvitationHero({ personalization, invitationContext }: InvitationHeroProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 md:pb-24 md:pt-12">
      <OfferHeroBackground />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center text-center">
        <OfferReveal>
          <BrandLogo size={44} variant="stacked" placement="auth" className="mb-6 sm:mb-8" />
        </OfferReveal>

        {personalization ? (
          <OfferReveal delayMs={30}>
            <InvitationPersonalizationBanner personalization={personalization} />
          </OfferReveal>
        ) : null}

        <OfferReveal delayMs={60}>
          <h1 className={cn(MARKETING_HERO_TITLE, "max-w-5xl")}>
            You&apos;ve Been Invited to Assess Your <span className="marketing-text-gradient">Technology</span>
          </h1>
        </OfferReveal>

        <OfferReveal delayMs={120}>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            Someone believes your organization could benefit from a clearer understanding of its
            technology environment.
          </p>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {BRAND.productName} helps organizations identify strengths, uncover hidden risks, and
            prioritize practical improvements through a guided Technology Maturity Assessment.
          </p>
        </OfferReveal>

        <OfferReveal delayMs={180} className="mt-8 flex w-full flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center">
          <TechnologySnapshotLink
            label="Start My Free Technology Snapshot"
            className="h-11 w-full px-8 text-base shadow-md transition-shadow hover:shadow-lg sm:w-auto"
            prospectId={invitationContext?.prospectId}
            campaignId={invitationContext?.campaignId}
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

        <div className="mt-10 w-full sm:mt-12 md:mt-14 lg:mt-16">
          <OfferReveal delayMs={240} variant="image">
            <ClientDashboardPreview />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Executive dashboard included with every StackScore assessment.
            </p>
          </OfferReveal>
        </div>
      </div>
    </section>
  );
}
