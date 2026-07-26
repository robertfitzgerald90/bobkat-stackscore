import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Toaster } from "@/components/ui/sonner";
import {
  EMPTY_CLIENT_PORTAL_STATE,
  getClientPortalState,
} from "@/lib/command-center/client-command-context";
import type { ClientPortalState } from "@/lib/command-center/types";
import { prisma } from "@/lib/db";
import { isCustomerMode } from "@/lib/navigation/portal-mode";
import { countNewWebsiteLeads } from "@/lib/website-leads";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error("[auth] session lookup failed in dashboard layout:", error);
    redirect("/login");
  }

  if (!session?.user) {
    redirect("/login");
  }

  let clientId: string | null = null;
  let clientPortal: ClientPortalState = EMPTY_CLIENT_PORTAL_STATE;
  if (isCustomerMode(session.user.role)) {
    const clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientId: true },
    });
    clientId = clientUser?.clientId ?? null;
    if (clientId) {
      clientPortal = await getClientPortalState(clientId);
    }
  }

  const user = {
    id: session.user.id,
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    role: session.user.role,
    clientId,
    clientPortal,
  };

  let navBadges: Record<string, number> = {};
  if (session.user.role === "admin") {
    try {
      const newWebsiteLeads = await countNewWebsiteLeads();
      if (newWebsiteLeads > 0) {
        navBadges = { "/website-leads": newWebsiteLeads };
      }
    } catch (error) {
      console.warn("[website-leads] unable to load new lead badge count", error);
    }
  }

  return (
    <>
      <DashboardShell user={user} navBadges={navBadges}>{children}</DashboardShell>
      <Toaster />
    </>
  );
}
