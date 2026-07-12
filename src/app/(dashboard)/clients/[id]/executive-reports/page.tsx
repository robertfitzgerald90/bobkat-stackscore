import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Calendar, Download, FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import {
  WorkspaceHubLinks,
  type WorkspaceHubLink,
} from "@/components/client-workspace/workspace-hub-links";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { BookingButton } from "@/components/support/booking-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientWorkspaceExecutiveReportsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
      technologyProfile: { select: { currentAssessmentId: true } },
    },
  });
  if (!client) notFound();

  if (isCustomerMode(session.user.role)) {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (clientUser?.clientId !== id) notFound();

    const reportHref = client.technologyProfile?.currentAssessmentId
      ? `/assessments/${client.technologyProfile.currentAssessmentId}/report`
      : null;

    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Executive-ready deliverables from your technology assessment.
          </p>
        </header>

        {reportHref ? (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Executive Assessment Report
              </CardTitle>
              <CardDescription>
                Your complete assessment results, maturity analysis, and prioritized
                recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Link href={reportHref} className={buttonClassName({})}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Link>
              <BookingButton
                label="primary"
                variant="outline"
                icon={<Calendar className="mr-2 h-4 w-4" />}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-4 font-medium">Report not available yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete your assessment to generate your executive report.
              </p>
              <Link href="/assessment/start" className={buttonClassName({ className: "mt-6" })}>
                Continue Assessment
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const links: WorkspaceHubLink[] = [
    {
      href: `/clients/${id}/quarterly-review`,
      title: "Quarterly Business Reviews",
      description: "Recurring executive reviews",
    },
    {
      href: `/clients/${id}/progress-report`,
      title: "Progress Report",
      description: "Client progress and improvement narrative",
    },
    {
      href: `/clients/${id}/improvement`,
      title: "Improvement Dashboard",
      description: "Analytics for completed and in-flight improvements",
    },
    {
      href: `/clients/${id}/improvement-plan`,
      title: "Improvement Plans",
      description: "Technology Improvement Plan drafts and PDFs",
    },
  ];

  const currentAssessmentId = client.technologyProfile?.currentAssessmentId;
  if (currentAssessmentId) {
    links.push({
      href: `/assessments/${currentAssessmentId}/results`,
      title: "Latest Assessment Results",
      description: "Current assessment outcomes and recommendation summary",
    });
  }

  return (
    <div className="space-y-6">
      <WorkspaceSectionHeader
        title="Executive Reports"
        description={`${client.companyName} — reviews, progress, and executive-ready deliverables`}
      />
      <WorkspaceHubLinks links={links} />
    </div>
  );
}
