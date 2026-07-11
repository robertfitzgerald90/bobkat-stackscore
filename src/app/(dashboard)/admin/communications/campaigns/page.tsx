import { redirect } from "next/navigation";
import { CampaignsListView } from "@/components/communications/campaigns-list-view";
import { auth } from "@/lib/auth";
import { assertCommunicationsAccessRole } from "@/lib/communications/auth";
import { listCampaigns } from "@/lib/communications/outreach/campaigns";

export default async function CampaignsPage() {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }

  const { items } = await listCampaigns({ limit: 100 });

  return <CampaignsListView campaigns={JSON.parse(JSON.stringify(items))} />;
}
