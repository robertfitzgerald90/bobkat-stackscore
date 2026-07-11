import { redirect } from "next/navigation";
import { CommunicationsDashboardView } from "@/components/communications/communications-dashboard-view";
import type { TemplateLibraryItem } from "@/components/communications/template-library-view";
import { auth } from "@/lib/auth";
import { assertCommunicationsAdminRole } from "@/lib/communications/auth";
import {
  getCommunicationDashboardStats,
  getRecentTestSends,
  isTemplatePreviewable,
  listEmailTemplates,
} from "@/lib/communications";

export default async function CommunicationsOverviewPage() {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAdminRole(session.user.role)) {
    redirect("/dashboard");
  }

  const [stats, recentTestSends, templates] = await Promise.all([
    getCommunicationDashboardStats(),
    getRecentTestSends(),
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
    />
  );
}
