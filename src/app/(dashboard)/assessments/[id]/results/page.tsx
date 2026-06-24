import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { RATING_LABELS } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Rating } from "@/generated/prisma/client";

type PageProps = { params: Promise<{ id: string }> };

export default async function AssessmentResultsPage({ params }: PageProps) {
  const { id } = await params;

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      client: true,
      categoryScores: { include: { category: true }, orderBy: { category: { displayOrder: "asc" } } },
      recommendations: {
        orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }],
        include: { category: true },
      },
    },
  });

  if (!assessment || assessment.status !== "completed") notFound();

  const rating = getRating(Number(assessment.overallScore));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{assessment.client.companyName}</p>
        <h2 className="text-2xl font-bold">{assessment.assessmentName}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>StackScore</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{Number(assessment.overallScore)}</p>
            <p className="text-muted-foreground">{RATING_LABELS[rating]}</p>
          </CardContent>
        </Card>
        {assessment.hasCriticalExposure ? (
          <Card className="border-destructive md:col-span-2">
            <CardHeader>
              <CardTitle className="text-destructive">Critical Exposure Warning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Critical security or recovery gaps were identified despite the overall score.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Scores</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {assessment.categoryScores.map((categoryScore) => (
            <div key={categoryScore.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{categoryScore.category.name}</p>
                <Badge variant="outline">{RATING_LABELS[categoryScore.rating]}</Badge>
              </div>
              <p className="mt-1 text-2xl font-semibold">
                {Number(categoryScore.percentScore).toFixed(0)}%
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assessment.recommendations.map((recommendation) => (
            <div key={recommendation.id} className="rounded-md border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{recommendation.title}</p>
                <Badge className="capitalize">{recommendation.priority}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{recommendation.businessImpact}</p>
              {recommendation.suggestedService ? (
                <p className="mt-2 text-sm">Service: {recommendation.suggestedService}</p>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      {assessment.executiveSummary ? (
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">{assessment.executiveSummary}</pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function getRating(score: number): Rating {
  if (score >= 90) return "exceptional";
  if (score >= 80) return "strong";
  if (score >= 70) return "stable";
  if (score >= 60) return "at_risk";
  return "critical";
}
