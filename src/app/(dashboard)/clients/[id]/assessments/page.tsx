import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  WorkspaceHubLinks,
  type WorkspaceHubLink,
} from "@/components/client-workspace/workspace-hub-links";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { prisma } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientWorkspaceAssessmentsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "client") redirect(clientTechnologyProfilePath(id));

  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
      technologyProfile: { select: { currentAssessmentId: true } },
      assessments: {
        where: { status: "completed" },
        select: { id: true },
        take: 2,
      },
    },
  });
  if (!client) notFound();

  const completedCount = client.assessments.length;
  const currentAssessmentId = client.technologyProfile?.currentAssessmentId;

  const links: WorkspaceHubLink[] = [
    {
      href: `/clients/${id}/assessments/history`,
      title: "Assessment History",
      description: "Immutable snapshots of every assessment for this client",
    },
  ];

  if (completedCount >= 2) {
    links.push({
      href: `/clients/${id}/assessments/compare`,
      title: "Compare Assessments",
      description: "Side-by-side maturity and score comparison",
    });
  }

  if (currentAssessmentId) {
    links.push({
      href: `/assessments/${currentAssessmentId}/results`,
      title: "Current Assessment Results",
      description: "Latest completed assessment outcomes and recommendations",
    });
  }

  return (
    <div className="space-y-6">
      <WorkspaceSectionHeader
        title="Assessments"
        description={`${client.companyName} — history, comparison, and current results. Use Assess Client in the header to start or continue an assessment.`}
      />
      <WorkspaceHubLinks links={links} />
    </div>
  );
}
