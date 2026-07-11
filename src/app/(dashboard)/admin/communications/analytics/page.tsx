import { redirect } from "next/navigation";
import { CommunicationAnalyticsView } from "@/components/communications/communication-analytics-view";
import { auth } from "@/lib/auth";
import { assertCommunicationsAccessRole } from "@/lib/communications/auth";
import {
  getCommunicationAnalyticsSummary,
  getMessagesSentOverTime,
  getRecentDeliveryFailures,
  getTemplatePerformance,
} from "@/lib/communications/tracking/analytics";

export default async function CommunicationAnalyticsPage() {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }

  const filters = { isTest: false };
  const [summary, sentOverTime, templatePerformance, recentFailures] = await Promise.all([
    getCommunicationAnalyticsSummary(filters),
    getMessagesSentOverTime(filters),
    getTemplatePerformance(filters),
    getRecentDeliveryFailures(),
  ]);

  return (
    <CommunicationAnalyticsView
      summary={summary}
      sentOverTime={sentOverTime}
      templatePerformance={templatePerformance}
      recentFailures={recentFailures}
    />
  );
}
