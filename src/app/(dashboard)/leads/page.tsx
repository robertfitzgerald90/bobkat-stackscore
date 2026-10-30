import { redirect } from "next/navigation";
import { LeadsHubView } from "@/components/admin/leads-hub-view";
import { auth } from "@/lib/auth";
import { getLeadsHubSummary } from "@/lib/leads/hub";

export default async function LeadsHubPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/dashboard");
  }

  const summary = await getLeadsHubSummary();
  return <LeadsHubView summary={summary} />;
}
