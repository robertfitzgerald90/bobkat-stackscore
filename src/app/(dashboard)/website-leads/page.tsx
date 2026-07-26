import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { WebsiteLeadsManagement } from "@/components/admin/website-leads-management";
import {
  getWebsiteLeadSummaryStats,
  listWebsiteLeadsForAdmin,
} from "@/lib/website-leads";

export default async function WebsiteLeadsPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/dashboard");
  }

  const [{ items }, stats] = await Promise.all([
    listWebsiteLeadsForAdmin({ sort: "newest", take: 200 }),
    getWebsiteLeadSummaryStats(),
  ]);

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="page-title">Website Leads</h2>
        <p className="page-description">
          Contact-form submissions received securely from Bobkat IT and other website entry points.
        </p>
      </div>
      <WebsiteLeadsManagement initialLeads={items} initialStats={stats} />
    </div>
  );
}
