import { redirect } from "next/navigation";
import { TemplateLibraryView } from "@/components/communications/template-library-view";
import type { TemplateLibraryItem } from "@/components/communications/template-library-view";
import { auth } from "@/lib/auth";
import { assertCommunicationsAdminRole } from "@/lib/communications/auth";
import { isTemplatePreviewable, listEmailTemplates } from "@/lib/communications";

export default async function CommunicationsTemplatesPage() {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAdminRole(session.user.role)) {
    redirect("/dashboard");
  }

  const templates: TemplateLibraryItem[] = listEmailTemplates().map((template) => ({
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Template Library</h2>
        <p className="mt-1 text-muted-foreground">
          Production email templates registered for the StackScore Communications Platform.
        </p>
      </div>
      <TemplateLibraryView templates={templates} />
    </div>
  );
}
