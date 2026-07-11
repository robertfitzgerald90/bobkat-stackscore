import { notFound, redirect } from "next/navigation";
import { ClientTechnologyProfile } from "@/components/client-technology/client-technology-profile";
import { auth } from "@/lib/auth";
import { getClientTechnologyProfileSummary } from "@/lib/client-technology";
import { getActiveTechnologiesForAssignment } from "@/lib/technology-catalog";
import { prisma } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientTechnologyProfilePage({ params }: PageProps) {
  const { id: clientId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "client") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (user?.clientId && user.clientId !== clientId) {
      redirect(`/clients/${user.clientId}/assets`);
    }
  }

  const [profile, catalogOptions] = await Promise.all([
    getClientTechnologyProfileSummary(clientId),
    session.user.role !== "client" ? getActiveTechnologiesForAssignment() : Promise.resolve([]),
  ]);

  if (!profile) notFound();

  return (
    <ClientTechnologyProfile
      clientId={clientId}
      companyName={profile.companyName}
      deployments={profile.deployments}
      catalogOptions={catalogOptions}
      metrics={profile.metrics}
      canManage={session.user.role !== "client"}
    />
  );
}
