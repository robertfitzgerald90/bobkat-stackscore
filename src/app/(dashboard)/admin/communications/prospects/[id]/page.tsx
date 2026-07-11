import { notFound, redirect } from "next/navigation";
import { ProspectDetailView } from "@/components/communications/prospect-detail-view";
import { auth } from "@/lib/auth";
import { assertCommunicationsAccessRole } from "@/lib/communications/auth";
import { getProspectDetail } from "@/lib/communications/outreach/prospects";

type PageProps = { params: Promise<{ id: string }> };

export default async function ProspectDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const prospect = await getProspectDetail(id);
  if (!prospect) notFound();

  return <ProspectDetailView prospect={JSON.parse(JSON.stringify(prospect))} />;
}
