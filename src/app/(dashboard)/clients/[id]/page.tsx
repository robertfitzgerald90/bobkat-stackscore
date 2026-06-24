import Link from "next/link";
import { notFound } from "next/navigation";
import { History, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ClientAdminActions } from "@/components/admin/client-admin-actions";
import { ClientScoreSummary } from "@/components/analytics/client-score-summary";
import { getClientImprovementAnalytics } from "@/lib/analytics";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClientAssessmentForms } from "@/components/clients/client-assessment-forms";
import {
  formatAssessmentStatus,
  formatAssessmentType,
  sortCompletedAssessmentsNewestFirst,
} from "@/lib/assessments/display";
import { formatClientStatus } from "@/lib/display";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      assessments: {
        where: isAdmin ? undefined : { status: { not: "archived" } },
        orderBy: { createdAt: "desc" },
      },
      scoreHistory: { orderBy: { recordedDate: "asc" } },
      projects: { orderBy: { updatedAt: "desc" }, take: 5 },
    },
  });

  if (!client) notFound();

  const analytics = await getClientImprovementAnalytics(id);

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
        <div>
          <h2 className="text-2xl font-bold">{client.companyName}</h2>
          <p className="text-muted-foreground">
            {client.primaryContactName} · {client.primaryContactEmail}
          </p>
          <Badge variant="outline" className="mt-2">
            {formatClientStatus(client.status)}
          </Badge>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {client.status !== "archived" ? (
            <ClientAssessmentForms
              clientId={client.id}
              completedAssessments={completedAssessments}
            />
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Link
          href={`/clients/${client.id}/improvement`}
          className={buttonClassName({ variant: "default", size: "sm" })}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Improvement Dashboard
        </Link>
        <Link
          href={`/clients/${client.id}/assessments/history`}
          className={buttonClassName({ variant: "outline", size: "sm" })}
        >
          <History className="mr-2 h-4 w-4" />
          Assessment History
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assessments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {client.assessments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assessments yet.</p>
            ) : (
              client.assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{assessment.assessmentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatAssessmentStatus(assessment.status)} ·{" "}
                      {formatAssessmentType(assessment.assessmentType)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {assessment.status === "completed" && assessment.sourceAssessmentId ? (
                      <Link
                        href={`/assessments/${assessment.id}/improvement`}
                        className={buttonClassName({ variant: "link", className: "h-auto p-0" })}
                      >
                        Improvement
                      </Link>
                    ) : null}
                    <Link
                      href={
                        assessment.status === "completed"
                          ? `/assessments/${assessment.id}/results`
                          : `/assessments/${assessment.id}`
                      }
                      className={buttonClassName({ variant: "link", className: "h-auto p-0" })}
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <ClientScoreSummary
          clientId={client.id}
          scoreTrend={analytics?.scoreTrend ?? []}
          initialScore={analytics?.initialScore ?? null}
          currentScore={analytics?.currentScore ?? null}
          netImprovement={analytics?.netImprovement ?? null}
        />
      </div>

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
