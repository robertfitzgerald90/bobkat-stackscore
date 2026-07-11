import { redirect } from "next/navigation";
import { CommunicationsDashboardView } from "@/components/communications/communications-dashboard-view";
import type { TemplateLibraryItem } from "@/components/communications/template-library-view";
import { auth } from "@/lib/auth";
import { assertCommunicationsAccessRole } from "@/lib/communications/auth";
import {
  getCommunicationDashboardStats,
  getCommunicationHealth,
  getRecentOrganizationActivity,
  getRecentTemplateActivity,
  getRecentTestSends,
  isTemplatePreviewable,
  listEmailTemplates,
} from "@/lib/communications";
import { getRecentDeliveryFailures } from "@/lib/communications/tracking/analytics";
import { getOutreachDashboardStats } from "@/lib/communications/outreach/campaigns";
import { listPendingQueueItems } from "@/lib/communications/queue/service";
import { listQuarterlyReviewReminders } from "@/lib/communications/quarterly-review/reminders";
import { ensureTemplateVersionsSeeded } from "@/lib/communications/template-versions";
import { CommunicationsUpcomingActions } from "@/components/communications/communications-upcoming-actions";

export default async function CommunicationsOverviewPage() {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }

  if (session.user.role === "admin") {
    await ensureTemplateVersionsSeeded(session.user.id);
  }

  const [stats, outreachStats, recentTestSends, recentActivity, customerActivity, recentFailures, health, templates, queueItems, quarterlyReminders] =
    await Promise.all([
    getCommunicationDashboardStats(),
    getOutreachDashboardStats(),
    getRecentTestSends(),
    getRecentTemplateActivity(),
    getRecentOrganizationActivity(),
    getRecentDeliveryFailures(5),
    getCommunicationHealth(),
    Promise.resolve(listEmailTemplates()),
    listPendingQueueItems(10),
    listQuarterlyReviewReminders(10),
  ]);

  const recentTemplates: TemplateLibraryItem[] = templates
    .slice()
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .map((template) => ({
      key: template.key,
      documentId: template.documentId,
      name: template.name,
      description: template.description,
      category: template.category,
      status: template.status,
      subject: template.subject,
      lastUpdated: template.lastUpdated,
      previewable: isTemplatePreviewable(template),
    }));

  return (
    <div className="page-shell space-y-8">
      <CommunicationsUpcomingActions
        queueItems={queueItems.map((item) => ({
          id: item.id,
          workflowKey: item.workflowKey,
          templateKey: item.templateKey,
          status: item.status,
          reviewRequired: item.reviewRequired,
          createdAt: item.createdAt.toISOString(),
          client: item.client,
        }))}
        quarterlyReminders={quarterlyReminders.map((reminder) => ({
          id: reminder.id,
          status: reminder.status,
          dueAt: reminder.dueAt.toISOString(),
          client: reminder.client,
        }))}
      />
      <CommunicationsDashboardView
        stats={stats}
        outreachStats={outreachStats}
        recentTemplates={recentTemplates}
        recentTestSends={recentTestSends}
        recentActivity={recentActivity}
        customerActivity={customerActivity}
        recentFailures={recentFailures}
        health={health}
      />
    </div>
  );
}
