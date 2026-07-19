import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { InsightsDashboardView } from "@/components/commercial-intelligence/insights-dashboard";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import { getCommercialInsightsDashboard } from "@/lib/commercial-intelligence";
import {
  listOperationalNotifications,
  refreshConsultantNotifications,
} from "@/lib/notifications";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

export default async function InsightsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (isCustomerMode(session.user.role)) redirect("/dashboard");

  await refreshConsultantNotifications(session.user.id, session.user.role);
  const [dashboard, notifications] = await Promise.all([
    getCommercialInsightsDashboard(),
    listOperationalNotifications(session.user.id, { limit: 20 }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <InsightsDashboardView dashboard={dashboard} />
      <NotificationsPanel initialNotifications={notifications} />
    </div>
  );
}
