import { notFound, redirect } from "next/navigation";
import { CampaignDetailView } from "@/components/communications/campaign-detail-view";
import { auth } from "@/lib/auth";
import { assertCommunicationsAccessRole } from "@/lib/communications/auth";
import { getCampaignDetail } from "@/lib/communications/outreach/campaigns";
import { getCampaignTimeline } from "@/lib/communications/outreach/campaign-sync";

type PageProps = { params: Promise<{ id: string }> };

export default async function CampaignDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const campaign = await getCampaignDetail(id);
  if (!campaign) notFound();

  const timeline = await getCampaignTimeline(id);

  return (
    <CampaignDetailView
      campaign={JSON.parse(JSON.stringify(campaign))}
      timeline={timeline}
    />
  );
}
