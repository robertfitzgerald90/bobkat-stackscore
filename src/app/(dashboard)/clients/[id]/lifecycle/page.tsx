import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LifecycleDashboard } from "@/components/technology-lifecycle/lifecycle-dashboard";
import { prisma } from "@/lib/db";
import { getTechnologyLifecycleDashboard } from "@/lib/technology-lifecycle";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

type PageProps = { params: Promise<{ id: string }> };

export default async function TechnologyLifecyclePage({ params }: PageProps) {
  const { id } = await params;
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

  const dashboard = await getTechnologyLifecycleDashboard(id, session.user.role);
  if (!dashboard) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <LifecycleDashboard dashboard={dashboard} />
    </div>
  );
}
