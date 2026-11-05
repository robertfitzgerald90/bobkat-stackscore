import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CustomerProjectsExperience } from "@/components/customer-portal/projects/customer-projects-experience";
import { prisma } from "@/lib/db";
import { getCustomerProjectsExperience } from "@/lib/customer-portal/projects-experience";
import { normalizeCustomerProjectViewFilter } from "@/lib/customer-portal/projects-dto";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClientWorkspaceProjectsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "client") {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (clientUser?.clientId !== id) notFound();
  }

  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
    },
  });
  if (!client) notFound();

  const viewRaw = typeof query.view === "string" ? query.view : undefined;
  const experience = await getCustomerProjectsExperience(
    client.id,
    client.companyName,
    normalizeCustomerProjectViewFilter(viewRaw),
  );
  return (
    <Suspense>
      <CustomerProjectsExperience experience={experience} />
    </Suspense>
  );
}
