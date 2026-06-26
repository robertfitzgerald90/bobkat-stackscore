import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listTipPlans } from "@/lib/technology-improvement-plan";
import { TipPlanList } from "@/components/technology-improvement-plan/tip-plan-list";

type PageProps = { params: Promise<{ id: string }> };

export default async function ImprovementPlanListPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "client") redirect(`/clients/${id}`);

  const client = await prisma.client.findUnique({
    where: { id },
    select: { id: true, companyName: true },
  });
  if (!client) notFound();

  const plans = await listTipPlans(id);

  return (
    <TipPlanList clientId={client.id} clientName={client.companyName} initialPlans={plans} />
  );
}
