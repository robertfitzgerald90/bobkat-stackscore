import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StartAssessmentForm } from "@/components/clients/start-assessment-form";

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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{client.companyName}</h2>
          <p className="text-muted-foreground">
            {client.primaryContactName} · {client.primaryContactEmail}
          </p>
          <Badge variant="outline" className="mt-2 capitalize">
            {client.status}
          </Badge>
        </div>
        <StartAssessmentForm clientId={client.id} />
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
                    <p className="text-sm capitalize text-muted-foreground">
                      {assessment.status} · {assessment.assessmentType}
                    </p>
                  </div>
                  <Link
                    href={
                      assessment.status === "completed"
                        ? `/assessments/${assessment.id}/results`
                        : `/assessments/${assessment.id}`
                    }
                    className={buttonVariants({ variant: "link" })}
                  >
                    Open
                  </Link>
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
                  <span>{new Date(entry.recordedDate).toLocaleDateString()}</span>
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
