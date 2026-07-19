import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ConsultingWorkspaceView } from "@/components/technology-lifecycle/consulting-workspace";
import { getConsultingWorkspaceSummary } from "@/lib/technology-lifecycle";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

export default async function ConsultingWorkspacePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (isCustomerMode(session.user.role)) redirect("/dashboard");

  const summary = await getConsultingWorkspaceSummary();

  return (
    <div className="mx-auto max-w-6xl">
      <ConsultingWorkspaceView summary={summary} />
    </div>
  );
}
