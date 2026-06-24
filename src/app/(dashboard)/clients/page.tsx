import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ClientsTable } from "@/components/clients/clients-table";

export default async function ClientsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const clients = await prisma.client.findMany({
    orderBy: { companyName: "asc" },
    include: {
      assessments: {
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 2,
        select: { overallScore: true },
      },
      scoreHistory: {
        orderBy: { recordedDate: "desc" },
        take: 2,
        select: { overallScore: true },
      },
      _count: { select: { assessments: true } },
    },
  });

  const rows = clients.map((client) => {
    const latestScore =
      client.scoreHistory[0]?.overallScore != null
        ? Math.round(Number(client.scoreHistory[0].overallScore))
        : client.assessments[0]?.overallScore != null
          ? Math.round(Number(client.assessments[0].overallScore))
          : null;

    const scoreDelta =
      client.scoreHistory.length >= 2
        ? Math.round(Number(client.scoreHistory[0].overallScore)) -
          Math.round(Number(client.scoreHistory[1].overallScore))
        : client.assessments.length >= 2
          ? Math.round(Number(client.assessments[0].overallScore)) -
            Math.round(Number(client.assessments[1].overallScore))
          : null;

    return {
      id: client.id,
      companyName: client.companyName,
      primaryContactName: client.primaryContactName,
      status: client.status,
      latestScore,
      scoreDelta,
      assessmentCount: client._count.assessments,
    };
  });

  return <ClientsTable clients={rows} isAdmin={isAdmin} />;
}
