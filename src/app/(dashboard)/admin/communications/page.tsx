import { redirect } from "next/navigation";
import { CommunicationsDashboardView } from "@/components/communications/communications-dashboard-view";
import type { TemplateLibraryItem } from "@/components/communications/template-library-view";
import { auth } from "@/lib/auth";
import { assertCommunicationsAccessRole } from "@/lib/communications/auth";
import {
  getCommunicationDashboardStats,
  getCommunicationHealth,
  getRecentTemplateActivity,
  getRecentTestSends,
  isTemplatePreviewable,
  listEmailTemplates,
} from "@/lib/communications";
import { ensureTemplateVersionsSeeded } from "@/lib/communications/template-versions";

export default async function CommunicationsOverviewPage() {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }

  if (session.user.role === "admin") {
    await ensureTemplateVersionsSeeded(session.user.id);
  }

  const [stats, recentTestSends, recentActivity, health, templates] = await Promise.all([
    getCommunicationDashboardStats(),
    getRecentTestSends(),
    getRecentTemplateActivity(),
    getCommunicationHealth(),
    Promise.resolve(listEmailTemplates()),
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
    <CommunicationsDashboardView
      stats={stats}
      recentTemplates={recentTemplates}
      recentTestSends={recentTestSends}
      recentActivity={recentActivity}
      health={health}
    />
  );
}
