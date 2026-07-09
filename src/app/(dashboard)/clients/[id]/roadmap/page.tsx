import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Calendar, FileText, Map } from "lucide-react";
import { auth } from "@/lib/auth";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { TipPlanList } from "@/components/technology-improvement-plan/tip-plan-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { listTipPlans } from "@/lib/technology-improvement-plan";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientWorkspaceRoadmapPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const client = await prisma.client.findUnique({
    where: { id },
    select: { id: true, companyName: true },
  });
  if (!client) notFound();

  if (isCustomerMode(session.user.role)) {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (clientUser?.clientId !== id) notFound();

    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Roadmap</h1>
          <p className="text-muted-foreground">
            Your personalized technology roadmap will be delivered after your strategy session
            with the BobKat team.
          </p>
        </header>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Map className="h-4 w-4 text-primary" />
              What happens next
            </CardTitle>
            <CardDescription className="leading-relaxed">
              After completing your assessment and reviewing your executive report, we will work
              together to build a phased implementation roadmap tailored to your business priorities
              and budget.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/clients/${id}/executive-reports`} className={buttonClassName({ variant: "outline" })}>
              <FileText className="mr-2 h-4 w-4" />
              View Reports
            </Link>
            <Link href="/support" className={buttonClassName({})}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Strategy Session
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const plans = await listTipPlans(id);

  return (
    <div className="space-y-6">
      <WorkspaceSectionHeader
        title="Roadmap"
        description="Technology investment planning for this client."
      />
      <TipPlanList
        clientId={client.id}
        clientName={client.companyName}
        initialPlans={plans}
        embedded
      />
    </div>
  );
}
