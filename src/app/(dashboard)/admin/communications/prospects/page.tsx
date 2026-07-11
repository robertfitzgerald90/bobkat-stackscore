import { redirect } from "next/navigation";
import { ProspectsListView } from "@/components/communications/prospects-list-view";
import { auth } from "@/lib/auth";
import { assertCommunicationsAccessRole } from "@/lib/communications/auth";
import { listProspectIndustries, listProspects } from "@/lib/communications/outreach/prospects";

export default async function ProspectsPage() {
  const session = await auth();
  if (!session?.user || !assertCommunicationsAccessRole(session.user.role)) {
    redirect("/dashboard");
  }

  const [{ items }, industries] = await Promise.all([
    listProspects({ limit: 200 }),
    listProspectIndustries(),
  ]);

  return <ProspectsListView prospects={items} industries={industries} />;
}
