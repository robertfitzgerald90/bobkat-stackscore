import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isConsultantMode } from "@/lib/navigation/portal-mode";

export default async function TechnologyCatalogPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isConsultantMode(session.user.role)) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <WorkspaceSectionHeader
        title="Technology Catalog"
        description="Recommended products and services for client engagements."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catalog</CardTitle>
          <CardDescription>
            Technology catalog integration is planned for a future release.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use client recommendations and project workflows to track suggested technology until the
          catalog module is available.
        </CardContent>
      </Card>
    </div>
  );
}
