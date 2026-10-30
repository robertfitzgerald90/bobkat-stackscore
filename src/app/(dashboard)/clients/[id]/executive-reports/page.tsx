import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  WorkspaceHubLinks,
  type WorkspaceHubLink,
} from "@/components/client-workspace/workspace-hub-links";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { CustomerReportsExperience } from "@/components/customer-portal/reports/customer-reports-experience";
import { prisma } from "@/lib/db";
import { getCustomerReportsExperience } from "@/lib/customer-portal/reports-experience";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientWorkspaceExecutiveReportsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
      technologyProfile: { select: { currentAssessmentId: true } },
    },
  });
  if (!client) notFound();

  if (isCustomerMode(session.user.role)) {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (clientUser?.clientId !== id) notFound();

    const experience = await getCustomerReportsExperience({
      clientId: id,
      companyName: client.companyName,
      userId: session.user.id,
    });

    return <CustomerReportsExperience experience={experience} />;
  }

  const links: WorkspaceHubLink[] = [
    {
      href: `/clients/${id}/quarterly-review`,
      title: "Business Reviews",
      description: "Flexible strategic reviews of technology progress",
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
