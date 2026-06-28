import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ClientAdminActions } from "@/components/admin/client-admin-actions";
import { ClientAssessmentForms } from "@/components/clients/client-assessment-forms";
import { TechnologyProfileDetailView } from "@/components/technology-profile/technology-profile-detail";
import { TpQuickActions } from "@/components/technology-profile/tp-quick-actions";
import { buttonClassName } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTechnologyProfileDetail } from "@/lib/technology-profile";
import { sortCompletedAssessmentsNewestFirst } from "@/lib/assessments/display";
import { formatClientStatus } from "@/lib/display";

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/clients"
            className={buttonClassName({ variant: "ghost", size: "sm", className: "-ml-2" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
          <Badge variant="outline">{formatClientStatus(client.status)}</Badge>
        </div>
        {sections.showAssessmentForms && client.status !== "archived" ? (
          <div className="w-full lg:max-w-2xl lg:shrink-0">
            <ClientAssessmentForms
              clientId={client.id}
              completedAssessments={completedAssessments}
            />
          </div>
        ) : null}
      </div>

      <TpQuickActions
        clientId={id}
        sections={sections}
        showCompareAssessments={
          sections.showAssessmentResultsLink && completedAssessments.length >= 2
        }
      />

      <TechnologyProfileDetailView detail={detail} />

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
