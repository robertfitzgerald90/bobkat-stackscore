import Link from "next/link";
import { notFound } from "next/navigation";
import { History } from "lucide-react";
import { prisma } from "@/lib/db";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StartAssessmentForm } from "@/components/clients/start-assessment-form";
import { ReassessmentForm } from "@/components/clients/reassessment-form";
import {
  formatAssessmentStatus,
  formatAssessmentType,
  formatAssessmentCompletionDate,
  sortCompletedAssessmentsNewestFirst,
} from "@/lib/assessments/display";
import { formatClientStatus } from "@/lib/display";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      assessments: { orderBy: { createdAt: "desc" } },
      scoreHistory: { orderBy: { recordedDate: "desc" }, take: 6 },
      projects: { orderBy: { updatedAt: "desc" }, take: 5 },
    },
  });

  if (!client) notFound();

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
          <StartAssessmentForm clientId={client.id} />
          <ReassessmentForm clientId={client.id} completedAssessments={completedAssessments} />
        </div>
      </div>

      <div className="flex justify-end">
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

        <Card>
          <CardHeader>
            <CardTitle>Score History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {client.scoreHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No score history yet.</p>
            ) : (
              client.scoreHistory.map((entry) => (
                <div key={entry.id} className="flex justify-between text-sm">
                  <span>{formatAssessmentCompletionDate(entry.recordedDate)}</span>
                  <span className="font-semibold">{Number(entry.overallScore)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
