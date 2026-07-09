import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayDate } from "@/lib/display";
import { isConsultantMode } from "@/lib/navigation/portal-mode";

export default async function AssessmentsHubPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isConsultantMode(session.user.role)) redirect("/assessment/start");

  const assessments = await prisma.assessment.findMany({
    where: { status: { in: ["draft", "completed"] } },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      assessmentName: true,
      status: true,
      updatedAt: true,
      client: { select: { id: true, companyName: true } },
    },
  });

  return (
    <div className="space-y-6">
      <WorkspaceSectionHeader
        title="Assessments"
        description="Recent assessments across your client portfolio."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{assessments.length} recent assessments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assessments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assessments yet.</p>
          ) : (
            assessments.map((assessment) => (
              <Link
                key={assessment.id}
                href={
                  assessment.status === "completed"
                    ? `/assessments/${assessment.id}/results`
                    : `/assessments/${assessment.id}`
                }
                className="flex flex-col gap-2 rounded-lg border border-border/60 p-4 transition-colors hover:border-primary/30 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">{assessment.assessmentName}</p>
                  <p className="text-sm text-muted-foreground">{assessment.client.companyName}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={assessment.status === "completed" ? "secondary" : "outline"}>
                    {assessment.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDisplayDate(assessment.updatedAt.toISOString())}
                  </span>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
