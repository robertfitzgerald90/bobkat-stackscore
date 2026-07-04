import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { TipPlanList } from "@/components/technology-improvement-plan/tip-plan-list";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { prisma } from "@/lib/db";
import { listTipPlans } from "@/lib/technology-improvement-plan";

type PageProps = { params: Promise<{ id: string }> };

/** Roadmap section — Phase 1 uses TIP as the interim planning surface (DEV-002 Phase 4 replaces this). */
export default async function ClientWorkspaceRoadmapPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "client") redirect(clientTechnologyProfilePath(id));

  const client = await prisma.client.findUnique({
    where: { id },
    select: { id: true, companyName: true },
  });
  if (!client) notFound();

  const plans = await listTipPlans(id);

  return (
    <div className="space-y-6">
      <WorkspaceSectionHeader
        title="Roadmap"
        description="Technology investment planning for this client. Phase 1 uses Improvement Plans as the interim roadmap surface."
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
