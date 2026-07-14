import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SnapshotLeadsManagement } from "@/components/admin/snapshot-leads-management";
import {
  getTechnologySnapshotLeadSummaryStats,
  listTechnologySnapshotLeadsForAdmin,
} from "@/lib/technology-snapshot/service";

export default async function SnapshotLeadsPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/dashboard");
  }

  const [leads, stats] = await Promise.all([
    listTechnologySnapshotLeadsForAdmin(),
    getTechnologySnapshotLeadSummaryStats(),
  ]);

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="page-title">Snapshot Leads</h2>
        <p className="page-description">
          Technology Snapshot submissions from the public lead-generation experience.
        </p>
      </div>
      <SnapshotLeadsManagement initialLeads={leads} initialStats={stats} />
    </div>
  );
}
