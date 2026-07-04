import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { TpReportsDocuments } from "@/components/technology-profile/tp-reports-documents";
import { getTechnologyProfileDetail } from "@/lib/technology-profile";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientWorkspaceDocumentsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const detail = await getTechnologyProfileDetail(id, session.user.role);
  if (!detail) notFound();

  return (
    <div className="space-y-6">
      <WorkspaceSectionHeader
        title="Documents"
        description={`${detail.client.companyName} — reports and deliverables`}
      />
      <TpReportsDocuments
        clientId={detail.profile.clientId}
        documents={detail.documents}
        activeTip={detail.activeTip}
        showRoadmapBuilderLink={detail.sections.showRoadmapBuilderLink}
        assessmentsCompleted={detail.journey.assessmentsCompleted}
        canEditImprovementPlan={detail.capabilities.canEditImprovementPlan}
      />
    </div>
  );
}
