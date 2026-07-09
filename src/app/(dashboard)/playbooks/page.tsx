import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isConsultantMode } from "@/lib/navigation/portal-mode";

export default async function PlaybooksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isConsultantMode(session.user.role)) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <WorkspaceSectionHeader
        title="Playbooks"
        description="Standard operating procedures and delivery playbooks for consultants."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Playbooks</CardTitle>
          <CardDescription>
            Playbook library integration is planned for a future release.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Playbooks will connect recommendations to repeatable delivery workflows, pricing, and
          profitability tracking.
        </CardContent>
      </Card>
    </div>
  );
}
