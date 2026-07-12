import { notFound, redirect } from "next/navigation";
import { getSessionUserWithClient, isStaffRole } from "@/lib/api/access";
import { prisma } from "@/lib/db";
import { isClientVisibleWorkspaceSection } from "@/lib/client-workspace/nav";

export type BillingPageContext = {
  clientId: string;
  companyName: string;
  isStaff: boolean;
};

export async function loadBillingPage(clientId: string): Promise<BillingPageContext> {
  const user = await getSessionUserWithClient();
  if (!user) redirect("/login");

  const isStaff = isStaffRole(user.role);
  if (!isStaff && user.clientId !== clientId) redirect("/login");
  if (!isStaff && !isClientVisibleWorkspaceSection("billing")) {
    redirect(`/clients/${clientId}/technology-profile`);
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, companyName: true },
  });
  if (!client) notFound();

  return { clientId: client.id, companyName: client.companyName, isStaff };
}
