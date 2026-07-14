import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SnapshotLeadDetailView } from "@/components/admin/snapshot-lead-detail-view";
import {
  buildSnapshotLeadDetailPayload,
  getTechnologySnapshotLeadById,
} from "@/lib/technology-snapshot/service";

type SnapshotLeadDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SnapshotLeadDetailPage({ params }: SnapshotLeadDetailPageProps) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const lead = await getTechnologySnapshotLeadById(id);
  if (!lead) notFound();

  const payload = buildSnapshotLeadDetailPayload(lead);

  return <SnapshotLeadDetailView initialLead={JSON.parse(JSON.stringify(payload))} />;
}
