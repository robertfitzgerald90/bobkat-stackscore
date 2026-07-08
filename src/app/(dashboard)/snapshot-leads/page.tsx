import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listTechnologySnapshotLeads } from "@/lib/technology-snapshot/service";
import { SnapshotLeadsManagement } from "@/components/admin/snapshot-leads-management";

export default async function SnapshotLeadsPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/dashboard");
  }

  const leads = await listTechnologySnapshotLeads();

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="page-title">Snapshot Leads</h2>
        <p className="page-description">
          Technology Snapshot submissions from the public lead-generation experience.
        </p>
      </div>
      <SnapshotLeadsManagement initialLeads={leads} />
    </div>
  );
}
