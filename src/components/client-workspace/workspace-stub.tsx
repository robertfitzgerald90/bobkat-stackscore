import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";

type WorkspaceStubProps = {
  title: string;
  companyName?: string;
  /** Defaults to a calm Phase 1 placeholder — no invented workflows or metrics. */
  message?: string;
};

/**
 * Placeholder for DOC-201 sections that ship in later migration phases (DEV-002).
 */
export function WorkspaceStub({
  title,
  companyName,
  message = "Available in a later migration phase.",
}: WorkspaceStubProps) {
  return (
    <div className="space-y-6">
      <WorkspaceSectionHeader
        title={title}
        description={companyName ? `${companyName}` : undefined}
      />
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          {message}
        </CardContent>
      </Card>
    </div>
  );
}
