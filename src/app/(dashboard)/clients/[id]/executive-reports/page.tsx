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

export default async function ClientWorkspaceExecutiveReportsPage({ params }: PageProps) {
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
        take: 1,
      },
    },
  });
  if (!client) notFound();

  const links: WorkspaceHubLink[] = [
    {
      href: `/clients/${id}/quarterly-review`,
      title: "Quarterly Business Reviews",
      description: "Recurring executive reviews (legacy QBR — evolves to EBR in a later phase)",
    },
    {
      href: `/clients/${id}/progress-report`,
      title: "Progress Report",
      description: "Client progress and improvement narrative",
    },
    {
      href: `/clients/${id}/improvement`,
      title: "Improvement Dashboard",
      description: "Analytics for completed and in-flight improvements",
    },
    {
      href: `/clients/${id}/improvement-plan`,
      title: "Improvement Plans",
      description: "Technology Improvement Plan drafts and PDFs",
    },
  ];

  const currentAssessmentId = client.technologyProfile?.currentAssessmentId;
  if (currentAssessmentId) {
    links.push({
      href: `/assessments/${currentAssessmentId}/results`,
      title: "Latest Assessment Results",
      description: "Current assessment outcomes and recommendation summary",
    });
  }

  return (
    <div className="space-y-6">
      <WorkspaceSectionHeader
        title="Executive Reports"
        description={`${client.companyName} — reviews, progress, and executive-ready deliverables`}
      />
      <WorkspaceHubLinks links={links} />
    </div>
  );
}
