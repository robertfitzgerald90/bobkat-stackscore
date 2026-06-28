import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, History, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ClientAdminActions } from "@/components/admin/client-admin-actions";
import { ClientAssessmentForms } from "@/components/clients/client-assessment-forms";
import { TechnologyProfileDetailView } from "@/components/technology-profile/technology-profile-detail";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            href="/clients"
            className={buttonClassName({ variant: "ghost", size: "sm", className: "mb-2 -ml-2" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
          <h2 className="page-title">{detail.client.companyName}</h2>
          <p className="text-muted-foreground">
            {detail.client.primaryContactName} · {detail.client.primaryContactEmail}
          </p>
          <Badge variant="outline" className="mt-2">
            {formatClientStatus(client.status)}
          </Badge>
        </div>
        {client.status !== "archived" ? (
          <div className="w-full lg:max-w-2xl lg:shrink-0">
            <ClientAssessmentForms
              clientId={client.id}
              completedAssessments={completedAssessments}
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
        <Link
          href={`/clients/${id}/business-profile`}
          className={buttonClassName({ variant: "outline", size: "sm", className: "w-full sm:w-auto" })}
        >
          <Building2 className="mr-2 h-4 w-4" />
          Business Profile
        </Link>
        <Link
          href={`/clients/${id}/improvement-plan`}
          className={buttonClassName({ variant: "default", size: "sm", className: "w-full sm:w-auto" })}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Improvement Plan
        </Link>
        <Link
          href={`/clients/${id}/improvement`}
          className={buttonClassName({ variant: "outline", size: "sm", className: "w-full sm:w-auto" })}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Improvement Dashboard
        </Link>
        <Link
          href={`/clients/${id}/assessments/history`}
          className={buttonClassName({ variant: "outline", size: "sm", className: "w-full sm:w-auto" })}
        >
          <History className="mr-2 h-4 w-4" />
          Assessment History
        </Link>
      </div>

      <TechnologyProfileDetailView detail={detail} />

      {isAdmin ? (
        <ClientAdminActions
          clientId={client.id}
          clientName={client.companyName}
          status={client.status}
        />
      ) : null}
    </div>
  );
}
