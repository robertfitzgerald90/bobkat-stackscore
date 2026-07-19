import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { PhaseWorkspace } from "@/components/client-roadmap/phase-workspace";
import { buttonClassName } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getClientRoadmapPhaseDetail } from "@/lib/client-roadmap";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

type PageProps = { params: Promise<{ id: string; phaseId: string }> };

export default async function RoadmapPhaseDetailPage({ params }: PageProps) {
  const { id, phaseId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const client = await prisma.client.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!client) notFound();

  if (isCustomerMode(session.user.role)) {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (clientUser?.clientId !== id) notFound();
  }

  const phase = await getClientRoadmapPhaseDetail(id, phaseId, session.user.role);
  if (!phase) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href={`/clients/${id}/roadmap`}
        className={buttonClassName({ variant: "ghost", size: "sm" })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to roadmap
      </Link>
      <PhaseWorkspace clientId={id} initialPhase={phase} />
    </div>
  );
}
