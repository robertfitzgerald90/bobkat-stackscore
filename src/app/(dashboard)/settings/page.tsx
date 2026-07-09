import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isConsultantMode } from "@/lib/navigation/portal-mode";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isConsultantMode(session.user.role)) redirect("/account");

  return (
    <div className="space-y-6">
      <WorkspaceSectionHeader
        title="Settings"
        description="Consultant workspace preferences and configuration."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace Settings</CardTitle>
          <CardDescription>
            Organization-wide settings will be available in a future release.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Contact your administrator to manage users, assessment library, and integrations.
        </CardContent>
      </Card>
    </div>
  );
}
