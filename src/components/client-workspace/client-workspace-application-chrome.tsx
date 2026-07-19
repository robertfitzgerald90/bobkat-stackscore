"use client";

import { AppHeader } from "@/components/layout/app-header";
import { useDashboardChrome } from "@/components/layout/dashboard-chrome-context";
import { ClientWorkspaceNav } from "@/components/client-workspace/client-workspace-nav";
import { TpWorkspaceHeader } from "@/components/technology-profile/tp-workspace-header";
import type { CompletedAssessmentForAuto } from "@/lib/assessments/auto-assessment";
import { STICKY_CLIENT_WORKSPACE_SHELL_CLASS } from "@/lib/ui/sticky-chrome";

type ClientWorkspaceApplicationChromeProps = {
  clientId: string;
  clientName: string;
  clientStatus: string;
  role: string;
  showAssessClient: boolean;
  completedAssessments: CompletedAssessmentForAuto[];
  draftAssessmentId: string | null;
  nextRecommendedAssessmentAt: string | null;
};

export function ClientWorkspaceApplicationChrome({
  clientId,
  clientName,
  clientStatus,
  role,
  showAssessClient,
  completedAssessments,
  draftAssessmentId,
  nextRecommendedAssessmentAt,
}: ClientWorkspaceApplicationChromeProps) {
  const { user, pageTitle, sidebarCollapsed, onMenuClick, onSidebarToggle } = useDashboardChrome();

  return (
    <header className={STICKY_CLIENT_WORKSPACE_SHELL_CLASS}>
      <AppHeader
        user={user}
        pageTitle={pageTitle}
        onMenuClick={onMenuClick}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={onSidebarToggle}
        variant="workspaceShell"
      />
      <div className="border-t border-sidebar-border/70 px-4 pb-2 pt-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <TpWorkspaceHeader
            clientId={clientId}
            clientName={clientName}
            clientStatus={clientStatus}
            showAssessClient={showAssessClient}
            completedAssessments={completedAssessments}
            draftAssessmentId={draftAssessmentId}
            nextRecommendedAssessmentAt={nextRecommendedAssessmentAt}
            variant="workspaceShell"
          />
          <ClientWorkspaceNav clientId={clientId} role={role} variant="workspaceShell" />
        </div>
      </div>
    </header>
  );
}
