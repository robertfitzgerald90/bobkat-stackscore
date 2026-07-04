import { notFound, redirect } from "next/navigation";
import type { Session } from "next-auth";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { prisma } from "@/lib/db";

type WorkspaceStubPageContext = {
  clientId: string;
  companyName: string;
};

/**
 * Shared loader for internal-only workspace stub pages (DEV-002 Phase 1 Commit 5).
 */
export async function loadWorkspaceStubPage(
  clientId: string,
  session: Session | null,
): Promise<WorkspaceStubPageContext> {
  if (!session?.user) redirect("/login");
  if (session.user.role === "client") redirect(clientTechnologyProfilePath(clientId));

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, companyName: true },
  });
  if (!client) notFound();

  return { clientId: client.id, companyName: client.companyName };
}
