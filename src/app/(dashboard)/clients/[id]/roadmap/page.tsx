import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import {
  RoadmapDashboard,
  RoadmapEmptyState,
} from "@/components/client-roadmap/roadmap-dashboard";
import { TipPlanList } from "@/components/technology-improvement-plan/tip-plan-list";
import { prisma } from "@/lib/db";
import { getClientRoadmapDashboard } from "@/lib/client-roadmap";
import { listTipPlans } from "@/lib/technology-improvement-plan";
import { isCustomerMode } from "@/lib/navigation/portal-mode";
import { getVcioFeatureAccess } from "@/lib/vcio/feature-unlocks";

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

  const isCustomer = isCustomerMode(session.user.role);

  if (isCustomer) {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (clientUser?.clientId !== id) notFound();

    const dashboard = await getClientRoadmapDashboard(id, session.user.role);

    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Technology Roadmap</h1>
          <p className="text-muted-foreground">
            Track your phased technology journey, approve the next implementation window, and
            measure StackScore progress over time.
          </p>
        </header>
        <RoadmapDashboard
          dashboard={dashboard}
          emptyFallback={<RoadmapEmptyState clientId={id} />}
        />
      </div>
    );
  }

  const [dashboard, plans, roadmapAccess] = await Promise.all([
    getClientRoadmapDashboard(id, session.user.role),
    listTipPlans(id),
    getVcioFeatureAccess(id, "roadmap_collaboration"),
  ]);

  return (
    <div className="space-y-8">
      <WorkspaceSectionHeader
        title="Technology Roadmap"
        description="Living implementation roadmap and technology investment planning for this client."
      />

      <RoadmapDashboard
        dashboard={dashboard}
        emptyFallback={<RoadmapEmptyState clientId={id} />}
      />

      <div className="space-y-4 border-t pt-8">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Planning Tools</h2>
          <p className="text-sm text-muted-foreground">
            Technology Improvement Plans refine phase sequencing before promoting the active
            roadmap.
          </p>
        </div>
        <TipPlanList
          clientId={client.id}
          clientName={client.companyName}
          initialPlans={plans}
          embedded
          canCreate={roadmapAccess.canEdit}
          readOnlyReason={roadmapAccess.reason}
        />
      </div>
    </div>
  );
}
