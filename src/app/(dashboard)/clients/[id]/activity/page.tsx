import { redirect } from "next/navigation";
import { ClientActivityTimelineView } from "@/components/communications/client-activity-timeline-view";
import { auth } from "@/lib/auth";
import {
  getSessionUserWithClient,
  isStaffRole,
  requireClientWorkspaceAccess,
} from "@/lib/api/access";
import { getClientActivityTimeline } from "@/lib/communications/activity/record-activity";
import { loadWorkspaceStubPage } from "@/lib/client-workspace/stub-page";

type PageProps = { params: Promise<{ id: string }> };

export default async function ClientWorkspaceActivityPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const user = await getSessionUserWithClient();
  if (!user) redirect("/login");

  const denied = await requireClientWorkspaceAccess(user, id);
  if (denied) redirect("/dashboard");

  const { companyName } = await loadWorkspaceStubPage(id, session);
  const includeInternal = isStaffRole(user.role) && user.role === "admin";
  const events = await getClientActivityTimeline(id, {
    includeInternal,
    limit: 50,
  });

  return (
    <ClientActivityTimelineView
      companyName={companyName}
      events={events}
      includeInternal={includeInternal}
    />
  );
}
