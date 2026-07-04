import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TechnologyJourneySection } from "@/components/client-workspace/technology-journey-section";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { getTechnologyProfileDetail } from "@/lib/technology-profile";

type PageProps = { params: Promise<{ id: string }> };

/** Technology Journey section — view over existing profile/timeline data (Phase 2 adds JourneyMilestone). */
export default async function ClientWorkspaceJourneyPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "client") redirect(clientTechnologyProfilePath(id));

  const detail = await getTechnologyProfileDetail(id, session.user.role);
  if (!detail) notFound();

  return (
    <div className="space-y-6">
      <WorkspaceSectionHeader
        title="Technology Journey"
        description={`${detail.client.companyName} — score progression and milestone history across the assess → improve → maintain lifecycle.`}
      />
      <TechnologyJourneySection
        clientId={detail.profile.clientId}
        journey={detail.journey}
        journeyScores={detail.journeyScores}
        journeyTimeline={detail.journeyTimeline}
      />
    </div>
  );
}
