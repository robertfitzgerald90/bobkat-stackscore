import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BusinessProfileForm } from "@/components/business-profile/business-profile-form";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { getBusinessProfile } from "@/lib/business-profile";

type PageProps = { params: Promise<{ id: string }> };

/** Contacts section — Phase 1 uses Business Profile as the interim contact surface. */
export default async function ClientWorkspaceContactsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await getBusinessProfile(id, session.user.role);
  if (!profile) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <WorkspaceSectionHeader
        title="Contacts"
        description={`${profile.companyName} — business context and primary relationships. First-class contacts arrive in a later phase.`}
      />
      <BusinessProfileForm clientId={id} initialProfile={profile} />
    </div>
  );
}
