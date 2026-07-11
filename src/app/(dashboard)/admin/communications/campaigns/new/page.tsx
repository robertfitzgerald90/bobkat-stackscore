import { redirect } from "next/navigation";
import { NewCampaignForm } from "@/components/communications/new-campaign-form";
import { auth } from "@/lib/auth";
import { assertCommunicationsAccessRole } from "@/lib/communications/auth";

export default async function NewCampaignPage() {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }

  return <NewCampaignForm />;
}
