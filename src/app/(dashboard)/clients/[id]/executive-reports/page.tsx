import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Calendar, FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { getLatestDraftAssessmentForClientUser } from "@/lib/auth/client-access";
import {
  ClientEmptyState,
  ClientPageHeader,
  ClientPageShell,
} from "@/components/client-ui";
import {
  WorkspaceHubLinks,
  type WorkspaceHubLink,
} from "@/components/client-workspace/workspace-hub-links";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { BookingButton } from "@/components/support/booking-button";
import { customerAssessmentDashboardPath } from "@/lib/clients/paths";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { getBookingUrl } from "@/lib/support/config";
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
    const draftAssessment = await getLatestDraftAssessmentForClientUser(session.user.id);
    const bookingUrl = getBookingUrl();

    return (
      <ClientPageShell className="max-w-3xl">
        <ClientPageHeader
          eyebrow="Executive Deliverables"
          title="Reports"
          description="Executive-ready deliverables from your technology assessment."
        />

        {reportHref ? (
          <Card className={CLIENT_SURFACE_CARD}>
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
                <FileText className="mr-2 h-4 w-4" />
                Review Assessment Report
              </Link>
              {bookingUrl ? (
                <BookingButton
                  label="primary"
                  variant="outline"
                  icon={<Calendar className="mr-2 h-4 w-4" />}
                />
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <ClientEmptyState
            icon={FileText}
            title="Report not available yet"
            description="Your executive assessment report is generated after you complete a technology assessment."
            nextStep="Complete or resume your assessment to unlock the report."
            action={
              draftAssessment ? (
                <Link href="/assessment/start" className={buttonClassName({})}>
                  Resume Assessment
                </Link>
              ) : (
                <Link
                  href={customerAssessmentDashboardPath(id)}
                  className={buttonClassName({ variant: "outline" })}
                >
                  Back to Executive Briefing
                </Link>
              )
            }
          />
        )}
      </ClientPageShell>
    );
  }

  const links: WorkspaceHubLink[] = [
    {
      href: `/clients/${id}/quarterly-review`,
      title: "Business Reviews",
      description: "Flexible strategic reviews of technology progress",
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
