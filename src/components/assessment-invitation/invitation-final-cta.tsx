import { OfferCtaPanel } from "@/components/assessment-offer/offer-cta-panel";
import { TechnologySnapshotLink } from "@/components/assessment-offer/technology-snapshot-link";
import { buttonVariants } from "@/components/ui/button";
import type { AssessmentInvitationContext } from "@/lib/assessment-invitation/content";
import { cn } from "@/lib/utils";
import Link from "next/link";

type InvitationFinalCtaProps = {
  invitationContext?: AssessmentInvitationContext;
};

export function InvitationFinalCta({ invitationContext }: InvitationFinalCtaProps) {
  return (
    <OfferCtaPanel
      headline="Ready to See Where Your Technology Stands?"
      supportingText="The Technology Snapshot is free and only takes a few minutes. You'll immediately receive a high-level view of your organization's technology maturity and understand where deeper improvements may exist."
    >
      <TechnologySnapshotLink
        label="Start My Free Technology Snapshot"
        className="h-11 w-full px-8 text-base sm:w-auto"
        prospectId={invitationContext?.prospectId}
        campaignId={invitationContext?.campaignId}
      />
      <Link
        href="/services"
        className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full px-8 text-base sm:w-auto")}
      >
        Explore Bobkat IT Services
      </Link>
    </OfferCtaPanel>
  );
}
