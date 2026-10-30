import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CustomerExploreExperience } from "@/components/customer-portal/explore/customer-explore-experience";
import { ClientLoadingState, ClientPageShell } from "@/components/client-ui";
import { getCustomerExplore } from "@/lib/customer-portal/pillar-explore";
import { prisma } from "@/lib/db";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ pillar?: string }>;
};

/**
 * SS-UX-005 — Interactive technology pillar exploration.
 */
export default async function ClientExplorePage({ params, searchParams }: PageProps) {
  const { id: clientId } = await params;
  const query = searchParams ? await searchParams : {};
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (isCustomerMode(session.user.role)) {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    if (clientUser?.clientId !== clientId) notFound();
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, companyName: true },
  });
  if (!client) notFound();

  const explore = await getCustomerExplore(
    clientId,
    session.user.role,
    client.companyName,
    query.pillar,
  );
  if (!explore) notFound();

  return (
    <Suspense
      fallback={
        <ClientPageShell>
          <ClientLoadingState label="Loading Explore…" />
        </ClientPageShell>
      }
    >
      <CustomerExploreExperience explore={explore} />
    </Suspense>
  );
}
