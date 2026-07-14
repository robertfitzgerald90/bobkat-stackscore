import type { Metadata } from "next";
import { AssessmentInvitationLanding } from "@/components/assessment-invitation/assessment-invitation-landing";
import type {
  AssessmentInvitationContext,
  AssessmentInvitationPersonalization,
} from "@/lib/assessment-invitation/content";

const title = "You've Been Invited | StackScore";
const description =
  "Start your free Technology Snapshot and discover strengths, risks, and practical technology insights.";
const ogImageUrl = "https://stackscore.bobkatit.com/images/og/assessment-invitation.png";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://stackscore.bobkatit.com/assessment-invitation",
    type: "website",
    images: [
      {
        url: ogImageUrl,
        alt: "StackScore Technology Snapshot invitation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImageUrl],
  },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readQueryParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return undefined;
}

export default async function AssessmentInvitationPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const personalization: AssessmentInvitationPersonalization = {
    invitedByName: readQueryParam(params, "invitedByName"),
    invitedByOrganization: readQueryParam(params, "invitedByOrganization"),
    campaignName: readQueryParam(params, "campaignName"),
    recipientFirstName: readQueryParam(params, "recipientFirstName"),
  };

  const invitationContext: AssessmentInvitationContext = {
    prospectId: readQueryParam(params, "prospectId"),
    campaignId: readQueryParam(params, "campaignId"),
  };

  const hasPersonalization = Object.values(personalization).some(Boolean);
  const hasInvitationContext = Boolean(invitationContext.prospectId || invitationContext.campaignId);

  return (
    <AssessmentInvitationLanding
      personalization={hasPersonalization ? personalization : undefined}
      invitationContext={hasInvitationContext ? invitationContext : undefined}
    />
  );
}
