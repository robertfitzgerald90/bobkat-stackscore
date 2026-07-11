import type { Metadata } from "next";
import { AssessmentInvitationLanding } from "@/components/assessment-invitation/assessment-invitation-landing";
import type { AssessmentInvitationPersonalization } from "@/lib/assessment-invitation/content";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Assessment Invitation | ${BRAND.companyName}`,
  description: `You've been invited to assess your technology with ${BRAND.productName}. Start with a free Technology Snapshot and discover strengths, risks, and practical improvements.`,
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: keyof AssessmentInvitationPersonalization,
): string | undefined {
  const value = params[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return undefined;
}

export default async function AssessmentInvitationPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Reserved for future email-link personalization (inviter, campaign, greeting).
  const personalization: AssessmentInvitationPersonalization = {
    invitedByName: readParam(params, "invitedByName"),
    invitedByOrganization: readParam(params, "invitedByOrganization"),
    campaignName: readParam(params, "campaignName"),
    recipientFirstName: readParam(params, "recipientFirstName"),
  };

  const hasPersonalization = Object.values(personalization).some(Boolean);

  return (
    <AssessmentInvitationLanding
      personalization={hasPersonalization ? personalization : undefined}
    />
  );
}
