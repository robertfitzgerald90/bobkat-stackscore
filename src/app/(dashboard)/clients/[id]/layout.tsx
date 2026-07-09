import { notFound, redirect } from "next/navigation";
import { ClientWorkspaceShell } from "@/components/client-workspace/client-workspace-shell";
import { auth } from "@/lib/auth";
import { sortCompletedAssessmentsNewestFirst } from "@/lib/assessments/display";
import { prisma } from "@/lib/db";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default async function ClientWorkspaceLayout({ children, params }: LayoutProps) {
  const { id: clientId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  if (role === "client") {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (clientUser?.clientId && clientUser.clientId !== clientId) {
      redirect(`/clients/${clientUser.clientId}/technology-profile`);
    }
  }

  const [client, draftAssessment] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        companyName: true,
        status: true,
        technologyProfile: {
          select: { nextRecommendedAssessmentAt: true },
        },
        assessments: {
          where: { status: "completed" },
          orderBy: { completedAt: "desc" },
          select: {
            id: true,
            assessmentType: true,
            completedAt: true,
          },
        },
      },
    }),
    prisma.assessment.findFirst({
      where: { clientId, status: "draft" },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    }),
  ]);

  if (!client) notFound();

  const completedAssessments = sortCompletedAssessmentsNewestFirst(
    client.assessments.map((assessment) => ({
      id: assessment.id,
      completedAt: assessment.completedAt?.toISOString() ?? null,
      assessmentType: assessment.assessmentType,
    })),
  );

  const showAssessClient = role !== "client" && client.status !== "archived";

  return (
    <ClientWorkspaceShell
      clientId={client.id}
      clientName={client.companyName}
      clientStatus={client.status}
      role={role}
      showAssessClient={showAssessClient}
      completedAssessments={completedAssessments}
      draftAssessmentId={draftAssessment?.id ?? null}
      nextRecommendedAssessmentAt={
        client.technologyProfile?.nextRecommendedAssessmentAt?.toISOString() ?? null
      }
    >
      {children}
    </ClientWorkspaceShell>
  );
}
