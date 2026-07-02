import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ClientAdminActions } from "@/components/admin/client-admin-actions";
import { TechnologyProfileDetailView } from "@/components/technology-profile/technology-profile-detail";
import { getTechnologyProfileDetail } from "@/lib/technology-profile";
import { sortCompletedAssessmentsNewestFirst } from "@/lib/assessments/display";

type PageProps = { params: Promise<{ id: string }> };

export default async function TechnologyProfilePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "admin";

  const [detail, client] = await Promise.all([
    getTechnologyProfileDetail(id, session.user.role),
    prisma.client.findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        status: true,
        assessments: {
          where: isAdmin ? undefined : { status: { not: "archived" } },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            assessmentName: true,
            assessmentType: true,
            status: true,
            completedAt: true,
            overallScore: true,
          },
        },
      },
    }),
  ]);

  if (!detail || !client) notFound();

  const completedAssessments = sortCompletedAssessmentsNewestFirst(
    client.assessments
      .filter((assessment) => assessment.status === "completed")
      .map((assessment) => ({
        id: assessment.id,
        assessmentName: assessment.assessmentName,
        assessmentType: assessment.assessmentType,
        completedAt: assessment.completedAt?.toISOString() ?? null,
        overallScore:
          assessment.overallScore !== null ? Math.round(Number(assessment.overallScore)) : null,
      })),
  );

  const { sections } = detail;

  return (
    <div className="space-y-6">
      <TechnologyProfileDetailView
        detail={detail}
        completedAssessments={completedAssessments}
      />

      {sections.showAdminActions ? (
        <ClientAdminActions
          clientId={client.id}
          clientName={client.companyName}
          status={client.status}
        />
      ) : null}
    </div>
  );
}
