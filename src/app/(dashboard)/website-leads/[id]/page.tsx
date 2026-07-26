import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  WebsiteLeadDetailView,
  type WebsiteLeadDetail,
} from "@/components/admin/website-lead-detail-view";
import { getWebsiteLeadById } from "@/lib/website-leads";

type PageProps = { params: Promise<{ id: string }> };

export default async function WebsiteLeadDetailPage({ params }: PageProps) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const lead = await getWebsiteLeadById(id);
  if (!lead) notFound();

  const serialized: WebsiteLeadDetail = {
    ...lead,
    submittedAt: lead.submittedAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    lastContactedAt: lead.lastContactedAt?.toISOString() ?? null,
    convertedAt: lead.convertedAt?.toISOString() ?? null,
  };

  return (
    <div className="min-w-0 space-y-6">
      <WebsiteLeadDetailView
        initialLead={serialized}
        convertPreview={{
          companyName: lead.company ?? lead.name,
          primaryContactName: lead.name,
          primaryContactEmail: lead.email,
          primaryContactPhone: lead.phone,
        }}
      />
    </div>
  );
}
