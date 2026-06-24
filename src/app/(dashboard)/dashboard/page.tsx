import Link from "next/link";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const [totalClients, activeClients, assessmentsThisMonth, recentAssessments, atRiskCount, avg] =
    await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: "active" } }),
      prisma.assessment.count({
        where: {
          status: "completed",
          completedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.assessment.findMany({
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 5,
        include: { client: true, assessor: true },
      }),
      prisma.assessment.count({
        where: { status: "completed", overallScore: { lt: 60 } },
      }),
      prisma.assessment.aggregate({
        where: { status: "completed", overallScore: { not: null } },
        _avg: { overallScore: true },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Overview of client technology assessments</p>
        </div>
        <Link href="/clients/new" className={buttonVariants()}>
          New Client
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Clients" value={totalClients} />
        <StatCard title="Active Clients" value={activeClients} />
        <StatCard title="Assessments This Month" value={assessmentsThisMonth} />
        <StatCard
          title="Average StackScore"
          value={Math.round(Number(avg._avg.overallScore ?? 0))}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAssessments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed assessments yet.</p>
            ) : (
              recentAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{assessment.client.companyName}</p>
                    <p className="text-sm text-muted-foreground">{assessment.assessmentName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{Number(assessment.overallScore)}</p>
                    <Link
                      href={`/assessments/${assessment.id}/results`}
                      className={buttonVariants({ variant: "link", className: "h-auto p-0" })}
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>At Risk Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant="destructive">{atRiskCount}</Badge>
              <p className="text-sm text-muted-foreground">
                Clients with a latest StackScore below 60
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
